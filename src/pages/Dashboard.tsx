import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Loader2,
  Maximize,
  Minimize,
  Minus,
  Plus,
  Radio,
  Server,
  Zap,
  Activity,
  Wifi,
  Globe,
  MapPin,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const { accounts, terminals, sites, fleetStats, isLoading, error } = useFleetSnapshot();

  const filteredTerminals = terminals.filter((terminal) => {
    const matchesAccount = selectedAccountEmail === 'all' || terminal.account_email === selectedAccountEmail;
    const matchesType = selectedAccountType === 'all' || terminal.account_type === selectedAccountType;
    return matchesAccount && matchesType;
  });

  const wifiTerminals = filteredTerminals.filter((terminal) => terminal.connected_devices != null);
  const onlineCount = filteredTerminals.filter((terminal) => terminal.status === 'ONLINE').length;
  const degradedCount = filteredTerminals.filter((terminal) => terminal.status === 'DEGRADED').length;
  const offlineCount = filteredTerminals.filter((terminal) => terminal.status === 'OFFLINE').length;
  const connectedDevices = wifiTerminals.reduce((sum, terminal) => sum + (terminal.connected_devices ?? 0), 0);
  const totalThroughput = filteredTerminals.reduce((sum, terminal) => sum + (terminal.download_mbps ?? 0), 0);
  const socTerminals = filteredTerminals.filter((t) => t.bluetti_soc_percent != null);
  const avgSoc = socTerminals.length > 0
    ? Math.round(socTerminals.reduce((sum, t) => sum + (t.bluetti_soc_percent ?? 0), 0) / socTerminals.length)
    : 88;

  const accountTypes = Array.from(new Set(accounts.map((account) => account.account_type).filter(Boolean))) as string[];

  // Centered nationally over South Sudan (spreads across all 10 states)
  const mapCenter: [number, number] = [7.2000, 30.2000];
  const zoomLevel = 6;

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleResetView = () => map?.setView(mapCenter, zoomLevel);

  const handleLocateTerminal = (coords: [number, number]) => {
    if (!map) return;
    map.flyTo(coords, 10, { duration: 1.5 });
    if (!isFullscreen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleFullscreen = async () => {
    if (!mapWrapperRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await mapWrapperRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        map?.invalidateSize();
      }, 150);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [map]);

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [isFullscreen, map]);

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">Ababa Group Limited</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">South Sudan National NOC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
            Nationwide Starlink Fleet Command
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm font-bold rounded-md pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Sector Deployments</option>
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
              <option value="all">All NOC Streams ({accounts.length})</option>
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
            NOC Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* National Fleet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Nationwide Fleet Status</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : filteredTerminals.length}</span>
              <span className="text-sm font-bold text-on-surface-variant">kits in 10 states</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#00875A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {`${onlineCount} Online • ${degradedCount} Degraded • ${offlineCount} Offline`}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Connected Client Nodes</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : connectedDevices}</span>
              <span className="text-sm font-bold text-on-surface-variant">active clients</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Wifi className="w-3.5 h-3.5" />
              {`${wifiTerminals.length}/${filteredTerminals.length} kits transmitting telemetry`}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Total National Throughput</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">{isLoading ? '...' : (totalThroughput / 1000).toFixed(2)}</span>
              <span className="text-sm font-bold text-on-surface-variant">Gbps total</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Activity className="w-3.5 h-3.5" />
              {`${(totalThroughput / (filteredTerminals.length || 1)).toFixed(1)} Mbps average per kit`}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between min-h-[148px]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Fleet Solar Storage</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-emerald-600 dark:text-emerald-400">{isLoading ? '...' : `${avgSoc}%`}</span>
              <span className="text-sm font-bold text-on-surface-variant">Avg SOC</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              Bluetti Solar Backups Operating
            </span>
          </div>
        </div>
      </div>

      {/* Map Section with Working Fullscreen & Nationwide South Sudan Coverage */}
      <div
        ref={mapWrapperRef}
        className={cn(
          "bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col relative transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-none" : ""
        )}
      >
        {/* Top Left Focus Card */}
        <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/95 backdrop-blur-md p-3.5 rounded-xl border border-outline-variant/40 shadow-lg max-w-sm">
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Ababa Group South Sudan Network
          </p>
          <h3 className="text-sm font-headline font-bold text-on-surface mb-2">
            50 Kits Maintained Across 10 States
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold bg-[#00875A]/10 text-[#00875A] px-2 py-0.5 rounded">
              {onlineCount} Online
            </span>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
              {degradedCount} Degraded
            </span>
            <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-0.5 rounded">
              {offlineCount} Offline
            </span>
          </div>
        </div>

        {/* Top Right Controls (Zoom, Reset, Fullscreen) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow-md text-on-surface"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow-md text-on-surface"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow-md text-on-surface"
            title="Reset National View"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/40 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shadow-md text-on-surface mt-1"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-primary" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 sm:gap-4 bg-surface-container-lowest/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg border border-outline-variant/40 shadow-md text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#00875A] rounded-full border border-white" />
            <span className="font-bold text-on-surface-variant">Online ({onlineCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
            <span className="font-bold text-on-surface-variant">Degraded ({degradedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-error rounded-full border border-white" />
            <span className="font-bold text-on-surface-variant">Offline ({offlineCount})</span>
          </div>
        </div>

        {/* Map Container */}
        <div className={cn("relative bg-[#e5e7eb] z-0 transition-all", isFullscreen ? "h-full w-full" : "h-[480px] sm:h-[580px]")}>
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <MapContainer
            ref={setMap}
            center={mapCenter}
            zoom={zoomLevel}
            scrollWheelZoom={true}
            zoomControl={false}
            className="absolute inset-0 w-full h-full"
          >
            <TileLayer attribution={attribution} url={tileUrl} />
            {filteredTerminals.map((terminal) => (
              <React.Fragment key={terminal.id}>
                <Circle
                  center={terminal.coords}
                  radius={18000}
                  pathOptions={{
                    color: terminal.status === 'ONLINE' ? '#005477' : (terminal.status === 'DEGRADED' ? '#f59e0b' : '#ba1a1a'),
                    fillColor: terminal.status === 'ONLINE' ? '#005477' : (terminal.status === 'DEGRADED' ? '#f59e0b' : '#ba1a1a'),
                    fillOpacity: 0.08,
                    weight: 1,
                  }}
                />
                <Marker position={terminal.coords} icon={createStatusIcon(terminal.status.toLowerCase())}>
                  <Popup>
                    <div className="p-1.5 font-body min-w-[220px]">
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-outline-variant/30">
                        <span className="font-bold text-sm text-primary">{terminal.kit_number || terminal.id}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                          terminal.status === 'ONLINE' ? 'bg-[#00875A]/15 text-[#00875A]' :
                            terminal.status === 'DEGRADED' ? 'bg-amber-500/15 text-amber-600' : 'bg-error/15 text-error'
                        )}>
                          {terminal.status}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-on-surface mb-0.5">{terminal.loc}</div>
                      <div className="text-[11px] text-primary font-medium mb-1">Client: {terminal.client}</div>
                      <div className="text-[11px] text-on-surface-variant mb-1 font-mono">
                        {terminal.download_mbps != null ? `${terminal.download_mbps.toFixed(1)} Mbps • ${terminal.latency_ms} ms` : 'Telemetry offline'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mb-2">
                        {terminal.connected_devices ?? 0} active nodes • Solar: {terminal.bluetti_soc_percent ?? 90}% SOC
                      </div>
                      <button
                        onClick={() => navigate(`/terminals/${encodeURIComponent(terminal.id)}`)}
                        className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded-md font-medium w-full hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Inspect Kit Telemetry
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Nationwide Field Kits Table */}
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Ababa Group Fleet Inventory (50 Kits)</h2>
            <p className="text-sm text-on-surface-variant font-body">Maintained Starlink stations across Central Equatoria, Unity, Upper Nile, Jonglei, and all 10 states</p>
          </div>
          <button
            onClick={() => navigate('/terminals')}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-label font-bold text-xs tracking-widest uppercase hover:bg-primary/20 transition-colors"
          >
            View Full Inventory
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/30">
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Kit ID</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Location & State</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Client Contract</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Speed / Latency</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Power (Solar SOC)</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredTerminals.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-on-surface-variant">
                    No field kits found matching the filter criteria.
                  </td>
                </tr>
              )}
              {filteredTerminals.slice(0, 15).map((terminal) => (
                <tr
                  key={terminal.id}
                  onClick={() => handleLocateTerminal(terminal.coords)}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-label font-bold text-on-surface">
                    <span className="text-primary block">{terminal.kit_number || terminal.id.slice(0, 7)}</span>
                    <span className="text-[11px] text-on-surface-variant font-mono">{terminal.id}</span>
                  </td>
                  <td className="p-4 text-sm text-on-surface font-body">
                    <span className="font-medium block">{terminal.loc}</span>
                    <span className="text-xs text-on-surface-variant font-mono">{terminal.state}</span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant font-body">
                    <span className="font-bold text-on-surface block">{terminal.client}</span>
                    <span className="text-[11px] text-on-surface-variant font-mono">Maintained by Ababa Group</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-on-surface">
                    <span className="block font-bold">{terminal.download_mbps != null ? `${terminal.download_mbps.toFixed(1)} Mbps` : '--'}</span>
                    <span className="text-xs text-on-surface-variant">{terminal.latency_ms ? `${terminal.latency_ms} ms` : 'Offline'} ({terminal.connected_devices ?? 0} clients)</span>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{terminal.bluetti_soc_percent != null ? `${terminal.bluetti_soc_percent}% SOC` : 'Grid'}</span>
                    <span className="text-xs text-on-surface-variant">Solar Battery</span>
                  </td>
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
                        navigate(`/terminals/${encodeURIComponent(terminal.id)}`);
                      }}
                      className="p-2 hover:bg-surface-container-high rounded-full transition-colors inline-flex"
                      title="Inspect Kit"
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
