import React from 'react';
import { 
  Satellite, 
  Activity, 
  AlertTriangle, 
  Wifi, 
  ArrowRight,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Plus,
  Minus,
  Maximize
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (status: string) => {
  const isOnline = status === 'online';
  const colorClass = isOnline ? 'bg-[#005477]' : 'bg-error';
  const shadowColor = isOnline ? 'rgba(0,84,119,0.8)' : 'rgba(186,26,26,0.8)';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-full h-full rounded-full animate-ping opacity-40 ${colorClass}"></div>
        <div class="relative w-3 h-3 rounded-full border-2 border-white ${colorClass}" style="box-shadow: 0 0 10px ${shadowColor}"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Coordinates for Uganda and South Sudan
  const mapCenter: [number, number] = [4.0, 31.5];
  const zoomLevel = 5;

  const terminals = [
    { id: 'EA-JUB-001', loc: 'Juba Central, SS', data: '42.4 GB', latency: '28 ms', status: 'ONLINE', coords: [4.8594, 31.5713] as [number, number] },
    { id: 'EA-KMP-014', loc: 'Kampala North, UG', data: '8.1 GB', latency: '31 ms', status: 'ONLINE', coords: [0.3476, 32.5825] as [number, number] },
    { id: 'EA-JUB-009', loc: 'Juba A2 Outpost, SS', data: '0.0 GB', latency: '--', status: 'DEGRADED', coords: [4.9, 31.6] as [number, number] },
    { id: 'EA-KMP-022', loc: 'Entebbe Logistics, UG', data: '112.9 GB', latency: '35 ms', status: 'ONLINE', coords: [0.0512, 32.4637] as [number, number] },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest mb-1">Operational Overview</p>
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">East Africa Fleet</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/terminals?add=true')}
            className="flex items-center gap-2 px-6 py-3 rounded-md bg-on-surface text-surface font-label font-bold text-xs tracking-widest uppercase hover:bg-on-surface/90 transition-colors shadow-sm"
          >
            Add Terminal
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Total Traffic</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">4.2</span>
              <span className="text-sm font-bold text-on-surface-variant">TB/mo</span>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-[#00875A]">
              <TrendingUp className="w-3 h-3" />
              +12% from last cycle
            </span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between border-l-4 border-l-[#00875A]">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider mb-4">Avg Fleet Latency</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-on-surface">34</span>
              <span className="text-sm font-bold text-on-surface-variant">ms</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#00875A]">
              <span className="w-2 h-2 rounded-full bg-[#00875A]"></span>
              Within Nominal Range
            </span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between border-l-4 border-l-error">
          <h3 className="text-on-surface-variant font-label font-bold text-xs uppercase tracking-wider text-error mb-4">Critical Alerts</h3>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-headline font-bold text-error">02</span>
              <span className="text-sm font-bold text-on-surface-variant">active</span>
            </div>
            <span className="text-xs font-bold text-error uppercase tracking-wider">
              OBSTRUCTION DETECTED:<br/>JUBA-A2
            </span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col relative">
        <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-lg border border-outline-variant/30 shadow-sm">
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1">Current Focus</p>
          <h3 className="text-sm font-headline font-bold text-on-surface mb-2">South Sudan & Uganda</h3>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">H3: Res 6</span>
            <span className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">LIVE TELEMETRY</span>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm">
            <Plus className="w-4 h-4 text-on-surface" />
          </button>
          <button className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm">
            <Minus className="w-4 h-4 text-on-surface" />
          </button>
          <button className="w-8 h-8 bg-surface-container-lowest border border-outline-variant/30 rounded flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm mt-2">
            <Maximize className="w-4 h-4 text-on-surface" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 bg-surface-container-lowest/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#005477] opacity-40 rounded-sm"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active H3 Cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#005477] rounded-full border-2 border-white"></div>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Terminal</span>
          </div>
        </div>

        <div className="h-[400px] relative bg-[#e5e7eb] z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            scrollWheelZoom={false} 
            zoomControl={false}
            className="absolute inset-0 w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {terminals.map((term, idx) => (
              <Marker key={idx} position={term.coords} icon={createCustomIcon(term.status.toLowerCase())}>
                <Popup>
                  <div className="p-2 font-body text-sm font-bold">{term.id}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Recent Terminals Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Recent Terminals</h2>
            <p className="text-sm text-on-surface-variant font-body">Live status for fleet endpoints across East Africa</p>
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
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Data (24H)</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Latency</th>
                <th className="p-4 text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((term, i) => (
                <tr 
                  key={i} 
                  onClick={() => navigate(`/terminals/${term.id}`)}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-label font-bold text-on-surface">{term.id}</td>
                  <td className="p-4 text-sm text-on-surface-variant font-body">{term.loc}</td>
                  <td className="p-4 text-sm font-medium text-on-surface">{term.data}</td>
                  <td className="p-4 text-sm font-medium text-on-surface">{term.latency}</td>
                  <td className="p-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      term.status === 'ONLINE' ? "bg-[#00875A]/10 text-[#00875A]" : "bg-error/10 text-error"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", term.status === 'ONLINE' ? "bg-[#00875A]" : "bg-error")}></span>
                      {term.status}
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
