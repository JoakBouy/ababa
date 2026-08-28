import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Loader2,
  Maximize,
  Minus,
  Plus,
  Radio,
  Server,
  Users,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as LeafletMap } from 'leaflet';
import { cn } from '../utils/cn';
import { createStatusIcon, initLeafletIcons } from '../utils/leafletSetup';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { accountTypeLabel, siteTypeLabel } from '../utils/platform';

initLeafletIcons();

export default function Dashboard() {
  const navigate = useNavigate();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState('all');
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const { accounts, terminals, sites, fleetStats, isLoading, error } = useFleetSnapshot();

  const filteredTerminals = terminals.filter((terminal) => {
    const matchesAccount = selectedAccountEmail === 'all' || terminal.account_email === selectedAccountEmail;
    const matchesType = selectedAccountType === 'all' || terminal.account_type === selectedAccountType;
    return matchesAccount && matchesType;
  });
  const filteredSites = sites.filter((site) => {
    const matchesAccount = selectedAccountEmail === 'all' || site.account_email === selectedAccountEmail;
    const matchesType = selectedAccountType === 'all' || site.account_type === selectedAccountType;
    return matchesAccount && matchesType;
  });

  const wifiTerminals = filteredTerminals.filter((terminal) => terminal.connected_devices != null);
  const onlineCount = filteredTerminals.filter((terminal) => terminal.status === 'ONLINE').length;
  const connectedDevices = wifiTerminals.reduce((sum, terminal) => sum + (terminal.connected_devices ?? 0), 0);
  const attentionCount = filteredTerminals.filter((terminal) => terminal.status !== 'ONLINE').length;
  const communitySessions = filteredTerminals.reduce((sum, terminal) => sum + (terminal.community_usage_sessions ?? 0), 0);
  const rangerSessions = filteredTerminals.reduce((sum, terminal) => sum + (terminal.ranger_voice_sessions ?? 0), 0);
  const accountTypes = Array.from(new Set(accounts.map((account) => account.account_type).filter(Boolean))) as string[];

  const mapCenter: [number, number] = filteredTerminals[0]?.coords ?? [9.485, 29.835];
  const zoomLevel = filteredTerminals.length > 0 ? 11 : 10;

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleResetView = () => map?.setView(mapCenter, zoomLevel);

  const handleLocateTerminal = (coords: [number, number]) => {
    if (!map) {
      return;
    }
    map.flyTo(coords, 12, { duration: 1.5 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const attribution = mapboxToken
    ? 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const hasLiveFleet = accounts.length > 0 || terminals.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">GPOC South Sudan</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">Contracted by Ababa Group Ltd</span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Unity Oil Field Command Center</h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm font-bold rounded-md pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Site Types</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>{accountTypeLabel(type)}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedAccountEmail}
              onChange={(e) => setSelectedAccountEmail(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm font-bold rounded-md pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Accounts ({accounts.length})</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.email}>{account.email}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-6 py-3 rounded-md bg-on-surface text-surface font-label font-bold text-xs tracking-widest uppercase hover:bg-on-surface/90 transition-colors shadow-sm"
          >
            Link Data Source
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {!isLoading && !hasLiveFleet && !error && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">No live Starlink data loaded</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              In remote mode, the backend only shows real terminals after you link at least one Starlink account in Settings and save valid cookie JSON.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Active Sites</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : filteredSites.length}</span>
              <span className="text-sm font-bold text-on-surface-variant">sites</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#00875A]">
              <CheckCircle2 className="w-3 h-3" />
              {fleetStats ? `${onlineCount}/${filteredTerminals.length} endpoints online` : 'Platform status'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Connected Devices</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : connectedDevices}</span>
              <span className="text-sm font-bold text-on-surface-variant">clients</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Wifi className="w-3 h-3" />
              {wifiTerminals.length === 0 ? 'Awaiting live router data' : `${wifiTerminals.length}/${filteredTerminals.length} terminals reporting`}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Community Sessions</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : communitySessions}</span>
              <span className="text-sm font-bold text-on-surface-variant">visits</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Users className="w-3 h-3" />
              Landing page usage reasons
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between border-l-4 border-l-error min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider text-error mb-4">Ranger Radio</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-error">{isLoading ? '...' : rangerSessions}</span>
              <span className="text-sm font-bold text-on-surface-variant">sessions</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-error uppercase tracking-wider">
              <Radio className="w-3 h-3" />
              {attentionCount > 0 ? `${attentionCount} endpoint alerts` : 'All clear'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filteredSites.slice(0, 3).map((site) => (
          <div key={site.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">{siteTypeLabel(site.site_type)}</p>
                <h2 className="text-lg font-headline font-bold text-on-surface mt-1">{site.name}</h2>
              </div>
              <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2 py-1 rounded">
                {accountTypeLabel(site.account_type)}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant min-h-[60px]">{site.purpose}</p>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-outline-variant/20">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Devices</p>
                <p className="text-lg font-bold text-on-surface">{site.metrics.connected_devices ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Voice</p>
                <p className="text-lg font-bold text-on-surface">{site.metrics.ranger_voice_sessions ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Power</p>
                <p className="text-lg font-bold text-on-surface">{site.metrics.avg_bluetti_soc_percent ?? 0}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col relative">
        <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-lg border border-outline-variant/30 shadow-sm">
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1">Current Focus</p>
          <h3 className="text-sm font-headline font-bold text-on-surface mb-2">
            {filteredTerminals[0]?.loc ?? 'Awaiting remote fleet data'}
          </h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
              {accounts.length} Accounts
            </span>
            <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">
              {filteredSites.length} Sites
            </span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-on-surface" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm"
          >
            <Minus className="w-4 h-4 text-on-surface" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm mt-2"
          >
            <Maximize className="w-4 h-4 text-on-surface" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 bg-surface-container-lowest/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#005477] opacity-40 rounded-sm" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Coverage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#005477] rounded-full border-2 border-white" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Terminal</span>
          </div>
        </div>

        <div className="h-[400px] relative bg-[#e5e7eb] z-0">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <MapContainer
            ref={setMap}
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={false}
            zoomControl={false}
            className="absolute inset-0 w-full h-full"
          >
            <TileLayer attribution={attribution} url={tileUrl} />
            {filteredTerminals.map((terminal) => (
              <React.Fragment key={terminal.id}>
                <Circle
                  center={terminal.coords}
                  radius={15000}
                  pathOptions={{
                    color: terminal.status === 'ONLINE' ? '#005477' : (terminal.status === 'DEGRADED' ? '#f59e0b' : '#ba1a1a'),
                    fillColor: terminal.status === 'ONLINE' ? '#005477' : (terminal.status === 'DEGRADED' ? '#f59e0b' : '#ba1a1a'),
                    fillOpacity: 0.1,
                    weight: 1,
                  }}
                />
                <Marker position={terminal.coords} icon={createStatusIcon(terminal.status.toLowerCase())}>
                  <Popup>
                    <div className="p-1 font-body">
                      <div className="font-bold text-sm mb-1">{terminal.id}</div>
                      <div className="text-xs text-on-surface-variant mb-1">{terminal.loc}</div>
                      <div className="text-[10px] text-on-surface-variant mb-1">{terminal.account_email}</div>
                      <div className="text-[10px] text-on-surface-variant mb-3 flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> {terminal.connected_devices ?? '--'} devices connected
                      </div>
                      <button
                        onClick={() => navigate(`/terminals/${terminal.id}`)}
                        className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-md font-medium w-full hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Recent Terminals</h2>
            <p className="text-sm text-on-surface-variant font-body">Live status by account, purpose, and deployment site</p>
          </div>
          <button
            onClick={() => navigate('/terminals')}
            className="px-4 py-2 rounded-md bg-primary/10 text-primary font-label font-bold text-xs tracking-widest uppercase hover:bg-primary/20 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Terminal ID</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Account</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Site Type</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Download</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Latency</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredTerminals.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-on-surface-variant">
                    No terminals available yet. Link a Starlink account in Settings to load remote data.
                  </td>
                </tr>
              )}
              {filteredTerminals.slice(0, 10).map((terminal) => (
                <tr
                  key={terminal.id}
                  onClick={() => handleLocateTerminal(terminal.coords)}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-label font-bold text-on-surface">{terminal.id}</td>
                  <td className="p-4 text-sm text-on-surface-variant font-body">{terminal.account_email}</td>
                  <td className="p-4 text-sm text-on-surface-variant font-body">{siteTypeLabel(terminal.site_type)}</td>
                  <td className="p-4 text-sm text-on-surface-variant font-body">{terminal.loc}</td>
                  <td className="p-4 text-sm font-medium text-on-surface">{terminal.download_mbps != null ? `${terminal.download_mbps.toFixed(1)} Mbps` : '--'}</td>
                  <td className="p-4 text-sm font-medium text-on-surface">{terminal.latency_ms ? `${terminal.latency_ms} ms` : '--'}</td>
                  <td className="p-4">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        terminal.status === 'ONLINE' ? 'bg-[#00875A]/10 text-[#00875A]' :
                          terminal.status === 'DEGRADED' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-error/10 text-error',
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          terminal.status === 'ONLINE' ? 'bg-[#00875A]' :
                            terminal.status === 'DEGRADED' ? 'bg-amber-500' :
                              'bg-error',
                        )}
                      />
                      {terminal.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/terminals/${terminal.id}`);
                      }}
                      className="p-2 hover:bg-surface-container-high rounded-full transition-colors inline-flex"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4 text-on-surface-variant" />
                    </button>
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
