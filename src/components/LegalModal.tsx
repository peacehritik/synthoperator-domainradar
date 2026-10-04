import React, { useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Scale, 
  Lock, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';

export type LegalDocType = 'privacy' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'privacy',
}) => {
  const { t, isRtl } = useLanguage();
  const [activeDoc, setActiveDoc] = React.useState<LegalDocType>(initialDoc);

  useEffect(() => {
    setActiveDoc(initialDoc);
  }, [initialDoc]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
      <div 
        className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center">
              {activeDoc === 'privacy' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Scale className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {activeDoc === 'privacy' ? t('legal_privacy_title') : t('legal_terms_title')}
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {t('legal_last_updated')} &bull; {t('legal_footer_governance')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white gap-2">
          <button
            type="button"
            onClick={() => setActiveDoc('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors inline-flex items-center space-x-1.5 cursor-pointer ${
              activeDoc === 'privacy'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('legal_tab_privacy')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('terms')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors inline-flex items-center space-x-1.5 cursor-pointer ${
              activeDoc === 'terms'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('legal_tab_terms')}</span>
          </button>
        </div>

        {/* Legal Document Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/40">
          {activeDoc === 'privacy' ? (
            /* PRIVACY POLICY CONTENT */
            <div className="space-y-5">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('privacy_intro_box')}</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>1.</span>
                  <span>{t('privacy_sec1_title')}</span>
                </h3>
                <p>{t('privacy_sec1_desc')}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                  <li>{t('privacy_sec1_li1')}</li>
                  <li>{t('privacy_sec1_li2')}</li>
                  <li>{t('privacy_sec1_li3')}</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>2.</span>
                  <span>{t('privacy_sec2_title')}</span>
                </h3>
                <p>{t('privacy_sec2_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>3.</span>
                  <span>{t('privacy_sec3_title')}</span>
                </h3>
                <p>{t('privacy_sec3_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>4.</span>
                  <span>{t('privacy_sec4_title')}</span>
                </h3>
                <p>{t('privacy_sec4_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>5.</span>
                  <span>{t('privacy_sec5_title')}</span>
                </h3>
                <p>{t('privacy_sec5_desc')}</p>
              </section>
            </div>
          ) : (
            /* TERMS OF SERVICE CONTENT */
            <div className="space-y-5">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t('terms_intro_box')}</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>1.</span>
                  <span>{t('terms_sec1_title')}</span>
                </h3>
                <p>{t('terms_sec1_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>2.</span>
                  <span>{t('terms_sec2_title')}</span>
                </h3>
                <p>{t('terms_sec2_desc')}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
                  <li>{t('terms_sec2_li1')}</li>
                  <li>{t('terms_sec2_li2')}</li>
                  <li>{t('terms_sec2_li3')}</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>3.</span>
                  <span>{t('terms_sec3_title')}</span>
                </h3>
                <p>{t('terms_sec3_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>4.</span>
                  <span>{t('terms_sec4_title')}</span>
                </h3>
                <p>{t('terms_sec4_desc')}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>5.</span>
                  <span>{t('terms_sec5_title')}</span>
                </h3>
                <p>{t('terms_sec5_desc')}</p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">{t('legal_footer_engine')}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            {t('btn_close')}
          </button>
        </div>
      </div>
    </div>
  );
};