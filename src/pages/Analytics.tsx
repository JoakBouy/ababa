import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { accounts, terminals, historicalConnections } from '../data/mockData';
import { TrendingUp, Users, DollarSign, Activity, PieChart as PieChartIcon } from 'lucide-react';

export default function Analytics() {
  // 1. Cost Analysis Data
  const costData = useMemo(() => {
    return accounts.map(acc => ({
      name: acc.name.split(' ')[1], // e.g., "Alpha"
      fullName: acc.name,
      cost: acc.monthlyCost,
      plan: acc.plan
    })).sort((a, b) => b.cost - a.cost);
  }, []);

  const totalMonthlySpend = costData.reduce((sum, item) => sum + item.cost, 0);

  // 2. Utilization Matrix Data (Data Usage vs Uptime)
  const utilizationData = useMemo(() => {
    return terminals.map(t => ({
      id: t.id,
      usage: t.dataUsageGB,
      uptime: t.uptimePercent,
      devices: t.connectedDevices,
      status: t.status
    }));
  }, []);

  // 3. Status Distribution Data
  const statusData = useMemo(() => {
    const online = terminals.filter(t => t.status === 'ONLINE').length;
    const degraded = terminals.filter(t => t.status === 'DEGRADED').length;
    const offline = terminals.filter(t => t.status === 'OFFLINE').length;
    return [
      { name: 'Online', value: online, color: '#00875A' },
      { name: 'Degraded', value: degraded, color: '#f59e0b' },
      { name: 'Offline', value: offline, color: '#ba1a1a' }
    ];
  }, []);

  // Custom tooltips
  const CostTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest p-3 border border-outline-variant/30 rounded-lg shadow-lg">
          <p className="font-bold text-sm text-on-surface mb-1">{data.fullName}</p>
          <p className="text-xs text-on-surface-variant mb-2">Plan: {data.plan}</p>
          <p className="text-sm font-bold text-primary">${data.cost} / month</p>
        </div>
      );
    }
    return null;
  };

  const UtilizationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest p-3 border border-outline-variant/30 rounded-lg shadow-lg">
          <p className="font-bold text-sm text-on-surface mb-1">{data.id}</p>
          <p className="text-xs text-on-surface-variant">Usage: <span className="font-bold text-on-surface">{data.usage.toFixed(1)} GB</span></p>
          <p className="text-xs text-on-surface-variant">Uptime: <span className="font-bold text-on-surface">{data.uptime}%</span></p>
          <p className="text-xs text-on-surface-variant">Devices: <span className="font-bold text-on-surface">{data.devices}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest mb-1">Financial & Usage Analytics</p>
        <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Impact Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Total Monthly Spend</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface">${totalMonthlySpend}</span>
            <span className="text-sm font-bold text-on-surface-variant">/ mo</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00875A]/10 rounded-lg text-[#00875A]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Avg Daily Users</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {historicalConnections[historicalConnections.length - 1].devices}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">clients</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Underutilized Kits</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {utilizationData.filter(d => d.usage < 10 && d.status === 'ONLINE').length}
            </span>
            <span className="text-sm font-bold text-on-surface-variant">terminals</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Avg Fleet Uptime</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface">
              {(utilizationData.reduce((sum, d) => sum + d.uptime, 0) / utilizationData.length).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Analysis Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Monthly Spend by Account</h2>
            <p className="text-sm text-on-surface-variant">Cost differentiation based on subscription plans</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005477" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#005477" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val}`} />
                <RechartsTooltip content={<CostTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="cost" fill="url(#colorCost)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Community Reach Chart (Area) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Community Reach (30 Days)</h2>
            <p className="text-sm text-on-surface-variant">Average number of devices connecting to the fleet daily</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalConnections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00875A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00875A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="devices" stroke="#00875A" strokeWidth={3} fillOpacity={1} fill="url(#colorDevices)" activeDot={{ r: 6, fill: '#00875A', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Status Distribution (Donut) */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Fleet Status Distribution</h2>
            <p className="text-sm text-on-surface-variant">Current operational state of all deployed kits</p>
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
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} Terminals`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilization Matrix */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Service Line Utilization Matrix</h2>
            <p className="text-sm text-on-surface-variant">Identify highly active communities vs. underutilized kits (Data Usage vs Uptime)</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="uptime" 
                  name="Uptime" 
                  unit="%" 
                  domain={[0, 100]}
                  label={{ value: 'Uptime (%)', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 12 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="usage" 
                  name="Data Usage" 
                  unit=" GB" 
                  label={{ value: 'Data Usage (GB)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <ZAxis type="number" dataKey="devices" range={[50, 400]} name="Connected Devices" />
                <RechartsTooltip content={<UtilizationTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Terminals" data={utilizationData} fill="#005477" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
