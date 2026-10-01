import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Layers, 
  FolderKanban, 
  Settings, 
  ShieldCheck, 
  Zap,
  Target,
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes';
  setActiveTab: (tab: 'audit' | 'brand' | 'bulk' | 'watchlist' | 'outcomes') => void;
  watchlistCount: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onOpenSettings,
}) => {
  const [hasKey, setHasKey] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('typesafe_api_key'));
  });

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">DomainRadar</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  AI Decision Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Buy, Drop, and Renewal Intelligence for Domain Portfolios
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'audit'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Instant Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('brand')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'brand'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Choose Brand (Mode C)</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Bulk Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'watchlist'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-slate-700" />
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {watchlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('outcomes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'outcomes'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Calibration &amp; Outcomes</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>15m TTL Cache</span>
            </div>

            {/* TypeSafe Key Status Indicator */}
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              title={hasKey ? "TypeSafe Key Saved" : "No Key (Running Demo Mode)"}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${hasKey ? "bg-emerald-500" : "bg-slate-400"}`}></span>
              <span className="hidden sm:inline text-[11px] font-mono">
                {hasKey ? "TypeSafe Key Saved" : "No Key (Running Demo Mode)"}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              title="API & Security Settings"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors relative"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
