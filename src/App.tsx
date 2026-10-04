/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { SingleAudit } from './components/SingleAudit';
import { SettingsModal } from './components/SettingsModal';
import { useLanguage } from './context/LanguageContext';
import type { DecisionMode, WatchlistDomain } from './types';

import { LandingHome } from './components/LandingHome';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { TldHubPage } from './pages/TldHubPage';
import { StrategyHubPage } from './pages/StrategyHubPage';
import { DynamicHead } from './components/DynamicHead';

// Dynamic code-splitting for secondary tab modules
const BrandDecision = lazy(() => import('./components/BrandDecision').then((m) => ({ default: m.BrandDecision })));
const BulkAudit = lazy(() => import('./components/BulkAudit').then((m) => ({ default: m.BulkAudit })));
const Watchlist = lazy(() => import('./components/Watchlist').then((m) => ({ default: m.Watchlist })));
const OutcomesDashboard = lazy(() => import('./components/OutcomesDashboard').then((m) => ({ default: m.OutcomesDashboard })));

function TabLoadingFallback() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[300px]">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
      <span className="text-xs font-medium text-slate-500 font-mono">Loading module...</span>
    </div>
  );
}

const INITIAL_WATCHLIST: WatchlistDomain[] = [
  {
    id: 'w1',
    domain: 'paywave.com',
    addedAt: new Date().toISOString(),
    mode: 'buy',
    verdict: 'Buy',
    score: 0.94,
    estimatedValue: 48000,
    annualCarryingCost: 14,
    annualParkingRevenue: 240,
    inboundOffers: 3,
    holdingYears: 1,
    notes: 'Premium fintech single-word keyword. High liquidity.',
  },
  {
    id: 'w2',
    domain: 'hyperagent.ai',
    addedAt: new Date().toISOString(),
    mode: 'renew',
    verdict: 'Renew',
    score: 0.88,
    estimatedValue: 12500,
    annualCarryingCost: 80,
    annualParkingRevenue: 120,
    inboundOffers: 2,
    holdingYears: 2,
    notes: 'AI startup brand. Retain for 2026 exit.',
  },
  {
    id: 'w3',
    domain: 'cheap-free-downloads-123.xyz',
    addedAt: new Date().toISOString(),
    mode: 'renew',
    verdict: 'Drop',
    score: 0.22,
    estimatedValue: 35,
    annualCarryingCost: 13,
    annualParkingRevenue: 0,
    inboundOffers: 0,
    holdingYears: 3,
    notes: 'Zero traffic, negative carrying ROI. Drop on expiry.',
  },
];

import { useRouter, Link } from './router/RouterContext';
import { siteConfig } from './config/site';

