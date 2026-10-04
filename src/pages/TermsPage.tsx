import React from 'react';
import { 
  Scale, 
  AlertTriangle, 
  Home, 
  Zap, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import { Link, useRouter } from '../router/RouterContext';

export const TermsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate, getLocalizedPath } = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-slate-900 inline-flex items-center space-x-1">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('breadcrumb_home', 'Home')}</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{t('legal_terms_title')}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>Algorithmic Diligence Notice &bull; Governance v2.4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('legal_terms_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-mono">
          {t('legal_last_updated')} &bull; {t('legal_footer_protocol')}
        </p>
      </div>

      {/* Main Legal Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm">
        {/* Disclaimer Callout Box */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs sm:text-sm flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <span>{t('terms_intro_box')}</span>
        </div>

        {/* Section 1 */}
        <section className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600 font-mono">01.</span>
            <span>{t('terms_sec1_title')}</span>
          </h2>
          <p>{t('terms_sec1_desc')}</p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600 font-mono">02.</span>
            <span>{t('terms_sec2_title')}</span>
          </h2>
          <p>{t('terms_sec2_desc')}</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2 text-xs sm:text-sm">
            <li>{t('terms_sec2_li1')}</li>
            <li>{t('terms_sec2_li2')}</li>
            <li>{t('terms_sec2_li3')}</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600 font-mono">03.</span>
            <span>{t('terms_sec3_title')}</span>
          </h2>
          <p>{t('terms_sec3_desc')}</p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pb-6 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600 font-mono">04.</span>
            <span>{t('terms_sec4_title')}</span>
          </h2>
          <p>{t('terms_sec4_desc')}</p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="text-emerald-600 font-mono">05.</span>
            <span>{t('terms_sec5_title')}</span>
          </h2>
          <p>{t('terms_sec5_desc')}</p>
        </section>

        {/* Action Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/privacy"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center space-x-1"
          >
            <span>{t('legal_privacy_title')}</span>
            <span>&rarr;</span>
          </Link>

          <button
            type="button"
            onClick={() => navigate(getLocalizedPath('/audit'))}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('btn_launch_audit', 'Launch Domain Audit')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};