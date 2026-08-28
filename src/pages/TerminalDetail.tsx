import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Wifi,
  Satellite,
  Settings,
  RefreshCw,
  RotateCcw,
  MapPin,
  CheckCircle2,
  Signal,
  AlertTriangle,
  ThermometerSnowflake,
  BatteryCharging,
  EyeOff,
  Lock,
  Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../utils/cn';
import { initLeafletIcons, createStatusIcon } from '../utils/leafletSetup';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { useToast } from '../contexts/ToastContext';
import { accountTypeLabel, siteTypeLabel } from '../utils/platform';
import {
  getDishConfig,
  getTerminal,
  getTerminalTelemetry,
  getWifiConfig,
  rebootTerminal,
  saveDishConfig,
  saveWifiConfig,
  type DishConfig,
  type Terminal,
  type TerminalTelemetry,
  type WifiConfig,
} from '../services/api';

initLeafletIcons();

function mergeTelemetry(
  previous: TerminalTelemetry | null,
  next: TerminalTelemetry,
): TerminalTelemetry {
  if (!previous) {
    return next;
  }

  return {
    ...previous,
    ...next,
    latency_ms: next.latency_ms ?? previous.latency_ms,
    download_mbps: next.download_mbps ?? previous.download_mbps,
    signal_percent: next.signal_percent ?? previous.signal_percent,
    uptime: next.uptime || previous.uptime,
    sw_version: next.sw_version || previous.sw_version,
    errors: next.errors ?? previous.errors,
    warnings: next.warnings ?? previous.warnings,
    location_type: next.location_type || previous.location_type,
    location_value: next.location_value || previous.location_value,
    lat: next.lat ?? previous.lat,
    lng: next.lng ?? previous.lng,
  };
}

function mergeTerminal(previous: Terminal | null, next: Terminal): Terminal {
  if (!previous) {
    return next;
  }

  return {
    ...previous,
    ...next,
    loc: next.loc || previous.loc,
    coords: next.coords ?? previous.coords,
    latency_ms: next.latency_ms ?? previous.latency_ms,
    download_mbps: next.download_mbps ?? previous.download_mbps,
    connected_devices: next.connected_devices ?? previous.connected_devices,
    account_type: next.account_type || previous.account_type,
    site_id: next.site_id ?? previous.site_id,
    site_type: next.site_type || previous.site_type,
    data_sources: next.data_sources.length > 0 ? next.data_sources : previous.data_sources,
    community_usage_sessions: next.community_usage_sessions ?? previous.community_usage_sessions,
    ranger_voice_sessions: next.ranger_voice_sessions ?? previous.ranger_voice_sessions,
    bluetti_soc_percent: next.bluetti_soc_percent ?? previous.bluetti_soc_percent,
  };
}