export default function App() {
  const { route, navigate, getLocalizedPath } = useRouter();

  // Active view driven by URL route with fallback to state
  const activeTab: 'home' | 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes' | 'privacy' | 'terms' | 'tld' | 'strategy' =
    route === 'home'
      ? 'home'
      : route === 'brand'
      ? 'brand'
      : route === 'bulk'
      ? 'bulk'
      : route === 'watchlist'
      ? 'watchlist'
      : route === 'outcomes'
      ? 'outcomes'
      : route === 'privacy'
      ? 'privacy'
      : route === 'terms'
      ? 'terms'
      : route === 'tld'
      ? 'tld'
      : route === 'strategy'
      ? 'strategy'
      : 'audit';

  const setActiveTab = (tab: 'home' | 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes') => {
    const routeMap: Record<string, string> = {
      home: '/',
      audit: '/audit',
      brand: '/brand-selection',
      bulk: '/bulk',
      watchlist: '/watchlist',
      outcomes: '/outcomes',
    };
    navigate(getLocalizedPath(routeMap[tab] || '/'));
  };

  const [auditTarget, setAuditTarget] = useState<{ domain: string; mode: DecisionMode } | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistDomain[]>(() => {
    try {
      const storageKey = `${siteConfig.name.toLowerCase()}_watchlist`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
    } catch {
      return INITIAL_WATCHLIST;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync watchlist to local storage
  useEffect(() => {
    try {
      const storageKey = `${siteConfig.name.toLowerCase()}_watchlist`;
      localStorage.setItem(storageKey, JSON.stringify(watchlist));
    } catch (err) {
      console.error('Failed to sync watchlist:', err);
    }
  }, [watchlist]);

  const handleAddToWatchlist = (item: Omit<WatchlistDomain, 'id' | 'addedAt'>) => {
    // Check if domain already exists
    if (watchlist.some((w) => w.domain.toLowerCase() === item.domain.toLowerCase())) {
      return;
    }
    const newItem: WatchlistDomain = {
      ...item,
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      addedAt: new Date().toISOString(),
    };
    setWatchlist((prev) => [newItem, ...prev]);
  };

  const handleRemoveDomain = (id: string) => {
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setWatchlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, notes } : w))
    );
  };

  const isInWatchlist = (domain: string): boolean => {
    return watchlist.some((w) => w.domain.toLowerCase() === domain.toLowerCase());
  };

  const handleSelectDomainForSingleAudit = (domain: string, mode: DecisionMode) => {
    setAuditTarget({ domain, mode });
    setActiveTab('audit');
  };

  const { isRtl, t, setLanguage, language } = useLanguage();

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 ${isRtl ? 'font-arabic' : 'font-sans'}`}>
      {/* Dynamic SEO Head Manager */}
      <DynamicHead />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <LandingHome
            onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
          />
        )}

        {activeTab === 'audit' && (
          <SingleAudit
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
            onSelectMode={(mode) => {
              if (mode === 'brand_selection') setActiveTab('brand');
            }}
            auditTarget={auditTarget}
            onClearAuditTarget={() => setAuditTarget(null)}
          />
        )}

        {activeTab === 'brand' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <BrandDecision
              onSelectMode={(mode) => {
                if (mode === 'buy' || mode === 'renew') setActiveTab('audit');
              }}
              onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
            />
          </Suspense>
        )}

        {activeTab === 'bulk' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <BulkAudit
              onAddToWatchlist={handleAddToWatchlist}
              isInWatchlist={isInWatchlist}
              onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
            />
          </Suspense>
        )}

        {activeTab === 'watchlist' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <Watchlist
              watchlist={watchlist}
              onRemoveDomain={handleRemoveDomain}
              onUpdateNotes={handleUpdateNotes}
              onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
            />
          </Suspense>
        )}

        {activeTab === 'outcomes' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <OutcomesDashboard />
          </Suspense>
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyPage />
        )}

        {activeTab === 'terms' && (
          <TermsPage />
        )}

        {activeTab === 'tld' && (
          <TldHubPage
            onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyHubPage
            onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
          />
        )}
      </main>

      {/* Modern High-Trust Dark Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 py-10 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            {/* Col 1: Brand, Tagline & Language Switcher (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm font-mono shadow-xs">
                  {siteConfig.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-lg text-white tracking-tight">{siteConfig.name}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {t('footer_engine_desc')}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 pt-1">
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Sub-2s Parallel Latency</span>
                </span>
                <span>&bull;</span>
                <span className="text-emerald-400">0% Paid API Cost</span>
                <span>&bull;</span>
                <span>Deterministic SHA-256</span>
              </div>

              {/* Regional Language Switcher */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('footer_regional_langs')}
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      language === 'en' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      language === 'fr' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('es')}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      language === 'es' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    Español
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('pt')}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      language === 'pt' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    Português
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`px-2 py-0.5 rounded border font-arabic transition-colors cursor-pointer ${
                      language === 'ar' ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>
            </div>

            {/* Col 2: Decision Engines & Modes (3 cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {t('footer_decision_modes')}
              </span>
              <div className="flex flex-col space-y-1.5 text-xs text-slate-400">
                <Link to="/audit" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  &bull; {t('mode_a_title')}
                </Link>
                <Link to="/audit?mode=renew" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  &bull; {t('mode_b_title')}
                </Link>
                <Link to="/brand-selection" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  &bull; {t('tab_brand')}
                </Link>
                <Link to="/bulk" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  &bull; {t('tab_bulk')}
                </Link>
                <Link to="/outcomes" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  &bull; {t('tab_outcomes')}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-start hover:text-emerald-400 transition-colors cursor-pointer pt-1"
                >
                  &bull; {t('settings_title')}
                </button>
              </div>
            </div>

            {/* Col 3: Programmatic TLD Guides (3 cols) */}
            <div className="lg:col-span-3 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {t('footer_tld_guides')}
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-400 font-mono">
                <Link to="/tld/com" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .com Guide
                </Link>
                <Link to="/tld/ai" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .ai Guide
                </Link>
                <Link to="/tld/io" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .io Guide
                </Link>
                <Link to="/tld/net" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .net Guide
                </Link>
                <Link to="/tld/org" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .org Guide
                </Link>
                <Link to="/tld/co" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .co Guide
                </Link>
                <Link to="/tld/ma" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .ma Guide
                </Link>
                <Link to="/tld/fr" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; .fr Guide
                </Link>
              </div>
            </div>

            {/* Col 4: Investment Strategy Archetypes (2 cols) */}
            <div className="lg:col-span-2 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {t('footer_strategy_guides')}
              </span>
              <div className="flex flex-col space-y-1.5 text-xs text-slate-400">
                <Link to="/strategy/brandable" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; Brandable
                </Link>
                <Link to="/strategy/exact-match-keyword" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; Keyword EMD
                </Link>
                <Link to="/strategy/geo-service" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; Geo Service
                </Link>
                <Link to="/strategy/short-acronym-numeric" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; Short Acronym
                </Link>
                <Link to="/strategy/tech-trend" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  &bull; Tech Trend AI
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} {siteConfig.name} &bull; Non-custodial AI Decision Platform. All rights reserved.
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/privacy"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-400 hover:text-white hover:underline transition-colors"
              >
                {t('legal_link_privacy')}
              </Link>
              <span>&bull;</span>
              <Link
                to="/terms"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-400 hover:text-white hover:underline transition-colors"
              >
                {t('legal_link_terms')}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
