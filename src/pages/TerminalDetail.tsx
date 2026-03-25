import React from 'react';
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
  Signal
} from 'lucide-react';

export default function TerminalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
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
            Kampala, Uganda • Standard Actuated
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reboot
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-error text-on-error font-label font-medium hover:bg-error/90 transition-colors shadow-sm">
            <Power className="w-4 h-4" />
            Stow
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Stats & Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Activity className="w-5 h-5" />
                <h3 className="font-label font-medium">Current Latency</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">28</span>
                <span className="text-sm text-on-surface-variant font-body">ms</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-1/4 rounded-full"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Wifi className="w-5 h-5" />
                <h3 className="font-label font-medium">Download Speed</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">145</span>
                <span className="text-sm text-on-surface-variant font-body">Mbps</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
                <Signal className="w-5 h-5" />
                <h3 className="font-label font-medium">Signal Quality</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">98</span>
                <span className="text-sm text-on-surface-variant font-body">%</span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed-dim w-[98%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface">Network Performance</h2>
              <select className="px-3 py-1.5 rounded-lg border border-outline-variant text-sm font-label font-medium bg-surface-container-lowest hover:bg-surface-container transition-colors outline-none focus:border-primary">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            
            {/* CSS-based Chart representation from HTML */}
            <div className="h-64 flex items-end gap-2 mt-4 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-on-surface-variant font-body py-2">
                <span>200 Mbps</span>
                <span>150 Mbps</span>
                <span>100 Mbps</span>
                <span>50 Mbps</span>
                <span>0</span>
              </div>
              
              {/* Chart Bars */}
              <div className="flex-1 flex items-end gap-1 ml-16 h-full border-b border-l border-outline-variant/30 pb-1 pl-1">
                {[40, 60, 45, 80, 75, 90, 85, 100, 95, 110, 105, 120, 115, 130, 125, 140, 135, 150, 145, 160, 155, 170, 165, 180].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end group">
                    <div 
                      className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-t-sm relative" 
                      style={{ height: `${(height / 200) * 100}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {height} Mbps
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-on-surface-variant font-body mt-2 ml-16">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Config */}
        <div className="space-y-6">
          
          {/* Device Info */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <Satellite className="w-5 h-5 text-primary" />
              Device Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant font-body">Hardware Version</span>
                <span className="text-sm font-medium text-on-surface">Rev3</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant font-body">Software Version</span>
                <span className="text-sm font-medium text-on-surface">a1b2c3d4</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant font-body">Uptime</span>
                <span className="text-sm font-medium text-on-surface">14d 6h 22m</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant font-body">Obstruction</span>
                <span className="text-sm font-medium text-tertiary-fixed-dim">Clear (0%)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-on-surface-variant font-body">IP Address</span>
                <span className="text-sm font-medium text-on-surface font-mono">100.64.0.1</span>
              </div>
            </div>
          </div>

          {/* Network Config */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Network Config
              </h2>
              <button className="text-sm font-label font-medium text-primary hover:underline">Edit</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">WiFi SSID</label>
                <div className="mt-1 p-3 bg-surface-container rounded-xl text-sm font-medium text-on-surface flex justify-between items-center">
                  STARLINK_BDR_082
                  <Wifi className="w-4 h-4 text-on-surface-variant" />
                </div>
              </div>
              <div>
                <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">Security</label>
                <div className="mt-1 p-3 bg-surface-container rounded-xl text-sm font-medium text-on-surface">
                  WPA3 Personal
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-label font-medium text-on-surface text-sm">Bypass Mode</h4>
                    <p className="text-xs text-on-surface-variant font-body">Disable built-in router</p>
                  </div>
                  {/* Toggle Switch */}
                  <div className="w-12 h-6 bg-surface-container-highest rounded-full relative cursor-pointer border border-outline-variant/50">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-outline rounded-full transition-transform"></div>
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
