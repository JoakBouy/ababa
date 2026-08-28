import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  RotateCcw,
  Wifi,
  Power,
  Zap,
  Activity,
  Sliders,
  Shield,
  MapPin,
  Flame,
  Radio,
  Clock,
  ChevronRight,
  TrendingUp,
  Server,
  Play,
  Check,
  Compass,
  Database,
  Lock,
  Layers,
  Thermometer
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../utils/cn';
import { createStatusIcon, initLeafletIcons } from '../utils/leafletSetup';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { useToast } from '../contexts/ToastContext';
import { getTerminal, getTerminalTelemetry, type Terminal, type TerminalTelemetry } from '../services/api';

initLeafletIcons();

export default function TerminalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { terminals } = useFleetSnapshot();
  const { toast } = useToast();

  const decodedId = id ? decodeURIComponent(id) : '';
  const initialTerminal = terminals.find((t) => t.id === id || t.id === decodedId) || terminals[0];

  const [terminal, setTerminal] = useState<Terminal>(initialTerminal);
  const [telemetry, setTelemetry] = useState<TerminalTelemetry>({
    latency_ms: initialTerminal?.latency_ms ?? 62,
    download_mbps: initialTerminal?.download_mbps ?? 124.5,
    signal_percent: 94,
    uptime: `${initialTerminal?.uptime_percent ?? 99.4}%`,
    sw_version: 'Ababa-Starlink-Edge v3.2.0',
    errors: initialTerminal?.status === 'DEGRADED' ? 2 : 0,
    warnings: initialTerminal?.status === 'DEGRADED' ? 3 : 0,
    location_type: 'Unity Wellsite Station',
    location_value: initialTerminal?.loc ?? 'Unity Oil Field',
    lat: initialTerminal?.coords[0] ?? 9.485,
    lng: initialTerminal?.coords[1] ?? 29.835,
  });

  // Simulated live Starlink states
  const [dishState, setDishState] = useState<'online' | 'stowed' | 'rebooting' | 'aligning'>('online');
  const [rebootProgress, setRebootProgress] = useState(0);
  const [rebootStep, setRebootStep] = useState('');
  const [snowMeltMode, setSnowMeltMode] = useState<'auto' | 'on' | 'off'>('auto');
  const [powerSaving, setPowerSaving] = useState(false);
  const [dishTemp, setDishTemp] = useState(38);
  const [elevationAngle, setElevationAngle] = useState(34.2);
  const [azimuthAngle, setAzimuthAngle] = useState(182.4);

  // Live speed test simulator
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [testSpeedMbps, setTestSpeedMbps] = useState<number | null>(null);
  const [testUploadMbps, setTestUploadMbps] = useState<number | null>(null);
  const [testPingMs, setTestPingMs] = useState<number | null>(null);

  // Live SCADA Packet ticker
  const [scadaPackets, setScadaPackets] = useState<Array<{ id: string; time: string; param: string; val: string; status: 'ok' | 'warn' }>>([
    { id: '1', time: 'Just now', param: 'Wellhead Tubing Pressure', val: '1,420 PSI', status: 'ok' },
    { id: '2', time: '1s ago', param: 'Casing Annulus Pressure', val: '840 PSI', status: 'ok' },
    { id: '3', time: '3s ago', param: 'Crude Production Flow Rate', val: '3,450 BPD', status: 'ok' },
    { id: '4', time: '5s ago', param: 'Bluetti Solar Charge Input', val: '840 Watts', status: 'ok' },
    { id: '5', time: '8s ago', param: 'Starlink Uplink SNR', val: '12.8 dB', status: 'ok' },
  ]);

  // WiFi Clients simulator
  const [clients, setClients] = useState([
    { id: 'c1', name: 'Wellhead SCADA RTU Gateway (Pad Alpha)', ip: '192.168.1.102', mac: '00:1A:2B:3C:4D:5E', usage: '48.2 MB', blocked: false },
    { id: 'c2', name: 'Ababa Group Field Engineer Laptop', ip: '192.168.1.115', mac: '44:6D:57:9A:11:22', usage: '312.8 MB', blocked: false },
    { id: 'c3', name: 'Bluetti EP500 Solar BMS Telemetry', ip: '192.168.1.120', mac: '68:C6:3A:4F:99:81', usage: '12.4 MB', blocked: false },
    { id: 'c4', name: 'Ababa Field Emergency VoIP Post', ip: '192.168.1.144', mac: '70:88:6B:12:00:33', usage: '84.0 MB', blocked: false },
  ]);

  // Sync with snapshot updates
  useEffect(() => {
    const found = terminals.find((t) => t.id === id || t.id === decodedId);
    if (found) {
      setTerminal(found);
      setTelemetry((prev) => ({
        ...prev,
        latency_ms: found.latency_ms ?? 65,
        download_mbps: found.download_mbps ?? 120,
        lat: found.coords[0],
        lng: found.coords[1],
      }));
    }
  }, [id, decodedId, terminals]);

  // Continuous subtle live telemetry jitter (makes the demo feel vividly alive!)
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (dishState === 'online' && terminal.status !== 'OFFLINE') {
        setTelemetry((prev) => ({
          ...prev,
          latency_ms: Math.max(48, Math.min(88, (prev.latency_ms || 60) + (Math.floor(Math.random() * 5) - 2))),
          download_mbps: Number(Math.max(70, Math.min(165, (prev.download_mbps || 110) + (Math.random() * 4 - 2))).toFixed(1)),
        }));

        // Push new SCADA packet
        const params = [
          { param: 'Wellhead Choke Opening', val: `${Math.floor(62 + Math.random() * 4)}%`, status: 'ok' as const },
          { param: 'Downhole Pressure Transducer', val: `${Math.floor(2150 + Math.random() * 20)} PSI`, status: 'ok' as const },
          { param: 'Bluetti Solar DC Bus Voltage', val: `${(52.4 + Math.random() * 0.4).toFixed(1)} V`, status: 'ok' as const },
          { param: 'Starlink Ping Jitter', val: `${(2.1 + Math.random() * 1.2).toFixed(1)} ms`, status: 'ok' as const },
        ];
        const randomParam = params[Math.floor(Math.random() * params.length)];
        setScadaPackets((prev) => [
          { id: String(Date.now()), time: 'Just now', ...randomParam },
          ...prev.slice(0, 5),
        ]);
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [dishState, terminal.status]);

  // Simulate Full Dish Reboot Sequence
  const handleReboot = () => {
    setDishState('rebooting');
    setRebootProgress(0);
    setRebootStep('Shutting down Starlink phased array power...');
    toast('Initiating motorized Starlink dish reboot sequence...', 'info');

    let current = 0;
    const interval = window.setInterval(() => {
      current += 10;
      setRebootProgress(current);

      if (current === 20) setRebootStep('Re-calibrating inertial gyro sensors & leveling motors...');
      if (current === 50) setRebootStep('Scanning 550km LEO orbital shell for active Starlink satellites...');
      if (current === 80) setRebootStep('Establishing phased array beamformed uplink (14.2 GHz)...');

      if (current >= 100) {
        window.clearInterval(interval);
        setDishState('online');
        setRebootProgress(0);
        setRebootStep('');
        toast('Dish successfully rebooted! Full satellite telemetry restored.', 'success');
      }
    }, 400);
  };

  // Simulate Motorized Stow / Unstow
  const handleToggleStow = () => {
    if (dishState === 'online') {
      setDishState('stowed');
      setElevationAngle(90.0);
      toast('Dish stowed flat for extreme storm protection / transport.', 'warning');
    } else {
      setDishState('aligning');
      toast('Motorized actuators un-stowing dish and seeking orbital azimuth...', 'info');
      setTimeout(() => {
        setDishState('online');
        setElevationAngle(34.2);
        setAzimuthAngle(182.4);
        toast('Dish alignment locked on Starlink constellation.', 'success');
      }, 2000);
    }
  };

  // Run Speed Test Simulator
  const handleRunSpeedTest = () => {
    setIsTestingSpeed(true);
    setTestSpeedMbps(24.5);
    setTestUploadMbps(null);
    setTestPingMs(null);

    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 1;
      setTestSpeedMbps(Number((50 + progress * 8.5 + Math.random() * 6).toFixed(1)));

      if (progress >= 10) {
        window.clearInterval(interval);
        setTestSpeedMbps(142.8);
        setTestUploadMbps(28.4);
        setTestPingMs(52);
        setIsTestingSpeed(false);
        toast('Speed test benchmark completed: 142.8 Mbps Download, 28.4 Mbps Upload, 52ms Ping.', 'success');
      }
    }, 200);
  };

  const toggleBlockClient = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, blocked: !c.blocked } : c))
    );
    toast('Client access permissions updated on Starlink router.', 'info');
  };

  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/terminals')}
            className="p-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors text-on-surface"
            title="Back to Kit Inventory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-label font-bold uppercase tracking-wider">
                {terminal.kit_number || terminal.id.slice(0, 7)}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">{terminal.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight mt-0.5">
              {terminal.loc}
            </h1>
            <p className="text-xs text-primary font-semibold mt-1">
              Client: {terminal.client} &bull; {terminal.state}, South Sudan
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border',
            terminal.status === 'ONLINE' ? 'bg-[#00875A]/10 text-[#00875A] border-[#00875A]/20' :
              terminal.status === 'DEGRADED' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                'bg-error/10 text-error border-error/20'
          )}>
            <span className={cn(
              'w-2 h-2 rounded-full',
              terminal.status === 'ONLINE' ? 'bg-[#00875A] animate-pulse' :
                terminal.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-error'
            )} />
            {dishState === 'rebooting' ? 'REBOOTING...' : dishState === 'stowed' ? 'STOWED (SAFE)' : terminal.status}
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/40 font-mono">
            Maintained by: Ababa Group Limited
          </span>
        </div>
      </div>

      {/* Rebooting Banner */}
      {dishState === 'rebooting' && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl animate-pulse space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-primary">
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              Dish Motorized Power Cycle in Progress
            </span>
            <span>{rebootProgress}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${rebootProgress}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant font-mono">{rebootStep}</p>
        </div>
      )}

      {/* Top 4 Real-Time Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-label font-bold uppercase tracking-wider">Live Downlink</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            {dishState === 'online' ? `${telemetry.download_mbps} Mbps` : '--'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">94% Constellation Link</span>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-label font-bold uppercase tracking-wider">LEO Roundtrip Latency</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            {dishState === 'online' ? `${telemetry.latency_ms} ms` : '--'}
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono">To Juba NOC Gateway</span>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-label font-bold uppercase tracking-wider">Bluetti Solar Power</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-emerald-600 dark:text-emerald-400">
            {terminal.bluetti_soc_percent != null ? `${terminal.bluetti_soc_percent}% SOC` : '92% SOC'}
          </div>
          <span className="text-[11px] text-on-surface-variant">840W Continuous Solar In</span>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-label font-bold uppercase tracking-wider">Dish Thermal State</span>
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            {dishTemp}°C
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Within Safe Operational Limits</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on Desktop): Operations & Sky Radar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Starlink Motorized Dish & Hardware Controls */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  Remote Starlink Dish Operations
                </h3>
                <p className="text-xs text-on-surface-variant">Actuator motors, stow mode, thermal sensors, and reboot controls</p>
              </div>
              <span className="text-xs bg-surface-container font-mono px-2.5 py-1 rounded text-on-surface-variant font-bold">
                Elevation: {elevationAngle}° • Azimuth: {azimuthAngle}°
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleReboot}
                disabled={dishState === 'rebooting'}
                className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <RotateCcw className="w-5 h-5 text-primary group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Simulate</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">Reboot Terminal</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Power cycles dish phased array and re-calibrates gyros</p>
              </button>

              <button
                type="button"
                onClick={handleToggleStow}
                disabled={dishState === 'rebooting'}
                className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    {dishState === 'stowed' ? 'Stowed' : 'Active'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">
                  {dishState === 'stowed' ? 'Unstow & Align' : 'Stow Dish for Storms'}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Motorizes dish flat for heavy winds or wellpad rig movement</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = snowMeltMode === 'auto' ? 'on' : snowMeltMode === 'on' ? 'off' : 'auto';
                  setSnowMeltMode(next);
                  toast(`Dust & Melt Heating set to: ${next.toUpperCase()}`, 'info');
                }}
                className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                    Mode: {snowMeltMode.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">Dust Melt Heating</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Clears heavy sand / dew accumulation with array heat</p>
              </button>
            </div>
          </div>

          {/* Speed & Latency Benchmark Tool */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Live Speed & Jitter Benchmark
                </h3>
                <p className="text-xs text-on-surface-variant">Measure end-to-end throughput from field deployment to Ababa Group Master Juba NOC</p>
              </div>
              <button
                type="button"
                onClick={handleRunSpeedTest}
                disabled={isTestingSpeed || dishState !== 'online'}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-label font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isTestingSpeed ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isTestingSpeed ? 'Testing Speed...' : 'Run Speed Test'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant/30 text-center">
              <div>
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Download</p>
                <p className="text-2xl font-headline font-bold text-primary mt-1">
                  {testSpeedMbps != null ? `${testSpeedMbps} Mbps` : `${telemetry.download_mbps} Mbps`}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">LEO Burst Tested</span>
              </div>
              <div>
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Upload</p>
                <p className="text-2xl font-headline font-bold text-on-surface mt-1">
                  {testUploadMbps != null ? `${testUploadMbps} Mbps` : '26.8 Mbps'}
                </p>
                <span className="text-[10px] text-on-surface-variant font-mono">SCADA Stream Up</span>
              </div>
              <div>
                <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Ping Jitter</p>
                <p className="text-2xl font-headline font-bold text-on-surface mt-1">
                  {testPingMs != null ? `${testPingMs} ms` : `${telemetry.latency_ms} ms`}
                </p>
                <span className="text-[10px] text-on-surface-variant font-mono">&lt; 3.2 ms Jitter</span>
              </div>
            </div>
          </div>

          {/* Live SCADA Telemetry Stream */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Live Wellhead SCADA Telemetry Stream
                </h3>
                <p className="text-xs text-on-surface-variant">Continuous sensor packets transmitted over Kit Starlink satellite uplink</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Feed
              </span>
            </div>

            <div className="divide-y divide-outline-variant/15 border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low/40 font-mono text-xs">
              {scadaPackets.map((pkt) => (
                <div key={pkt.id} className="p-3 flex items-center justify-between hover:bg-surface-container/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-on-surface-variant opacity-70">{pkt.time}</span>
                    <span className="font-semibold text-on-surface">{pkt.param}</span>
                  </div>
                  <span className="font-bold text-primary">{pkt.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Map, Sky Radar & Connected Clients */}
        <div className="space-y-6">
          {/* Kit Location Map */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <span className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Station Geolocation
              </span>
              <span className="text-xs font-mono text-on-surface-variant">
                {telemetry.lat.toFixed(4)}, {telemetry.lng.toFixed(4)}
              </span>
            </div>
            <div className="h-56 relative bg-surface-container">
              <MapContainer
                center={[telemetry.lat, telemetry.lng]}
                zoom={12}
                scrollWheelZoom={false}
                zoomControl={false}
                className="absolute inset-0 w-full h-full"
              >
                <TileLayer attribution={attribution} url={tileUrl} />
                <Circle
                  center={[telemetry.lat, telemetry.lng]}
                  radius={3500}
                  pathOptions={{ color: '#005477', fillColor: '#005477', fillOpacity: 0.1, weight: 1 }}
                />
                <Marker position={[telemetry.lat, telemetry.lng]} icon={createStatusIcon(terminal.status.toLowerCase())}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong>{terminal.kit_number || terminal.id}</strong>
                      <p>{terminal.loc}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Starlink Sky Constellation Radar */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                Sky LOS Obstruction Radar
              </h4>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                0.0% Obstruction (Clear Sky)
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant/30 relative overflow-hidden">
              <div className="w-36 h-36 rounded-full border-2 border-primary/30 flex items-center justify-center relative">
                <div className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center" />
                <div className="w-12 h-12 rounded-full border border-primary/20" />
                {/* Simulated passing LEO satellite dots */}
                <div className="absolute top-6 right-8 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <div className="absolute top-6 right-8 w-2.5 h-2.5 bg-emerald-500 rounded-full" title="Starlink-v2 (Active Beam)" />
                <div className="absolute bottom-8 left-10 w-2 h-2 bg-primary/60 rounded-full" title="Starlink-v1 (Next Handover)" />
                <div className="absolute top-12 left-6 w-2 h-2 bg-primary/40 rounded-full" title="Starlink LEO Pass" />
                {/* Center dish icon */}
                <div className="w-4 h-4 bg-primary rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                  ★
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant font-mono mt-3">
                Tracking 3 active Starlink LEO satellites over Unity State
              </p>
            </div>
          </div>

          {/* Connected Field Devices & Client Security */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                Connected Field Nodes ({clients.filter(c => !c.blocked).length})
              </h4>
              <span className="text-[10px] font-mono text-on-surface-variant">SSID: ABABA-GROUP-SECURE</span>
            </div>

            <div className="space-y-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 text-xs",
                    client.blocked
                      ? "bg-error/5 border-error/20 opacity-60"
                      : "bg-surface-container-low/60 border-outline-variant/30 hover:bg-surface-container"
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface truncate">{client.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono">{client.ip} • {client.usage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBlockClient(client.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors shrink-0",
                      client.blocked
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                        : "bg-error/10 text-error hover:bg-error hover:text-white"
                    )}
                  >
                    {client.blocked ? 'Unblock' : 'Isolate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
