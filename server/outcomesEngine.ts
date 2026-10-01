import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  DomainOutcomeRecord, 
  CalibrationMetricsReport, 
  OutcomeStatus,
  DomainStrategyType 
} from '../src/types.js';
import { ENGINE_VERSION } from './typesafeJev.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data_outcomes.json');

class OutcomesEngine {
  private records: Map<string, DomainOutcomeRecord> = new Map();

  constructor() {
    this.loadRecords();
  }

  private loadRecords() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed: DomainOutcomeRecord[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            this.records.set(item.id, item);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Could not read saved outcomes from disk:', err);
    }
  }

  private persistRecords() {
    try {
      const arr = Array.from(this.records.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
    } catch (err) {
      console.warn('Could not persist outcomes to disk:', err);
    }
  }

  public getAll(): DomainOutcomeRecord[] {
    return Array.from(this.records.values()).sort(
      (a, b) => new Date(b.audit_date).getTime() - new Date(a.audit_date).getTime()
    );
  }

  public getById(id: string): DomainOutcomeRecord | undefined {
    return this.records.get(id);
  }

  public create(input: {
    domain: string;
    strategy_type?: DomainStrategyType;
    audit_date?: string;
    engine_version?: string;
    initial_verdict: string;
    initial_score: number;
    initial_ev_usd: number;
    actual_acquisition_price_usd: number;
    outcome_status?: OutcomeStatus;
    notes?: string;
  }): DomainOutcomeRecord {
    const id = `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString().split('T')[0];

    const record: DomainOutcomeRecord = {
      id,
      domain: input.domain.trim().toLowerCase(),
      strategy_type: input.strategy_type || 'brandable',
      audit_date: input.audit_date || nowIso,
      engine_version: input.engine_version || ENGINE_VERSION,
      initial_verdict: input.initial_verdict,
      initial_score: input.initial_score,
      initial_ev_usd: input.initial_ev_usd,
      actual_acquisition_price_usd: input.actual_acquisition_price_usd,
      outcome_status: input.outcome_status || 'holding',
      actual_sale_price_usd: null,
      holding_duration_days: 0,
      realized_net_pnl_usd: null,
      realized_roi_pct: null,
      notes: input.notes?.trim() || ''
    };

    this.calculateRealizedMetrics(record);
    this.records.set(id, record);
    this.persistRecords();
    return record;
  }

  public update(id: string, updates: Partial<DomainOutcomeRecord>): DomainOutcomeRecord | null {
    const record = this.records.get(id);
    if (!record) return null;

    if (updates.outcome_status !== undefined) record.outcome_status = updates.outcome_status;
    if (updates.actual_sale_price_usd !== undefined) record.actual_sale_price_usd = updates.actual_sale_price_usd;
    if (updates.holding_duration_days !== undefined) record.holding_duration_days = updates.holding_duration_days;
    if (updates.notes !== undefined) record.notes = updates.notes;
    if (updates.actual_acquisition_price_usd !== undefined) record.actual_acquisition_price_usd = updates.actual_acquisition_price_usd;

    this.calculateRealizedMetrics(record);
    this.records.set(id, record);
    this.persistRecords();
    return record;
  }

  private calculateRealizedMetrics(record: DomainOutcomeRecord) {
    const isClosed = 
      record.outcome_status === 'sold_profitable' ||
      record.outcome_status === 'sold_break_even' ||
      record.outcome_status === 'sold_loss' ||
      record.outcome_status === 'dropped_abandoned';

    if (!isClosed) {
      record.realized_net_pnl_usd = null;
      record.realized_roi_pct = null;
      return;
    }

    const salePrice = record.actual_sale_price_usd ?? 0;
    const acqCost = record.actual_acquisition_price_usd ?? 0;
    const renewalHoldingCost = 14 * Math.max(0.5, (record.holding_duration_days || 0) / 365);
    
    // Net PnL = Exit Revenue - Acquisition Cost - Carrying Renewal Fees
    const netPnl = salePrice - acqCost - (record.outcome_status === 'dropped_abandoned' ? renewalHoldingCost : 0);
    record.realized_net_pnl_usd = Math.round(netPnl);

    if (acqCost > 0) {
      const roi = (netPnl / acqCost) * 100;
      record.realized_roi_pct = Math.round(roi * 10) / 10;
    } else {
      record.realized_roi_pct = 0;
    }
  }

  public delete(id: string): boolean {
    const existed = this.records.delete(id);
    if (existed) {
      this.persistRecords();
    }
    return existed;
  }

  /**
   * Deterministic Calibration Metrics & Drift Detection Engine
   */
  public computeCalibrationReport(): CalibrationMetricsReport {
    const all = Array.from(this.records.values());
    const total_tracked_assets = all.length;

    if (total_tracked_assets === 0) {
      return {
        total_tracked_assets: 0,
        active_holdings_count: 0,
        completed_exits_count: 0,
        buy_verdict_precision_pct: 0,
        renew_verdict_precision_pct: 0,
        valuation_error_pct: 0,
        total_realized_pnl_usd: 0,
        decision_distribution: {
          buy_pct: 0,
          review_pct: 0,
          pass_pct: 0,
          insufficient_pct: 0
        },
        calibration_health: 'healthy',
        tuning_recommendation: 'No tracked domain outcomes recorded yet. Track domain acquisitions and sales to activate live calibration analytics.'
      };
    }

    let active_holdings_count = 0;
    let completed_exits_count = 0;
    let total_realized_pnl_usd = 0;

    let buyVerdictCount = 0;
    let buyProfitableExits = 0;
    let buyTotalExits = 0;

    let renewVerdictCount = 0;
    let renewPositiveCount = 0;

    let sumAbsolutePctErrors = 0;
    let valuationCompsCount = 0;

    let buyDecisions = 0;
    let reviewDecisions = 0;
    let passDecisions = 0;
    let insufficientDecisions = 0;

    for (const r of all) {
      const v = (r.initial_verdict || '').toLowerCase();
      if (v === 'buy') buyDecisions++;
      else if (v === 'review') reviewDecisions++;
      else if (v === 'pass' || v === 'drop') passDecisions++;
      else insufficientDecisions++;

      const isClosed = 
        r.outcome_status === 'sold_profitable' ||
        r.outcome_status === 'sold_break_even' ||
        r.outcome_status === 'sold_loss' ||
        r.outcome_status === 'dropped_abandoned';

      if (isClosed) {
        completed_exits_count++;
        if (typeof r.realized_net_pnl_usd === 'number') {
          total_realized_pnl_usd += r.realized_net_pnl_usd;
        }

        // Check BUY precision
        if (v === 'buy') {
          buyTotalExits++;
          if (r.outcome_status === 'sold_profitable' || (r.realized_net_pnl_usd && r.realized_net_pnl_usd > 0)) {
            buyProfitableExits++;
          }
        }

        // Check Valuation MAPE (Mean Absolute Percentage Error) for sold domains
        if (
          r.actual_sale_price_usd && 
          r.actual_sale_price_usd > 0 && 
          r.initial_ev_usd && 
          r.initial_ev_usd > 0
        ) {
          const absError = Math.abs(r.actual_sale_price_usd - r.initial_ev_usd) / r.actual_sale_price_usd;
          sumAbsolutePctErrors += absError;
          valuationCompsCount++;
        }
      } else {
        active_holdings_count++;
        if (v === 'renew' || r.outcome_status === 'renewed_retained') {
          renewPositiveCount++;
        }
      }

      if (v === 'buy') buyVerdictCount++;
      if (v === 'renew') renewVerdictCount++;
    }

    const buy_verdict_precision_pct = buyTotalExits > 0 
      ? Math.round((buyProfitableExits / buyTotalExits) * 1000) / 10 
      : 0;

    const renew_verdict_precision_pct = renewVerdictCount > 0 
      ? Math.round((renewPositiveCount / renewVerdictCount) * 1000) / 10 
      : 0;

    const valuation_error_pct = valuationCompsCount > 0 
      ? Math.round((sumAbsolutePctErrors / valuationCompsCount) * 1000) / 10 
      : 0;

    const buy_pct = total_tracked_assets > 0 
      ? Math.round((buyDecisions / total_tracked_assets) * 1000) / 10 
      : 0;
    const review_pct = total_tracked_assets > 0 
      ? Math.round((reviewDecisions / total_tracked_assets) * 1000) / 10 
      : 0;
    const pass_pct = total_tracked_assets > 0 
      ? Math.round((passDecisions / total_tracked_assets) * 1000) / 10 
      : 0;
    const insufficient_pct = total_tracked_assets > 0 
      ? Math.round((insufficientDecisions / total_tracked_assets) * 1000) / 10 
      : 0;

    // Distribution Drift Detection Rules
    let calibration_health: 'healthy' | 'overly_optimistic' | 'overly_conservative' = 'healthy';
    let tuning_recommendation = 'Decision distribution is well-calibrated against market norms.';

    if (buy_pct > 40) {
      calibration_health = 'overly_optimistic';
      tuning_recommendation = 'Model is over-issuing BUY signals. Increase minimum composite threshold from 75 to 80.';
    } else if (buy_pct > 0 && buy_pct < 10) {
      calibration_health = 'overly_conservative';
      tuning_recommendation = 'Model is under-issuing BUY signals. Review risk gate tolerances.';
    }

    return {
      total_tracked_assets,
      active_holdings_count,
      completed_exits_count,
      buy_verdict_precision_pct,
      renew_verdict_precision_pct,
      valuation_error_pct,
      total_realized_pnl_usd: Math.round(total_realized_pnl_usd),
      decision_distribution: {
        buy_pct,
        review_pct,
        pass_pct,
        insufficient_pct
      },
      calibration_health,
      tuning_recommendation
    };
  }
}

export const outcomesEngine = new OutcomesEngine();
