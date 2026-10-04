import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { HowItWorksSection } from './HowItWorksSection';
import { FaqSection } from './FaqSection';
import { siteConfig } from '../config/site';
import { JevInspectorModal } from './JevInspectorModal';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import type { 
  DecisionMode, 
  FullAuditResponse, 
  WatchlistDomain,
  StrategyProfileResult,
  RiskEngineResult,
  EconomicValuationResult,
  HoldingEfficiencyResult,
  ExplainabilityReport,
  EvidenceSignal,
  NextActionItem,
  AuditVersionTrace,
  UserManualEvidenceOverrides,
  MetricSourceTag,
  FreeEvidenceReport
} from '../types';

interface SingleAuditProps {
  onAddToWatchlist: (item: Omit<WatchlistDomain, 'id' | 'addedAt'>) => void;
  isInWatchlist: (domain: string) => boolean;
  onSelectMode?: (mode: DecisionMode) => void;
  auditTarget?: { domain: string; mode: DecisionMode } | null;
  onClearAuditTarget?: () => void;
}

const SAMPLE_DOMAINS = [
  { domain: 'paywave.com', label: 'Tier 1 Fintech' },
  { domain: 'hyperagent.ai', label: 'AI Trend Asset' },
  { domain: 'quickshop.io', label: 'E-Com Brand' },
  { domain: 'casacourier.ma', label: 'Morocco ccTLD' },
  { domain: 'cheap-free-downloads-123.xyz', label: 'Drop Candidate' },
  { domain: 'appledeals.store', label: 'Trademark Risk' },
];

