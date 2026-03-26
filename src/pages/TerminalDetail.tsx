import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Wifi, 
  Satellite, 
  Settings, 
  Power,
  RotateCcw,
  MapPin,
  CheckCircle2,
  Signal,
  AlertTriangle,
  ThermometerSnowflake,
  BatteryCharging,
  EyeOff,
  Lock,
  Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../utils/cn';
import { initLeafletIcons, createStatusIcon } from '../utils/leafletSetup';
import { useToast } from '../contexts/ToastContext';

initLeafletIcons();

export default function TerminalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simulated API States
  const [isRebooting, setIsRebooting] = useState(false);
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [isFetchingTelemetry, setIsFetchingTelemetry] = useState(true);

  // Simulated Data States
  const [networkStats, setNetworkStats] = useState({ latency: 28, download: 145, signal: 98 });
  const [location, setLocation] = useState({ type: 'H3 Cell', value: '8a2a1072b59ffff', lat: 0.3476, lng: 32.5825 });
  const [telemetry, setTelemetry] = useState({ uptime: '14d 6h 22m', errors: 0, warnings: 2, swVersion: 'a1b2c3d4' });
  
  // Config States
  const [dishConfig, setDishConfig] = useState({ snowMeltMode: 'auto', powerSaving: false });
  const [wifiConfig, setWifiConfig] = useState({ ssid: 'STARLINK_BDR_082', password: '••••••••', hideSsid: false, bypassMode: false });

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken 
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const attribution = mapboxToken
    ? 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetchingTelemetry(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleReboot = () => {
    setIsRebooting(true);
    setTimeout(() => {
      setIsRebooting(false);
      toast('Dish rebooted successfully.', 'success');
    }, 3000);
  };

  const handleSaveDishConfig = () => {
    setIsSavingDish(true);
    setTimeout(() => {
      setIsSavingDish(false);
      toast('Dish configuration saved.', 'success');
    }, 1500);
  };

  const handleSaveWifiConfig = () => {
    setIsSavingWifi(true);
    setTimeout(() => {
      setIsSavingWifi(false);
      toast('WiFi configuration saved.', 'success');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">{id || 'SS-UG_BDR_082'}</h1>
            <span className="flex items-center gap-1 text-sm font-medium text-tertiary-fixed-dim bg-tertiary-fixed/10 px-3 py-1 rounded-full border border-tertiary-fixed/20">
              <CheckCircle2 className="w-4 h-4" />
              Online
            </span>
          </div>
          <p className="text-on-surface-variant font-body mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.type}: {location.value}
          </p>
        </div>
        <div className="md:ml-auto flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleReboot}
            disabled={isRebooting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {isRebooting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            {isRebooting ? 'Rebooting...' : 'Reboot Dish'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Stats & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Network Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
              {isFetchingTelemetry && <div className="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Activity className="w-5 h-5" />
                <h3 className="font-label font-medium">Latency</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">{networkStats.latency}</span>
                <span className="text-sm text-on-surface-variant font-body">ms</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-1/4 rounded-full"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
              {isFetchingTelemetry && <div className="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Wifi className="w-5 h-5" />
                <h3 className="font-label font-medium">Download</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">{networkStats.download}</span>
                <span className="text-sm text-on-surface-variant font-body">Mbps</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden">
              {isFetchingTelemetry && <div className="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Signal className="w-5 h-5" />
                <h3 className="font-label font-medium">Signal</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">{networkStats.signal}</span>
                <span className="text-sm text-on-surface-variant font-body">%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-[98%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Telemetry & Device Info */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 relative overflow-hidden">
            {isFetchingTelemetry && <div className="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Telemetry & Diagnostics
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Linked Account</span>
                  <span className="text-sm font-medium text-on-surface">admin@enjojofoundation.org</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Connection Mode</span>
                  <span className="text-sm font-medium text-tertiary-fixed-dim flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Remote (H3 Cell)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Software Version</span>
                  <span className="text-sm font-medium text-on-surface font-mono">{telemetry.swVersion}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Uptime</span>
                  <span className="text-sm font-medium text-on-surface">{telemetry.uptime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-outline-variant/10">
                  <span className="text-sm text-on-surface-variant font-body">Location Type</span>
                  <span className="text-sm font-medium text-on-surface">{location.type}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-on-surface-variant font-body">Coordinates</span>
                  <span className="text-sm font-medium text-on-surface font-mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-error-container/20 border border-error/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-label font-bold text-error text-sm">Errors ({telemetry.errors})</h4>
                    <p className="text-xs text-on-surface-variant mt-1">No active errors detected.</p>
                  </div>
                </div>
                <div className="bg-secondary-container/20 border border-secondary/20 rounded-2xl p-4 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-label font-bold text-secondary text-sm">Warnings ({telemetry.warnings})</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Minor obstruction detected (2%).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dish Configuration */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                Dish Configuration
              </h2>
              <button 
                onClick={handleSaveDishConfig}
                disabled={isSavingDish}
                className="text-sm font-label font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isSavingDish && <Loader2 className="w-3 h-3 animate-spin" />}
                Save Config
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <ThermometerSnowflake className="w-4 h-4" /> Snow Melt Mode
                </label>
                <select 
                  value={dishConfig.snowMeltMode}
                  onChange={(e) => setDishConfig({...dishConfig, snowMeltMode: e.target.value})}
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
                  onClick={() => setDishConfig({...dishConfig, powerSaving: !dishConfig.powerSaving})}
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface flex justify-between items-center cursor-pointer"
                >
                  <span>Enable Power Saving</span>
                  <div className={cn("w-10 h-5 rounded-full relative transition-colors", dishConfig.powerSaving ? "bg-primary" : "bg-outline-variant/50")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform", dishConfig.powerSaving ? "left-5" : "left-1")}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Location & WiFi Config */}
        <div className="space-y-6">
          
          {/* Location Map */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h2>
            <div className="h-[250px] relative bg-[#e5e7eb] rounded-xl overflow-hidden z-0">
              <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={12} 
                scrollWheelZoom={false} 
                zoomControl={true}
                className="absolute inset-0 w-full h-full"
              >
                <TileLayer
                  attribution={attribution}
                  url={tileUrl}
                />
                <Marker position={[location.lat, location.lng]} icon={createStatusIcon('online')}>
                  <Popup>
                    <div className="p-1 font-body text-sm font-bold">{id || 'SS-UG_BDR_082'}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">Coordinates</span>
              <span className="font-mono font-medium">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          </div>

          {/* WiFi Configuration */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                WiFi Configuration
              </h2>
              <button 
                onClick={handleSaveWifiConfig}
                disabled={isSavingWifi}
                className="text-sm font-label font-medium text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {isSavingWifi && <Loader2 className="w-3 h-3 animate-spin" />}
                Apply
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">SSID Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={wifiConfig.ssid}
                    onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
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
                    onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
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
                    onClick={() => setWifiConfig({...wifiConfig, hideSsid: !wifiConfig.hideSsid})}
                    className={cn("w-10 h-5 rounded-full relative transition-colors cursor-pointer", wifiConfig.hideSsid ? "bg-primary" : "bg-outline-variant/50")}
                  >
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform", wifiConfig.hideSsid ? "left-5" : "left-1")}></div>
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
                    onClick={() => setWifiConfig({...wifiConfig, bypassMode: !wifiConfig.bypassMode})}
                    className={cn("w-10 h-5 rounded-full relative transition-colors cursor-pointer", wifiConfig.bypassMode ? "bg-primary" : "bg-outline-variant/50")}
                  >
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform", wifiConfig.bypassMode ? "left-5" : "left-1")}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <div className="bg-surface-container-low rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Connected Clients</p>
                    <p className="text-2xl font-headline font-bold text-on-surface mt-1">12</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                    <Wifi className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
