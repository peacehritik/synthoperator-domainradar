import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Clock, 
  Globe, 
  ShieldAlert, 
  Sparkles, 
  BookmarkPlus, 
  BookmarkCheck, 
  HelpCircle,
  RefreshCw,
  Sliders,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Archive,
  FileText,
  Edit3,
  Code2,
  ShieldCheck,
  Scale,
  Cpu,
  Layers,
  Compass,
  Tag,
  AlertCircle,
  Lock,
  Receipt,
  ListTodo,
  ArrowUpRight,
  ExternalLink,
  Zap,
  Activity,
  GitBranch,
  Copy,
  Check,
  Database,
  RotateCcw,
  X,
  Target
} from 'lucide-react';
import { JevInspectorModal } from './JevInspectorModal';
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
  let Icon = Sparkles;
  if (strategy_type === 'exact_match_keyword') {
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    Icon = Tag;
  } else if (strategy_type === 'geo_service') {
    colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
    Icon = Compass;
  } else if (strategy_type === 'short_acronym_numeric') {
    colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    Icon = Layers;
  } else if (strategy_type === 'tech_trend') {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = Cpu;
  }

  return (
    <div className="inline-flex items-center gap-1.5 group relative">
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} shadow-2xs`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </span>
      <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-30 w-72 p-2.5 bg-slate-900 text-white text-[11px] leading-relaxed rounded-md shadow-lg pointer-events-none">
        <div className="font-semibold text-slate-200 mb-0.5">{label} Archetype</div>
        <div className="text-slate-300">{description}</div>
      </div>
    </div>
  );
};

// TLD-aware registry renewal fee helper
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
}) => {
  const [domainInput, setDomainInput] = useState('paywave.com');
  const [mode, setMode] = useState<DecisionMode>('buy');
  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<FullAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mode B Renewal specific inputs
  const [renewalCost, setRenewalCost] = useState<number>(() => getDefaultRenewalCostForDomain('paywave.com'));
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

  // Auto sanitize domain helper on input
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

  // Keyboard shortcut listener: Cmd+K / Ctrl+K to focus search
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

  // Run audit against server
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

      const response = await fetch('/api/domains/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-typesafe-key': typesafeKey,
        },
        body: JSON.stringify({
          domain: activeDomain,
          mode: activeMode,
          force_refresh: forceRefresh,
          manual_overrides: manualOverrides,
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

  // Initial load
  useEffect(() => {
    handleRunAudit('paywave.com', 'buy');
  }, []);

  // Re-run when mode changes
  const handleModeChange = (newMode: DecisionMode) => {
    setMode(newMode);
    if (domainInput) {
      handleRunAudit(domainInput, newMode);
    }
  };

  // Handle adding to watchlist
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

  // Outcome Tracking Modal State
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
      {/* Top Controller: Mode Tabs & Single Domain Audit Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Decision Intelligence Engine
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {isBuyMode
                ? 'Mode A: Acquisition & Buy Valuation'
                : 'Mode B: Portfolio Retention & Renewal / Drop Engine'}
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
              Mode A: Buy Decision
            </button>
            <button
              onClick={() => handleModeChange('renew')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                !isBuyMode
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mode B: Renewal Decision
            </button>
          </div>
        </div>

        {/* Input Bar */}
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
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(sanitize(e.target.value))}
                placeholder="Enter domain name (e.g. brandflow.com, neurobot.ai, deals.store)..."
                className="w-full pl-10 pr-24 py-2.5 text-sm sm:text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs font-mono"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  Cmd + K
                </kbd>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Audit Domain</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
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
              <RotateCcw className={`w-4 h-4 mr-1.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              <span>Force Refresh</span>
            </button>
          </form>

          {/* Quick Sample Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium mr-1">Quick Samples:</span>
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

          {/* Manual Evidence Enrichment (Optional) Collapsible Drawer */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsManualEnrichmentOpen(!isManualEnrichmentOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      Manual Evidence Enrichment (Optional)
                    </span>
                    {configuredOverridesCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {configuredOverridesCount} configured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    Automated free signals (Wayback, Google Suggest, DNS, Trademark) run automatically. You can optionally input paid metrics from third-party tools to increase diligence coverage.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-slate-400 shrink-0 ml-2">
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {isManualEnrichmentOpen ? 'Collapse' : 'Configure'}
                </span>
                {isManualEnrichmentOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </button>

            {isManualEnrichmentOpen && (
              <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-700">
                    Third-Party Metric Overrides (Google Keyword Planner, Ahrefs, SEMrush, Brokerage Records)
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
                      className="text-[11px] text-slate-500 hover:text-rose-600 underline font-mono self-start sm:self-auto"
                    >
                      Reset All Overrides
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Search Volume */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Exact Monthly Search Volume
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 800 (from Keyword Planner)"
                      value={manualSearchVolume}
                      onChange={(e) => setManualSearchVolume(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* CPC */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Estimated CPC in USD ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 2.50"
                      value={manualCpc}
                      onChange={(e) => setManualCpc(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Referring Domains */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Referring Domains Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 45"
                      value={manualReferringDomains}
                      onChange={(e) => setManualReferringDomains(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Asking / Backorder Price */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Asking / Backorder Price in USD ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 433 (override default)"
                      value={manualAskingPrice}
                      onChange={(e) => setManualAskingPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Inbound Inquiries (12m) */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Inbound Purchase Inquiries (last 12m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 3"
                      value={manualInboundOffers}
                      onChange={(e) => setManualInboundOffers(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Annual Parking Revenue */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Annual Parking Revenue in USD ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 150"
                      value={manualParkingRevenue}
                      onChange={(e) => setManualParkingRevenue(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>All inputs are 100% optional. Leaving them blank evaluates the domain using free public telemetry only.</span>
                  <button
                    type="button"
                    onClick={() => handleRunAudit(undefined, undefined, true)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md self-start sm:self-auto transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    <span>Apply &amp; Re-audit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Results View */}
      {auditData && currentDecision && (
        <div className="space-y-6">
          {/* Audit Telemetry & State Hash Bar */}
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              {auditData.version_trace?.cache_hit || auditData.cached ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  <Database className="w-3.5 h-3.5 text-slate-600" />
                  <span>
                    CACHED TRACE ({auditData.version_trace?.latency_ms || auditData.latencyMs || 4}ms)
                  </span>
                </span>
              ) : auditData.version_trace?.execution_source === 'primary_jev_api' ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LIVE EXECUTION (JEV API - {auditData.version_trace?.latency_ms || auditData.latencyMs || 218}ms)</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 font-mono"
                  title="Running on deterministic local simulation. Add your TypeSafe API key in Settings to activate live cloud inference."
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  <span>LOCAL CONTRACT ENGINE (Offline Demo - {auditData.version_trace?.latency_ms || auditData.latencyMs || 14}ms)</span>
                </span>
              )}

              {/* Version Tag */}
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                <span>Engine v{auditData.version_trace?.engine_version || '2.4.0'} / Q-Set {auditData.version_trace?.question_set_version || (isBuyMode ? 'acquisition-v2.1' : 'renewal-v2.1')}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Truncated State Hash with Copy Button */}
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
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Force Live Re-Audit Trigger Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRunAudit(undefined, undefined, true)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-md border border-slate-300 transition-colors shadow-2xs font-semibold"
                title="Bypass cache and force live re-audit"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
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
                    Target: {auditData.domain}
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
                  {auditData.jev?.missingApiKey && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      JEV Local Engine (Key in Settings for Live Sync)
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
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : currentDecision.verdict === 'Review' ? (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
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
                            Brandability: {auditData.jev.modeAAnswers?.brandability.levelLabel || 'Average'} ({auditData.jev.modeAAnswers?.brandability.normalizedPercentage ?? 60}%)
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Liquidity: {auditData.jev.modeAAnswers?.aftermarket_liquidity.choice.replace('_', ' ') || 'slow speculative'}
                          </span>
                          <span>&bull;</span>
                          <span className="px-2 py-0.5 rounded bg-white/60">
                            Memorability: {Math.round((auditData.jev.modeAAnswers?.startup_memorability.value ?? 0.65) * 100)}%
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
                    <span>Evidence: {currentDecision.evidence?.dataQualityPct ?? 85}%</span>
                    <span>&bull;</span>
                    <span>JEV Conf: {currentDecision.evidence?.jevConfidence ?? 85}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInspectorOpen(true)}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors"
                    title="Inspect raw payload and response sent to TypeSafe JEV"
                  >
                    <Code2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Inspect JEV Payload</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenOutcomeModal}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors"
                    title="Log acquisition basis into real-world outcomes tracking"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Track Domain Outcome</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWatchlistAction}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors ${
                      isSaved
                        ? 'bg-white text-emerald-800 border border-emerald-300'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved in Watchlist</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Track in Portfolio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Metric Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Card 1: Length */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Character Length</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {auditData.valuation.length}
                </span>
                <span className="text-xs text-slate-400 font-normal">chars (SLD)</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {auditData.valuation.length <= 4
                  ? 'Ultra Short (Premium)'
                  : auditData.valuation.length <= 8
                  ? 'Optimal Brandable'
                  : 'Longer Phrase'}
              </span>
            </div>

            {/* Card 2: Syllables */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Syllable Count</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {auditData.valuation.syllables}
                </span>
                <span className="text-xs text-slate-400 font-normal">syllables</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {auditData.valuation.syllables <= 2 ? 'High Pronounceability' : 'Multi-syllabic'}
              </span>
            </div>

            {/* Card 3: Extension Tier */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Extension Tier</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {auditData.valuation.extension.tld}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                  {auditData.valuation.extension.tier}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Credibility: {auditData.valuation.extension.credibility}
              </span>
            </div>

            {/* Card 4: Estimated Value */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                {isBuyMode ? 'Estimated Fair Value' : 'Liquidation Exit'}
              </span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  $
                  {(isBuyMode
                    ? auditData.valuation.estimatedValue
                    : auditData.valuation.wholesaleLiquidationValue
                  ).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Wholesale: ${auditData.valuation.wholesaleLiquidationValue.toLocaleString()}
              </span>
            </div>

            {/* Card 5: Annual Carrying Cost */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Annual Carrying Cost</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  ${auditData.valuation.annualCarryingCost}
                </span>
                <span className="text-xs text-slate-400 font-normal">/yr</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Registry Base Fee
              </span>
            </div>

            {/* Card 6: Verdict Badge */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Decision Verdict</span>
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
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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

          {/* Financial Valuation & Actuarial Expected Value Card */}
          {(currentDecision.economic_valuation || auditData.valuation.economic_valuation || auditData.economic_valuation) && (
            (() => {
              const econ = (currentDecision.economic_valuation || auditData.valuation.economic_valuation || auditData.economic_valuation)!;
              const holdingEff = auditData.renewalDecision?.holding_efficiency || auditData.holding_efficiency;
              return (
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Financial Valuation &amp; Actuarial Spread
                        </h3>
                        <p className="text-xs text-slate-500">
                          Deterministic Wholesale, Retail End-User Ranges, and Net Expected Value
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        Ask Price: ${econ.acquisition_cost_usd}
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {/* Column 1: Wholesale Liquidation */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-500 block mb-1">
                        Wholesale Liquidation Range
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        ${econ.wholesale_range.low.toLocaleString()} - ${econ.wholesale_range.high.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Immediate domainer / auction floor
                      </span>
                    </div>

                    {/* Column 2: Retail End-User Value */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-500 block mb-1">
                        Retail End-User Value
                      </span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        ${econ.retail_range.low.toLocaleString()} - ${econ.retail_range.high.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Estimated business acquisition range (Mid: ${econ.retail_range.midpoint.toLocaleString()})
                      </span>
                    </div>

                    {/* Column 3: Net Actuarial Expected Value */}
                    <div className={`p-4 border rounded-lg ${
                      econ.is_positive_roi_spread
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-80">
                          Net Actuarial Expected Value (EV)
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                          econ.is_positive_roi_spread
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {econ.is_positive_roi_spread ? 'Positive ROI Spread' : 'Negative EV Spread'}
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold font-mono mt-1">
                        {econ.net_actuarial_expected_value_usd >= 0 ? '+' : ''}${econ.net_actuarial_expected_value_usd.toLocaleString()}
                      </div>
                      <span className="text-[11px] opacity-80 mt-1 block">
                        Assumed {econ.estimated_annual_sale_probability_pct}% annual sale probability at retail midpoint
                      </span>
                    </div>
                  </div>

                  {/* Mode B Holding Efficiency Gauge if in Renew Mode */}
                  {!isBuyMode && holdingEff && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                            Portfolio Holding Efficiency Ratio: {holdingEff.holding_efficiency_ratio}x Annual Renewal
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

                      {/* Segmented Efficiency Gauge Bar */}
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
                        <span>Past Acquisition Cost: <strong className="text-slate-700">Sunk Cost - Non-Decision Factor</strong></span>
                        <span>Evaluation Rule: Forward-looking cashflow only</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}

          {/* Institutional Risk Gates & Capital Diligence Panel */}
          {currentDecision.risk_evaluation && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Institutional Risk Gates &amp; Capital Diligence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Inviolable Hard Gates and Capital-Proportional Diligence Verification
                    </p>
                  </div>
                </div>

                <div>
                  {currentDecision.risk_evaluation.overall_status === 'cleared' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>All Risk Gates Cleared</span>
                    </span>
                  ) : currentDecision.risk_evaluation.overall_status === 'hard_blocked' ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hard Risk Blocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Diligence Review Required</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Capital Diligence Progress Bar */}
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
                  <span>Exposure: ${currentDecision.risk_evaluation.risk_budget.acquisition_price_usd}</span>
                  <span>
                    Status: {currentDecision.risk_evaluation.risk_budget.is_diligence_satisfied ? (
                      <strong className="text-emerald-700 font-medium">Diligence Quorum Satisfied</strong>
                    ) : (
                      <strong className="text-amber-700 font-medium">Manual Verification Required</strong>
                    )}
                  </span>
                </div>
              </div>

              {/* 4 Evaluated Hard Gates Checklist */}
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
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : gate.status === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span>{gate.name}</span>
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
                      {gate.description}
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
                  <Sliders className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Portfolio Carrying Economics & Renewal ROI Calculator
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunAudit(auditData.domain, 'renew')}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recalculate Decision</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                {/* Field 1: Annual Renewal Cost */}
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

                {/* Field 2: Annual Parking Revenue */}
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

                {/* Field 3: Inbound Offers */}
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

                {/* Field 4: Monthly Impressions */}
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

                {/* Field 5: Holding Years */}
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

              {/* Economic Summary Strip */}
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
            {/* Left Card: Valuation & Brandability Metrics */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">Commercial Brandability & Traffic</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">Heuristic Engine</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Brandability Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${auditData.valuation.brandabilityScore}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {auditData.valuation.brandabilityScore}/100
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
                      <HelpCircle className="w-3 h-3 text-slate-400" /> Unknown
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

            {/* Right Card: RDAP / Registry Status */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-base">RDAP & WHOIS Infrastructure</h3>
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
                  <span className="text-slate-600">Registrar Organization</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
                    {auditData.rdap.registrar || 'Protected / Verisign Registry'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Registration Date</span>
                  <span className="font-mono text-slate-900">
                    {auditData.rdap.createdDate
                      ? new Date(auditData.rdap.createdDate).toLocaleDateString()
                      : 'Aged Record'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Expiration Date</span>
                  <span className="font-mono text-slate-900">
                    {auditData.rdap.expirationDate
                      ? new Date(auditData.rdap.expirationDate).toLocaleDateString()
                      : 'Active Portfolio'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Nameservers</span>
                  <span className="font-mono text-xs text-slate-700">
                    {auditData.rdap.nameservers && auditData.rdap.nameservers.length > 0
                      ? `${auditData.rdap.nameservers.length} Nameservers Routed`
                      : 'Standard DNS Root'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">HTTP/RDAP Status Code</span>
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
                    <Scale className="w-4 h-4" />
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

              {/* Dual Meters: Data Quality Coverage vs JEV Statistical Confidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Data Quality Evidence Coverage</span>
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
                  <span className="text-[11px] text-slate-500 mt-1.5 block">
                    {currentDecision.evidence.dataQualityPct >= 70
                      ? 'High evidence: Verified registry contract, RDAP records, phonetics, and search intent.'
                      : currentDecision.evidence.dataQualityPct >= 40
                      ? 'Moderate evidence: Registry status and structural attributes verified.'
                      : 'Low evidence (<40%): Hard Gate 2 active - Capital deployment requires secondary verification.'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-emerald-600" />
                      <span>JEV Statistical Confidence</span>
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
                  <span className="text-[11px] text-slate-500 mt-1.5 block">
                    Atomic classification certainty across brandability, resale liquidity, and trademark clearance.
                  </span>
                </div>
              </div>

              {/* Free Telemetry & Automated Evidence Discovery Panel */}
              {auditData.free_evidence && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Automated Free Telemetry Signals (0ms Heuristics &amp; Public Endpoints)</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      100% Free Public Discovery &bull; {auditData.free_evidence.latencyMs || 18}ms parallel lookup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {/* 1. Wayback Machine CDX */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Archive className="w-3.5 h-3.5 text-slate-500" />
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

                    {/* 2. Google Autocomplete / Suggest */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Search className="w-3.5 h-3.5 text-slate-500" />
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

                    {/* 3. Wikipedia Entity Search */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
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

                    {/* 4. Native DNS Resolution */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
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

                    {/* 5. Local Brand Trademark Trie Scan */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Local Trademark Scan</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Source: Local Brand Index (Free)
                        </span>
                      </div>
                      <div className="text-slate-900 font-medium">
                        {auditData.free_evidence.trademarkScan.trademark_collision_risk === 'high' ? (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
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

                    {/* 6. User Manual Diligence Input */}
                    <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-slate-500" />
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

              {/* Dynamic Strategy Weighting Matrix & Distribution */}
              {currentDecision.evidence?.strategyProfile && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-600" />
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

                  {/* Active Weighting Chips */}
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

                  {/* Points Contribution Breakdown */}
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

              {/* Verified Pros (+) and Cons (-) Strict Factual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider block mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
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
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
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

              {/* Verified Telemetry Strip */}
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

          {/* 3-Pillar Explainability Matrix Card (Bull / Bear / Unknown) */}
          {(currentDecision.explainability || auditData.explainability) && (
            (() => {
              const report: ExplainabilityReport = (currentDecision.explainability || auditData.explainability)!;
              return (
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                        <Compass className="w-4 h-4 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          3-Pillar Decision Explainability Matrix
                        </h3>
                        <p className="text-xs text-slate-500">
                          Deterministic Verification: Bull Factors, Bear Hazards, and Unobserved Data Gaps
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
                    {/* Pillar 1: Bull Signals (+ Verified Positives) */}
                    <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 mb-2.5">
                          <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider flex items-center space-x-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-700" />
                            <span>Bull Signals (+ Facts)</span>
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
                                  {sig.label}
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
                        Positive asset value drivers
                      </div>
                    </div>

                    {/* Pillar 2: Bear Signals (- Verified Risks) */}
                    <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-rose-200/80 mb-2.5">
                          <span className="text-xs uppercase font-bold text-rose-900 tracking-wider flex items-center space-x-1.5">
                            <TrendingDown className="w-4 h-4 text-rose-700" />
                            <span>Bear Signals (- Risks)</span>
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
                        Identified financial liabilities
                      </div>
                    </div>

                    {/* Pillar 3: Unknown Signals (? Unobserved Evidence Gaps) */}
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                          <span className="text-xs uppercase font-bold text-slate-800 tracking-wider flex items-center space-x-1.5">
                            <HelpCircle className="w-4 h-4 text-slate-600" />
                            <span>Unknown (? Evidence Gaps)</span>
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
                                  {sig.label}
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
                        Unobserved telemetry requiring manual due diligence
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
                        <ListTodo className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Actionable Investigation Roadmap
                        </h3>
                        <p className="text-xs text-slate-500">
                          Prioritized Verification Checklist to Eliminate Uncertainty Before Capital Outlay
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

          {/* Gemini AI Strategic Synthesis Card */}
          {auditData.aiAnalysis && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Gemini AI Portfolio Advisory & End-User Targeting
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider block mb-1.5">
                    Commercial Strengths
                  </span>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {auditData.aiAnalysis.key_pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs uppercase font-semibold text-rose-800 tracking-wider block mb-1.5">
                    Risk Factors & Holding Liabilities
                  </span>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {auditData.aiAnalysis.key_risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    Strategic Investor Action:
                  </span>
                  <p className="text-slate-600">{auditData.aiAnalysis.strategic_recommendation}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    Target End-User Industry:
                  </span>
                  <p className="text-slate-600">{auditData.aiAnalysis.suggested_niche}</p>
                </div>
              </div>
            </div>
          )}
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
                <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Track Outcome: {auditData.domain}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOutcomeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
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
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Est. EV</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${(currentDecision.economic_valuation?.gross_expected_value_usd || auditData.valuation?.estimatedValue || 1000).toLocaleString()}
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
