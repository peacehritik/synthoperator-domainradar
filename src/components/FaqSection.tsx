import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FaqSection: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQ_ITEMS = [
    {
      qKey: 'faq_q1',
      aKey: 'faq_a1',
      defaultQ: 'How does the platform calculate Net Expected Value without paid APIs?',
      defaultA: 'The platform utilizes open public telemetry protocols (ICANN RDAP, Internet Archive Wayback CDX, Google Autocomplete commercial tokens, native Node.js DNS resolution) combined with an offline 1,000+ trademark collision trie and TypeSafe JEV System One atomic scoring. All valuation ranges and Net Expected Value models are computed deterministically in TypeScript without incurring paid third-party subscriptions.'
    },
    {
      qKey: 'faq_q2',
      aKey: 'faq_a2',
      defaultQ: 'What is the difference between Mode A (Buy), Mode B (Renew), and Mode C (Brand)?',
      defaultA: 'Mode A evaluates secondary acquisition viability, fair market retail ranges, and actuarial resale ROI. Mode B analyzes portfolio retention to identify whether an existing asset generates positive carrying cashflow or is a sunk-cost drop candidate. Mode C benchmarks up to 10 candidate brand names against a structured business context, target audience, and strategic naming priorities.'
    },
    {
      qKey: 'faq_q3',
      aKey: 'faq_a3',
      defaultQ: 'Are TypeSafe JEV evaluations really deterministic and cache-shared?',
      defaultA: 'Yes. TypeSafe JEV System One processes structured canonical English state contracts. Every audit computes a 64-character deterministic SHA-256 state hash cached in volatile memory for 2 hours. Changing the interface language (French, Arabic, Spanish, Portuguese) reuses the identical state hash with zero extra API latency or cost.'
    },
    {
      qKey: 'faq_q4',
      aKey: 'faq_a4',
      defaultQ: 'How does the Known-Brand Trademark Collision Screen work?',
      defaultA: 'Our offline brand scanner compares the second-level domain (SLD) against an indexed dictionary of over 1,000 famous global trademarks using exact matching, substring overlap, and Levenshtein distance typosquat detection. If a critical collision is flagged, Hard Gate 1 inviolably blocks automated acquisition to safeguard investor capital from UDRP forfeiture.'
    },
    {
      qKey: 'faq_q5',
      aKey: 'faq_a5',
      defaultQ: 'Why does the engine display "Price Required" on registered domains?',
      defaultA: 'In accordance with Constitutional Rule 06, the platform never fabricates an artificial purchase price. When a domain is registered on the secondary market and no asking price is specified by the user, Net EV calculation is honestly suspended until a seller asking price is provided.'
    },
    {
      qKey: 'faq_q6',
      aKey: 'faq_a6',
      defaultQ: 'Can I customize the scoring weights for my specific investment strategy?',
      defaultA: 'Yes. In the Settings modal, open the Scoring Weights tab to customize composite metric sliders (Brandability, Memorability, Search Intent, Liquidity, TLD Equity, Economics Margin) with instant automatic normalization to 100% and pre-configured investment strategy presets.'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 no-print">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('faq_badge', 'Answers & Guidelines')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('faq_title', 'Frequently Asked Questions')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('faq_subtitle', 'Everything you need to know about deterministic domain decision intelligence and valuation methodology.')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-slate-200">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.qKey} className="py-4">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left space-x-3 transition-colors cursor-pointer group"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t(item.qKey, item.defaultQ)}
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-emerald-700 transition-colors">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pr-8 animate-in fade-in duration-150">
                  {t(item.aKey, item.defaultA)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};