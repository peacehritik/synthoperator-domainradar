import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  BookmarkPlus, 
  PieChart, 
  ArrowUpRight, 
  Download,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  X,
  Check,
  Globe
} from 'lucide-react';
import { siteConfig } from '../config/site';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import type { 
  DomainOutcomeRecord, 
  CalibrationMetricsReport, 
  OutcomeStatus, 
  DomainStrategyType 
} from '../types';

export const OutcomesDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [outcomes, setOutcomes] = useState<DomainOutcomeRecord[]>([]);
  const [metrics, setMetrics] = useState<CalibrationMetricsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');

  // Edit / Status Updater Modal State
  const [selectedRecord, setSelectedRecord] = useState<DomainOutcomeRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<OutcomeStatus>('holding');
  const [editSalePrice, setEditSalePrice] = useState<string>('');
  const [editHoldingDays, setEditHoldingDays] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDomain, setNewDomain] = useState<string>('');
  const [newStrategy, setNewStrategy] = useState<DomainStrategyType>('brandable');
  const [newVerdict, setNewVerdict] = useState<string>('Buy');
  const [newScore, setNewScore] = useState<number>(85);
  const [newEvUsd, setNewEvUsd] = useState<number>(5000);
  const [newAcqPrice, setNewAcqPrice] = useState<number>(500);
  const [newNotes, setNewNotes] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Fetch outcomes from server
  const fetchOutcomes = async () => {
    setLoading(true);
    setError(null);
    try {
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';
      const res = await fetch('/api/outcomes', {
        headers: {
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch outcomes (${res.status})`);
      }
      const data = await res.json();
      setOutcomes(data.outcomes || []);
      setMetrics(data.metrics || null);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load calibration records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, []);

  // Handle open edit status modal
  const handleOpenEdit = (rec: DomainOutcomeRecord) => {
    setSelectedRecord(rec);
    setEditStatus(rec.outcome_status);
    setEditSalePrice(rec.actual_sale_price_usd !== null ? rec.actual_sale_price_usd.toString() : '');
    setEditHoldingDays(rec.holding_duration_days ? rec.holding_duration_days.toString() : '0');
    setEditNotes(rec.notes || '');
    setIsEditModalOpen(true);
  };

  // Submit status/outcome update
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setIsUpdating(true);

    try {
      const salePriceNum = editSalePrice.trim() !== '' ? parseFloat(editSalePrice) : null;
      const holdingDaysNum = editHoldingDays.trim() !== '' ? parseInt(editHoldingDays, 10) : 0;
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';

      const res = await fetch(`/api/outcomes/${selectedRecord.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
        body: JSON.stringify({
          outcome_status: editStatus,
          actual_sale_price_usd: salePriceNum,
          holding_duration_days: holdingDaysNum,
          notes: editNotes
        })
      });

      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();

      setOutcomes(prev => prev.map(o => o.id === selectedRecord.id ? data.record : o));
      if (data.metrics) setMetrics(data.metrics);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update domain outcome record.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle record delete
  const handleDelete = async (id: string, domainName: string) => {
    if (!confirm(`Are you sure you want to remove ${domainName} from calibration tracking?`)) {
      return;
    }
    try {
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';
      const res = await fetch(`/api/outcomes/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
      });
      if (!res.ok) throw new Error('Deletion failed');
      const data = await res.json();
      setOutcomes(prev => prev.filter(o => o.id !== id));
      if (data.metrics) setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
      alert('Failed to delete outcome record.');
    }
  };

  // Handle manual log submission
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsCreating(true);

    try {
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
        body: JSON.stringify({
          domain: newDomain.trim().toLowerCase(),
          strategy_type: newStrategy,
          initial_verdict: newVerdict,
          initial_score: newScore,
          initial_ev_usd: newEvUsd,
          actual_acquisition_price_usd: newAcqPrice,
          notes: newNotes
        })
      });

      if (!res.ok) throw new Error('Failed to create record');
      const data = await res.json();

      setOutcomes(prev => [data.record, ...prev]);
      if (data.metrics) setMetrics(data.metrics);
      setIsAddModalOpen(false);
      setNewDomain('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
      alert('Failed to log outcome record.');
    } finally {
      setIsCreating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (outcomes.length === 0) return;

    const headers = [
      'Domain',
      'Strategy',
      'Audit Date',
      'Engine Version',
      'Initial Verdict',
      'Initial Score',
      'Estimated EV ($)',
      'Acquisition Basis ($)',
      'Status',
      'Holding Days',
      'Actual Exit Price ($)',
      'Realized PnL ($)',
      'Realized ROI (%)',
      'Notes'
    ];

    const rows = outcomes.map(o => [
      o.domain,
      o.strategy_type,
      o.audit_date,
      o.engine_version,
      o.initial_verdict,
      o.initial_score,
      o.initial_ev_usd,
      o.actual_acquisition_price_usd,
      o.outcome_status,
      o.holding_duration_days,
      o.actual_sale_price_usd !== null ? o.actual_sale_price_usd : '',
      o.realized_net_pnl_usd !== null ? o.realized_net_pnl_usd : '',
      o.realized_roi_pct !== null ? `${o.realized_roi_pct}%` : '',
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${siteConfig.name.toLowerCase()}_outcomes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Pill Helper
  const renderStatusBadge = (status: OutcomeStatus) => {
    switch (status) {
      case 'sold_profitable':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {t('outcomes_sold_profitable')}
          </span>
        );
      case 'sold_break_even':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {t('outcomes_sold_breakeven')}
          </span>
        );
      case 'sold_loss':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            {t('outcomes_sold_loss')}
          </span>
        );
      case 'renewed_retained':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            {t('outcomes_renewed_retained')}
          </span>
        );
      case 'dropped_abandoned':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            {t('outcomes_dropped')}
          </span>
        );
      case 'holding':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            {t('outcomes_active_hold')}
          </span>
        );
    }
  };

  // Filtered outcomes
  const filteredOutcomes = outcomes.filter(o => {
    const matchesSearch = o.domain.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesStatus = statusFilter === 'all' || o.outcome_status === statusFilter;
    const matchesStrategy = strategyFilter === 'all' || o.strategy_type === strategyFilter;
    return matchesSearch && matchesStatus && matchesStrategy;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('outcomes_title')}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {t('outcomes_badge')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            {t('outcomes_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchOutcomes}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('outcomes_btn_refresh')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={outcomes.length === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('btn_export_csv')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('outcomes_btn_log')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Realized Portfolio P&L */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {t('outcomes_kpi_pnl')}
              </span>
              <div className={`p-1.5 rounded-md ${metrics.total_realized_pnl_usd >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl font-extrabold font-mono ${metrics.total_realized_pnl_usd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                <LtrIsolate>{metrics.total_realized_pnl_usd >= 0 ? '+' : ''}${metrics.total_realized_pnl_usd.toLocaleString()}</LtrIsolate>
              </span>
              <span className="text-xs text-slate-500 font-mono">USD</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>{t('outcomes_kpi_pnl_sub', { closed: metrics.completed_exits_count, active: metrics.active_holdings_count })}</span>
            </div>
          </div>

          {/* Card 2: Model BUY Precision */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {t('outcomes_kpi_precision')}
              </span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                <LtrIsolate>{metrics.buy_verdict_precision_pct}%</LtrIsolate>
              </span>
              <span className="text-xs text-emerald-700 font-medium font-mono">{t('outcomes_kpi_precision_label')}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>{t('outcomes_exit_winrate')}</span>
              <span className="font-mono text-slate-500"><LtrIsolate>{t('outcomes_benchmark')}</LtrIsolate></span>
            </div>
          </div>

          {/* Card 3: Valuation Accuracy (MAPE) */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {t('outcomes_kpi_mape')}
              </span>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                <LtrIsolate>{metrics.valuation_error_pct}%</LtrIsolate>
              </span>
              <span className="text-xs text-slate-500 font-mono">{t('outcomes_kpi_mape_label')}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>{t('outcomes_ev_vs_realized')}</span>
              <span className="font-mono text-emerald-700 font-medium">{t('outcomes_inst_grade')}</span>
            </div>
          </div>

          {/* Card 4: Decision Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {t('outcomes_kpi_signals')}
              </span>
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            {/* Segmented Bar */}
            <div className="mt-3 h-2.5 rounded-full overflow-hidden flex bg-slate-100">
              <div 
                style={{ width: `${metrics.decision_distribution.buy_pct}%` }} 
                className="bg-emerald-500" 
                title={`Buy: ${metrics.decision_distribution.buy_pct}%`}
              />
              <div 
                style={{ width: `${metrics.decision_distribution.review_pct}%` }} 
                className="bg-amber-400" 
                title={`Review: ${metrics.decision_distribution.review_pct}%`}
              />
              <div 
                style={{ width: `${metrics.decision_distribution.pass_pct}%` }} 
                className="bg-rose-500" 
                title={`Pass: ${metrics.decision_distribution.pass_pct}%`}
              />
              <div 
                style={{ width: `${metrics.decision_distribution.insufficient_pct}%` }} 
                className="bg-slate-400" 
                title={`Insufficient: ${metrics.decision_distribution.insufficient_pct}%`}
              />
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
              <span className="text-emerald-700 font-semibold"><LtrIsolate>{metrics.decision_distribution.buy_pct}%</LtrIsolate> {t('verdict_buy')}</span>
              <span className="text-amber-700"><LtrIsolate>{metrics.decision_distribution.review_pct}%</LtrIsolate> {t('verdict_review')}</span>
              <span className="text-rose-700"><LtrIsolate>{metrics.decision_distribution.pass_pct}%</LtrIsolate> {t('verdict_pass')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Advisory Banner */}
      {metrics && (
        <div className={`p-4 rounded-lg border shadow-xs ${
          metrics.calibration_health === 'healthy'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : metrics.calibration_health === 'overly_optimistic'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <div className={`p-2 rounded-md ${
                metrics.calibration_health === 'healthy'
                  ? 'bg-emerald-600 text-white'
                  : metrics.calibration_health === 'overly_optimistic'
                  ? 'bg-amber-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {metrics.calibration_health === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current font-mono">
                    {metrics.calibration_health === 'healthy'
                      ? t('outcomes_status_healthy')
                      : metrics.calibration_health === 'overly_optimistic'
                      ? t('outcomes_status_optimistic')
                      : t('outcomes_status_conservative')}
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    {t('outcomes_sample_basis', { count: metrics.total_tracked_assets })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium mt-1">
                  {metrics.tuning_recommendation.includes('No tracked')
                    ? t('outcomes_rec_empty')
                    : metrics.tuning_recommendation.includes('well-calibrated')
                    ? t('outcomes_rec_healthy')
                    : metrics.tuning_recommendation.includes('over-issuing')
                    ? t('outcomes_rec_optimistic')
                    : t('outcomes_rec_conservative')}
                </p>
              </div>
            </div>

            <div className="text-right sm:shrink-0 text-xs font-mono opacity-80">
              <span>{t('outcomes_engine_version')}</span>
              <span className="block text-[11px] opacity-75">{t('outcomes_auto_tuned')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('outcomes_search_placeholder')}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">{t('outcomes_filter_status')}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 rounded-md border border-slate-300 text-slate-700 bg-white font-medium focus:outline-hidden"
            >
              <option value="all">{t('outcomes_all_outcomes')}</option>
              <option value="holding">{t('outcomes_active_hold')}</option>
              <option value="sold_profitable">{t('outcomes_sold_profitable')}</option>
              <option value="sold_break_even">{t('outcomes_sold_breakeven')}</option>
              <option value="sold_loss">{t('outcomes_sold_loss')}</option>
              <option value="renewed_retained">{t('outcomes_renewed_retained')}</option>
              <option value="dropped_abandoned">{t('outcomes_dropped')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">{t('outcomes_filter_strategy')}</span>
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="py-1 px-2.5 rounded-md border border-slate-300 text-slate-700 bg-white font-medium focus:outline-hidden"
            >
              <option value="all">{t('outcomes_all_archetypes')}</option>
              <option value="brandable">{t('strat_brandable')}</option>
              <option value="exact_match_keyword">{t('strat_exact_keyword')}</option>
              <option value="geo_service">{t('strat_geo_service')}</option>
              <option value="short_acronym_numeric">{t('strat_short_acronym')}</option>
              <option value="tech_trend">{t('strat_tech_trend')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Outcomes Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">{t('th_domain')}</th>
                <th className="py-3 px-4">{t('th_strategy')}</th>
                <th className="py-3 px-4">{t('th_verdict')}</th>
                <th className="py-3 px-4 text-right">{t('th_cost_basis')}</th>
                <th className="py-3 px-4 text-right">{t('th_est_value')}</th>
                <th className="py-3 px-4">{t('th_holding_time')}</th>
                <th className="py-3 px-4">{t('th_status')}</th>
                <th className="py-3 px-4 text-right">{t('th_actual_exit')}</th>
                <th className="py-3 px-4 text-right">{t('th_net_pnl')}</th>
                <th className="py-3 px-4 text-center">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOutcomes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-slate-500 text-xs">
                    <div className="max-w-md mx-auto space-y-2 px-4">
                      <Target className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-medium text-slate-700">
                        {outcomes.length === 0 
                          ? t('outcomes_empty_desc')
                          : t('outcomes_no_matching_filter')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOutcomes.map((rec) => {
                  const hasExit = rec.actual_sale_price_usd !== null;
                  const netPnl = rec.realized_net_pnl_usd;
                  const roi = rec.realized_roi_pct;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Domain */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold"><LtrIsolate>{rec.domain}</LtrIsolate></span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                          {rec.audit_date} &bull; v{rec.engine_version}
                        </span>
                      </td>

                      {/* Strategy */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {rec.strategy_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Verdict & Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold uppercase font-mono ${
                            rec.initial_verdict.toLowerCase() === 'buy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.initial_verdict.toLowerCase() === 'review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {rec.initial_verdict}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {rec.initial_score}/100
                          </span>
                        </div>
                      </td>

                      {/* Acquisition Price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        <LtrIsolate>${rec.actual_acquisition_price_usd.toLocaleString()}</LtrIsolate>
                      </td>

                      {/* Estimated EV */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        <LtrIsolate>${rec.initial_ev_usd.toLocaleString()}</LtrIsolate>
                      </td>

                      {/* Holding Time */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span><LtrIsolate>{rec.holding_duration_days}</LtrIsolate> {t('days_label')}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans block">
                          {t('mos_approx', { val: Math.round((rec.holding_duration_days / 30) * 10) / 10 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {renderStatusBadge(rec.outcome_status)}
                      </td>

                      {/* Actual Exit Price */}
                      <td className="py-3 px-4 text-right font-mono">
                        {hasExit ? (
                          <span className="font-semibold text-slate-900">
                            <LtrIsolate>${rec.actual_sale_price_usd?.toLocaleString()}</LtrIsolate>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">{t('outcomes_active_hold_short')}</span>
                        )}
                      </td>

                      {/* Realized Net P&L / ROI */}
                      <td className="py-3 px-4 text-right font-mono">
                        {netPnl !== null ? (
                          <div>
                            <span className={`font-bold ${netPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              <LtrIsolate>{netPnl >= 0 ? '+' : ''}${netPnl.toLocaleString()}</LtrIsolate>
                            </span>
                            {roi !== null && (
                              <span className={`block text-[10px] font-semibold ${roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <LtrIsolate>({roi >= 0 ? '+' : ''}{roi}%)</LtrIsolate>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">{t('outcomes_unrealized')}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title={t('modal_update_outcome')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rec.id, rec.domain)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Status Updater Modal */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('modal_update_outcome')}: <LtrIsolate>{selectedRecord.domain}</LtrIsolate>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('th_status')}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OutcomeStatus)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="holding">{t('outcomes_active_hold')}</option>
                  <option value="sold_profitable">{t('outcomes_sold_profitable')}</option>
                  <option value="sold_break_even">{t('outcomes_sold_breakeven')}</option>
                  <option value="sold_loss">{t('outcomes_sold_loss')}</option>
                  <option value="renewed_retained">{t('outcomes_renewed_retained')}</option>
                  <option value="dropped_abandoned">{t('outcomes_dropped')}</option>
                </select>
              </div>

              {(editStatus === 'sold_profitable' || editStatus === 'sold_break_even' || editStatus === 'sold_loss') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('outcomes_actual_sale_price')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editSalePrice}
                    onChange={(e) => setEditSalePrice(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('outcomes_holding_duration_days')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={editHoldingDays}
                  onChange={(e) => setEditHoldingDays(e.target.value)}
                  placeholder="e.g. 180"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('outcomes_notes_channel')}
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Sold on Dan.com marketplace to Series A buyer"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t('btn_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  {isUpdating ? t('btn_saving') : t('btn_save_updates')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Outcome Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('modal_log_asset_title')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('th_domain')}
                </label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. quantumflow.com"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('th_strategy')}
                  </label>
                  <select
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value as DomainStrategyType)}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="brandable">{t('strat_brandable')}</option>
                    <option value="exact_match_keyword">{t('strat_exact_keyword')}</option>
                    <option value="geo_service">{t('strat_geo_service')}</option>
                    <option value="short_acronym_numeric">{t('strat_short_acronym')}</option>
                    <option value="tech_trend">{t('strat_tech_trend')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('th_verdict')}
                  </label>
                  <select
                    value={newVerdict}
                    onChange={(e) => setNewVerdict(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-md border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Buy">{t('verdict_buy')}</option>
                    <option value="Review">{t('verdict_review')}</option>
                    <option value="Pass">{t('verdict_pass')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('th_cost_basis')} ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newAcqPrice}
                    onChange={(e) => setNewAcqPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('th_est_value')} ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEvUsd}
                    onChange={(e) => setNewEvUsd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('th_notes')}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Purchased via GoDaddy Auctions expiry"
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t('btn_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  {isCreating ? t('btn_adding') : t('btn_log_asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};