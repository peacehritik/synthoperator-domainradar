/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SingleAudit } from './components/SingleAudit';
import { BrandDecision } from './components/BrandDecision';
import { BulkAudit } from './components/BulkAudit';
import { Watchlist } from './components/Watchlist';
import { OutcomesDashboard } from './components/OutcomesDashboard';
import { SettingsModal } from './components/SettingsModal';
import type { DecisionMode, WatchlistDomain } from './types';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes'>('audit');
  const [watchlist, setWatchlist] = useState<WatchlistDomain[]>(() => {
    try {
      const saved = localStorage.getItem('domainradar_watchlist');
      return saved ? JSON.parse(saved) : INITIAL_WATCHLIST;
    } catch {
      return INITIAL_WATCHLIST;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync watchlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('domainradar_watchlist', JSON.stringify(watchlist));
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
    setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'audit' && (
          <SingleAudit
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
            onSelectMode={(mode) => {
              if (mode === 'brand_selection') setActiveTab('brand');
            }}
          />
        )}

        {activeTab === 'brand' && (
          <BrandDecision
            onSelectMode={(mode) => {
              if (mode === 'buy' || mode === 'renew') setActiveTab('audit');
            }}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkAudit
            onAddToWatchlist={handleAddToWatchlist}
            isInWatchlist={isInWatchlist}
            onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
          />
        )}

        {activeTab === 'watchlist' && (
          <Watchlist
            watchlist={watchlist}
            onRemoveDomain={handleRemoveDomain}
            onUpdateNotes={handleUpdateNotes}
            onSelectDomainForSingleAudit={handleSelectDomainForSingleAudit}
          />
        )}

        {activeTab === 'outcomes' && (
          <OutcomesDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">DomainRadar Engine</span>
            <span>:</span>
            <span>Deterministic RDAP, Syllabic &amp; Carrying Cost Decision Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>Mode A: Buy Aftermarket</span>
            <span>&bull;</span>
            <span>Mode B: Renewal Portfolio Hold vs Drop</span>
            <span>&bull;</span>
            <span className="font-mono text-emerald-700">15m TTL Server Cache</span>
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
