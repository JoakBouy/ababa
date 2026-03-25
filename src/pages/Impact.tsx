import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { terminals, conflictData, conflictTrendData, impactComparisonData } from '../data/mockData';
import { Sparkles, ShieldAlert, HeartHandshake, ArrowRight, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Cell
} from 'recharts';

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

const createStarlinkIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-4 h-4">
        <div class="absolute w-full h-full rounded-full bg-[#005477] opacity-80"></div>
        <div class="relative w-2 h-2 rounded-full border border-white bg-[#005477]"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

export default function Impact() {
  const [timeframe, setTimeframe] = useState<'before' | 'after'>('before');

  const mapCenter: [number, number] = [4.0, 31.5];
  const zoomLevel = 5;

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken 
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const attribution = mapboxToken
    ? 'Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const currentConflicts = timeframe === 'before' ? conflictData.before : conflictData.after;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-label font-bold text-primary uppercase tracking-widest mb-1">Conflict Mitigation</p>
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Community Impact Map</h1>
        </div>
        
        {/* Timeframe Toggle */}
        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/50 shadow-sm">
          <button
            onClick={() => setTimeframe('before')}
            className={cn(
              "px-6 py-2 rounded-md font-label font-bold text-xs uppercase tracking-widest transition-all",
              timeframe === 'before' 
                ? "bg-on-surface text-surface shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Before Deployment
          </button>
          <button
            onClick={() => setTimeframe('after')}
            className={cn(
              "px-6 py-2 rounded-md font-label font-bold text-xs uppercase tracking-widest transition-all",
              timeframe === 'after' 
                ? "bg-primary text-on-primary shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            After Deployment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col relative h-[600px]">
          
          <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-lg border border-outline-variant/30 shadow-sm">
            <h3 className="text-sm font-headline font-bold text-on-surface mb-2">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error opacity-60"></div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Conflict Hotspot</span>
              </div>
              {timeframe === 'after' && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#005477]"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Starlink Node</span>
                </div>
              )}
            </div>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={zoomLevel} 
            scrollWheelZoom={false} 
            className="w-full h-full z-0 bg-[#e5e7eb]"
          >
            <TileLayer attribution={attribution} url={tileUrl} />
            
            {/* Render Conflict "Heatmap" using overlapping circles */}
            {currentConflicts.map((conflict, idx) => (
              <Circle 
                key={`conflict-${idx}`}
                center={[conflict.lat, conflict.lng]} 
                radius={conflict.radius}
                pathOptions={{ 
                  color: 'transparent', 
                  fillColor: '#ba1a1a', 
                  fillOpacity: conflict.intensity * 0.6 // Scale opacity by intensity
                }} 
              />
            ))}

            {/* Render Starlink Nodes ONLY in "After" view */}
            {timeframe === 'after' && terminals.filter(t => t.status !== 'OFFLINE').map((term, idx) => (
              <Marker key={`term-${idx}`} position={term.coords} icon={createStarlinkIcon()}>
                <Popup>
                  <div className="p-1 font-body">
                    <div className="font-bold text-sm mb-1">{term.id}</div>
                    <div className="text-xs text-on-surface-variant">{term.loc}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* AI Insights Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-primary-container to-surface-container-lowest rounded-xl border border-primary/20 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-headline font-bold text-on-surface">AI Impact Analysis</h2>
            </div>
            
            <div className="relative z-10 space-y-4">
              {timeframe === 'before' ? (
                <>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Pre-Deployment Baseline:</strong> High concentration of resource-based conflicts detected in Juba, Gulu, and Malakal regions. 
                  </p>
                  <div className="bg-surface-container-lowest/80 p-4 rounded-lg border border-outline-variant/30">
                    <div className="flex items-center gap-2 text-error mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="font-bold text-sm">Critical Finding</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Communication blackouts correlate strongly with 45% of escalation events. Lack of real-time reporting delays mediation response by an average of 72 hours.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">Post-Deployment Impact:</strong> Significant reduction in conflict density observed within a 15km radius of active Starlink nodes.
                  </p>
                  <div className="bg-surface-container-lowest/80 p-4 rounded-lg border border-outline-variant/30">
                    <div className="flex items-center gap-2 text-[#00875A] mb-2">
                      <HeartHandshake className="w-4 h-4" />
                      <span className="font-bold text-sm">Positive Correlation</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Conflict incidents reduced by <strong>62%</strong> near active nodes. Real-time communication access has improved local mediation response times from 72 hours down to <strong>4 hours</strong> on average.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-headline font-bold text-on-surface mb-6">Key Indicators (Before vs After)</h3>
            
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactComparisonData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="metric" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} width={100} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="before" name="Before Deployment" fill="#ba1a1a" radius={[0, 4, 4, 0]} barSize={20} />
                  <Bar dataKey="after" name="After Deployment" fill="#00875A" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis Chart */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-headline font-bold text-on-surface">6-Month Trend: Connectivity vs Conflict Resolution</h2>
          <p className="text-sm text-on-surface-variant">Correlation between active Starlink nodes and reduction in reported incidents</p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={conflictTrendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'Reported Incidents', angle: -90, position: 'insideLeft', fill: '#ba1a1a', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'Active Nodes', angle: 90, position: 'insideRight', fill: '#005477', fontSize: 12, fontWeight: 'bold' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area yAxisId="left" type="monotone" dataKey="incidents" name="Conflict Incidents" fill="url(#colorIncidents)" stroke="#ba1a1a" strokeWidth={3} />
              <Line yAxisId="right" type="monotone" dataKey="activeNodes" name="Active Starlink Nodes" stroke="#005477" strokeWidth={3} dot={{ r: 4, fill: '#005477', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
