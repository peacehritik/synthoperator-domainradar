import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Clock, 
  Send, 
  Radio, 
  ExternalLink,
  Database,
  GitBranch,
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import type { AuditVersionTrace, DecisionMode } from '../types';

interface JevInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  latencyMs?: number;
  rawJevPayload?: Record<string, any>;
  rawJevResponse?: Record<string, any>;
  versionTrace?: AuditVersionTrace;
  mode?: DecisionMode;
}

export const JevInspectorModal: React.FC<JevInspectorModalProps> = ({
  isOpen,
  onClose,
  domain,
  latencyMs,
  rawJevPayload,
  rawJevResponse,
  versionTrace,
  mode,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'trace'>('request');
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

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

  const questionsObj = rawJevPayload?.questions || {};
  const questionKeys = Object.keys(questionsObj);
  const isModeB = mode === 'renew' || 
    'renewal_justification' in questionsObj || 
    versionTrace?.question_set_version?.includes('renewal') ||
    rawJevResponse?.mode === 'renew';

  const isolatedBadgeLabel = isModeB
    ? 'Mode B Isolated Payload (5 questions - Renewal only)'
    : 'Mode A Isolated Payload (6 questions - Acquisition only)';

  const requestJson = rawJevPayload 
    ? JSON.stringify(rawJevPayload, null, 2)
    : JSON.stringify({ note: 'No request payload recorded for this execution.' }, null, 2);

  const responseJson = rawJevResponse
    ? JSON.stringify(rawJevResponse, null, 2)
    : JSON.stringify({ note: 'No response telemetry recorded for this execution.' }, null, 2);

  const traceJson = versionTrace
    ? JSON.stringify(versionTrace, null, 2)
    : JSON.stringify({ note: 'No audit version trace attached.' }, null, 2);

  const activeJson = activeTab === 'request' ? requestJson : activeTab === 'response' ? responseJson : traceJson;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
      <div 
        className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jev-inspector-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-2xs">
              <Code2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 id="jev-inspector-title" className="font-bold text-slate-900 text-sm sm:text-base">
                  TypeSafe JEV System One: Raw Telemetry
                </h3>
                {typeof latencyMs === 'number' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{latencyMs}ms</span>
                  </span>
                )}
                {/* Validation Badge */}
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                  isModeB
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isolatedBadgeLabel}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target: {domain} &bull; Endpoint: POST https://api.typesafe.ai/v1/systemone
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation and Actions Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'request'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Sent (State)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('response')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'response'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Response Received (Answers)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trace')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'trace'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Audit Trace &amp; Hashes</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
            title="Copy current JSON view to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Monospace Code Body or Telemetry Panel */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-slate-50 space-y-4">
          {activeTab === 'trace' && versionTrace && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Engine Version */}
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-medium block">Engine Version</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center space-x-1">
                    <GitBranch className="w-3 h-3 text-slate-600" />
                    <span>v{versionTrace.engine_version}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{versionTrace.question_set_version}</span>
                </div>

                {/* Execution Source */}
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-medium block">Execution Source</span>
                  <div className="font-semibold text-slate-900 mt-0.5 flex items-center space-x-1">
                    {versionTrace.cache_hit ? (
                      <>
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Cached Trace</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700">Live Evaluation</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    Latency: {versionTrace.latency_ms}ms
                  </span>
                </div>

                {/* Cache TTL Remaining */}
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-medium block">Cache TTL Expiration</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {typeof versionTrace.cache_ttl_seconds_remaining === 'number'
                      ? `${Math.floor(versionTrace.cache_ttl_seconds_remaining / 3600)}h ${Math.floor((versionTrace.cache_ttl_seconds_remaining % 3600) / 60)}m`
                      : 'Active'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    {versionTrace.cache_expires_at ? new Date(versionTrace.cache_expires_at).toLocaleTimeString() : '2 hours window'}
                  </span>
                </div>

                {/* Model ID */}
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-medium block">Underlying Model</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {versionTrace.model}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">TypeSafe JEV</span>
                </div>
              </div>

              {/* SHA-256 State Hash Full String */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-md space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Deterministic SHA-256 State Hash</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (versionTrace.state_hash) {
                        await navigator.clipboard.writeText(versionTrace.state_hash);
                        setCopiedHash(true);
                        setTimeout(() => setCopiedHash(false), 2000);
                      }
                    }}
                    className="inline-flex items-center space-x-1 text-slate-300 hover:text-white"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 break-all select-all">
                  {versionTrace.state_hash}
                </div>
              </div>
            </div>
          )}

          <div className="relative rounded-lg border border-slate-800 bg-slate-900 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-[11px] font-mono text-slate-400">
              <span>
                {activeTab === 'request'
                  ? 'payload.json (application/json)'
                  : activeTab === 'response'
                  ? 'response.json (application/json)'
                  : 'version_trace.json (canonical state trace)'}
              </span>
              <span className="text-[10px] text-slate-400">Read-only JSON Inspector</span>
            </div>

            <pre className="p-4 text-slate-100 font-mono text-xs overflow-auto max-h-[50vh] leading-relaxed selection:bg-emerald-800 selection:text-white">
              <code>{activeJson}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Deterministic JEV contract: No natural language token hallucinations.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md shadow-2xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
