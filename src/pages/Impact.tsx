import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Loader2, MapPin, Server, Wifi } from 'lucide-react';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { accountTypeLabel, siteTypeLabel } from '../utils/platform';

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#00875A',
  DEGRADED: '#f59e0b',
  OFFLINE: '#ba1a1a',
};

export default function Impact() {
  const { accounts, terminals, sites, isLoading, error } = useFleetSnapshot();

  const mapCenter: [number, number] = terminals[0]?.coords ?? [4.0, 31.5];
  const zoomLevel = terminals.length > 0 ? 6 : 5;

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const attribution = mapboxToken
    ? 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const accountCoverage = accounts.map((account) => ({
    email: account.email,
    terminals: terminals.filter((terminal) => terminal.account_email === account.email).length,
  }));

  const telemetryCoverage = [
    { name: 'Telemetry live', value: terminals.filter((terminal) => terminal.download_mbps != null).length, color: '#00875A' },
    { name: 'WiFi live', value: terminals.filter((terminal) => terminal.connected_devices != null).length, color: '#005477' },
    {
      name: 'Unavailable',
      value: terminals.filter((terminal) => terminal.download_mbps == null && terminal.connected_devices == null).length,
      color: '#ba1a1a',
    },
  ].filter((entry) => entry.value > 0);

  const throughputByTerminal = terminals
    .filter((terminal) => terminal.download_mbps != null)
    .map((terminal) => ({
      id: terminal.id.slice(0, 10),
      throughput: terminal.download_mbps ?? 0,
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest mb-1">Field Coverage & Impact</p>
        <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Network Footprint</h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Live connectivity coverage, community usage signals, ranger communications, and base-camp telemetry from API data.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 flex items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading live network footprint...
        </div>
      )}

      {!isLoading && terminals.length === 0 && !error && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <h2 className="text-lg font-headline font-bold text-on-surface">No live network data yet</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Link a Starlink account to populate the map and coverage analytics.
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
          <p className="text-xs text-on-surface-variant mt-2">{sites.length} deployment sites</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00875A]/10 rounded-lg text-[#00875A]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Active Nodes</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">
            {terminals.filter((terminal) => terminal.status !== 'OFFLINE').length}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Telemetry Live</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">
            {terminals.filter((terminal) => terminal.download_mbps != null).length}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#005477]/10 rounded-lg text-[#005477]">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider">Routers Live</h3>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface">
            {terminals.filter((terminal) => terminal.connected_devices != null).length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden h-[560px]">
          <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={false} className="w-full h-full z-0 bg-[#e5e7eb]">
            <TileLayer attribution={attribution} url={tileUrl} />
            {terminals.map((terminal) => (
              <CircleMarker
                key={terminal.id}
                center={terminal.coords}
                radius={10}
                pathOptions={{
                  color: STATUS_COLORS[terminal.status] ?? '#005477',
                  fillColor: STATUS_COLORS[terminal.status] ?? '#005477',
                  fillOpacity: 0.8,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="p-1 font-body">
                    <div className="font-bold text-sm mb-1">{terminal.id}</div>
                    <div className="text-xs text-on-surface-variant mb-1">{terminal.loc}</div>
                    <div className="text-[10px] text-on-surface-variant">{siteTypeLabel(terminal.site_type)} · {terminal.account_email}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Live Data Coverage</h2>
            <p className="text-sm text-on-surface-variant">How many terminals currently expose live Starlink data</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={telemetryCoverage} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} stroke="none">
                  {telemetryCoverage.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`${value} terminals`, 'Count']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Deployment Purpose</h2>
            <p className="text-sm text-on-surface-variant">Current site split by field operating model</p>
          </div>
          <div className="space-y-3">
            {sites.map((site) => (
              <div key={site.id} className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-3 last:border-b-0">
                <div>
                  <p className="text-sm font-bold text-on-surface">{site.name}</p>
                  <p className="text-xs text-on-surface-variant">{siteTypeLabel(site.site_type)} · {accountTypeLabel(site.account_type)}</p>
                </div>
                <span className="text-xs font-bold text-primary">{site.metrics.connected_devices ?? 0} devices</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Nodes by Account</h2>
            <p className="text-sm text-on-surface-variant">Live terminal counts grouped by linked account</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountCoverage} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="email" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} angle={-15} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="terminals" fill="#005477" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-headline font-bold text-on-surface">Live Throughput by Terminal</h2>
            <p className="text-sm text-on-surface-variant">Only terminals with active Starlink telemetry appear here</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputByTerminal} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip formatter={(value: number) => [`${value} Mbps`, 'Download']} />
                <Bar dataKey="throughput" fill="#00875A" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
