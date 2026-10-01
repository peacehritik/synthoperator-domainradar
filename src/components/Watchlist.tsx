import React, { useState } from 'react';
import { 
  FolderKanban, 
  Trash2, 
  ExternalLink, 
  AlertOctagon, 
  DollarSign, 
  Download, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { DecisionMode, WatchlistDomain } from '../types';

interface WatchlistProps {
  watchlist: WatchlistDomain[];
  onRemoveDomain: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSelectDomainForSingleAudit: (domain: string, mode: DecisionMode) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  watchlist,
  onRemoveDomain,
  onUpdateNotes,
  onSelectDomainForSingleAudit,
}) => {
  const [search, setSearch] = useState('');

  const filtered = watchlist.filter((w) =>
    w.domain.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = watchlist.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
  const totalCarry = watchlist.reduce((sum, item) => sum + (item.annualCarryingCost || 0), 0);
  const totalRevenue = watchlist.reduce((sum, item) => sum + (item.annualParkingRevenue || 0), 0);
  const netCashflow = totalRevenue - totalCarry;

  const dropCandidates = watchlist.filter(
    (w) => w.verdict === 'Drop' || w.verdict === 'Pass'
  );

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `domainradar_portfolio_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Financial Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Portfolio Carrying & Asset Watchlist
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active holding ledger for tracking renewal obligations, parking cash flow, and exit valuations.
            </p>
          </div>

          {watchlist.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold border border-slate-300 transition-colors self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Ledger</span>
            </button>
          )}
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Total Portfolio Value</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
              ${totalValue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {watchlist.length} Monitored Domains
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Annual Carrying Obligation</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
              ${totalCarry.toLocaleString()}/yr
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Registry renewals total
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Net Portfolio Yield</span>
            <span
              className={`text-2xl font-bold font-mono mt-1 block ${
                netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {netCashflow >= 0 ? '+' : ''}${netCashflow.toLocaleString()}/yr
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Parking revenue minus carry
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block">Drop / Pass Warnings</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-rose-700">
                {dropCandidates.length}
              </span>
              <span className="text-xs text-slate-500">assets</span>
            </div>
            <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
              Potential carry waste
            </span>
          </div>
        </div>
      </div>

      {/* Main Watchlist Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search watchlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filtered.length} of {watchlist.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <FolderKanban className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700">No domains in watchlist</p>
            <p className="text-xs text-slate-500 mt-1">
              Audit domains in Mode A or Mode B and click "Track in Portfolio" to monitor them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3 text-right">Est. Value</th>
                  <th className="px-4 py-3 text-right">Carrying Cost</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {item.domain}
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-[11px] font-semibold text-slate-600">
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          item.verdict === 'Buy' || item.verdict === 'Renew'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.verdict === 'Moderate' || item.verdict === 'Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ${item.estimatedValue?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      ${item.annualCarryingCost}/yr
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={item.notes || ''}
                        onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded bg-transparent focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onSelectDomainForSingleAudit(item.domain, item.mode)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                        title="Open in Audit Engine"
                      >
                        Re-Audit
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveDomain(item.id)}
                        className="text-xs text-rose-600 hover:text-rose-800"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
