import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Satellite, 
  Search, 
  Filter, 
  MoreVertical,
  Wifi,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Terminals() {
  const navigate = useNavigate();

  const terminals = [
    { id: 'SS-UG_BDR_082', location: 'Kampala, Uganda', status: 'online', latency: '32ms', speed: '145 Mbps', uptime: '99.9%' },
    { id: 'SS-KE_NBO_145', location: 'Nairobi, Kenya', status: 'offline', latency: '--', speed: '--', uptime: '98.2%' },
    { id: 'SS-TZ_DAR_012', location: 'Dar es Salaam, Tanzania', status: 'online', latency: '45ms', speed: '120 Mbps', uptime: '99.5%' },
    { id: 'SS-RW_KGL_055', location: 'Kigali, Rwanda', status: 'online', latency: '28ms', speed: '160 Mbps', uptime: '99.8%' },
    { id: 'SS-UG_EBB_004', location: 'Entebbe, Uganda', status: 'warning', latency: '120ms', speed: '45 Mbps', uptime: '95.4%' },
    { id: 'SS-KE_MSA_099', location: 'Mombasa, Kenya', status: 'online', latency: '38ms', speed: '135 Mbps', uptime: '99.7%' },
    { id: 'SS-TZ_ZNZ_021', location: 'Zanzibar, Tanzania', status: 'online', latency: '42ms', speed: '110 Mbps', uptime: '99.1%' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">My Terminals</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage and monitor your Starlink fleet</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Satellite className="w-4 h-4" />
          Add Terminal
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-full border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full sm:w-96">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search by ID, location..." 
            className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <select className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium bg-surface-container-lowest hover:bg-surface-container transition-colors outline-none focus:border-primary">
            <option>All Status</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Warning</option>
          </select>
        </div>
      </div>

      {/* Terminals List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Terminal ID</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Location</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Status</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Latency</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Throughput</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Uptime</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((term, i) => (
                <tr 
                  key={i} 
                  onClick={() => navigate(`/terminals/${term.id}`)}
                  className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                        <Satellite className="w-5 h-5" />
                      </div>
                      <span className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{term.id}</span>
                    </div>
                  </td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.location}</td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      term.status === 'online' ? "bg-tertiary-container/20 text-on-tertiary-container" :
                      term.status === 'offline' ? "bg-error-container/20 text-error" :
                      "bg-secondary-container/20 text-on-secondary-container"
                    )}>
                      {term.status === 'online' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       term.status === 'offline' ? <AlertCircle className="w-3.5 h-3.5" /> :
                       <Activity className="w-3.5 h-3.5" />}
                      {term.status.charAt(0).toUpperCase() + term.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.latency}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-outline" />
                      <span className="font-body text-sm text-on-surface-variant">{term.speed}</span>
                    </div>
                  </td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.uptime}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-on-surface-variant font-body">
          <span>Showing 1 to 7 of 48 terminals</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded-md bg-primary text-on-primary font-medium">1</button>
            <button className="px-3 py-1 rounded-md border border-outline-variant hover:bg-surface-container transition-colors">2</button>
            <button className="px-3 py-1 rounded-md border border-outline-variant hover:bg-surface-container transition-colors">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 rounded-md border border-outline-variant hover:bg-surface-container transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
