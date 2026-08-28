import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Search,
  Server,
  Satellite,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { accountTypeLabel, siteTypeLabel } from '../utils/platform';

export default function Terminals() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountEmail, setSelectedAccountEmail] = useState('all');
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const { accounts, terminals, isLoading, error } = useFleetSnapshot();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTerminals = terminals.filter((terminal) => {
    const matchesAccount = selectedAccountEmail === 'all' || terminal.account_email === selectedAccountEmail;
    const matchesType = selectedAccountType === 'all' || terminal.account_type === selectedAccountType;
    const matchesQuery = normalizedQuery.length === 0 || [
      terminal.id,
      terminal.account_email,
      accountTypeLabel(terminal.account_type),
      siteTypeLabel(terminal.site_type),
      terminal.loc,
      terminal.status,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesAccount && matchesType && matchesQuery;
  });
  const accountTypes = Array.from(new Set(accounts.map((account) => account.account_type).filter(Boolean))) as string[];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">GPOC South Sudan</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">Contractor: Ababa Group Ltd</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Unity Oil Field Kit Inventory</h1>
          <p className="text-on-surface-variant font-body mt-1">Satellite & telemetry endpoints monitoring CPF, well pads, rig camps, and pipeline stations</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Server className="w-4 h-4" />
          Link Data Source
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-full border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full sm:w-96">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kit ID, well pad, location..."
            className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium bg-surface-container-lowest">
            <Filter className="w-4 h-4" />
            {filteredTerminals.length} shown
          </div>
          <select
            value={selectedAccountType}
            onChange={(e) => setSelectedAccountType(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium bg-surface-container-lowest hover:bg-surface-container transition-colors outline-none focus:border-primary"
          >
            <option value="all">All Site Types</option>
            {accountTypes.map((type) => (
              <option key={type} value={type}>{accountTypeLabel(type)}</option>
            ))}
          </select>
          <select
            value={selectedAccountEmail}
            onChange={(e) => setSelectedAccountEmail(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium bg-surface-container-lowest hover:bg-surface-container transition-colors outline-none focus:border-primary"
          >
            <option value="all">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.email}>{account.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Kit / Terminal ID</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Oilfield Site</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Contractor</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Speed / Devices</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Power (Solar SOC)</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-8">
                    <div className="flex items-center justify-center gap-3 text-on-surface-variant">Loading terminals...</div>
                  </td>
                </tr>
              )}

              {!isLoading && filteredTerminals.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-on-surface-variant">
                    No live terminals found. If you&apos;re in remote mode, link a Starlink account with valid cookie JSON in Settings.
                  </td>
                </tr>
              )}

              {filteredTerminals.map((terminal) => (
                <tr
                  key={terminal.id}
                  onClick={() => navigate(`/terminals/${encodeURIComponent(terminal.id)}`)}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                        <Satellite className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors block">{terminal.id}</span>
                        <span className="text-[11px] text-on-surface-variant font-mono">{siteTypeLabel(terminal.site_type)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-body text-sm text-on-surface">
                    <span className="font-medium block">{terminal.loc}</span>
                    <span className="text-xs text-on-surface-variant">GPOC Unity Oilfield</span>
                  </td>
                  <td className="p-4 font-body text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface block">{terminal.contractor ?? 'Ababa Group Ltd'}</span>
                    <span className="text-[11px] text-on-surface-variant font-mono">{terminal.account_email}</span>
                  </td>
                  <td className="p-4 font-body text-sm text-on-surface">
                    <span className="font-bold block">{terminal.download_mbps != null ? `${terminal.download_mbps.toFixed(1)} Mbps` : '--'}</span>
                    <span className="text-xs text-on-surface-variant">{terminal.connected_devices ?? 0} active devices ({terminal.latency_ms ?? '--'} ms)</span>
                  </td>
                  <td className="p-4 font-body text-sm">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{terminal.bluetti_soc_percent != null ? `${terminal.bluetti_soc_percent}% SOC` : 'Grid Connected'}</span>
                    <span className="text-xs text-on-surface-variant">Solar Battery Station</span>
                  </td>
                  <td className="p-4">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        terminal.status === 'ONLINE' ? 'bg-[#00875A]/10 text-[#00875A]' :
                          terminal.status === 'DEGRADED' ? 'bg-[#F2994A]/10 text-[#F2994A]' :
                            'bg-error/10 text-error',
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          terminal.status === 'ONLINE' ? 'bg-[#00875A]' :
                            terminal.status === 'DEGRADED' ? 'bg-[#F2994A]' :
                              'bg-error',
                        )}
                      />
                      {terminal.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
