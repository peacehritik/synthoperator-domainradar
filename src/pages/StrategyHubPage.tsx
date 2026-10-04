import React, { useState } from 'react';
import { 
  Home, 
  Zap, 
  Receipt, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Layers,
  ChevronRight,
  Tag,
  Compass,
  Cpu
} from 'lucide-react';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import { Link, useRouter } from '../router/RouterContext';
import { STRATEGY_HUBS_DATABASE } from '../utils/strategyData';
import type { DecisionMode } from '../types';

interface StrategyHubPageProps {
  onSelectDomainForSingleAudit: (domain: string, mode: DecisionMode) => void;
}

const STRATEGY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  brandable: Sparkles,
  exact_match_keyword: Tag,
  geo_service: Compass,
  short_acronym_numeric: Layers,
  tech_trend: Cpu,
};

export const StrategyHubPage: React.FC<StrategyHubPageProps> = ({ onSelectDomainForSingleAudit }) => {
  const { t, isRtl } = useLanguage();
  const { params, navigate, getLocalizedPath } = useRouter();

  const rawSlug = (params.strategy || 'brandable').toLowerCase().replace(/_/g, '-');
  const normalizedKey = rawSlug.replace(/-/g, '_');
  
  const strategyMeta = STRATEGY_HUBS_DATABASE[normalizedKey] || STRATEGY_HUBS_DATABASE['brandable'];
  const IconComponent = STRATEGY_ICONS[strategyMeta.type] || Sparkles;

  const [testDomain, setTestDomain] = useState(strategyMeta.examplePatterns[0] || 'brandflow.com');

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDomain.trim()) return;
    onSelectDomainForSingleAudit(testDomain.trim().toLowerCase(), 'buy');
    navigate(getLocalizedPath('/audit'));
  };

  const allStrategies = Object.values(STRATEGY_HUBS_DATABASE);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 inline-flex items-center space-x-1">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('breadcrumb_home', 'Home')}</span>
        </Link>
        <span>/</span>
        <span className="text-slate-500">Strategies</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{strategyMeta.name}</span>
      </nav>

      {/* Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                <IconComponent className="w-3.5 h-3.5" />
                <span>Archetype Protocol</span>
              </span>
              <span className="text-xs text-slate-500 font-medium font-mono">
                {strategyMeta.liquidityScore}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {strategyMeta.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {strategyMeta.subtitle}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:text-right shrink-0">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Exit Timeframe</span>
            <div className="text-sm font-bold font-mono text-slate-900">
              {strategyMeta.holdingHorizon}
            </div>
            <span className="text-[10px] text-slate-400">Target Horizon</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {strategyMeta.description}
        </p>

        {/* Quick Audit Simulator */}
        <div className="pt-2">
          <form
            onSubmit={handleRunAudit}
            className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300"
          >
            <div className="relative flex-1 flex items-center bg-white rounded-md border border-slate-200 px-3">
              <input
                type="text"
                dir="ltr"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="Enter domain to test against this archetype"
                className="w-full py-2 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Audit with {strategyMeta.name.split(' ')[0]} Weights</span>
            </button>
          </form>
        </div>
      </div>

      {/* JEV Applied Dynamic Weighting Matrix Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Applied Dynamic Weighting Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic scoring formula applied to {strategyMeta.name} by TypeSafe JEV System One.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">100% Normalized</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">Brandability</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.brandability * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Naming Power</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">Memorability</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.memorability * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Phonetics</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">Search Demand</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.commercial_search * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Organic CPC</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">Liquidity</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.liquidity * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Auction Speed</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">TLD Equity</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.tld_equity * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Global Trust</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 block">Economics</span>
            <span className="text-lg font-bold text-slate-900 block">
              {Math.round(strategyMeta.appliedWeights.economics_spread * 100)}%
            </span>
            <span className="text-[9px] text-slate-400 block">Net EV Margin</span>
          </div>
        </div>
      </div>

      {/* Target Buyer & Advantages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <span className="text-xs uppercase font-bold text-emerald-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Investment Drivers</span>
          </span>
          <ul className="space-y-2 text-xs text-slate-700">
            {strategyMeta.keyAdvantages.map((adv, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">+</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <span className="text-xs uppercase font-bold text-rose-800 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Risk Considerations</span>
          </span>
          <ul className="space-y-2 text-xs text-slate-700">
            {strategyMeta.commonRisks.map((risk, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold shrink-0">&minus;</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real Observed Public Sales Matching This Archetype */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Documented Public Sales Matching {strategyMeta.name}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {strategyMeta.associatedSales.length} Verified Comps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3 text-right">Sale Price</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Venue</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {strategyMeta.associatedSales.map((sale) => (
                <tr key={sale.domain} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <LtrIsolate>{sale.domain}</LtrIsolate>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    <LtrIsolate>${sale.price_usd.toLocaleString()}</LtrIsolate>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                    {sale.date}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-sans text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {sale.venue}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      OBSERVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Linking: Explore All 5 Archetypes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-600" />
          <span>Explore Other Investment Archetypes</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {allStrategies.map((strat) => {
            const isActive = strat.slug === strategyMeta.slug;
            const StratIcon = STRATEGY_ICONS[strat.type] || Sparkles;
            return (
              <Link
                key={strat.slug}
                to={`/strategy/${strat.slug}`}
                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center space-y-1.5 ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <StratIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold block">{strat.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 block">{strat.holdingHorizon.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};