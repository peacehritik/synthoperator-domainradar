import React from 'react';
import { Icon } from './Icons';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';

export const HowItWorksSection: React.FC = () => {
  const { t, isRtl } = useLanguage();

  return (
    <div className="space-y-12 py-8 no-print">
      {/* 1. Visual "How Our Engine Works" Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Icon name="sparkles" size={14} className="text-emerald-600" />
            <span>{t('how_it_works_badge', 'Autonomous Decision Protocol')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('how_it_works_title', 'How Our Domain Decision Engine Works')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('how_it_works_subtitle', '{appName} evaluates domains deterministically across 7 open free telemetry sources, TypeSafe JEV atomic judgments, and capital-proportional risk gates.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* Left Preview Card: Visual Mock of an Authentic Audit */}
          <div className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-200">paywave.com</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                BUY &bull; 94/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Retail Valuation</span>
                <span className="text-base font-bold text-emerald-400">$38,000 - $58,000</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Mid: $48,000</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Net Expected Value</span>
                <span className="text-base font-bold text-emerald-400">+$6,840/yr</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">P_sale: 18.0%</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-sans pt-1">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Icon name="check-circle" size={14} className="shrink-0" />
                <span>Zero trademark collision across 1,000+ top protected global marks.</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Icon name="check-circle" size={14} className="shrink-0" />
                <span>Wayback footprint verified dating back to 2012 (clean history).</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <Icon name="check-circle" size={14} className="shrink-0" />
                <span>Tier 1 .com liquidity floor &bull; JEV brand equity: Premium (95/100).</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SHA-256 Hash Verified</span>
              <span>100% Free Telemetry</span>
            </div>
          </div>

          {/* Right Steps Checklist */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-start space-x-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('how_step1_title', 'Multi-Source Free Evidence Ingestion')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('how_step1_desc', 'Probes RDAP ICANN status, Wayback CDX historical archives, Google Autocomplete demand, native Node.js DNS routing, and our 1,000+ brand trademark trie in sub-2s parallel execution.')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('how_step2_title', 'TypeSafe JEV System One Atomic Judgment')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('how_step2_desc', 'Evaluates strategy archetype, phonetic brandability, memorability cadence, aftermarket liquidity probability, and legal risk with zero natural language hallucination.')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('how_step3_title', 'Deterministic Net EV & Hard Risk Gates')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('how_step3_desc', 'Screens capital against 4 inviolable risk gates and computes actuarial Net Expected Value (Net EV), wholesale floors, and transparent 3-pillar explainability.')}
                </p>
              </div>
            </div>

            {/* Note regarding zero paid API cost */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-start space-x-2 text-xs text-emerald-950">
              <Icon name="info" size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <span>{t('how_disclaimer_box', 'Zero Third-Party Subscription Notice: {appName} operates 100% on open public telemetry and local algorithms. No paid Ahrefs or SEMrush API keys required.')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three-Step Guide Cards */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Icon name="cpu" size={14} className="text-slate-600" />
            <span>{t('step_guide_badge', 'Simple 3-Step Process')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t('step_guide_title', 'How to Use {appName} in 3 Easy Steps')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('step_guide_subtitle', 'Fast, deterministic, and 100% free decision intelligence for domain investors and startup founders.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t('step_1_badge', 'Step 1')}
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-200">01</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('step_1_title', 'Enter Target Domain & Optional Price')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step_1_desc', 'Type or paste any domain name (e.g. brandflow.com, neurobot.ai). You can optionally enter the seller asking price in USD ($) for instant Net EV calculation.')}
              </p>
            </div>

            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <span>{t('step_1_action', 'Instant RDAP & WHOIS Lookup')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t('step_2_badge', 'Step 2')}
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-200">02</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('step_2_title', 'Automated Free Diligence & JEV Judgment')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step_2_desc', 'The engine runs parallel public scans (Wayback, Suggest, DNS, Trademark) and TypeSafe JEV System One atomic evaluation with 2-hour SHA-256 caching.')}
              </p>
            </div>

            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <span>{t('step_2_action', 'Parallel Telemetry Execution')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t('step_3_badge', 'Step 3')}
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-200">03</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {t('step_3_title', 'Get Actionable Verdict & Certified Dossier')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step_3_desc', 'Review clear Buy / Review / Pass verdicts, wholesale & retail valuation bounds, observed public sales comps, and export a certified printable PDF report.')}
              </p>
            </div>

            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <span>{t('step_3_action', 'Export Certified Audit (PDF / JSON)')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </div>
          </div>
        </div>

        {/* Bottom Compatibility Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 font-medium">
          <div className="flex items-center space-x-2">
            <Icon name="shield-check" size={16} className="text-emerald-600 shrink-0" />
            <span>{t('compat_strip_left', 'Compatible with all extensions: .com, .ai, .io, .org, .net, ccTLDs (.fr, .ma, .es, .de, .uk) and new gTLDs.')}</span>
          </div>
          <span className="text-emerald-700 font-bold font-mono">
            {t('compat_strip_right', '100% Free • Non-Custodial & Private')}
          </span>
        </div>
      </div>
    </div>
  );
};