export default function TerminalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { terminals, lastUpdatedAt: fleetLastUpdatedAt } = useFleetSnapshot();
  const { toast } = useToast();

  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [telemetry, setTelemetry] = useState<TerminalTelemetry | null>(null);
  const [wifiConfig, setWifiConfig] = useState<(WifiConfig & { password: string }) | null>(null);
  const [dishConfig, setDishConfig] = useState<DishConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const inFlightRef = useRef(false);
  const decodedId = id ? decodeURIComponent(id) : '';
  const snapshotTerminal = terminals.find((terminalItem) => terminalItem.id === id || terminalItem.id === decodedId);

  useEffect(() => {
    if (!snapshotTerminal) {
      return;
    }

    setTerminal((previousTerminal) => mergeTerminal(previousTerminal, snapshotTerminal));
    setIsLoading(false);
    setError(null);
    if (fleetLastUpdatedAt) {
      setLastUpdatedAt((previousTimestamp) => previousTimestamp ?? fleetLastUpdatedAt);
    }
  }, [snapshotTerminal, fleetLastUpdatedAt]);

  useEffect(() => {
    let cancelled = false;

    async function loadTerminalBase(showLoader: boolean) {
      if (!id) {
        return;
      }
      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      setIsRefreshing(true);
      if (showLoader) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const terminalData = await getTerminal(id);
        if (cancelled) {
          return;
        }
        setTerminal((previousTerminal) => mergeTerminal(previousTerminal, terminalData));
        setLastUpdatedAt(Date.now());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load terminal.');
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
          setIsLoading(false);
        }
        inFlightRef.current = false;
      }
    }

    if (!snapshotTerminal) {
      void loadTerminalBase(true);
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id, snapshotTerminal]);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = mapboxToken
    ? 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const locationLat = telemetry?.lat ?? terminal?.coords[0] ?? 0;
  const locationLng = telemetry?.lng ?? terminal?.coords[1] ?? 0;
  const status = terminal?.status ?? 'ONLINE';
  const lastUpdatedLabel = lastUpdatedAt
    ? new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
      }).format(lastUpdatedAt)
    : null;

  const handleRefresh = async () => {
    if (!id || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const terminalData = await getTerminal(id);
      setTerminal((previousTerminal) => mergeTerminal(previousTerminal, terminalData));

      const [telemetryResult, wifiResult, dishResult] = await Promise.allSettled([
        getTerminalTelemetry(id),
        getWifiConfig(id),
        getDishConfig(id),
      ]);

      if (telemetryResult.status === 'fulfilled') {
        setTelemetry((previousTelemetry) => mergeTelemetry(previousTelemetry, telemetryResult.value));
      }
      if (wifiResult.status === 'fulfilled') {
        setWifiConfig((previousWifi) => ({
          ...(previousWifi ?? {}),
          ...wifiResult.value,
          password: previousWifi?.password ?? '',
        }));
      }
      if (dishResult.status === 'fulfilled') {
        setDishConfig((previousDish) => ({
          ...(previousDish ?? {}),
          ...dishResult.value,
        }));
      }

      setLastUpdatedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh terminal.');
    } finally {
      setIsRefreshing(false);
      inFlightRef.current = false;
    }
  };

  const handleReboot = async () => {
    if (!id) {
      return;
    }
    setIsRebooting(true);
    try {
      await rebootTerminal(id);
      toast('Dish reboot requested successfully.', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to reboot dish.', 'error');
    } finally {
      setIsRebooting(false);
    }
  };

  const handleSaveDishConfig = async () => {
    if (!id || !dishConfig) {
      return;
    }
    setIsSavingDish(true);
    try {
      await saveDishConfig(id, dishConfig);
      toast('Dish configuration saved.', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Dish configuration is not available from the live API.', 'error');
    } finally {
      setIsSavingDish(false);
    }
  };

  const handleSaveWifiConfig = async () => {
    if (!id || !wifiConfig) {
      return;
    }
    setIsSavingWifi(true);
    try {
      const payload: Record<string, unknown> = {
        ssid: wifiConfig.ssid,
        hide_ssid: wifiConfig.hide_ssid,
        bypass_mode: wifiConfig.bypass_mode,
      };
      if (wifiConfig.password.trim()) {
        payload.password = wifiConfig.password.trim();
      }
      await saveWifiConfig(id, payload);
      setWifiConfig((prev) => prev ? { ...prev, password: '' } : prev);
      toast('WiFi configuration saved.', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to save WiFi configuration.', 'error');
    } finally {
      setIsSavingWifi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">{terminal?.id ?? id ?? 'Terminal'}</h1>
            {terminal && (
              <span className={cn(
                'flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full border',
                status === 'ONLINE'
                  ? 'text-tertiary-fixed-dim bg-tertiary-fixed/10 border-tertiary-fixed/20'
                  : status === 'DEGRADED'
                    ? 'text-amber-700 bg-amber-500/10 border-amber-500/20'
                    : 'text-error bg-error/10 border-error/20',
              )}>
                <CheckCircle2 className="w-4 h-4" />
                {status}
              </span>
            )}
          </div>
          <p className="text-on-surface-variant font-body mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {terminal?.loc ?? 'Loading live terminal location...'}
          </p>
        </div>
        <div className="md:ml-auto flex gap-3 w-full md:w-auto">
          <button
            onClick={() => void handleRefresh()}
            disabled={isRefreshing || !terminal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Live'}
          </button>
          <button
            onClick={handleReboot}
            disabled={isRebooting || !terminal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {isRebooting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {isRebooting ? 'Rebooting...' : 'Reboot Dish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-container/20 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {lastUpdatedLabel && (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
          Showing the last successful live data from {lastUpdatedLabel}. This page only refreshes when you use <span className="font-medium text-on-surface">Refresh Live</span>.
        </div>
      )}

      {!isLoading && terminal && !telemetry && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700">
          Live telemetry is not currently available for this terminal from Starlink, so this page is showing only the real account, status, and location data the API returned.
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 flex items-center justify-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading live terminal data...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Activity className="w-5 h-5" />
                <h3 className="font-label font-medium">Latency</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">
                  {telemetry?.latency_ms != null ? telemetry.latency_ms.toFixed(0) : '--'}
                </span>
                <span className="text-sm text-on-surface-variant font-body">ms</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Wifi className="w-5 h-5" />
                <h3 className="font-label font-medium">Download</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">
                  {telemetry?.download_mbps != null ? telemetry.download_mbps.toFixed(1) : terminal?.download_mbps != null ? terminal.download_mbps.toFixed(1) : '--'}
                </span>
                <span className="text-sm text-on-surface-variant font-body">Mbps</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Signal className="w-5 h-5" />
                <h3 className="font-label font-medium">Signal</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">{telemetry?.signal_percent ?? '--'}</span>
                <span className="text-sm text-on-surface-variant font-body">%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Telemetry & Diagnostics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Linked Account</span>
                  <span className="text-sm font-medium text-on-surface">{terminal?.account_email ?? '--'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Deployment Type</span>
                  <span className="text-sm font-medium text-on-surface">{terminal ? siteTypeLabel(terminal.site_type) : '--'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Account Purpose</span>
                  <span className="text-sm font-medium text-on-surface">{terminal ? accountTypeLabel(terminal.account_type) : '--'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Connection Mode</span>
                  <span className="text-sm font-medium text-tertiary-fixed-dim flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {telemetry?.location_type ?? 'Live API'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Software Version</span>
                  <span className="text-sm font-medium text-on-surface font-mono">{telemetry?.sw_version ?? 'Unavailable'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Uptime</span>
                  <span className="text-sm font-medium text-on-surface">{telemetry?.uptime ?? 'Unavailable'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Location</span>
                  <span className="text-sm font-medium text-on-surface">{terminal?.loc ?? 'Unavailable'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-on-surface-variant font-body">Coordinates</span>
                  <span className="text-sm font-medium text-on-surface font-mono">
                    {terminal ? `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}` : '--'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-error-container/20 border border-error/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-label font-bold text-error text-sm">Errors ({telemetry?.errors ?? '--'})</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {telemetry ? 'Live Starlink diagnostics.' : 'Live telemetry is not currently available for this terminal.'}
                    </p>
                  </div>
                </div>
                <div className="bg-secondary-container/20 border border-secondary/20 rounded-2xl p-4 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-label font-bold text-secondary text-sm">Warnings ({telemetry?.warnings ?? '--'})</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {telemetry ? 'Live Starlink diagnostics.' : 'Warnings will appear here when the live API exposes them.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                Dish Configuration
              </h2>
              <button
                onClick={handleSaveDishConfig}
                disabled={isSavingDish || !dishConfig}
                className="text-sm font-label font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isSavingDish && <Loader2 className="w-3 h-3 animate-spin" />}
                Save Config
              </button>
            </div>

            {!dishConfig ? (
              <p className="text-sm text-on-surface-variant">
                Dish configuration is not available from the current live Starlink cloud API for this account.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                    <ThermometerSnowflake className="w-4 h-4" /> Snow Melt Mode
                  </label>
                  <select
                    value={dishConfig.snow_melt_mode}
                    onChange={(e) => setDishConfig({ ...dishConfig, snow_melt_mode: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="auto">Automatic</option>
                    <option value="on">Always On</option>
                    <option value="off">Disabled</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4" /> Power Saving Mode
                  </label>
                  <div
                    onClick={() => setDishConfig({ ...dishConfig, power_saving: !dishConfig.power_saving })}
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface flex justify-between items-center cursor-pointer"
                  >
                    <span>Enable Power Saving</span>
                    <div className={cn('w-10 h-5 rounded-full relative transition-colors', dishConfig.power_saving ? 'bg-primary' : 'bg-outline-variant/50')}>
                      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', dishConfig.power_saving ? 'left-5' : 'left-1')} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h2>
            <div className="h-[250px] relative bg-[#e5e7eb] rounded-xl overflow-hidden z-0">
              <MapContainer
                center={[locationLat, locationLng]}
                zoom={12}
                scrollWheelZoom={false}
                zoomControl={true}
                className="absolute inset-0 w-full h-full"
              >
                <TileLayer attribution={attribution} url={tileUrl} />
                <Marker position={[locationLat, locationLng]} icon={createStatusIcon(status.toLowerCase())}>
                  <Popup>
                    <div className="p-1 font-body text-sm font-bold">{terminal?.loc ?? id ?? 'Terminal'}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Coordinates</span>
              <span className="font-mono font-medium">{terminal ? `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}` : '--'}</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                WiFi Configuration
              </h2>
              <button
                onClick={handleSaveWifiConfig}
                disabled={isSavingWifi || !wifiConfig}
                className="text-sm font-label font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isSavingWifi && <Loader2 className="w-3 h-3 animate-spin" />}
                Apply
              </button>
            </div>

            {!wifiConfig ? (
              <p className="text-sm text-on-surface-variant">
                Live WiFi configuration is not currently available for this terminal.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">SSID Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={wifiConfig.ssid}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 pl-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={wifiConfig.password}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 pl-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label font-medium text-on-surface text-sm flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-on-surface-variant" /> Hide SSID
                      </h4>
                      <p className="text-xs text-on-surface-variant font-body mt-0.5">Do not broadcast network name</p>
                    </div>
                    <div
                      onClick={() => setWifiConfig({ ...wifiConfig, hide_ssid: !wifiConfig.hide_ssid })}
                      className={cn('w-10 h-5 rounded-full relative transition-colors cursor-pointer', wifiConfig.hide_ssid ? 'bg-primary' : 'bg-outline-variant/50')}
                    >
                      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', wifiConfig.hide_ssid ? 'left-5' : 'left-1')} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label font-medium text-on-surface text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-on-surface-variant" /> Bypass Mode
                      </h4>
                      <p className="text-xs text-on-surface-variant font-body mt-0.5">Disable built-in router routing</p>
                    </div>
                    <div
                      onClick={() => setWifiConfig({ ...wifiConfig, bypass_mode: !wifiConfig.bypass_mode })}
                      className={cn('w-10 h-5 rounded-full relative transition-colors cursor-pointer', wifiConfig.bypass_mode ? 'bg-primary' : 'bg-outline-variant/50')}
                    >
                      <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform', wifiConfig.bypass_mode ? 'left-5' : 'left-1')} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                  <div className="bg-surface-container-low rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Connected Clients</p>
                      <p className="text-2xl font-headline font-bold text-on-surface mt-1">{wifiConfig.connected_clients}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                      <Wifi className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
