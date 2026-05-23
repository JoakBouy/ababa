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
  RefreshCw,
  AlertTriangle,
  Info,
  BarChart3,
  HeartHandshake
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { useToast } from '../contexts/ToastContext';
import StarlinkSetupModal from './StarlinkSetupModal';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    accounts,
    terminals,
    isLoading: isLoadingFleet,
    isRefreshing: isRefreshingFleet,
    lastUpdatedAt,
    refreshFleetSnapshot,
  } = useFleetSnapshot();
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showStarlinkSetup, setShowStarlinkSetup] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<Array<{ id: string; title: string; desc: string; type: 'error' | 'info' }>>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

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

  useEffect(() => {
    if (!isLoadingFleet) {
      setShowStarlinkSetup(accounts.length === 0);
    }
  }, [accounts.length, isLoadingFleet]);

  useEffect(() => {
    if (!showNotifications) {
      return;
    }

    setIsLoadingAlerts(isLoadingFleet);
    const nextAlerts = terminals.flatMap((terminal) => {
      if (terminal.status === 'DEGRADED') {
        return [{
          id: `${terminal.id}-degraded`,
          title: 'Terminal degraded',
          desc: `${terminal.id} is reporting degraded service at ${terminal.loc}.`,
          type: 'error' as const,
        }];
      }
      if (terminal.status === 'OFFLINE') {
        return [{
          id: `${terminal.id}-offline`,
          title: 'Terminal offline',
          desc: `${terminal.id} is offline at ${terminal.loc}.`,
          type: 'error' as const,
        }];
      }
      if (terminal.download_mbps == null) {
        return [{
          id: `${terminal.id}-telemetry`,
          title: 'Telemetry unavailable',
          desc: `${terminal.id} is online, but Starlink is not exposing live telemetry right now.`,
          type: 'info' as const,
        }];
      }
      return [];
    });
    setLiveAlerts(nextAlerts);
    setIsLoadingAlerts(false);
  }, [isLoadingFleet, showNotifications, terminals]);

  const navItems = [
    { name: 'Command Center', path: '/', icon: LayoutDashboard },
    { name: 'Connected Endpoints', path: '/terminals', icon: Satellite },
    { name: 'Analytics & Impact', path: '/analytics', icon: BarChart3 },
    { name: 'Community Impact', path: '/impact', icon: HeartHandshake },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const userInitials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'OP';

  const lastUpdatedLabel = lastUpdatedAt
    ? new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
      }).format(lastUpdatedAt)
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <StarlinkSetupModal
        open={showStarlinkSetup}
        onClose={() => setShowStarlinkSetup(false)}
        onLinked={() => setShowStarlinkSetup(false)}
        defaultEmail={user?.email}
      />

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
            <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Operations Platform</p>
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
              navigate('/settings');
            }}
            className="w-full bg-on-surface text-surface py-3 rounded-md font-label font-bold text-xs tracking-widest uppercase hover:bg-on-surface/90 transition-colors shadow-sm"
          >
            Link Data Source
          </button>
          
          <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 font-bold text-sm">
              {user?.name?.substring(0, 2).toUpperCase() ?? 'OP'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-label font-bold text-on-surface truncate">{user?.name ?? 'Operator'}</p>
              <p className="text-xs font-body text-on-surface-variant truncate">{user?.role ?? 'Fleet Manager'}</p>
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
              aria-label="Open navigation menu"
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-md border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-96">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search endpoints, sites, or locations..." 
                className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void refreshFleetSnapshot('manual')}
              disabled={isRefreshingFleet}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md border border-outline-variant/50 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshingFleet && 'animate-spin')} />
              {isRefreshingFleet ? 'Refreshing...' : 'Refresh Live'}
            </button>
            {lastUpdatedLabel && (
              <span className="hidden lg:block text-xs text-on-surface-variant">
                Holding last live data from {lastUpdatedLabel}
              </span>
            )}
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                aria-label="Toggle notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {liveAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
                    <h3 className="font-headline font-bold text-on-surface">Alerts & Notifications</h3>
                    <span className="text-xs font-bold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                      {liveAlerts.length} Live
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingAlerts && (
                      <div className="p-4 text-sm text-on-surface-variant">Loading live alerts...</div>
                    )}
                    {!isLoadingAlerts && liveAlerts.length === 0 && (
                      <div className="p-4 text-sm text-on-surface-variant">
                        No live alerts are active right now.
                      </div>
                    )}
                    {!isLoadingAlerts && liveAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer flex gap-3">
                        <div className={cn("mt-0.5 shrink-0", alert.type === 'error' ? 'text-error' : 'text-primary')}>
                          {alert.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">{alert.title}</h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{alert.desc}</p>
                        </div>
                      </div>
                    ))}
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
                {userInitials}
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-outline-variant/30">
                    <p className="text-sm font-bold text-on-surface">{user?.name ?? 'Operator'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
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
                        setShowProfileMenu(false);
                        logout();
                        toast('Signed out successfully.', 'info');
                        navigate('/login');
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
          <div className="md:hidden mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void refreshFleetSnapshot('manual')}
              disabled={isRefreshingFleet}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-outline-variant/50 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshingFleet && 'animate-spin')} />
              {isRefreshingFleet ? 'Refreshing...' : 'Refresh Live'}
            </button>
            {lastUpdatedLabel && (
              <span className="text-xs text-on-surface-variant">
                Last live data {lastUpdatedLabel}
              </span>
            )}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
