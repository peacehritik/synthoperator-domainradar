import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  Layers, 
  FolderKanban, 
  Settings, 
  ShieldCheck, 
  Zap,
  Target,
  Sparkles,
  Globe,
  ChevronDown,
  Menu,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { siteConfig } from '../config/site';
import type { SupportedLanguage } from '../types';

const SUPPORTED_LANGS: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
];

interface HeaderProps {
  activeTab: 'home' | 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes' | 'privacy' | 'terms' | 'tld' | 'strategy';
  setActiveTab: (tab: 'home' | 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes') => void;
  watchlistCount: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onOpenSettings,
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [hasKey, setHasKey] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('typesafe_api_key'));
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for storage / key changes
  useEffect(() => {
    const updateKeyStatus = () => {
      setHasKey(Boolean(localStorage.getItem('typesafe_api_key')));
    };

    window.addEventListener('typesafe_key_updated', updateKeyStatus);
    window.addEventListener('storage', updateKeyStatus);

    return () => {
      window.removeEventListener('typesafe_key_updated', updateKeyStatus);
      window.removeEventListener('storage', updateKeyStatus);
    };
  }, []);

  // Close mobile drawer on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelectTab = (tab: 'home' | 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Left: Brand Logo & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectTab('home')}
              className="flex items-center space-x-2.5 text-left cursor-pointer group"
              title={`${siteConfig.name} Home`}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Radar className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    {siteConfig.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    v{siteConfig.version.slice(0, 3)}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* 2. Center: Desktop Navigation Tabs (Hidden on Mobile/Tablet) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            <button
              type="button"
              onClick={() => handleSelectTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('tab_audit')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('brand')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'brand'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('tab_brand')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('bulk')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bulk'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('tab_bulk')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('watchlist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'watchlist'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('tab_watchlist')}</span>
              {watchlistCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {watchlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('outcomes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'outcomes'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('tab_outcomes')}</span>
            </button>
          </nav>

          {/* 3. Right: Controls & Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector Dropdown (Desktop) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs cursor-pointer"
                title="Change Application Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold">{SUPPORTED_LANGS.find((l) => l.code === language)?.label || 'English'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isLangMenuOpen && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-1.5 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100`}>
                  {SUPPORTED_LANGS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-start px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        language === lang.code ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span className={lang.code === 'ar' ? 'font-arabic' : ''}>{lang.label}</span>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cache Status Badge (Desktop only) */}
            <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('cache_badge')}</span>
            </div>

            {/* TypeSafe Key Status Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs cursor-pointer"
              title={hasKey ? t('key_saved') : t('key_demo')}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[11px] font-mono">
                {hasKey ? t('key_saved') : t('key_demo')}
              </span>
            </button>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              title={t('settings_title')}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              aria-label="Open mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Sheet Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider block mb-1">
              Navigation
            </span>
            <button
              type="button"
              onClick={() => handleSelectTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'audit'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>{t('tab_audit')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Mode A &bull; B</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('brand')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'brand'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t('tab_brand')}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono">Mode C</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('bulk')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>{t('tab_bulk')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">CSV Batch</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('watchlist')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'watchlist'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-slate-600" />
                <span>{t('tab_watchlist')}</span>
              </div>
              {watchlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
                  {watchlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('outcomes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                activeTab === 'outcomes'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>{t('tab_outcomes')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Calibration</span>
            </button>
          </div>

          {/* Mobile Settings & Language Row */}
          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider block">
              Languages &amp; Integration
            </span>
            <div className="grid grid-cols-3 gap-1.5 px-1">
              {SUPPORTED_LANGS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={lang.code === 'ar' ? 'font-arabic' : ''}>{lang.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 px-1">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t('settings_title')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};