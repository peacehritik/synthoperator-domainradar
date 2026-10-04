import React, { useState } from 'react';
import { 
  Globe, 
  Home, 
  Zap, 
  Receipt, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import { Link, useRouter } from '../router/RouterContext';
import { TLD_REGISTRY_DATABASE, TLD_OBSERVED_SALES } from '../utils/tldData';
import type { DecisionMode } from '../types';

interface TldHubPageProps {
  onSelectDomainForSingleAudit: (domain: string, mode: DecisionMode) => void;
}

export const TldHubPage: React.FC<TldHubPageProps> = ({ onSelectDomainForSingleAudit }) => {
  const { t, isRtl } = useLanguage();
  const { params, navigate, getLocalizedPath } = useRouter();

  const rawTld = (params.tld || 'com').toLowerCase().replace(/^\./, '');
  const tldMeta = TLD_REGISTRY_DATABASE[rawTld] || {
    tld: `.${rawTld}`,
    name: `${rawTld.toUpperCase()} Domain Extension`,
    tier: 'Tier 3' as const,
    tierMultiplier: 0.65,
    annualRenewalCost: 25,
    credibility: 'Moderate' as const,
    liquidityProfile: 'Specialized Liquidity',
    bestFor: 'Regional, specialized, or category-specific web projects.',
    registryType: 'Generic (gTLD)' as const,
    description: `Official registry specifications and secondary market dynamics for the .${rawTld} namespace.`,
  };

  const salesRecords = TLD_OBSERVED_SALES[rawTld] || [];
  const [quickSld, setQuickSld] = useState('');

  const handleLaunchTldAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSld = quickSld.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSld) return;
    const fullDomain = `${cleanSld}${tldMeta.tld}`;
    onSelectDomainForSingleAudit(fullDomain, 'buy');
    navigate(getLocalizedPath('/audit'));
  };

  const allTldsList = Object.keys(TLD_REGISTRY_DATABASE);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 inline-flex items-center space-x-1">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('breadcrumb_home', 'Home')}</span>
        </Link>
        <span>/</span>
        <span className="text-slate-500">Extensions</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold font-mono">{tldMeta.tld}</span>
      </nav>

      {/* Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {tldMeta.tier} &bull; {tldMeta.registryType}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {tldMeta.credibility} Credibility Rating
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline space-x-3">
              <span className="font-mono text-emerald-600">{tldMeta.tld}</span>
              <span className="text-xl sm:text-2xl text-slate-800 font-sans font-bold">
                {tldMeta.name}
              </span>
            </h1>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:text-right shrink-0">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Official Base Renewal</span>
            <div className="text-xl font-bold font-mono text-slate-900">
              <LtrIsolate>${tldMeta.annualRenewalCost}/yr</LtrIsolate>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Carrying Cost</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {tldMeta.description}
        </p>

        {/* Quick TLD Sifter Form */}
        <div className="pt-2">
          <form
            onSubmit={handleLaunchTldAudit}
            className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-300"
          >
            <div className="relative flex-1 flex items-center bg-white rounded-md border border-slate-200 px-3">
              <input
                type="text"
                dir="ltr"
                value={quickSld}
                onChange={(e) => setQuickSld(e.target.value)}
                placeholder={`Search any name in ${tldMeta.tld} (e.g. brand, flow)`}
                className="w-full py-2 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-hidden"
              />
              <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">
                {tldMeta.tld}
              </span>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Audit in {tldMeta.tld}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 4 Key Investment Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Liquidity Profile</span>
          <span className="text-base font-bold text-slate-900 font-mono block">
            {tldMeta.liquidityProfile}
          </span>
          <span className="text-[10px] text-slate-400 block">Aftermarket Auction Speed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">Valuation Multiplier</span>
          <span className="text-base font-bold text-emerald-700 font-mono block">
            {tldMeta.tierMultiplier}x
          </span>
          <span className="text-[10px] text-slate-400 block">Retail Base Weight</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">3-Year Carrying Drag</span>
          <span className="text-base font-bold text-slate-900 font-mono block">
            <LtrIsolate>${tldMeta.annualRenewalCost * 3}</LtrIsolate>
          </span>
          <span className="text-[10px] text-slate-400 block">Holding Obligation</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium block">5-Year Carrying Drag</span>
          <span className="text-base font-bold text-slate-900 font-mono block">
            <LtrIsolate>${tldMeta.annualRenewalCost * 5}</LtrIsolate>
          </span>
          <span className="text-[10px] text-slate-400 block">Long-Term Drag</span>
        </div>
      </div>

      {/* Real Public Sales in this TLD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Verified Public Sales in {tldMeta.tld}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {salesRecords.length} Documented Comps
          </span>
        </div>

        {salesRecords.length > 0 ? (
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
                {salesRecords.map((sale) => (
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
        ) : (
          <p className="text-xs text-slate-500 italic py-2">
            No public sales records currently indexed for {tldMeta.tld} in our local ledger.
          </p>
        )}
      </div>

      {/* Internal Linking: Explore Other TLD Hubs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-600" />
          <span>Explore Other TLD Extension Hubs</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {allTldsList.map((tldKey) => {
            const meta = TLD_REGISTRY_DATABASE[tldKey];
            const isActive = tldKey === rawTld;
            return (
              <Link
                key={tldKey}
                to={`/tld/${tldKey}`}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isActive
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-mono text-sm block">{meta.tld}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">${meta.annualRenewalCost}/yr</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};