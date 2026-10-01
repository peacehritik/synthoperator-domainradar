import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Building2,
  Globe,
  DollarSign,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Trash2,
  Info,
  Scale,
  Code2,
  ExternalLink,
  Target,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type {
  BusinessContext,
  BusinessPriority,
  CandidateEvaluationResult,
  ComparativeDecisionReport,
  DecisionMode,
} from '../types';
import { JevInspectorModal } from './JevInspectorModal';

interface BrandDecisionProps {
  onSelectMode?: (mode: DecisionMode) => void;
}

const SAMPLE_PRESETS: {
  label: string;
  business: BusinessContext;
  domains: string[];
}[] = [
  {
    label: 'Real Estate AI SaaS',
    business: {
      business_name: 'PropMind',
      business_type: 'saas',
      industry: 'Real Estate Tech & AI',
      target_market: 'global_us_eu',
      target_audience: 'b2b_enterprises',
      brand_tone: ['professional', 'innovative'],
      primary_priority: 'brand_first',
      max_budget_usd: 5000,
    },
    domains: [
      'propmind.com',
      'propmind.ai',
      'getpropmind.com',
      'propmind.io',
      'propmindapp.com',
    ],
  },
  {
    label: 'Developer DevOps Platform',
    business: {
      business_name: 'FlowStack',
      business_type: 'saas',
      industry: 'Developer Tools & Cloud Infrastructure',
      target_market: 'global_us_eu',
      target_audience: 'creators_developers',
      brand_tone: ['innovative', 'minimal'],
      primary_priority: 'trust_first',
      max_budget_usd: 8000,
    },
    domains: [
      'flowstack.com',
      'flowstack.dev',
      'flowstack.io',
      'tryflowstack.com',
      'flowstack-cloud.net',
    ],
  },
  {
    label: 'Direct-to-Consumer Luxury Care',
    business: {
      business_name: 'AuraSkin',
      business_type: 'ecommerce',
      industry: 'Organic Skincare & Wellness',
      target_market: 'us_only',
      target_audience: 'b2c_consumers',
      brand_tone: ['luxury', 'minimal'],
      primary_priority: 'brand_first',
      max_budget_usd: 2500,
    },
    domains: [
      'auraskin.com',
      'auraskin.co',
      'auraskincare.com',
      'myauraskin.store',
      'auraskin-shop.com',
    ],
  },
];

const TONE_OPTIONS: { id: 'professional' | 'innovative' | 'playful' | 'minimal' | 'luxury'; label: string }[] = [
  { id: 'professional', label: 'Professional & Authoritative' },
  { id: 'innovative', label: 'Innovative & Tech-Forward' },
  { id: 'minimal', label: 'Minimal & Punchy' },
  { id: 'luxury', label: 'Luxury & Premium' },
  { id: 'playful', label: 'Playful & Consumer-Friendly' },
];

