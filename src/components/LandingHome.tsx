import React, { useState } from 'react';
import { Icon } from './Icons';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import { useRouter } from '../router/RouterContext';
import { HowItWorksSection } from './HowItWorksSection';
import { FaqSection } from './FaqSection';
import type { DecisionMode } from '../types';

interface LandingHomeProps {
  onSelectDomainForSingleAudit: (domain: string, mode: DecisionMode) => void;
}

const SAMPLE_CHIPS = [
  { domain: 'paywave.com', mode: 'buy' as DecisionMode, label: 'Fintech Tier 1' },
  { domain: 'hyperagent.ai', mode: 'renew' as DecisionMode, label: 'AI Trend Portfolio' },
  { domain: 'flowstack.io', mode: 'buy' as DecisionMode, label: 'Dev Brandable' },
  { domain: 'casacourier.ma', mode: 'buy' as DecisionMode, label: 'Regional ccTLD' },
];

export const LandingHome: React.FC<LandingHomeProps> = ({ onSelectDomainForSingleAudit }) => {
  const { t, isRtl } = useLanguage();
  const { navigate, getLocalizedPath } = useRouter();
  const [quickDomain, setQuickDomain] = useState('');

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

  const handleLaunchQuickAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitize(quickDomain);
    if (!clean) return;
    onSelectDomainForSingleAudit(clean, 'buy');
    navigate(getLocalizedPath('/audit'));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const clean = sanitize(text);
        setQuickDomain(clean);
        if (clean) {
          onSelectDomainForSingleAudit(clean, 'buy');
          navigate(getLocalizedPath('/audit'));
        }
      }
    } catch (err) {
      console.warn('Could not read clipboard:', err);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero Presentation Section */}
      <section className="text-center max-w-4xl mx-auto pt-4 sm:pt-8 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('landing_hero_title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('landing_hero_subtitle')}
          </p>
        </div>

        {/* Quick Search Input Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <form
            onSubmit={handleLaunchQuickAudit}
            className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-md focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
          >
            <div className="relative flex-1 flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" size={20} className="text-slate-400" />
              </div>
              <input
                type="text"
                dir="ltr"
                value={quickDomain}
                onChange={(e) => setQuickDomain(sanitize(e.target.value))}
                placeholder={t('search_placeholder')}
                className="w-full pl-10 pr-24 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 font-mono focus:outline-hidden bg-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200 inline-flex items-center space-x-1 cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Icon name="clipboard-paste" size={14} className="text-slate-600" />
                  <span>{t('btn_paste')}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors shadow-xs cursor-pointer space-x-2"
            >
              <span>{t('btn_audit')}</span>
              <Icon name="chevron-right" size={16} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </button>
          </form>

          {/* Quick Demo Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <span className="font-medium mr-1">{t('quick_samples')}</span>
            {SAMPLE_CHIPS.map((chip) => (
              <button
                key={chip.domain}
                type="button"
                onClick={() => {
                  onSelectDomainForSingleAudit(chip.domain, chip.mode);
                  navigate(getLocalizedPath('/audit'));
                }}
                className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] transition-colors cursor-pointer shadow-2xs inline-flex items-center space-x-1"
              >
                <span>{chip.domain}</span>
                <span className="text-[10px] text-slate-400 font-sans">({chip.label})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Three Dedicated Strategic Mode CTA Cards */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 block">
            Domain Decision Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('landing_modes_heading', 'Three Specialized Decision Engines')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('landing_modes_sub', 'Select the engine calibrated to your specific investment phase.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card: Mode A */}
          <div className="bg-white rounded-xl border-2 border-emerald-500/80 p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden group hover:border-emerald-600 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <Icon name="zapper" size={22} className="text-emerald-700" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block font-mono">
                Mode A &bull; Buy Diligence
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('landing_cta_mode_a_title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing_cta_mode_a_desc')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(getLocalizedPath('/audit'))}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <span>{t('landing_cta_mode_a_btn')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </button>
          </div>

          {/* Card: Mode B */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Icon name="folder-kanban" size={22} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 inline-block font-mono">
                Mode B &bull; Portfolio Retention
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('landing_cta_mode_b_title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing_cta_mode_b_desc')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(getLocalizedPath('/audit'))}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <span>{t('landing_cta_mode_b_btn')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </button>
          </div>

          {/* Card: Mode C */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Icon name="target" size={22} className="text-purple-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 inline-block font-mono">
                Mode C &bull; Brand Naming
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {t('landing_cta_mode_c_title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('landing_cta_mode_c_desc')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(getLocalizedPath('/brand-selection'))}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <span>{t('landing_cta_mode_c_btn')}</span>
              <Icon name="arrow-right" size={14} className={`${isRtl ? 'rotate-180 mr-1 ml-0' : ''}`} />
            </button>
          </div>
        </div>

        {/* Secondary Tools Strip: Bulk & Calibration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="layers" size={20} className="text-slate-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t('tab_bulk')}</span>
                <span className="text-[11px] text-slate-500">Batch audit up to 100 domains with CSV import</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(getLocalizedPath('/bulk'))}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Open Bulk
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="target" size={20} className="text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">{t('tab_outcomes')}</span>
                <span className="text-[11px] text-slate-500">Live calibration metrics, realized P&amp;L, and accuracy drift</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(getLocalizedPath('/outcomes'))}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Open Calibration
            </button>
          </div>
        </div>
      </section>

      {/* 3. Visual "How It Works" Protocol & 3-Step Guide */}
      <HowItWorksSection />

      {/* 4. Frequently Asked Questions Accordion */}
      <FaqSection />
    </div>
  );
};