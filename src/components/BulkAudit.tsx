import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Filter, 
  Search,
  BookmarkPlus,
  Code2,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RotateCcw
} from 'lucide-react';
import { siteConfig } from '../config/site';
import { JevInspectorModal } from './JevInspectorModal';
import { useLanguage, LtrIsolate } from '../context/LanguageContext';
import type { BulkItemResult, DecisionMode, WatchlistDomain } from '../types';

interface BulkAuditProps {
  onAddToWatchlist: (item: Omit<WatchlistDomain, 'id' | 'addedAt'>) => void;
  isInWatchlist: (domain: string) => boolean;
  onSelectDomainForSingleAudit: (domain: string, mode: DecisionMode) => void;
}

const DEFAULT_PORTFOLIO_SAMPLE = `paystream.com
cloudagent.ai
vaultpay.io
casaship.ma
globaltrade.net
cheapdiscountdeals123.xyz
smartcard.co
fastorder.org
applediscounthub.tech
quickfixer.dev`;

export const BulkAudit: React.FC<BulkAuditProps> = ({
  onAddToWatchlist,
  isInWatchlist,
  onSelectDomainForSingleAudit,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<DecisionMode>('buy');
  const [loading, setLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [results, setResults] = useState<BulkItemResult[]>([]);
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectingItem, setInspectingItem] = useState<BulkItemResult | null>(null);

  const handleRunBulk = async () => {
    const domainLines = inputText
      .split(/[\r\n,]+/)
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (domainLines.length === 0) return;

    setLoading(true);
    try {
      const typesafeKey = localStorage.getItem('typesafe_api_key') || '';
      const res = await fetch('/api/domains/bulk-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typesafeKey ? { 'x-typesafe-key': typesafeKey } : {}),
        },
        body: JSON.stringify({
          domains: domainLines,
          mode,
          force_refresh: forceRefresh,
        }),
      });

      if (!res.ok) throw new Error('Bulk audit failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'Domain',
      'Mode',
      'Verdict',
      'Score',
      'Estimated Value ($)',
      'Annual Carrying Cost ($)',
      'Extension Tier',
      'Length',
      'Syllables',
      'Brandability Score',
    ];

    const rows = results.map((r) => [
      r.domain,
      r.mode,
      r.verdict,
      r.score,
      r.estimatedValue,
      r.annualCarryingCost,
      r.tldTier,
      r.length,
      r.syllables,
      r.brandabilityScore,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${siteConfig.name.toLowerCase()}_audit_${mode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter((r) => {
    if (filterVerdict !== 'all' && r.verdict.toLowerCase() !== filterVerdict.toLowerCase()) {
      return false;
    }
    if (searchTerm && !r.domain.includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculate summary portfolio metrics
  const totalValuation = results.reduce((acc, r) => acc + r.estimatedValue, 0);
  const totalCarryingCost = results.reduce((acc, r) => acc + r.annualCarryingCost, 0);
  const buyOrRenewCount = results.filter(
    (r) => r.verdict === 'Buy' || r.verdict === 'Renew'
  ).length;
  const passOrDropCount = results.filter(
    (r) => r.verdict === 'Pass' || r.verdict === 'Drop'
  ).length;

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('bulk_title')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('bulk_subtitle')}
            </p>
          </div>

          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setMode('buy')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === 'buy'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('btn_mode_a')}
            </button>
            <button
              onClick={() => setMode('renew')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === 'renew'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('btn_mode_b')}
            </button>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 block">
                {t('bulk_domain_list_label')}
              </label>
              <button
                type="button"
                onClick={() => setInputText(DEFAULT_PORTFOLIO_SAMPLE)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                {t('bulk_load_sample')}
              </button>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              placeholder="example.com&#10;brand.ai&#10;startup.io"
            />
          </div>

          <div className="flex flex-col justify-between space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block mb-1">
                {t('bulk_upload_title')}
              </span>
              <p className="text-[11px] text-slate-500 mb-3">
                {t('bulk_upload_desc')}
              </p>
              <label className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md cursor-pointer text-xs font-medium transition-colors shadow-xs">
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>{t('bulk_btn_select')}</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('bulk_bypass_cache')}</span>
              </label>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleRunBulk}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs sm:text-sm font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('bulk_processing')}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{t('bulk_btn_run')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Empty State before batch execution */}
      {results.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {t('bulk_ready_title')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('bulk_ready_desc')}
          </p>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs text-slate-500 block">Total Audited</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {results.length} Domains
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">
                {mode === 'buy' ? 'High-Conviction Buys' : 'Definite Renewals'}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {buyOrRenewCount} ({((buyOrRenewCount / results.length) * 100).toFixed(0)}%)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">
                {mode === 'buy' ? 'Pass Candidates' : 'Drop Candidates'}
              </span>
              <span className="text-xl font-bold font-mono text-rose-700">
                {passOrDropCount}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Total Carrying Drag</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                ${totalCarryingCost.toLocaleString()}/yr
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Filters & Export */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter domains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-hidden"
                  />
                </div>

                <select
                  value={filterVerdict}
                  onChange={(e) => setFilterVerdict(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700"
                >
                  <option value="all">All Verdicts</option>
                  {mode === 'buy' ? (
                    <>
                      <option value="buy">Buy Only</option>
                      <option value="moderate">Moderate Only</option>
                      <option value="pass">Pass Only</option>
                    </>
                  ) : (
                    <>
                      <option value="renew">Renew Only</option>
                      <option value="review">Review Only</option>
                      <option value="drop">Drop Only</option>
                    </>
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{t('th_domain')}</th>
                    <th className="px-4 py-3">{t('th_verdict')}</th>
                    <th className="px-4 py-3 text-right">{t('th_score')}</th>
                    <th className="px-4 py-3 text-right">{t('th_est_value')}</th>
                    <th className="px-4 py-3 text-right">{t('th_carrying_cost')}</th>
                    <th className="px-4 py-3">{t('th_tld_tier')}</th>
                    <th className="px-4 py-3">{t('th_metrics')}</th>
                    <th className="px-4 py-3 text-center">{t('th_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredResults.map((item) => {
                    const saved = isInWatchlist(item.domain);
                    return (
                      <tr key={item.domain} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <span>{item.domain}</span>
                            {item.trademarkFlagged && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1 py-0.2 rounded border border-rose-300">
                                TM Risk
                              </span>
                            )}
                          </div>
                          {item.strategy_profile && (
                            <div className="mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium inline-block ${
                                item.strategy_profile.strategy_type === 'brandable' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                item.strategy_profile.strategy_type === 'exact_match_keyword' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                item.strategy_profile.strategy_type === 'geo_service' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                item.strategy_profile.strategy_type === 'short_acronym_numeric' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {item.strategy_profile.label}
                              </span>
                            </div>
                          )}
                          {item.version_trace?.state_hash && (
                            <div className="mt-1 flex items-center space-x-1.5 text-[10px] font-mono">
                              {item.version_trace.cache_hit ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200" title="State hash cache hit (< 10ms)">
                                  <Zap className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                                  <span>Cached ({item.version_trace.latency_ms}ms)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Live JEV evaluation">
                                  <Activity className="w-2.5 h-2.5 mr-0.5 text-blue-600" />
                                  <span>Live ({item.version_trace.latency_ms}ms)</span>
                                </span>
                              )}
                              <span className="text-slate-400 font-mono" title={`State Hash: ${item.version_trace.state_hash}`}>
                                #{item.version_trace.state_hash.slice(0, 6)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                item.verdict === 'Buy' || item.verdict === 'Renew'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.verdict === 'Review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.statusLabel || item.verdict}
                            </span>
                            {item.risk_evaluation?.overall_status === 'hard_blocked' ? (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded inline-flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                                <span>{item.risk_evaluation.blocked_by_gate || 'Hard Blocked'}</span>
                              </span>
                            ) : item.risk_evaluation?.overall_status === 'diligence_warning' ? (
                              <span className="text-[9px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded inline-flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                <span>Diligence Warning</span>
                              </span>
                            ) : item.evidence?.hardGateTriggered ? (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded">
                                {item.evidence.hardGateTriggered}
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded inline-flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Gates Cleared</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          <div className="text-slate-900 font-bold">{item.compositeScore ?? (item.score * 100).toFixed(0)}/100</div>
                          <div className="text-[10px] text-slate-400">
                            Cov: {item.evidence?.dataQualityPct ?? 85}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ${item.estimatedValue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          ${item.annualCarryingCost}/yr
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-xs font-mono">
                            {item.tldTier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          <div>{item.length} chars, {item.syllables} syll</div>
                          {item.brandabilityLevel && (
                            <div className="text-[10px] text-slate-400">JEV: {item.brandabilityLevel}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setInspectingItem(item)}
                            className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 border border-slate-200"
                            title="Inspect raw payload and response sent to TypeSafe JEV"
                          >
                            <Code2 className="w-3 h-3 text-slate-500" />
                            <span>JEV</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectDomainForSingleAudit(item.domain, mode)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            disabled={saved}
                            onClick={() =>
                              onAddToWatchlist({
                                domain: item.domain,
                                mode: item.mode,
                                verdict: item.verdict,
                                score: item.score,
                                estimatedValue: item.estimatedValue,
                                annualCarryingCost: item.annualCarryingCost,
                              })
                            }
                            className={`text-xs ${
                              saved
                                ? 'text-slate-400 cursor-default'
                                : 'text-slate-700 hover:text-slate-900 font-medium'
                            }`}
                          >
                            {saved ? 'Tracked' : '+Track'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* JEV System One Raw Telemetry Inspector Modal */}
      {inspectingItem && (
        <JevInspectorModal
          isOpen={!!inspectingItem}
          onClose={() => setInspectingItem(null)}
          domain={inspectingItem.domain}
          mode={inspectingItem.mode}
          latencyMs={inspectingItem.latencyMs}
          rawJevPayload={inspectingItem.rawJevPayload}
          rawJevResponse={inspectingItem.rawJevResponse}
          versionTrace={inspectingItem.version_trace}
        />
      )}
    </div>
  );
};
