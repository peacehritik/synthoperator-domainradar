import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Check, 
  Zap, 
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { siteConfig } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import type { StrategyWeights } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_WEIGHTS: StrategyWeights = {
  brandability: 0.35,
  memorability: 0.25,
  commercial_search: 0.05,
  liquidity: 0.15,
  tld_equity: 0.15,
  economics_spread: 0.05,
};

const WEIGHT_PRESETS: { key: string; label: string; weights: StrategyWeights }[] = [
  {
    key: 'preset_default',
    label: 'Archetype Default',
    weights: DEFAULT_WEIGHTS,
  },
  {
    key: 'preset_brand',
    label: 'Brand-First',
    weights: { brandability: 0.40, memorability: 0.30, commercial_search: 0.05, liquidity: 0.10, tld_equity: 0.10, economics_spread: 0.05 },
  },
  {
    key: 'preset_seo',
    label: 'SEO / Search-First',
    weights: { brandability: 0.05, memorability: 0.05, commercial_search: 0.40, liquidity: 0.20, tld_equity: 0.15, economics_spread: 0.15 },
  },
  {
    key: 'preset_liq',
    label: 'Liquidity-First',
    weights: { brandability: 0.10, memorability: 0.05, commercial_search: 0.05, liquidity: 0.45, tld_equity: 0.20, economics_spread: 0.15 },
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'api' | 'weights'>('api');

  const [typesafeKey, setTypesafeKey] = useState(() => {
    return localStorage.getItem('typesafe_api_key') || '';
  });

  const [weights, setWeights] = useState<StrategyWeights>(() => {
    try {
      const storageKey = `${siteConfig.name.toLowerCase()}_custom_weights`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
    } catch {
      return DEFAULT_WEIGHTS;
    }
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'idle' | 'connected' | 'invalid_key' | 'fallback_ready';
    message: string;
  }>({
    status: 'idle',
    message: 'Check live connectivity to https://api.typesafe.ai/v1/systemone',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : (localStorage.getItem('typesafe_api_key') || '');
    setTestingConnection(true);
    try {
      const res = await fetch('/api/typesafe/status', {
        headers: key ? { 'x-typesafe-key': key } : {},
      });
      const data = await res.json();
      setConnectionStatus({
        status: data.status,
        message: data.message,
      });
    } catch {
      setConnectionStatus({
        status: 'fallback_ready',
        message: 'TypeSafe JEV local contract engine active. Fallback ready.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const totalWeightPct = Math.round(
    ((weights.brandability || 0) +
      (weights.memorability || 0) +
      (weights.commercial_search || 0) +
      (weights.liquidity || 0) +
      (weights.tld_equity || 0) +
      (weights.economics_spread || 0)) *
      100
  );

  const handleWeightChange = (key: keyof StrategyWeights, valPct: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, valPct)) / 100,
    }));
  };

  const handleApplyPreset = (presetWeights: StrategyWeights) => {
    setWeights(presetWeights);
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typesafeKey.trim()) {
      localStorage.setItem('typesafe_api_key', typesafeKey.trim());
    } else {
      localStorage.removeItem('typesafe_api_key');
    }

    const weightsStorageKey = `${siteConfig.name.toLowerCase()}_custom_weights`;
    localStorage.setItem(weightsStorageKey, JSON.stringify(weights));

    window.dispatchEvent(new Event('typesafe_key_updated'));
    window.dispatchEvent(new Event(`${siteConfig.name.toLowerCase()}_weights_updated`));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {t('settings_title')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('settings_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50/50 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors inline-flex items-center space-x-1.5 ${
              activeTab === 'api'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>TypeSafe API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weights')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors inline-flex items-center space-x-1.5 ${
              activeTab === 'weights'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('settings_tab_weights')}</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {activeTab === 'api' ? (
            /* TypeSafe AI Configuration Section */
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">{t('settings_engine_name')}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    System One
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  model: jev-latest
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('settings_api_key_label')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="ts_live_... or custom authorization key"
                    value={typesafeKey}
                    onChange={(e) => setTypesafeKey(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {t('settings_api_key_hint')}
                </span>
              </div>

              {/* Connection Status Box */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {connectionStatus.status === 'connected' ? (
                    <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('settings_status_connected')}</span>
                    </span>
                  ) : connectionStatus.status === 'invalid_key' ? (
                    <span className="flex items-center space-x-1.5 font-semibold text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{t('settings_status_invalid')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>{t('settings_status_fallback')}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => checkStatus(typesafeKey.trim())}
                  disabled={testingConnection}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded shadow-2xs hover:bg-slate-50"
                >
                  {testingConnection ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                  )}
                  <span>{t('btn_test_conn')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Custom Investment Weights Sliders Section */
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{t('weights_strategy_title')}</span>
                  <span className="text-[11px] text-slate-500">{t('weights_strategy_desc')}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    totalWeightPct === 100
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {totalWeightPct}% Total
                  </span>
                </div>
              </div>

              {/* Quick Strategy Presets */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                {WEIGHT_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleApplyPreset(p.weights)}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Sliders Grid */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_brandability')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.brandability || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.brandability || 0) * 100)}
                    onChange={(e) => handleWeightChange('brandability', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_memorability')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.memorability || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.memorability || 0) * 100)}
                    onChange={(e) => handleWeightChange('memorability', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_search')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.commercial_search || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.commercial_search || 0) * 100)}
                    onChange={(e) => handleWeightChange('commercial_search', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_liquidity')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.liquidity || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.liquidity || 0) * 100)}
                    onChange={(e) => handleWeightChange('liquidity', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_tld')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.tld_equity || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.tld_equity || 0) * 100)}
                    onChange={(e) => handleWeightChange('tld_equity', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 mb-1">
                    <span className="font-semibold">{t('weight_economics')}</span>
                    <span className="font-mono font-bold text-slate-900">{Math.round((weights.economics_spread || 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={Math.round((weights.economics_spread || 0) * 100)}
                    onChange={(e) => handleWeightChange('economics_spread', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Weights auto-normalize to 100% on execution.</span>
                <button
                  type="button"
                  onClick={() => setWeights(DEFAULT_WEIGHTS)}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-rose-600 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-mono">
              {activeTab === 'api' ? 'POST https://api.typesafe.ai/v1/systemone' : 'Local Investment Policy'}
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                {t('btn_cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                {saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>{t('btn_save_config')}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};