const renderStrategyBadge = (profile?: StrategyProfileResult) => {
  if (!profile) return null;
  const { strategy_type, label, description } = profile;
  let colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let iconName = 'sparkles';
  if (strategy_type === 'exact_match_keyword') {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    iconName = 'tag';
  } else if (strategy_type === 'geo_service') {
    colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
    iconName = 'compass';
  } else if (strategy_type === 'short_acronym_numeric') {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    iconName = 'layers';
  } else if (strategy_type === 'tech_trend') {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    iconName = 'cpu';
  }

  return (
    <div className="inline-flex items-center gap-1.5 group relative">
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} shadow-2xs`}>
        <Icon name={iconName as any} className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>
      <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-30 w-72 p-2.5 bg-slate-900 text-white text-[11px] leading-relaxed rounded-md shadow-lg pointer-events-none">
        <div className="font-semibold text-slate-200 mb-0.5">{label} Archetype</div>
        <div className="text-slate-300">{description}</div>
      </div>
    </div>
  );
};

export function getDefaultRenewalCostForDomain(domain: string): number {
  const parts = domain.trim().toLowerCase().split('.');
  const tld = parts.length > 1 ? parts.slice(1).join('.') : 'com';
  switch (tld) {
    case 'ai':
      return 80;
    case 'io':
      return 45;
    case 'com':
    case 'net':
    case 'org':
      return 14;
    case 'co':
      return 28;
    case 'app':
    case 'dev':
    case 'store':
    case 'xyz':
    case 'tech':
    case 'cloud':
    case 'online':
    case 'site':
    case 'club':
      return 18;
    case 'ma':
    case 'ae':
    case 'sa':
    case 'fr':
    case 'de':
    case 'uk':
    case 'co.uk':
    case 'ca':
    case 'es':
    case 'it':
    case 'nl':
    case 'ch':
    case 'jp':
    case 'in':
      return 25;
    default:
      if (tld.length === 2 || tld.includes('.')) return 25;
      return 18;
  }
}

export const SingleAudit: React.FC<SingleAuditProps> = ({
  onAddToWatchlist,
  isInWatchlist,
  onSelectMode,
  auditTarget,
  onClearAuditTarget,
}) => {
  const { language, t, formatPrice, isRtl } = useLanguage();
  const [domainInput, setDomainInput] = useState('');
  const [mode, setMode] = useState<DecisionMode>('buy');
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<FullAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mode B Renewal specific inputs
  const [renewalCost, setRenewalCost] = useState<number>(14);
  const [parkingRevenue, setParkingRevenue] = useState<number>(0);
  const [inboundOffers, setInboundOffers] = useState<number>(0);
  const [monthlyImpressions, setMonthlyImpressions] = useState<number>(120);
  const [holdingYears, setHoldingYears] = useState<number>(2);

  // Optional Manual Evidence Enrichment Drawer State
  const [isManualEnrichmentOpen, setIsManualEnrichmentOpen] = useState(false);
  const [manualSearchVolume, setManualSearchVolume] = useState<string>('');
  const [manualCpc, setManualCpc] = useState<string>('');
  const [manualBacklinks, setManualBacklinks] = useState<string>('');
  const [manualReferringDomains, setManualReferringDomains] = useState<string>('');
  const [manualAskingPrice, setManualAskingPrice] = useState<string>('');
  const [manualInboundOffers, setManualInboundOffers] = useState<string>('');
  const [manualParkingRevenue, setManualParkingRevenue] = useState<string>('');

  const configuredOverridesCount = [
    manualSearchVolume,
    manualCpc,
    manualBacklinks,
    manualReferringDomains,
    manualAskingPrice,
    manualInboundOffers,
    manualParkingRevenue,
  ].filter((val) => val !== '').length;

  const sanitize = (val: string): string => {
    return val
      .trim()
      .toLowerCase()
      .replace(/^[a-zA-Z]+:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .replace(/[^a-z0-9.-]/g, '');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const clean = sanitize(text);
        setDomainInput(clean);
        setRenewalCost(getDefaultRenewalCostForDomain(clean));
        if (clean) {
          handleRunAudit(clean);
        }
      }
    } catch (err) {
      console.warn('Could not read from clipboard:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const handleRunAudit = async (targetDomain?: string, targetMode?: DecisionMode, forceRefresh: boolean = false) => {
    const activeDomain = sanitize(targetDomain || domainInput);
    const activeMode = targetMode || mode;

    if (!activeDomain) {
      setError('Please provide a valid domain name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';
      const domainRenewalCost = renewalCost || getDefaultRenewalCostForDomain(activeDomain);

      const manualOverrides: UserManualEvidenceOverrides = {
        exact_search_volume: manualSearchVolume !== '' ? Number(manualSearchVolume) : null,
        cpc_usd: manualCpc !== '' ? Number(manualCpc) : null,
        backlinks_count: manualBacklinks !== '' ? Number(manualBacklinks) : null,
        referring_domains: manualReferringDomains !== '' ? Number(manualReferringDomains) : null,
        custom_asking_price_usd: manualAskingPrice !== '' ? Number(manualAskingPrice) : null,
        inbound_inquiries_12m: manualInboundOffers !== '' ? Number(manualInboundOffers) : null,
        annual_parking_revenue_usd: manualParkingRevenue !== '' ? Number(manualParkingRevenue) : null,
      };

      let customWeightsPayload = undefined;
      try {
        const savedWeights = localStorage.getItem(`${siteConfig.name.toLowerCase()}_custom_weights`);
        if (savedWeights) customWeightsPayload = JSON.parse(savedWeights);
      } catch {}

      const response = await fetch('/api/domains/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
        body: JSON.stringify({
          domain: activeDomain,
          mode: activeMode,
          locale: language,
          force_refresh: forceRefresh,
          manual_overrides: manualOverrides,
          custom_weights: customWeightsPayload,
          renewalInput: {
            annualRenewalCost: domainRenewalCost,
            annualParkingRevenue: manualParkingRevenue !== '' ? Number(manualParkingRevenue) : parkingRevenue,
            inboundOffersLast12m: manualInboundOffers !== '' ? Number(manualInboundOffers) : inboundOffers,
            monthlyImpressions: monthlyImpressions,
            holdingYears: holdingYears,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Audit failed with status ${response.status}`);
      }

      const data: FullAuditResponse = await response.json();
      setAuditData(data);
      if (data.valuation?.annualCarryingCost) {
        setRenewalCost(data.valuation.annualCarryingCost);
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to complete audit. Ensure the server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auditTarget && auditTarget.domain) {
      setDomainInput(auditTarget.domain);
      setMode(auditTarget.mode);
      setRenewalCost(getDefaultRenewalCostForDomain(auditTarget.domain));
      handleRunAudit(auditTarget.domain, auditTarget.mode);
      onClearAuditTarget?.();
    }
  }, [auditTarget]);

  const handleModeChange = (newMode: DecisionMode) => {
    setMode(newMode);
    if (domainInput.trim() && auditData) {
      handleRunAudit(domainInput, newMode);
    }
  };

  const handleExportJsonDossier = () => {
    if (!auditData || !currentDecision) return;
    const exportPayload = {
      certification: {
        platform: `${siteConfig.name} Decision Intelligence Engine`,
        version: auditData.version_trace?.engine_version || siteConfig.version,
        model: auditData.version_trace?.model || 'jev-latest',
        state_hash_sha256: auditData.version_trace?.state_hash,
        timestamp_utc: auditData.version_trace?.timestamp || new Date().toISOString(),
        canonical_verification_url: `${siteConfig.url}/verify/${auditData.version_trace?.state_hash || ''}`,
      },
      audit_target: {
        domain: auditData.domain,
        mode: auditData.mode,
        decision_verdict: currentDecision.verdict,
        composite_score: currentDecision.compositeScore,
        strategy_archetype: currentDecision.strategy_profile?.label,
      },
      financial_valuation: currentDecision.economic_valuation,
      risk_evaluation: currentDecision.risk_evaluation,
      evidence_coverage: currentDecision.evidence,
      explainability_matrix: currentDecision.explainability,
      real_comparables: auditData.valuation?.comparables,
      canonical_state_json: auditData.version_trace?.canonical_state_json,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${siteConfig.name.toLowerCase()}_certified_audit_${auditData.domain}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPdfDossier = () => {
    window.print();
  };

  const handleWatchlistAction = () => {
    if (!auditData) return;
    const isBuy = auditData.mode === 'buy';
    const decision = isBuy ? auditData.buyDecision : auditData.renewalDecision;
    if (!decision) return;

    onAddToWatchlist({
      domain: auditData.domain,
      mode: auditData.mode,
      verdict: decision.verdict,
      score: decision.score,
      estimatedValue: isBuy
        ? auditData.valuation.estimatedValue
        : auditData.renewalDecision?.estimatedLiquidationValue || auditData.valuation.wholesaleLiquidationValue,
      annualCarryingCost: auditData.valuation.annualCarryingCost,
      annualParkingRevenue: parkingRevenue,
      inboundOffers: inboundOffers,
      holdingYears: holdingYears,
    });
  };

  const isBuyMode = mode === 'buy';
  const currentDecision = isBuyMode ? auditData?.buyDecision : auditData?.renewalDecision;
  const isSaved = auditData ? isInWatchlist(auditData.domain) : false;

  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeAcqPrice, setOutcomeAcqPrice] = useState<number>(100);
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [isLoggingOutcome, setIsLoggingOutcome] = useState(false);
  const [outcomeLoggedSuccess, setOutcomeLoggedSuccess] = useState(false);

  const handleOpenOutcomeModal = () => {
    if (!auditData || !currentDecision) return;
    const defaultCost = currentDecision.economic_valuation?.acquisition_cost_usd ||
      auditData.valuation?.wholesaleLiquidationValue ||
      100;
    setOutcomeAcqPrice(defaultCost);
    setOutcomeNotes(`Logged from audit. Verdict: ${currentDecision.verdict}, Score: ${currentDecision.compositeScore}/100.`);
    setIsOutcomeModalOpen(true);
    setOutcomeLoggedSuccess(false);
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditData || !currentDecision) return;
    setIsLoggingOutcome(true);

    try {
      const strategyType = currentDecision.strategy_profile?.strategy_type || 
        auditData.strategy_profile?.strategy_type || 
        'brandable';
      const initialEv = currentDecision.economic_valuation?.gross_expected_value_usd ||
        auditData.valuation?.estimatedValue ||
        1000;

      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: auditData.domain,
          strategy_type: strategyType,
          initial_verdict: currentDecision.verdict,
          initial_score: currentDecision.compositeScore ?? Math.round(currentDecision.score * 100),
          initial_ev_usd: initialEv,
          actual_acquisition_price_usd: outcomeAcqPrice,
          notes: outcomeNotes
        })
      });

      if (!res.ok) throw new Error('Failed to log outcome');
      setOutcomeLoggedSuccess(true);
      setTimeout(() => {
        setIsOutcomeModalOpen(false);
        setOutcomeLoggedSuccess(false);
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Failed to log domain into outcomes tracking.');
    } finally {
      setIsLoggingOutcome(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Certified Header (Visible only when printing/exporting PDF) */}
      {auditData && currentDecision && (
        <div className="print-only mb-6 p-5 border-2 border-slate-900 rounded-lg bg-white text-slate-900 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-bold font-mono text-sm">
                {siteConfig.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold uppercase tracking-tight">{siteConfig.name} Certified Audit Dossier</h1>
                <p className="text-[10px] text-slate-500 font-mono">Autonomous Domain Decision Intelligence Protocol</p>
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-600">
              <div>Date: {new Date().toISOString().split('T')[0]} (UTC)</div>
              <div>Verification Hash: #{auditData.version_trace?.state_hash?.slice(0, 16) || 'AUTHENTIC'}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 bg-slate-100 rounded">
              <span className="text-[9px] text-slate-500 uppercase block">Domain Target</span>
              <span className="font-bold text-slate-900">{auditData.domain}</span>
            </div>
            <div className="p-2 bg-slate-100 rounded">
              <span className="text-[9px] text-slate-500 uppercase block">Verdict</span>
              <span className="font-bold text-slate-900">{currentDecision.verdict}</span>
            </div>
            <div className="p-2 bg-slate-100 rounded">
              <span className="text-[9px] text-slate-500 uppercase block">Composite Score</span>
              <span className="font-bold text-slate-900">{currentDecision.compositeScore}/100</span>
            </div>
            <div className="p-2 bg-slate-100 rounded">
              <span className="text-[9px] text-slate-500 uppercase block">JEV Engine</span>
              <span className="font-bold text-slate-900">v{auditData.version_trace?.engine_version || '2.4.0'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Controller: Mode Tabs & Single Domain Audit Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('active_engine')}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isBuyMode ? t('mode_a_title') : t('mode_b_title')}
            </h2>
          </div>

          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => handleModeChange('buy')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isBuyMode
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('btn_mode_a')}
            </button>
            <button
              onClick={() => handleModeChange('renew')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                !isBuyMode
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('btn_mode_b')}
            </button>
          </div>
        </div>

        <div className="pt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAudit();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" size={20} />
              </div>
              <input
                ref={inputRef}
                type="text"
                dir="ltr"
                value={domainInput}
                onChange={(e) => setDomainInput(sanitize(e.target.value))}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-28 py-2.5 text-sm sm:text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs font-mono"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 inline-flex items-center space-x-1 cursor-pointer"
                  title="Paste domain from clipboard"
                >
                  <Icon name="clipboard-paste" size={14} className="text-slate-600" />
                  <span className="hidden sm:inline">{t('btn_paste', 'Paste')}</span>
                </button>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded">
                  Cmd+K
                </kbd>
              </div>
            </div>

            {isBuyMode && (
              <div className="relative w-36 sm:w-44 shrink-0" title="Optional target acquisition price in USD">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                  $
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={manualAskingPrice}
                  onChange={(e) => setManualAskingPrice(e.target.value)}
                  placeholder="Price (USD opt)"
                  className="w-full pl-6 pr-2 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon name="refresh-cw" size={16} className="mr-2 animate-spin" />
                  <span>{t('btn_auditing')}</span>
                </>
              ) : (
                <>
                  <span>{t('btn_audit')}</span>
                  <Icon name="chevron-right" size={16} className={`ml-1.5 ${isRtl ? 'rotate-180 mr-1.5 ml-0' : ''}`} />
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleRunAudit(undefined, undefined, true)}
              className="inline-flex items-center justify-center px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors border border-slate-300 shadow-xs disabled:opacity-50"
              title="Purge cache and execute fresh live audit"
            >
              <Icon name="rotate-ccw" size={16} className={`mr-1.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{t('btn_refresh')}</span>
            </button>
          </form>

          {/* Quick Sample Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium mr-1">{t('quick_samples')}</span>
            {SAMPLE_DOMAINS.map((s) => (
              <button
                key={s.domain}
                type="button"
                onClick={() => {
                  setDomainInput(s.domain);
                  setRenewalCost(getDefaultRenewalCostForDomain(s.domain));
                  handleRunAudit(s.domain);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono transition-colors border border-slate-200 flex items-center space-x-1"
              >
                <span>{s.domain}</span>
                <span className="text-[10px] text-slate-500 font-sans">({s.label})</span>
              </button>
            ))}
          </div>

          {/* Manual Evidence Enrichment Drawer */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsManualEnrichmentOpen(!isManualEnrichmentOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
                  <Icon name="cpu" size={16} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {t('drawer_title')}
                    </span>
                    {configuredOverridesCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {configuredOverridesCount} {t('drawer_configured')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {t('drawer_subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 shrink-0 ml-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {isManualEnrichmentOpen ? t('drawer_collapse') : t('drawer_configure')}
                </span>
                {isManualEnrichmentOpen ? (
                  <Icon name="chevron-up" size={16} className="text-slate-600" />
                ) : (
                  <Icon name="chevron-down" size={16} className="text-slate-600" />
                )}
              </div>
            </button>

            {isManualEnrichmentOpen && (
              <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {t('drawer_section_header')}
                  </span>
                  {configuredOverridesCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualSearchVolume('');
                        setManualCpc('');
                        setManualBacklinks('');
                        setManualReferringDomains('');
                        setManualAskingPrice('');
                        setManualInboundOffers('');
                        setManualParkingRevenue('');
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-600 underline font-mono self-start sm:self-auto cursor-pointer"
                    >
                      {t('btn_reset_overrides')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Mode A specific field: Asking/Purchase Price */}
                  {isBuyMode ? (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_ask')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder={t('drawer_input_ask_ph')}
                        value={manualAskingPrice}
                        onChange={(e) => setManualAskingPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  ) : (
                    /* Mode B specific field: Annual Renewal Cost */
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_renewal_cost', 'Annual Renewal Cost ($/yr)')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={renewalCost}
                        onChange={(e) => setRenewalCost(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}

                  {/* Mode B specific: Inbound inquiries */}
                  {!isBuyMode ? (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_inbound')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={t('drawer_input_inbound_ph')}
                        value={manualInboundOffers}
                        onChange={(e) => setManualInboundOffers(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_cpc')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t('drawer_input_cpc_ph')}
                        value={manualCpc}
                        onChange={(e) => setManualCpc(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}

                  {/* Mode B specific: Parking revenue */}
                  {!isBuyMode ? (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_parking')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={t('drawer_input_parking_ph')}
                        value={manualParkingRevenue}
                        onChange={(e) => setManualParkingRevenue(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {t('drawer_input_ref_dom')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder={t('drawer_input_ref_dom_ph')}
                        value={manualReferringDomains}
                        onChange={(e) => setManualReferringDomains(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}

                  {/* Search volume common */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {t('drawer_input_vol')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder={t('drawer_input_vol_ph')}
                      value={manualSearchVolume}
                      onChange={(e) => setManualSearchVolume(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Backlinks */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {t('drawer_input_backlinks', 'Backlinks Count')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 120"
                      value={manualBacklinks}
                      onChange={(e) => setManualBacklinks(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>{t('drawer_disclaimer')}</span>
                  <button
                    type="button"
                    onClick={() => handleRunAudit(undefined, undefined, true)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md self-start sm:self-auto transition-colors shadow-2xs cursor-pointer"
                  >
                    <Icon name="refresh-cw" size={12} className="mr-1" />
                    <span>{t('btn_apply_reaudit')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center space-x-2">
          <Icon name="info" size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State / Welcome Guide when no domain audited yet */}
      {!auditData && !loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <Icon name="sparkles" size={24} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t('empty_audit_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              {t('empty_audit_desc')}
            </p>
          </div>

          {/* Educational Protocol & FAQ Sections */}
          <HowItWorksSection />
          <FaqSection />
        </div>
      )}

      {/* Audit Results View */}
      {auditData && currentDecision && (
        <div className="space-y-6">
          {/* Audit Telemetry & State Hash Bar */}
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {auditData.version_trace?.cache_hit || auditData.cached ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  <Icon name="database" size={14} className="text-slate-600" />
                  <span>
                    CACHED TRACE ({auditData.version_trace?.latency_ms || auditData.latencyMs || 4}ms)
                  </span>
                </span>
              ) : auditData.version_trace?.execution_source === 'primary_jev_api' ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  <Icon name="zap" size={14} className="text-emerald-600" />
                  <span>LIVE EXECUTION (JEV API - {auditData.version_trace?.latency_ms || auditData.latencyMs || 218}ms)</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 font-mono"
                  title="Running on deterministic local simulation. Add your TypeSafe API key in Settings to activate live cloud inference."
                >
                  <Icon name="cpu" size={14} className="text-slate-600" />
                  <span>LOCAL CONTRACT ENGINE (Offline Demo - {auditData.version_trace?.latency_ms || auditData.latencyMs || 14}ms)</span>
                </span>
              )}

              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                <Icon name="git-branch" size={14} className="text-slate-500" />
                <span>Engine v{auditData.version_trace?.engine_version || '2.4.0'} / Q-Set {auditData.version_trace?.question_set_version || (isBuyMode ? 'acquisition-v2.1' : 'renewal-v2.1')}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              {auditData.version_trace?.state_hash && (
                <div
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]"
                  title="Deterministic SHA-256 State Hash - Click copy to copy full 64-char hash"
                >
                  <span className="text-slate-400">hash:</span>
                  <span className="font-semibold text-slate-800">
                    {auditData.version_trace.state_hash.slice(0, 10)}...
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(auditData.version_trace!.state_hash)}
                    className="p-0.5 hover:text-slate-900 transition-colors text-slate-500"
                    title="Deterministic SHA-256 State Hash - Click to copy full hash"
                  >
                    {copiedHash ? (
                      <Icon name="check" size={14} className="text-emerald-600" />
                    ) : (
                      <Icon name="copy" size={14} />
                    )}
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={() => handleRunAudit(undefined, undefined, true)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-md border border-slate-300 transition-colors shadow-2xs font-semibold"
                title="Bypass cache and force live re-audit"
              >
                <Icon name="rotate-ccw" size={14} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Force Live Re-Audit</span>
              </button>
            </div>
          </div>

          {/* Main Verdict Banner */}
          <div className={`p-6 rounded-lg border shadow-xs ${currentDecision.bannerClass}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/70 border border-current">
                    {isBuyMode ? 'Acquisition Verdict' : 'Portfolio Renewal Verdict'}
                  </span>
                  <span className="text-xs font-mono font-medium opacity-80">
                    Target: <LtrIsolate>{auditData.domain}</LtrIsolate>
                  </span>
                  {renderStrategyBadge(currentDecision.strategy_profile || auditData.strategy_profile || currentDecision.evidence?.strategyProfile)}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 border border-current flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>TypeSafe JEV ({auditData.jev?.model || 'jev-latest'})</span>
                  </span>
                  {auditData.jev && (
                    <span className="text-[10px] font-mono opacity-80">
                      {auditData.jev.source === 'api.typesafe.ai' ? 'Live api.typesafe.ai' : 'JEV System One Engine'} &bull; {auditData.jev.latencyMs}ms
                    </span>
                  )}
                  {currentDecision.evidence?.hardGateTriggered && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white tracking-wider">
                      {currentDecision.evidence.hardGateTriggered}
                    </span>
                  )}
                  {auditData.cached && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-white/90 rounded border border-current">
                      Cached 15m
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {currentDecision.verdict === 'Buy' || currentDecision.verdict === 'Renew' ? (
                    <Icon name="check-circle" size={28} className="text-emerald-600 shrink-0" />
                  ) : currentDecision.verdict === 'Review' ? (
                    <Icon name="info" size={28} className="text-amber-600 shrink-0" />
                  ) : (
                    <Icon name="x" size={28} className="text-rose-600 shrink-0" />
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {currentDecision.headline}
                  </h1>
                </div>

                <p className="text-sm sm:text-base font-normal opacity-90 max-w-3xl">
                  {currentDecision.summary}
                </p>

                {/* Atomic JEV System One Judgments Strip */}
                {auditData.jev && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs opacity-90 border-t border-current/20">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Atomic JEV Judgments:</span>
                      {isBuyMode ? (
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Brandability: {auditData.jev.modeAAnswers?.brandability.levelLabel || 'Average'} ({auditData.jev.modeAAnswers?.brandability.normalizedPercentage ?? 65}%)
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Liquidity: {auditData.jev.modeAAnswers?.aftermarket_liquidity.choice.replace('_', ' ') || 'slow speculative'}
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Memorability: {Math.round((auditData.jev.modeAAnswers?.startup_memorability.value ?? 0.25) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Justification: {auditData.jev.modeBAnswers?.renewal_justification.choice.replace('_', ' ') || 'borderline review'}
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Inbound Appeal: {Math.round((auditData.jev.modeBAnswers?.inbound_monetization_appeal.value ?? 0.5) * 100)}%
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Brandability: {auditData.jev.modeBAnswers?.brandability.levelLabel || 'Average'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                        (auditData.jev.modeAAnswers?.trademark_risk.choice === 'critical' || auditData.jev.modeAAnswers?.trademark_risk.choice === 'high')
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-white/60'
                      }`}>
                        Trademark: {auditData.jev.modeAAnswers?.trademark_risk.choice || auditData.jev.modeBAnswers?.trademark_risk.choice || 'clear'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Composite Score & Evidence Metrics & Watchlist Button */}
              <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-current/20">
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider font-semibold opacity-75 block">
                    Composite Score
                  </span>
                  <div className="text-3xl font-extrabold font-mono leading-none">
                    {currentDecision.compositeScore ?? Math.round(currentDecision.score * 100)}
                    <span className="text-sm font-normal opacity-75">/100</span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 text-[11px] font-mono opacity-80 mt-1">
                    <span title="Automated Open Telemetry Coverage">Telemetry: {currentDecision.evidence?.telemetryQualityPct ?? currentDecision.evidence?.coverageReport?.telemetry_coverage_pct ?? 100}%</span>
                    <span>&bull;</span>
                    <span title="Commercial Decision Diligence Coverage">Diligence: {currentDecision.evidence?.dataQualityPct ?? 50}%</span>
                    <span>&bull;</span>
                    <span>JEV Conf: {currentDecision.evidence?.jevConfidence ?? 75}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintPdfDossier}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors no-print"
                    title={t('btn_print_dossier', 'Print / PDF Certified Dossier')}
                  >
                    <Icon name="printer" size={14} className="text-slate-600" />
                    <span>{t('btn_print_dossier', 'Print Dossier (PDF)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJsonDossier}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors no-print"
                    title={t('btn_export_json_dossier', 'Download Certified JSON Audit')}
                  >
                    <Icon name="download" size={14} className="text-slate-600" />
                    <span>{t('btn_export_json_dossier', 'Export JSON')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInspectorOpen(true)}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors no-print"
                    title={t('btn_inspect_payload')}
                  >
                    <Icon name="code" size={14} className="text-slate-600" />
                    <span>{t('btn_inspect_payload')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenOutcomeModal}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors no-print"
                    title={t('btn_track_outcome')}
                  >
                    <Icon name="bookmark-plus" size={14} className="text-emerald-600" />
                    <span>{t('btn_track_outcome')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWatchlistAction}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors no-print ${
                      isSaved
                        ? 'bg-white text-emerald-800 border border-emerald-300'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Icon name="bookmark-check" size={14} className="text-emerald-600" />
                        <span>{t('btn_saved_portfolio')}</span>
                      </>
                    ) : (
                      <>
                        <Icon name="bookmark-plus" size={14} />
                        <span>{t('btn_track_portfolio')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Diligence Guidance Banner (Mode-Specific) */}
          {(currentDecision.verdict === 'Review' || (currentDecision.evidence && currentDecision.evidence.dataQualityPct < 75)) && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-200/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Icon name="target" size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    {isBuyMode ? t('diligence_banner_title_buy') : t('diligence_banner_title_renew')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualEnrichmentOpen(true);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-indigo-100/80 text-indigo-900 border border-indigo-300 rounded-md text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <Icon name="sliders" size={14} className="text-indigo-700" />
                  <span>{t('btn_open_diligence')}</span>
                </button>
              </div>

              <p className="text-xs text-indigo-900/90 leading-relaxed">
                {isBuyMode ? t('diligence_banner_desc_buy') : t('diligence_banner_desc_renew')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-medium text-indigo-950">
                <div className="p-2.5 bg-white/90 rounded border border-indigo-200/70 shadow-2xs">
                  {isBuyMode ? t('diligence_req_price_buy') : t('diligence_req_parking_renew')}
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-indigo-200/70 shadow-2xs">
                  {isBuyMode ? t('diligence_req_search_buy') : t('diligence_req_inbounds_renew')}
                </div>
                <div className="p-2.5 bg-white/90 rounded border border-indigo-200/70 shadow-2xs">
                  {isBuyMode ? t('diligence_req_seo_buy') : t('diligence_req_cost_renew')}
                </div>
              </div>
            </div>
          )}

          {/* Primary Metric Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">{t('metric_length')}</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {auditData.valuation.length}
                </span>
                <span className="text-xs text-slate-400 font-normal">{t('chars_sld')}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {auditData.valuation.length <= 4
                  ? 'Ultra Short (Premium)'
                  : auditData.valuation.length <= 8
                  ? 'Optimal Brandable'
                  : 'Longer Phrase'}
              </span>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">{t('metric_syllables')}</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {auditData.valuation.syllables}
                </span>
                <span className="text-xs text-slate-400 font-normal">{t('syllables_label')}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {auditData.valuation.syllables <= 2 ? 'High Pronounceability' : 'Multi-syllabic'}
              </span>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">{t('metric_extension_tier')}</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  <LtrIsolate>{auditData.valuation.extension.tld}</LtrIsolate>
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                  {auditData.valuation.extension.tier}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Credibility: {auditData.valuation.extension.credibility}
              </span>
            </div>

            {/* Card 4: Model Retail Midpoint */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                {isBuyMode ? 'Model Retail Midpoint' : t('metric_liquidation_exit')}
              </span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  <LtrIsolate>
                    ${(isBuyMode
                      ? (currentDecision.economic_valuation?.retail_range.midpoint ?? auditData.valuation.estimatedValue)
                      : auditData.renewalDecision?.estimatedLiquidationValue ?? auditData.valuation.wholesaleLiquidationValue
                    ).toLocaleString()}
                  </LtrIsolate>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Wholesale: <LtrIsolate>${(currentDecision.economic_valuation?.wholesale_range.midpoint ?? auditData.valuation.wholesaleLiquidationValue).toLocaleString()}</LtrIsolate>
              </span>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">{t('metric_carrying_cost')}</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  <LtrIsolate>${auditData.valuation.annualCarryingCost}</LtrIsolate>
                </span>
                <span className="text-xs text-slate-400 font-normal">/yr</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Registry Base Fee
              </span>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">{t('metric_decision_verdict')}</span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2.5 py-1 text-sm font-bold rounded-md ${
                    currentDecision.verdict === 'Buy' || currentDecision.verdict === 'Renew'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentDecision.verdict === 'Review'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {currentDecision.verdict.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Score: {currentDecision.score.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Hard Gate Inviolable Blocking Banner */}
          {currentDecision.risk_evaluation?.overall_status === 'hard_blocked' && (
            <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-lg flex items-start space-x-3 shadow-xs">
              <Icon name="lock" size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                    Automated Action Blocked
                  </span>
                  <span className="text-sm font-bold text-rose-900">
                    Hard Risk Gate Active: {currentDecision.risk_evaluation.blocked_by_gate || 'Critical Risk Constraint'}
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {currentDecision.risk_evaluation.evaluated_gates.find(g => g.status === 'blocked')?.reason ||
                    'Inviolable policy protection triggered. Automated acquisition or renewal is blocked to protect capital.'}
                </p>
              </div>
            </div>
          )}

          {/* Financial Valuation & Expected Value Card */}
          {(currentDecision.economic_valuation || auditData.valuation.economic_valuation || auditData.economic_valuation) && (
            (() => {
              const econ = (currentDecision.economic_valuation || auditData.valuation.economic_valuation || auditData.economic_valuation)!;
              const holdingEff = auditData.renewalDecision?.holding_efficiency || auditData.holding_efficiency;
              return (
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Icon name="receipt" size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {t('fin_title')}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {t('fin_subtitle')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {econ.acquisition_status === 'user_specified' ? (
                          <span>Ask Price: <LtrIsolate>${econ.acquisition_cost_usd}</LtrIsolate> (User Specified)</span>
                        ) : econ.acquisition_status === 'available_registry' ? (
                          <span>Registration Fee: <LtrIsolate>${econ.acquisition_cost_usd}</LtrIsolate> (Available)</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">Ask Price: Unknown (Awaiting Seller Price)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-500 block mb-1">
                        {t('fin_wholesale_range')}
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        <LtrIsolate>${econ.wholesale_range.low.toLocaleString()} - ${econ.wholesale_range.high.toLocaleString()}</LtrIsolate>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {t('fin_wholesale_sub')}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-500 block mb-1">
                        {t('fin_retail_range')}
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        <LtrIsolate>${econ.retail_range.low.toLocaleString()} - ${econ.retail_range.high.toLocaleString()}</LtrIsolate>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {t('fin_retail_sub')} (Mid: <LtrIsolate>${econ.retail_range.midpoint.toLocaleString()}</LtrIsolate>)
                      </span>
                    </div>

                    <div className={`p-4 border rounded-lg ${
                      econ.acquisition_status === 'unknown_aftermarket'
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : econ.is_positive_roi_spread
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-80">
                          {t('fin_net_ev')}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                          econ.acquisition_status === 'unknown_aftermarket'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : econ.is_positive_roi_spread
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {econ.acquisition_status === 'unknown_aftermarket'
                            ? 'Price Required'
                            : econ.is_positive_roi_spread
                            ? t('fin_positive_spread')
                            : t('fin_negative_spread')}
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold font-mono mt-1">
                        {econ.acquisition_status === 'unknown_aftermarket' ? (
                          <span className="text-lg text-slate-500 font-sans font-semibold">Pending Price</span>
                        ) : (
                          <span>
                            <LtrIsolate>{econ.net_actuarial_expected_value_usd! >= 0 ? '+' : ''}${econ.net_actuarial_expected_value_usd!.toLocaleString()}</LtrIsolate>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80 mt-1 block">
                        {econ.acquisition_status === 'unknown_aftermarket'
                          ? 'Input seller asking price above to calculate Net EV spread.'
                          : `Scenario assumption: ${econ.estimated_annual_sale_probability_pct}% modeled annual sale-rate (Uncalibrated scenario)`}
                      </span>
                    </div>
                  </div>

                  {!isBuyMode && holdingEff && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            {t('fin_efficiency_ratio')}: {holdingEff.holding_efficiency_ratio}x Annual Renewal
                          </span>
                          <span className="text-xs text-slate-500">
                            Total Annual Economic Yield (${holdingEff.total_annual_economic_value_usd}/yr) vs Renewal Fee (${holdingEff.annual_renewal_cost_usd}/yr)
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded border font-mono ${
                          holdingEff.efficiency_status === 'surplus_hold'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : holdingEff.efficiency_status === 'break_even_review'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {holdingEff.verdict_label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex text-[10px] font-mono text-slate-500 justify-between">
                          <span>Sunk Cost Drag (&lt;1.0x)</span>
                          <span>Break-Even (1.0x - 2.0x)</span>
                          <span>Surplus Asset (&ge;2.0x)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          <div className={`h-full transition-all duration-500 ${
                            holdingEff.holding_efficiency_ratio >= 2.0
                              ? 'bg-emerald-500'
                              : holdingEff.holding_efficiency_ratio >= 1.0
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} style={{ width: `${Math.min(100, (holdingEff.holding_efficiency_ratio / 3.0) * 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span>{t('fin_sunk_cost_notice')}</span>
                        <span>Evaluation Rule: Forward-looking cashflow only</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}

          {/* Real Public Comparable Sales Ledger Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Icon name="receipt" size={16} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t('comps_title')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('comps_subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {auditData.valuation.comparables && auditData.valuation.comparables.length > 0 ? (
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {auditData.valuation.comparables.length} Observed Comps &bull; Median: <LtrIsolate>${auditData.valuation.medianComparableUsd?.toLocaleString()}</LtrIsolate>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {t('comps_no_match')}
                  </span>
                )}
              </div>
            </div>

            {auditData.valuation.comparables && auditData.valuation.comparables.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Comparable Domain</th>
                      <th className="py-2.5 px-3 text-right">Real Sale Price</th>
                      <th className="py-2.5 px-3">Sale Date</th>
                      <th className="py-2.5 px-3">Sales Venue</th>
                      <th className="py-2.5 px-3">Affinity Match Reason</th>
                      <th className="py-2.5 px-3 text-center">Data Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {auditData.valuation.comparables.map((comp) => (
                      <tr key={comp.domain} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <LtrIsolate>{comp.domain}</LtrIsolate>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          <LtrIsolate>${comp.sale_price_usd.toLocaleString()}</LtrIsolate>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                          {comp.sale_date}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-sans text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {comp.venue}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                          {comp.match_reason}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                            OBSERVED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">
                  No Direct Comparable Transactions Qualified
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  No historical aftermarket sale in the local public ledger met the minimum 40% affinity threshold for length, extension, and naming structure. In accordance with Constitutional Rule 01, this metric remains honest and unobserved.
                </p>
              </div>
            )}
          </div>

          {/* Institutional Risk Gates & Capital Diligence Panel */}
          {currentDecision.risk_evaluation && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <Icon name="shield-check" size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {t('gates_title')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('gates_subtitle')}
                    </p>
                  </div>
                </div>

                <div>
                  {currentDecision.risk_evaluation.overall_status === 'cleared' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Icon name="shield-check" size={14} className="text-emerald-600" />
                      <span>{t('gates_all_cleared')}</span>
                    </span>
                  ) : currentDecision.risk_evaluation.overall_status === 'hard_blocked' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <Icon name="shield-alert" size={14} className="text-rose-600" />
                      <span>{t('gates_hard_blocked')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Icon name="info" size={16} className="text-amber-600" />
                      <span>{t('gates_diligence_review')}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Capital Diligence Budget: {currentDecision.risk_evaluation.risk_budget.tier_label}
                  </span>
                  <span className="font-mono text-slate-600">
                    Required: {currentDecision.risk_evaluation.risk_budget.required_evidence_coverage_pct}% | Actual: <strong className="text-slate-900">{currentDecision.risk_evaluation.risk_budget.actual_evidence_coverage_pct}%</strong>
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentDecision.risk_evaluation.risk_budget.is_diligence_satisfied
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${currentDecision.risk_evaluation.risk_budget.actual_evidence_coverage_pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Exposure: {currentDecision.risk_evaluation.risk_budget.acquisition_price_usd !== null ? (
                      <strong className="text-slate-900 font-mono">${currentDecision.risk_evaluation.risk_budget.acquisition_price_usd}</strong>
                    ) : (
                      <span className="text-amber-700 font-medium">Unknown (Price Input Required)</span>
                    )}
                  </span>
                  <span>
                    Status: {currentDecision.risk_evaluation.risk_budget.is_diligence_satisfied ? (
                      <strong className="text-emerald-700 font-medium">Diligence Quorum Satisfied</strong>
                    ) : (
                      <strong className="text-amber-700 font-medium">Manual Verification Required</strong>
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentDecision.risk_evaluation.evaluated_gates.map((gate) => (
                  <div
                    key={gate.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      gate.status === 'blocked'
                        ? 'bg-rose-50/70 border-rose-300'
                        : gate.status === 'warning'
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                        {gate.status === 'blocked' ? (
                          <Icon name="x" size={16} className="text-rose-600 shrink-0" />
                        ) : gate.status === 'warning' ? (
                          <Icon name="alert-circle" size={16} className="text-amber-600 shrink-0" />
                        ) : (
                          <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
                        )}
                        <span>{t(`${gate.id}_name`, gate.name)}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold font-mono px-1.5 py-0.2 rounded ${
                        gate.status === 'blocked'
                          ? 'bg-rose-600 text-white'
                          : gate.status === 'warning'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {gate.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      {t(`${gate.id}_desc`, gate.description)}
                    </p>

                    {gate.triggered && gate.reason && (
                      <div className="text-[11px] font-medium text-slate-800 pt-1 border-t border-current/10">
                        Reason: {gate.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode B: Interactive Portfolio Holding Calculator */}
          {!isBuyMode && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Icon name="sliders" size={20} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Portfolio Carrying Economics & Renewal ROI Calculator
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunAudit(auditData.domain, 'renew')}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <Icon name="refresh-cw" size={14} />
                  <span>Recalculate Decision</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Annual Renewal Fee ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={renewalCost}
                    onChange={(e) => setRenewalCost(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Standard TLD registrar cost</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Annual Parking / Lease ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={parkingRevenue}
                    onChange={(e) => setParkingRevenue(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Monetization yield</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Inbound Offers (Last 12m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={inboundOffers}
                    onChange={(e) => setInboundOffers(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Unsolicited buyer inquiries</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Monthly Impressions
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyImpressions}
                    onChange={(e) => setMonthlyImpressions(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Type-in traffic volume</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Years Held in Portfolio
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={holdingYears}
                    onChange={(e) => setHoldingYears(Number(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Carrying duration</span>
                </div>
              </div>

              {auditData.renewalDecision && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between text-xs gap-3">
                  <div>
                    <span className="text-slate-500 font-medium">Net Annual Cashflow: </span>
                    <span
                      className={`font-mono font-bold ${
                        auditData.renewalDecision.netAnnualCashflow >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {auditData.renewalDecision.netAnnualCashflow >= 0 ? '+' : ''}$
                      {auditData.renewalDecision.netAnnualCashflow}/yr
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">3-Year Carrying Drag: </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${auditData.renewalDecision.threeYearCarryingCost}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Wholesale Liquidation: </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${auditData.renewalDecision.estimatedLiquidationValue}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-medium">Holding Efficiency: </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {(auditData.renewalDecision.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deep Technical & Commercial Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Icon name="award" size={20} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">{t('metric_brand_equity_score')} &amp; Traffic</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Heuristic Engine</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">JEV Brand Equity Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${auditData.jev?.modeAAnswers?.brandability.normalizedPercentage ?? 65}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {auditData.jev?.modeAAnswers?.brandability.normalizedPercentage ?? 65}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Pronounceability Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-slate-700 h-full rounded-full"
                        style={{ width: `${auditData.valuation.pronounceabilityScore}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {auditData.valuation.pronounceabilityScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Estimated Search Volume</span>
                  {auditData.valuation.searchVolumeEstimate !== null ? (
                    <span className="font-mono font-bold text-slate-900">
                      {auditData.valuation.searchVolumeEstimate.toLocaleString()} queries/mo
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 border border-slate-200 text-xs px-2 py-0.5 rounded font-mono inline-flex items-center gap-1">
                      <Icon name="help-circle" size={12} className="text-slate-400" /> Unknown
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Advertising CPM Tier</span>
                  <span className="font-medium text-slate-900">
                    {auditData.valuation.cpmTier}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Trademark Friction</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-xs ${
                      auditData.valuation.trademarkRisk === 'Low'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : auditData.valuation.trademarkRisk === 'Medium'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {auditData.valuation.trademarkRisk} Risk
                  </span>
                </div>

                {auditData.valuation.keywordMatch.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1.5">Identified Commercial Keywords:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {auditData.valuation.keywordMatch.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-mono rounded border border-slate-200"
                        >
                          +{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Icon name="globe" size={20} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">{t('metric_rdap_whois')}</h3>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    auditData.rdap.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : auditData.rdap.status === 'registered'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {auditData.rdap.status === 'available'
                    ? 'AVAILABLE (RDAP 404)'
                    : auditData.rdap.status === 'registered'
                    ? 'REGISTERED (RDAP 200)'
                    : auditData.rdap.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('metric_registrar')}</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
                    {auditData.rdap.registrar || 'Protected / Verisign Registry'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('metric_reg_date')}</span>
                  <span className="font-mono text-slate-900">
                    {auditData.rdap.createdDate
                      ? new Date(auditData.rdap.createdDate).toLocaleDateString()
                      : 'Aged Record'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('metric_exp_date')}</span>
                  <span className="font-mono text-slate-900">
                    {auditData.rdap.expirationDate
                      ? new Date(auditData.rdap.expirationDate).toLocaleDateString()
                      : 'Active Portfolio'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('metric_nameservers')}</span>
                  <span className="font-mono text-xs text-slate-700">
                    {auditData.rdap.nameservers && auditData.rdap.nameservers.length > 0
                      ? `${auditData.rdap.nameservers.length} Nameservers Routed`
                      : 'Standard DNS Root'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('metric_http_status')}</span>
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                    HTTP {auditData.rdap.rdapStatusCode || 200}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Intelligence & Verified Evidence Breakdown Card */}
          {currentDecision.evidence && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Icon name="scale" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Why This Decision: Verified Evidence &amp; Formula Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Facts ➔ Atomic JEV Judgments ➔ Weighted Composite Engine &amp; Hard Gates
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                    Status: {currentDecision.statusLabel || currentDecision.verdict}
                  </span>
                  {currentDecision.evidence.hardGateTriggered && (
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-rose-100 border border-rose-300 text-rose-800">
                      {currentDecision.evidence.hardGateTriggered}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
                {/* Gauge 1: Observed Automated Telemetry Coverage */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                        <Icon name="globe" size={16} className="text-emerald-600" />
                        <span>{t('metric_telemetry_cov')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {currentDecision.evidence.telemetryQualityPct ?? currentDecision.evidence.coverageReport?.telemetry_coverage_pct ?? 100}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${currentDecision.evidence.telemetryQualityPct ?? currentDecision.evidence.coverageReport?.telemetry_coverage_pct ?? 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    Automated probing across 7 open sources: RDAP registry, DNS, Wayback CDX, Google Suggest, Wikipedia, and Trademark index.
                  </span>
                </div>

                {/* Gauge 2: Commercial Decision Diligence Coverage */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                        <Icon name="shield-check" size={16} className="text-emerald-600" />
                        <span>{t('metric_diligence_cov')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {currentDecision.evidence.dataQualityPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentDecision.evidence.dataQualityPct >= 70
                            ? 'bg-emerald-500'
                            : currentDecision.evidence.dataQualityPct >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${currentDecision.evidence.dataQualityPct}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    {currentDecision.evidence.dataQualityPct >= 70
                      ? 'High commercial diligence: Search intent, seller pricing, and link authority verified.'
                      : currentDecision.evidence.dataQualityPct >= 40
                      ? 'Moderate diligence: Core structural facts verified; third-party SEO signals unlinked.'
                      : 'Low diligence (<40%): Hard Gate 2 active - Capital deployment requires secondary verification.'}
                  </span>
                </div>

                {/* Gauge 3: JEV Statistical Confidence */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                        <Icon name="cpu" size={16} className="text-emerald-600" />
                        <span>{t('metric_jev_conf')}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {currentDecision.evidence.jevConfidence}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${currentDecision.evidence.jevConfidence}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    TypeSafe JEV statistical certainty across brandability, aftermarket liquidity, and trademark collision judgments.
                  </span>
                </div>
              </div>

              {auditData.free_evidence && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <Icon name="globe" size={14} className="text-emerald-600" />
                        <span>Automated Free Telemetry Signals (0ms Heuristics &amp; Public Endpoints)</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      100% Free Public Discovery &bull; {auditData.free_evidence.latencyMs || 18}ms parallel lookup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="archive" size={14} className="text-slate-500" />
                          <span>Wayback Machine</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Wayback CDX (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.wayback.has_historical_snapshots ? (
                          <span>
                            {auditData.free_evidence.wayback.snapshot_count} snapshots ({auditData.free_evidence.wayback.first_seen_year || 'Aged'} - {auditData.free_evidence.wayback.last_seen_year || 'Recent'})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No historical web snapshots indexed</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="search" size={14} className="text-slate-500" />
                          <span>Google Autocomplete</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Google Suggest (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.googleSuggest.suggestion_count > 0 ? (
                          <div className="space-y-0.5">
                            <span>{auditData.free_evidence.googleSuggest.suggestion_count} related queries found</span>
                            {auditData.free_evidence.googleSuggest.has_commercial_intent_tokens && (
                              <span className="ml-1.5 inline-block text-[9px] font-bold px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                Commercial Intent
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No live query autocomplete patterns</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="file-text" size={14} className="text-slate-500" />
                          <span>Wikipedia Entity</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Wikipedia Entity (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.wikipedia.is_encyclopedic_term ? (
                          <span className="text-emerald-700 font-semibold">
                            Recognized Knowledge Concept ({auditData.free_evidence.wikipedia.search_hit_count} hits)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No exact encyclopedic article match</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="globe" size={14} className="text-slate-500" />
                          <span>Node DNS Resolution</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Node DNS (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.dns.is_resolving ? (
                          <span>
                            Active DNS &bull; {auditData.free_evidence.dns.has_mx_mail_records ? 'MX Mail Configured' : 'Web Only Routing'}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No active A/AAAA DNS records (Parked or Inactive)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="shield-check" size={14} className="text-slate-500" />
                          <span>Local Trademark Scan</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Local Brand Index (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.trademarkScan.trademark_collision_risk === 'high' ? (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <Icon name="alert-circle" size={12} className="text-rose-600" />
                            High Collision: {auditData.free_evidence.trademarkScan.matched_brand_name}
                          </span>
                        ) : auditData.free_evidence.trademarkScan.trademark_collision_risk === 'low' ? (
                          <span className="text-amber-700 font-semibold">
                            Similar to {auditData.free_evidence.trademarkScan.matched_brand_name}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">
                            Zero collision against 1,000+ top trademarks
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Icon name="sliders" size={14} className="text-slate-500" />
                          <span>User Diligence Overrides</span>
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                          configuredOverridesCount > 0 ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {configuredOverridesCount > 0 ? 'Source: User Manual (Verified)' : 'Source: Unknown / Not Provided'}
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {configuredOverridesCount > 0 ? (
                          <span>{configuredOverridesCount} verified metric overrides applied</span>
                        ) : (
                          <span className="text-slate-500 italic">Optional manual metrics empty</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentDecision.evidence?.strategyProfile && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <Icon name="layers" size={14} className="text-slate-600" />
                        <span>Dynamic Weighting Matrix: {currentDecision.evidence.strategyProfile.label}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Composite Score: <span className="font-bold text-slate-900">{currentDecision.compositeScore}/100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {currentDecision.evidence.strategyProfile.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">Active Weights:</span>
                    {Object.entries(currentDecision.evidence.strategyProfile.applied_weights).map(([key, weight]) => {
                      const pct = Math.round(weight * 100);
                      if (pct === 0) return null;
                      const formattedKey = key
                        .replace('_', ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <span
                          key={key}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                            pct >= 25
                              ? 'bg-slate-900 text-white border-slate-900'
                              : pct >= 15
                              ? 'bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {pct}% {formattedKey}
                        </span>
                      );
                    })}
                  </div>

                  {currentDecision.evidence.scoreBreakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-[11px] pt-2 border-t border-slate-200">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">Brandability ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.brandability * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.brandabilityComponent} pts</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">Memorability ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.memorability * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.memorabilityComponent} pts</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">Search Intent ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.commercial_search * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.commercialSearchComponent ?? 0} pts</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">Liquidity ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.liquidity * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.liquidityComponent} pts</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">TLD Equity ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.tld_equity * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.tldEquityComponent} pts</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500 text-[10px]">Economics ({Math.round(currentDecision.evidence.strategyProfile.applied_weights.economics_spread * 100)}%)</div>
                        <div className="font-bold text-slate-900">{currentDecision.evidence.scoreBreakdown.economicsComponent} pts</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider block mb-2 flex items-center space-x-1.5">
                    <Icon name="check-circle" size={16} className="text-emerald-700" />
                    <span>Verified Positive Factors (+)</span>
                  </span>
                  {currentDecision.evidence.verifiedPros.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {currentDecision.evidence.verifiedPros.map((pro, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-700 font-bold shrink-0">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No significant positive attributes detected.</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-rose-50/60 border border-rose-200">
                  <span className="text-xs uppercase font-bold text-rose-900 tracking-wider block mb-2 flex items-center space-x-1.5">
                    <Icon name="info" size={16} className="text-rose-700" />
                    <span>Verified Risk &amp; Drag Factors (-)</span>
                  </span>
                  {currentDecision.evidence.verifiedCons.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-800">
                      {currentDecision.evidence.verifiedCons.map((con, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-rose-700 font-bold shrink-0">&minus;</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No critical risk flags detected.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Engine: {auditData.jev?.source === 'api.typesafe.ai' ? 'Primary JEV API (api.typesafe.ai)' : 'Local JEV Contract Engine (jev-latest)'}
                  </span>
                  <span>&bull;</span>
                  <span>Latency: {auditData.latencyMs || auditData.jev?.latencyMs || 14}ms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Hard Gate 1 (Trademark): {currentDecision.evidence.hardGateTriggered?.includes('Trademark') ? 'FLAGGED' : 'CLEARED'}</span>
                  <span>&bull;</span>
                  <span>Hard Gate 2 (Coverage): {currentDecision.evidence.dataQualityPct < 40 ? 'FLAGGED' : 'CLEARED'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3-Pillar Explainability Matrix Card */}
          {(currentDecision.explainability || auditData.explainability) && (
            (() => {
              const report: ExplainabilityReport = (currentDecision.explainability || auditData.explainability)!;
              return (
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                        <Icon name="compass" size={16} className="text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {t('explain_title')}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {t('explain_subtitle')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        +{report.bull_signals.length} Bull
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                        -{report.bear_signals.length} Bear
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        ? {report.unknown_signals.length} Unknown
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 mb-2.5">
                          <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider flex items-center space-x-1.5">
                            <Icon name="trending-up" size={16} className="text-emerald-700" />
                            <span>{t('pillar_bull')}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {report.bull_signals.length} Verified
                          </span>
                        </div>

                        {report.bull_signals.length > 0 ? (
                          <div className="space-y-2.5">
                            {report.bull_signals.map((sig) => (
                              <div
                                key={sig.id}
                                className="p-2.5 bg-white/90 rounded border border-emerald-200/70 text-xs space-y-1.5 shadow-2xs"
                              >
                                <div className="text-slate-800 leading-snug font-medium">
                                  {t(sig.id, sig.label)}
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    {sig.source}
                                  </span>
                                  <span className={`uppercase font-bold font-mono px-1 py-0.2 rounded ${
                                    sig.impact === 'high' ? 'text-emerald-700 font-extrabold' : 'text-slate-600'
                                  }`}>
                                    {sig.impact} impact
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">No verified positive signals identified.</p>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-800 pt-2 border-t border-emerald-200/60 font-medium">
                        {t('pillar_bull_sub')}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-rose-200/80 mb-2.5">
                          <span className="text-xs uppercase font-bold text-rose-900 tracking-wider flex items-center space-x-1.5">
                            <Icon name="trending-down" size={16} className="text-rose-700" />
                            <span>{t('pillar_bear')}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                            {report.bear_signals.length} Identified
                          </span>
                        </div>

                        {report.bear_signals.length > 0 ? (
                          <div className="space-y-2.5">
                            {report.bear_signals.map((sig) => (
                              <div
                                key={sig.id}
                                className="p-2.5 bg-white/90 rounded border border-rose-200/70 text-xs space-y-1.5 shadow-2xs"
                              >
                                <div className="text-slate-800 leading-snug font-medium">
                                  {sig.label}
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    {sig.source}
                                  </span>
                                  <span className={`uppercase font-bold font-mono px-1 py-0.2 rounded ${
                                    sig.impact === 'high' ? 'text-rose-700 font-extrabold' : 'text-slate-600'
                                  }`}>
                                    {sig.impact} impact
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">No critical downside hazards identified.</p>
                        )}
                      </div>
                      <div className="text-[11px] text-rose-800 pt-2 border-t border-rose-200/60 font-medium">
                        {t('pillar_bear_sub')}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                          <span className="text-xs uppercase font-bold text-slate-800 tracking-wider flex items-center space-x-1.5">
                            <Icon name="help-circle" size={16} className="text-slate-600" />
                            <span>{t('pillar_unknown')}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                            {report.unknown_signals.length} Gaps
                          </span>
                        </div>

                        {report.unknown_signals.length > 0 ? (
                          <div className="space-y-2.5">
                            {report.unknown_signals.map((sig) => (
                              <div
                                key={sig.id}
                                className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-1.5 shadow-2xs"
                              >
                                <div className="text-slate-700 leading-snug">
                                  {t(sig.id, sig.label)}
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {sig.source}
                                  </span>
                                  <span className="uppercase font-medium font-mono text-slate-500 px-1 py-0.2 rounded">
                                    {sig.impact} priority
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">Full telemetry coverage across all dimensions.</p>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 font-medium">
                        {t('pillar_unknown_sub')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Actionable Next Action Investigation Roadmap Card */}
          {(currentDecision.explainability?.next_actions?.length || auditData.explainability?.next_actions?.length) ? (
            (() => {
              const actions: NextActionItem[] = (currentDecision.explainability?.next_actions || auditData.explainability?.next_actions || []);
              return (
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Icon name="list-todo" size={16} className="text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {t('roadmap_title')}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {t('roadmap_subtitle')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {actions.length} Action Items
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {actions.map((act, index) => (
                      <div
                        key={act.id || index}
                        className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900 leading-snug">
                              {act.action}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span>Target: <strong className="text-slate-700 font-medium">{act.target_dimension}</strong></span>
                              <span>&bull;</span>
                              <span>Source: <strong className="font-mono text-slate-700">{act.suggested_tool_or_source}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                              act.priority === 'critical'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : act.priority === 'recommended'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {act.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>
      )}

      {/* JEV System One Raw Telemetry Inspector Modal */}
      {auditData && (
        <JevInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          domain={auditData.domain}
          mode={auditData.mode}
          latencyMs={auditData.latencyMs || auditData.jev?.latencyMs}
          rawJevPayload={auditData.rawJevPayload || auditData.jev?.rawJevPayload}
          rawJevResponse={auditData.rawJevResponse || auditData.jev?.rawJevResponse}
          versionTrace={auditData.version_trace || currentDecision?.version_trace}
        />
      )}

      {/* Track Domain Outcome Modal */}
      {isOutcomeModalOpen && auditData && currentDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Icon name="bookmark-plus" size={16} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Track Outcome: <LtrIsolate>{auditData.domain}</LtrIsolate>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOutcomeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveOutcome} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Verdict</span>
                  <span className={`font-mono font-bold uppercase text-[11px] ${
                    currentDecision.verdict === 'Buy'
                      ? 'text-emerald-700'
                      : currentDecision.verdict === 'Review'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    {currentDecision.verdict}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Score</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentDecision.compositeScore ?? Math.round(currentDecision.score * 100)}/100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Est. Retail</span>
                  <span className="font-mono font-bold text-slate-900">
                    <LtrIsolate>${(currentDecision.economic_valuation?.retail_range.midpoint || auditData.valuation?.estimatedValue || 640).toLocaleString()}</LtrIsolate>
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Acquisition Cost Basis ($ USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={outcomeAcqPrice}
                  onChange={(e) => setOutcomeAcqPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Confirm the real purchase cost or backorder fee for calibration tracking.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portfolio Notes
                </label>
                <textarea
                  rows={2}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {outcomeLoggedSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center space-x-2">
                  <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
                  <span>Domain asset successfully logged into outcome calibration!</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingOutcome || outcomeLoggedSuccess}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors shadow-xs"
                >
                  {isLoggingOutcome ? 'Logging...' : outcomeLoggedSuccess ? 'Saved' : 'Confirm & Track Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};