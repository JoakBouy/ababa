import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Satellite, 
  Settings, 
  LogOut,
  Menu,
  Search,
  Bell,
  UserCircle,
  AlertTriangle,
  Info,
  BarChart3,
  HeartHandshake
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Terminals', path: '/terminals', icon: Satellite },
    { name: 'Analytics & Impact', path: '/analytics', icon: BarChart3 },
    { name: 'Community Impact', path: '/impact', icon: HeartHandshake },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const mockAlerts = [
    { id: 1, title: 'Obstruction Detected', desc: 'Terminal EA-JUB-009 (Juba A2) is reporting physical obstruction.', time: '10m ago', type: 'error' },
    { id: 2, title: 'Terminal Offline', desc: 'Terminal EA-ZNZ-021 lost connection.', time: '1h ago', type: 'error' },
    { id: 3, title: 'Firmware Update', desc: 'EA-KMP-014 successfully updated to v2.4.1', time: '2h ago', type: 'info' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest border-r border-outline-variant/30 text-on-surface flex flex-col transition-transform duration-300 ease-in-out",
        showMobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 pb-2 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-headline font-bold text-xl tracking-tight text-primary">Enjojo</span>
            </div>
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Global Ops - East Africa</p>
          </div>
          <button 
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full"
            onClick={() => setShowMobileMenu(false)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-md font-label transition-all duration-200",
                isActive 
                  ? "bg-surface-container text-on-surface font-bold" 
                  : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface font-medium"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-4">
          <button 
            onClick={() => {
              setShowMobileMenu(false);
              navigate('/terminals?add=true');
            }}
            className="w-full bg-on-surface text-surface py-3 rounded-md font-label font-bold text-xs tracking-widest uppercase hover:bg-on-surface/90 transition-colors shadow-sm"
          >
            Add Terminal
          </button>
          
          <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=f0f0f0" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-label font-bold text-on-surface truncate">Alex Rodriguez</p>
              <p className="text-xs font-body text-on-surface-variant truncate">East Africa Region</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Bar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-md border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-96">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search Terminals or Locations..." 
                className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
                    <h3 className="font-headline font-bold text-on-surface">Alerts & Notifications</h3>
                    <span className="text-xs font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockAlerts.map(alert => (
                      <div key={alert.id} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer flex gap-3">
                        <div className={cn("mt-0.5 shrink-0", alert.type === 'error' ? 'text-error' : 'text-primary')}>
                          {alert.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{alert.title}</h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{alert.desc}</p>
                          <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider mt-2 block">{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-outline-variant/30 bg-surface-container-low/50">
                    <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">View All History</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label font-bold text-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              >
                AR
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-outline-variant/30">
                    <p className="text-sm font-bold text-on-surface">Alex Rodriguez</p>
                    <p className="text-xs text-on-surface-variant truncate">admin@enjojofoundation.org</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </button>
                  </div>
                  <div className="p-2 border-t border-outline-variant/30">
                    <button 
                      onClick={() => {
                        alert('Logged out successfully.');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-surface p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
