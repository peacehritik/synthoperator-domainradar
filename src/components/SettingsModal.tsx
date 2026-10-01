import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Check, 
  Zap, 
  Wifi, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [typesafeKey, setTypesafeKey] = useState(() => {
    return localStorage.getItem('typesafe_api_key') || '';
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

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typesafeKey.trim()) {
      localStorage.setItem('typesafe_api_key', typesafeKey.trim());
    } else {
      localStorage.removeItem('typesafe_api_key');
    }

    window.dispatchEvent(new Event('typesafe_key_updated'));
    setSaved(true);
    checkStatus(typesafeKey.trim());
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
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
                TypeSafe AI (JEV System One) Configuration
              </h3>
              <p className="text-[11px] text-slate-500">
                Decision engine authentication and upstream endpoint routing
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

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* TypeSafe AI Configuration Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">TypeSafe AI JEV Engine</span>
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
                TypeSafe API Key (TYPESAFE_API_KEY)
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
                Saved in localStorage and relayed via <code className="font-mono bg-slate-200/70 px-1 rounded">x-typesafe-key</code> header to Express.
              </span>
            </div>

            {/* Connection Status Box */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {connectionStatus.status === 'connected' ? (
                  <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected to api.typesafe.ai</span>
                  </span>
                ) : connectionStatus.status === 'invalid_key' ? (
                  <span className="flex items-center space-x-1.5 font-semibold text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>API Key Invalid (Local Fallback Active)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Local Contract Simulation Ready</span>
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
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-mono">
              POST https://api.typesafe.ai/v1/systemone
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
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
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
