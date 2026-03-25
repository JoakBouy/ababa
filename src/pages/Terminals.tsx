import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Satellite, 
  Search, 
  Filter, 
  MoreVertical,
  Wifi,
  Activity,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Server
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Terminals() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (location.search.includes('add=true')) {
      setIsAddModalOpen(true);
    }
  }, [location]);

  const terminals = [
    { id: 'EA-JUB-001', account: 'admin@enjojofoundation.org', location: 'Juba Central, SS', data: '42.4 GB', latency: '28 ms', status: 'ONLINE' },
    { id: 'EA-KMP-014', account: 'kenya.ops@enjojofoundation.org', location: 'Kampala North, UG', data: '8.1 GB', latency: '31 ms', status: 'ONLINE' },
    { id: 'EA-JUB-009', account: 'admin@enjojofoundation.org', location: 'Juba A2 Outpost, SS', data: '0.0 GB', latency: '--', status: 'DEGRADED' },
    { id: 'EA-KMP-022', account: 'rwanda.ops@enjojofoundation.org', location: 'Entebbe Logistics, UG', data: '112.9 GB', latency: '35 ms', status: 'ONLINE' },
    { id: 'EA-NBO-004', account: 'admin@enjojofoundation.org', location: 'Nairobi, KE', data: '12.4 GB', latency: '120 ms', status: 'DEGRADED' },
    { id: 'EA-MSA-099', account: 'kenya.ops@enjojofoundation.org', location: 'Mombasa, KE', data: '56.2 GB', latency: '38 ms', status: 'ONLINE' },
    { id: 'EA-ZNZ-021', account: 'admin@enjojofoundation.org', location: 'Zanzibar, TZ', data: '0.0 GB', latency: '--', status: 'OFFLINE' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">My Terminals</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage and monitor your Starlink fleet across multiple accounts</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Terminal
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-full border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full sm:w-96">
          <Search className="w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search by ID, location, account..." 
            className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <select className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium bg-surface-container-lowest hover:bg-surface-container transition-colors outline-none focus:border-primary">
            <option>All Accounts</option>
            <option>admin@enjojofoundation.org</option>
            <option>kenya.ops@enjojofoundation.org</option>
            <option>rwanda.ops@enjojofoundation.org</option>
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
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Account</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Location</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Data (24H)</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Latency</th>
                <th className="p-4 font-label font-medium text-sm text-on-surface-variant">Status</th>
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
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.account}</td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.location}</td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.data}</td>
                  <td className="p-4 font-body text-sm text-on-surface-variant">{term.latency}</td>
                  <td className="p-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      term.status === 'ONLINE' ? "bg-[#00875A]/10 text-[#00875A]" : 
                      term.status === 'DEGRADED' ? "bg-[#F2994A]/10 text-[#F2994A]" : 
                      "bg-error/10 text-error"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full", 
                        term.status === 'ONLINE' ? "bg-[#00875A]" : 
                        term.status === 'DEGRADED' ? "bg-[#F2994A]" : 
                        "bg-error"
                      )}></span>
                      {term.status}
                    </div>
                  </td>
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

      {/* Add Terminal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
              <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Add New Terminal
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-label font-medium text-on-surface-variant">Starlink Account</label>
                <select className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                  <option>admin@enjojofoundation.org</option>
                  <option>kenya.ops@enjojofoundation.org</option>
                  <option>rwanda.ops@enjojofoundation.org</option>
                  <option>+ Link New Account...</option>
                </select>
                <p className="text-xs text-on-surface-variant font-body">Select the account this terminal belongs to.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-label font-medium text-on-surface-variant">Terminal ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., UT00000000-00000000-00000000"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-label font-medium text-on-surface-variant">Local IP Address (For Precise Location)</label>
                <input 
                  type="text" 
                  placeholder="e.g., 192.168.100.1"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50"
                />
                <p className="text-xs text-on-surface-variant font-body">Required only if you need precise real-time location via local network access. Otherwise, H3 cell location will be used.</p>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container-low/30">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Terminal added successfully.');
                  setIsAddModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Add Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
