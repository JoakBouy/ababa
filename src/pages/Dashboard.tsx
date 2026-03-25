import React from 'react';
import { 
  Satellite, 
  Activity, 
  AlertTriangle, 
  Wifi, 
  ArrowRight,
  MapPin,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Dashboard() {
  const navigate = useNavigate();

  // Coordinates for Uganda and South Sudan
  const mapCenter: [number, number] = [4.0, 31.5];
  const zoomLevel = 5;

  const terminals = [
    { id: 'SS-UG_BDR_082', loc: 'Kampala, UG', coords: [0.3476, 32.5825] as [number, number], status: 'online' },
    { id: 'SS-SS_JUB_012', loc: 'Juba, SS', coords: [4.8594, 31.5713] as [number, number], status: 'online' },
    { id: 'SS-UG_EBB_004', loc: 'Entebbe, UG', coords: [0.0512, 32.4637] as [number, number], status: 'online' },
    { id: 'SS-SS_WAU_045', loc: 'Wau, SS', coords: [7.7029, 27.9953] as [number, number], status: 'offline' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">East Africa Fleet</h1>
          <p className="text-on-surface-variant font-body mt-1">Real-time telemetry and operational status</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
            <Activity className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Satellite className="w-4 h-4" />
            Provision Terminal
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <Satellite className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-tertiary-fixed-dim bg-tertiary-fixed/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium text-sm mb-1">Active Terminals</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">48</span>
            <span className="text-sm text-on-surface-variant">/ 50</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-tertiary-fixed-dim bg-tertiary-fixed/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +5%
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium text-sm mb-1">Total Throughput</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">4.2</span>
            <span className="text-sm text-on-surface-variant">Tbps</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <Wifi className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-on-surface-variant bg-surface-variant px-2 py-1 rounded-full">
              Avg
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium text-sm mb-1">Network Latency</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-bold text-on-surface">32</span>
            <span className="text-sm text-on-surface-variant">ms</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-error/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-error bg-error/10 px-2 py-1 rounded-full">
              Action Req
            </span>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium text-sm mb-1 relative z-10">Critical Alerts</h3>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-4xl font-headline font-bold text-error">7</span>
            <span className="text-sm text-on-surface-variant">terminals</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest z-10">
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Deployment Map</h2>
              <p className="text-sm text-on-surface-variant font-body">Live terminal locations and status</p>
            </div>
            <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <MapPin className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
          <div className="flex-1 min-h-[400px] relative bg-[#e5e9eb] z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={zoomLevel} 
              scrollWheelZoom={false} 
              className="absolute inset-0 w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {terminals.map((term, idx) => (
                <Marker key={idx} position={term.coords}>
                  <Popup>
                    <div className="font-body">
                      <p className="font-bold text-sm">{term.id}</p>
                      <p className="text-xs text-gray-600">{term.loc}</p>
                      <p className={cn("text-xs font-medium mt-1", term.status === 'online' ? "text-green-600" : "text-red-600")}>
                        {term.status.toUpperCase()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Recent Terminals List */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-xl font-headline font-bold text-on-surface">Recent Activity</h2>
            <button 
              onClick={() => navigate('/terminals')}
              className="text-sm font-label font-medium text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-2">
            {[
              { id: 'SS-UG_BDR_082', loc: 'Kampala, UG', status: 'online', time: '2m ago' },
              { id: 'SS-KE_NBO_145', loc: 'Nairobi, KE', status: 'offline', time: '15m ago' },
              { id: 'SS-TZ_DAR_012', loc: 'Dar es Salaam, TZ', status: 'online', time: '1h ago' },
              { id: 'SS-RW_KGL_055', loc: 'Kigali, RW', status: 'online', time: '3h ago' },
              { id: 'SS-UG_EBB_004', loc: 'Entebbe, UG', status: 'online', time: '5h ago' },
            ].map((term, i) => (
              <div 
                key={i} 
                onClick={() => navigate('/terminals/SS-UG_BDR_082')}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    term.status === 'online' ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-on-error-container"
                  )}>
                    {term.status === 'online' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-label font-bold text-on-surface group-hover:text-primary transition-colors">{term.id}</h4>
                    <p className="text-xs text-on-surface-variant font-body">{term.loc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-on-surface-variant">{term.time}</span>
                  <ArrowRight className="w-4 h-4 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import cn
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
