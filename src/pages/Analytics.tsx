import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { Activity, Loader2, Server, TrendingUp, Users, Wifi } from 'lucide-react';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#00875A',
  DEGRADED: '#f59e0b',
  OFFLINE: '#ba1a1a',
};

export default function Analytics() {
  const { accounts, terminals, fleetStats, isLoading, error } = useFleetSnapshot();

  const terminalsByAccount = accounts.map((account) => {
    const accountTerminals = terminals.filter((terminal) => terminal.account_email === account.email);
    return {
      email: account.email,
      terminals: accountTerminals.length,
      throughput: Number(accountTerminals.reduce((sum, terminal) => sum + (terminal.download_mbps ?? 0), 0).toFixed(1)),
      online: accountTerminals.filter((terminal) => terminal.status === 'ONLINE').length,
    };
  });

  const statusData = [
    { name: 'Online', value: terminals.filter((terminal) => terminal.status === 'ONLINE').length, color: STATUS_COLORS.ONLINE },
    { name: 'Degraded', value: terminals.filter((terminal) => terminal.status === 'DEGRADED').length, color: STATUS_COLORS.DEGRADED },
    { name: 'Offline', value: terminals.filter((terminal) => terminal.status === 'OFFLINE').length, color: STATUS_COLORS.OFFLINE },
  ].filter((entry) => entry.value > 0);

  const utilizationData = terminals.map((terminal) => ({
    id: terminal.id,
    uptime: terminal.uptime_percent,
    usage: terminal.download_mbps ?? 0,
    devices: terminal.connected_devices ?? 0,
    status: terminal.status,
  }));

  const totalDevices = terminals.reduce((sum, terminal) => sum + (terminal.connected_devices ?? 0), 0);
  const totalThroughput = terminals.reduce((sum, terminal) => sum + (terminal.download_mbps ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest mb-1">Live Fleet Analytics</p>
        <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Analytics Dashboard</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 flex items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading analytics...
        </div>
      )}

      {!isLoading && terminals.length === 0 && !error && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="text-lg font-headline font-bold text-on-surface">No live analytics yet</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Remote analytics populate after the backend loads at least one Starlink account with valid cookies.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Linked Accounts</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">{accounts.length}</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00875A]/10 rounded-lg text-[#00875A]">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Connected Devices</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">{totalDevices}</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Live Throughput</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">{totalThroughput.toFixed(1)} Mbps</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Avg Fleet Uptime</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">
            {fleetStats ? `${fleetStats.avg_uptime_percent.toFixed(1)}%` : '0.0%'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Terminals by Account</h2>
            <p className="text-sm text-on-surface-variant">Live terminal counts grouped by linked Starlink account</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={terminalsByAccount} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="email"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="terminals" fill="#005477" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Fleet Status Distribution</h2>
            <p className="text-sm text-on-surface-variant">Current online, degraded, and offline totals from the backend</p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`${value} terminals`, 'Count']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Utilization Matrix</h2>
            <p className="text-sm text-on-surface-variant">Live download throughput vs uptime sized by connected devices</p>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="uptime"
                  name="Uptime"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Uptime (%)', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="usage"
                  name="Data Usage"
                  unit=" Mbps"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Download (Mbps)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                />
                <ZAxis type="number" dataKey="devices" range={[60, 420]} name="Connected Devices" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Terminals" data={utilizationData} fill="#005477" fillOpacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Throughput by Account</h2>
            <p className="text-sm text-on-surface-variant">Current download throughput grouped by linked account</p>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={terminalsByAccount} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="email"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip />
                <Bar dataKey="throughput" fill="#00875A" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