export const BrandDecision: React.FC<BrandDecisionProps> = () => {
  // Business context state
  const [businessName, setBusinessName] = useState('PropMind');
  const [businessType, setBusinessType] = useState<BusinessContext['business_type']>('saas');
  const [industry, setIndustry] = useState('Real Estate Tech & AI Analytics');
  const [targetMarket, setTargetMarket] = useState<BusinessContext['target_market']>('global_us_eu');
  const [targetAudience, setTargetAudience] = useState<BusinessContext['target_audience']>('b2b_enterprises');
  const [brandTones, setBrandTones] = useState<BusinessContext['brand_tone']>(['professional', 'innovative']);
  const [primaryPriority, setPrimaryPriority] = useState<BusinessPriority>('brand_first');
  const [maxBudget, setMaxBudget] = useState<string>('5000');

  // Domains input
  const [domainListText, setDomainListText] = useState(
    'propmind.com\npropmind.ai\ngetpropmind.com\npropmind.io\npropmindapp.com'
  );

  // Evaluation & telemetry state
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComparativeDecisionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspectingCandidate, setInspectingCandidate] = useState<CandidateEvaluationResult | null>(null);
  const [expandedTradeoffs, setExpandedTradeoffs] = useState<Record<string, boolean>>({});

  const toggleTone = (tone: 'professional' | 'innovative' | 'playful' | 'minimal' | 'luxury') => {
    if (brandTones.includes(tone)) {
      if (brandTones.length > 1) {
        setBrandTones(brandTones.filter((t) => t !== tone));
      }
    } else {
      setBrandTones([...brandTones, tone]);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setBusinessName(preset.business.business_name);
    setBusinessType(preset.business.business_type);
    setIndustry(preset.business.industry);
    setTargetMarket(preset.business.target_market);
    setTargetAudience(preset.business.target_audience);
    setBrandTones(preset.business.brand_tone);
    setPrimaryPriority(preset.business.primary_priority);
    setMaxBudget(preset.business.max_budget_usd ? String(preset.business.max_budget_usd) : '');
    setDomainListText(preset.domains.join('\n'));
    setError(null);
  };

  const handleRunComparison = async (forceRefresh = false) => {
    const rawDomains = domainListText
      .split(/[\n,;]+/)
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    if (rawDomains.length === 0) {
      setError('Please provide at least 1 candidate domain to evaluate.');
      return;
    }

    if (!businessName.trim()) {
      setError('Please provide a business name to benchmark naming resonance.');
      return;
    }

    setLoading(true);
    setError(null);

    const businessPayload: BusinessContext = {
      business_name: businessName.trim(),
      business_type: businessType,
      industry: industry.trim() || 'General Business',
      target_market: targetMarket,
      target_audience: targetAudience,
      brand_tone: brandTones,
      primary_priority: primaryPriority,
      max_budget_usd: maxBudget ? parseFloat(maxBudget) : null,
    };

    const storedKey = localStorage.getItem('typesafe_api_key') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (storedKey) {
      headers['x-typesafe-key'] = storedKey;
    }

    try {
      const res = await fetch('/api/domains/brand-selection', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          business: businessPayload,
          domains: rawDomains,
          force_refresh: forceRefresh,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to analyze brand options`);
      }

      const data: ComparativeDecisionReport = await res.json();
      setReport(data);

      // Auto expand first tradeoff
      if (data.alternatives.length > 0) {
        setExpandedTradeoffs({ [data.alternatives[0].domain]: true });
      }
    } catch (err: any) {
      console.error('Comparative decision error:', err);
      setError(err.message || 'Failed to execute comparative brand analysis.');
    } finally {
      setLoading(false);
    }
  };

  const candidateCount = domainListText
    .split(/[\n,;]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Identity */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Mode C
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Business Brand Selection &amp; Multi-Domain Comparative Decision
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Choose the Winning Brand Name for Your Business
            </h1>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto text-xs">
            <span className="text-slate-500 font-medium mr-1">Sample Scenarios:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors border border-slate-200 text-xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step-by-Step Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
          {/* Step 1: Business Context Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2 pb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-sm font-bold text-slate-900">Define Business &amp; Positioning Context</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Product Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. PropMind, FlowStack"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                >
                  <option value="saas">SaaS / Cloud Software</option>
                  <option value="startup">Venture Tech Startup</option>
                  <option value="ecommerce">E-Commerce &amp; DTC</option>
                  <option value="agency">Agency / B2B Services</option>
                  <option value="creator">Creator / Community</option>
                  <option value="newsletter">Media &amp; Newsletter</option>
                  <option value="product">Digital / Physical Product</option>
                  <option value="other">Other Commercial Venture</option>
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry / Category
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Real Estate Tech, AI Developer Tools"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Target Market */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Geography
                </label>
                <select
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                >
                  <option value="global_us_eu">Global (US, EU &amp; International)</option>
                  <option value="us_only">US Domestic Only</option>
                  <option value="eu_only">European Union Only</option>
                  <option value="local_national">Local / National Market</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Customer Segment
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                >
                  <option value="b2b_enterprises">B2B Enterprises &amp; Mid-Market</option>
                  <option value="b2b_smb">B2B Small &amp; Medium Businesses</option>
                  <option value="b2c_consumers">B2C Mass Consumers</option>
                  <option value="creators_developers">Developers &amp; Technical Creators</option>
                </select>
              </div>

              {/* Primary Decision Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Decision Priority
                </label>
                <select
                  value={primaryPriority}
                  onChange={(e) => setPrimaryPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-emerald-50/50 border border-emerald-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                >
                  <option value="brand_first">Brand-First (Memorability &amp; Clean Root Equity)</option>
                  <option value="trust_first">Trust-First (Enterprise Credibility &amp; .com Authority)</option>
                  <option value="budget_first">Budget-First (Lowest Acquisition &amp; Renewal Cost)</option>
                  <option value="global_first">Global-First (International Recognition &amp; No Friction)</option>
                  <option value="seo_first">SEO-First (Organic Search Intent &amp; Keyword Demand)</option>
                </select>
              </div>
            </div>

            {/* Brand Tone Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brand Personality &amp; Tone (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TONE_OPTIONS.map((tone) => {
                  const selected = brandTones.includes(tone.id);
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => toggleTone(tone.id)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium border ${
                        selected
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {selected ? '✓ ' : ''}{tone.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Candidates Input & Submit (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:border-l lg:border-slate-200 lg:pl-5">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Domain Candidates (Up to 10)</h2>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {candidateCount}/10 domains
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-2">
                Enter candidate domains on separate lines or separated by commas (e.g. root .com, .ai, .io, get/try prefixes).
              </p>

              <textarea
                rows={5}
                value={domainListText}
                onChange={(e) => setDomainListText(e.target.value)}
                placeholder="propmind.com&#10;propmind.ai&#10;getpropmind.com&#10;propmind.io&#10;propmindapp.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
              />

              {/* Optional Max Budget */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Acquisition Budget in USD ($) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                disabled={loading || candidateCount === 0}
                onClick={() => handleRunComparison(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all shadow-xs disabled:opacity-50 space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    <span>Evaluating {candidateCount} Candidates Concurrently...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Analyze &amp; Compare Domain Options</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Comparative Decision Report Display */}
      {report && (
        <div className="space-y-6">
          {/* 1. Recommended Option Hero Card */}
          <div className="bg-white rounded-lg border-2 border-emerald-500 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-lg tracking-wider uppercase flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommended Choice (#1)</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Left Column: Domain Identity & Verdict */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Highest Strategic Fit for {report.business.business_name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {report.recommended_option.valuation?.extension.tld} &bull; {report.recommended_option.valuation?.length} chars
                  </span>
                </div>

                <div className="flex items-baseline space-x-3">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {report.recommended_option.domain}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  Best balanced option considering your <strong className="text-slate-900 font-semibold">{report.business.primary_priority.replace('_', ' ')}</strong> priority, positioning resonance, and zero auditory friction.
                </p>

                {/* Why this domain leads */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Why This Domain Leads:
                  </span>
                  <div className="space-y-1">
                    {report.recommended_option.why_recommended_points.map((pt, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Honest Trademark Disclaimer */}
                <div className="pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{report.recommended_option.trademark_legal_status}</span>
                </div>
              </div>

              {/* Right Column: Composite Score & Component Breakdowns */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-full md:w-80 space-y-3 shrink-0">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Strategic Brand Score</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                      {report.recommended_option.composite_decision_score}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/100</span>
                  </div>
                </div>

                {/* Component Progress Meters */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Business &amp; Category Fit</span>
                      <span className="font-mono font-bold text-slate-900">{report.recommended_option.business_fit_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.recommended_option.business_fit_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Brand Authority &amp; Recall</span>
                      <span className="font-mono font-bold text-slate-900">{report.recommended_option.brand_strength_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.recommended_option.brand_strength_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Trust / TLD Profile</span>
                      <span className="font-mono font-bold text-slate-900">{report.recommended_option.trust_tld_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.recommended_option.trust_tld_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Risk Clearance</span>
                      <span className="font-mono font-bold text-slate-900">{report.recommended_option.risk_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.recommended_option.risk_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Carrying Cost &amp; Economics</span>
                      <span className="font-mono font-bold text-slate-900">{report.recommended_option.economics_score}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.recommended_option.economics_score}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Summary */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Evidence Coverage: {report.recommended_option.evidence_coverage}%</span>
                  <span>JEV Confidence: {report.recommended_option.jev_confidence}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Side-by-Side Trade-Off Matrix Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Side-by-Side Comparative Matrix</h3>
                <p className="text-xs text-slate-500">
                  Weighted scoring against {report.business.primary_priority.replace('_', ' ')} priority.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleRunComparison(true)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 font-medium transition-colors inline-flex items-center space-x-1 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Force Re-Evaluate</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3.5 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate Domain</th>
                    <th className="py-3 px-3 text-center">Business Fit</th>
                    <th className="py-3 px-3 text-center">Brand Strength</th>
                    <th className="py-3 px-3 text-center">Trust / TLD</th>
                    <th className="py-3 px-3 text-center">Risk Clearance</th>
                    <th className="py-3 px-3 text-center">Economics</th>
                    <th className="py-3 px-3.5 text-center">Decision Score</th>
                    <th className="py-3 px-4 text-center">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[report.recommended_option, ...report.alternatives].map((candidate) => {
                    const isWinner = candidate.rank === 1 && !candidate.hard_risk_triggered;
                    return (
                      <tr
                        key={candidate.domain}
                        className={`transition-colors ${
                          isWinner
                            ? 'bg-emerald-50/40 hover:bg-emerald-50/70 font-medium'
                            : candidate.hard_risk_triggered
                            ? 'bg-rose-50/30 hover:bg-rose-50/60'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center rounded-full font-bold font-mono text-xs ${
                              isWinner
                                ? 'bg-emerald-600 text-white'
                                : candidate.hard_risk_triggered
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            #{candidate.rank}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {candidate.domain}
                            </span>
                            {isWinner && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Best Pick
                              </span>
                            )}
                            {candidate.hard_risk_triggered && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                Risk Blocked
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {candidate.valuation?.length} chars &bull; ${candidate.valuation?.annualCarryingCost}/yr renewal
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {candidate.business_fit_score}/100
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {candidate.brand_strength_score}/100
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {candidate.trust_tld_score}/100
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold">
                          <span
                            className={
                              candidate.risk_score >= 80
                                ? 'text-emerald-700'
                                : candidate.risk_score >= 50
                                ? 'text-amber-700'
                                : 'text-rose-700 font-bold'
                            }
                          >
                            {candidate.risk_score}/100
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                          {candidate.economics_score}/100
                        </td>

                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                              isWinner
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : candidate.composite_decision_score >= 70
                                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                                : candidate.hard_risk_triggered
                                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {candidate.composite_decision_score}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              candidate.status === 'recommended'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : candidate.status === 'strong_alternative'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : candidate.status === 'viable_budget'
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {candidate.status === 'recommended' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {candidate.status === 'avoid_risk' && <ShieldAlert className="w-3 h-3 mr-1" />}
                            {candidate.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. "Why Not the Others?" Trade-Off Breakdown */}
          {report.alternatives.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Why Not the Alternatives? (Direct Drawbacks vs. {report.recommended_option.domain})
                </h3>
                <p className="text-xs text-slate-500">
                  Explicit trade-offs and verbal leakage hazards identified during automated cross-domain benchmarking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.alternatives.map((alt) => {
                  const tradeoff = report.cross_domain_tradeoffs.find((t) => t.domain === alt.domain);
                  const isExpanded = expandedTradeoffs[alt.domain] ?? true;

                  return (
                    <div
                      key={alt.domain}
                      className={`p-4 rounded-lg border transition-all ${
                        alt.hard_risk_triggered
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {alt.domain}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            Rank #{alt.rank}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            alt.hard_risk_triggered
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Score: {alt.composite_decision_score}/100
                        </span>
                      </div>

                      {/* Tradeoff Summary */}
                      <div className="pt-2.5 space-y-2 text-xs">
                        <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700">
                          <span className="font-semibold text-slate-900 block mb-0.5">
                            Cross-Domain Comparison:
                          </span>
                          <span>{tradeoff?.tradeoff_summary}</span>
                        </div>

                        {/* Why Not Points */}
                        {alt.why_not_this_domain_points.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                              Specific Drawbacks:
                            </span>
                            {alt.why_not_this_domain_points.map((pt, i) => (
                              <div key={i} className="flex items-start space-x-1.5 text-slate-600 text-[11px]">
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Unobserved Gaps & Diligence Guidance */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Diligence Coverage Notice &amp; Scope Boundary</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              {report.unobserved_gaps.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* JEV Raw Telemetry Modal */}
      {inspectingCandidate && (
        <JevInspectorModal
          isOpen={!!inspectingCandidate}
          onClose={() => setInspectingCandidate(null)}
          domain={inspectingCandidate.domain}
          mode="brand_selection"
          latencyMs={inspectingCandidate.valuation ? 16 : 24}
          rawJevPayload={{
            model: 'jev-latest',
            state: inspectingCandidate,
            questions: {},
          }}
          rawJevResponse={inspectingCandidate.jevAnswers}
          versionTrace={inspectingCandidate.version_trace}
        />
      )}
    </div>
  );
};
