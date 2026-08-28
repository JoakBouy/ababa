import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Satellite,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  UserCircle,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  BarChart3,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  Radio
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useFleetSnapshot } from '../contexts/FleetSnapshotContext';
import { useAlerts } from '../contexts/AlertContext';
import { useToast } from '../contexts/ToastContext';
import StarlinkSetupModal from './StarlinkSetupModal';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    accounts,
    isLoading: isLoadingFleet,
    isRefreshing: isRefreshingFleet,
    lastUpdatedAt,
    refreshFleetSnapshot,
  } = useFleetSnapshot();
  const {
    alerts,
    unreadCount,
    activeBanner,
    soundEnabled,
    setSoundEnabled,
    acknowledgeBanner,
    markAllRead,
    dismissAlert,
    triggerSimulatedAlert,
  } = useAlerts();

  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showStarlinkSetup, setShowStarlinkSetup] = useState(false);
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'critical' | 'warning'>('all');

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

  const navItems = [
    { name: 'Command Center', path: '/', icon: LayoutDashboard },
    { name: 'Field Kits & Endpoints', path: '/terminals', icon: Satellite },
    { name: 'Field Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings & SLA', path: '/settings', icon: Settings },
  ];

  const userInitials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'GP';

  const lastUpdatedLabel = lastUpdatedAt
    ? new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
      }).format(lastUpdatedAt)
    : null;

  const filteredAlerts = alerts.filter((alert) => {
    if (activeAlertTab === 'critical') return alert.severity === 'critical';
    if (activeAlertTab === 'warning') return alert.severity === 'warning';
    return true;
  });

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
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-surface-container-lowest border-r border-outline-variant/30 text-on-surface flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none",
        showMobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 pb-3 flex justify-between items-center border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-headline font-black text-2xl tracking-tight text-primary">GPOC</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label font-bold uppercase">South Sudan</span>
            </div>
            <p className="text-[11px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Unity Oil Field Grid</p>
            <p className="text-[10px] font-body text-primary font-semibold mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Contracted by Ababa Group Ltd
            </p>
          </div>
          <button 
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full"
            onClick={() => setShowMobileMenu(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-label transition-all duration-200",
                isActive 
                  ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface font-medium"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}

          {/* Quick Demo Simulator Trigger */}
          <div className="pt-6">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-amber-500" />
                  Live Incident Demo
                </span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-tight">
                Trigger real-time kit telemetry fault with alarm sound and top banner.
              </p>
              <button
                type="button"
                onClick={() => {
                  triggerSimulatedAlert();
                  toast('Incident simulation triggered with alarm.', 'warning');
                }}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-label font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                Trigger Alarm Now
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 space-y-3 border-t border-outline-variant/30">
          <div className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">Contractor Status</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">99.8% SLA</span>
            </div>
            <p className="text-xs font-headline font-bold text-on-surface">Ababa Group Ltd</p>
            <p className="text-[10px] text-on-surface-variant">50 Kits • 24/7 Satellite NOC</p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 font-bold text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-label font-bold text-on-surface truncate">{user?.name ?? 'GPOC Operator'}</p>
              <p className="text-xs font-body text-on-surface-variant truncate">{user?.role ?? 'Unity Operations Manager'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top App Bar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation menu"
              className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-64 md:w-80 lg:w-96">
              <Search className="w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search Unity Oil Field kits (1-50)..." 
                className="bg-transparent border-none outline-none text-xs font-body w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Instant Demo Simulation Button */}
            <button
              type="button"
              onClick={() => {
                triggerSimulatedAlert();
                toast('Incident alert generated!', 'warning');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-label font-bold hover:bg-amber-500 hover:text-white transition-colors"
              title="Trigger Instant Kit Incident Alert"
            >
              <Zap className="w-3.5 h-3.5" />
              Simulate Alert
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast(soundEnabled ? 'Alarm audio muted.' : 'Alarm audio enabled.', 'info');
              }}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
              title={soundEnabled ? "Alarm Audio: Enabled (Click to Mute)" : "Alarm Audio: Muted (Click to Enable)"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-5 h-5 text-on-surface-variant/60" />}
            </button>

            <button
              type="button"
              onClick={() => void refreshFleetSnapshot('manual')}
              disabled={isRefreshingFleet}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-label font-medium text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshingFleet && 'animate-spin')} />
              {isRefreshingFleet ? 'Refreshing...' : 'Live Telemetry'}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                aria-label="Toggle notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markAllRead();
                }}
                className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[10px] font-bold bg-error text-on-error rounded-full border-2 border-surface-container-lowest animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[90vw] max-w-sm sm:w-96 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/80">
                    <div>
                      <h3 className="font-headline font-bold text-sm text-on-surface">Field Incidents & Telemetry Alerts</h3>
                      <p className="text-[10px] text-on-surface-variant">Live Starlink & SCADA fault monitoring</p>
                    </div>
                    <button
                      onClick={() => triggerSimulatedAlert()}
                      className="px-2 py-1 bg-primary text-on-primary text-[10px] font-label font-bold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Test Alert
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-outline-variant/20 px-3 pt-2 gap-1 bg-surface-container-low/30 text-xs font-label">
                    <button
                      onClick={() => setActiveAlertTab('all')}
                      className={cn("px-3 py-1.5 rounded-t-lg font-bold border-b-2 transition-colors", activeAlertTab === 'all' ? "border-primary text-primary bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface")}
                    >
                      All ({alerts.length})
                    </button>
                    <button
                      onClick={() => setActiveAlertTab('critical')}
                      className={cn("px-3 py-1.5 rounded-t-lg font-bold border-b-2 transition-colors", activeAlertTab === 'critical' ? "border-error text-error bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface")}
                    >
                      Critical ({alerts.filter(a => a.severity === 'critical').length})
                    </button>
                    <button
                      onClick={() => setActiveAlertTab('warning')}
                      className={cn("px-3 py-1.5 rounded-t-lg font-bold border-b-2 transition-colors", activeAlertTab === 'warning' ? "border-amber-500 text-amber-600 bg-surface-container-lowest" : "border-transparent text-on-surface-variant hover:text-on-surface")}
                    >
                      Warnings
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/10">
                    {filteredAlerts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-on-surface-variant">
                        No active alerts in this category.
                      </div>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(`/terminals/${encodeURIComponent(alert.kitId)}`);
                          }}
                          className={cn(
                            "p-3.5 hover:bg-surface-container/60 transition-colors cursor-pointer flex gap-3",
                            !alert.read && "bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 p-2 rounded-xl shrink-0 flex items-center justify-center h-8 w-8",
                            alert.severity === 'critical' ? 'bg-error/10 text-error' :
                              alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                                'bg-emerald-500/10 text-emerald-600'
                          )}>
                            {alert.severity === 'critical' ? <AlertOctagon className="w-4 h-4" /> :
                              alert.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-primary truncate">{alert.kitNumber}</span>
                              <span className="text-[10px] text-on-surface-variant shrink-0">
                                {new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(alert.timestamp)}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-on-surface truncate">{alert.title}</h4>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-tight">{alert.message}</p>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="text-[10px] font-mono text-on-surface-variant">{alert.location}</span>
                              <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
                                Inspect <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label font-bold text-xs cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              >
                {userInitials}
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-outline-variant/30">
                    <p className="text-sm font-bold text-on-surface">{user?.name ?? 'GPOC Operator'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email ?? 'operations@gpoc.co.ss'}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Account & SLA Settings
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

        {/* Floating Emergency Incident Banner with Sound Warning */}
        {activeBanner && (
          <div className={cn(
            "z-30 px-4 py-3 border-b shadow-xl transition-all duration-300 animate-in slide-in-from-top flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0",
            activeBanner.severity === 'critical'
              ? "bg-red-950/95 border-red-500/60 text-red-100 backdrop-blur-md"
              : activeBanner.severity === 'warning'
                ? "bg-amber-950/95 border-amber-500/60 text-amber-100 backdrop-blur-md"
                : "bg-emerald-950/95 border-emerald-500/60 text-emerald-100 backdrop-blur-md"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl shrink-0 animate-bounce",
                activeBanner.severity === 'critical' ? "bg-red-500 text-white" :
                  activeBanner.severity === 'warning' ? "bg-amber-500 text-white" :
                    "bg-emerald-500 text-white"
              )}>
                {activeBanner.severity === 'critical' ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-black/40 tracking-wider">
                    {activeBanner.severity.toUpperCase()} INCIDENT
                  </span>
                  <span className="font-headline font-bold text-sm">{activeBanner.kitNumber}</span>
                  <span className="text-xs opacity-80 font-mono">({activeBanner.location})</span>
                </div>
                <p className="text-xs mt-0.5 opacity-90">{activeBanner.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  acknowledgeBanner();
                  navigate(`/terminals/${encodeURIComponent(activeBanner.kitId)}`);
                }}
                className="px-3 py-1.5 bg-white text-black font-label font-bold text-xs rounded-lg hover:bg-white/90 transition-all shadow-md flex items-center gap-1"
              >
                Inspect Kit Telemetry
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={acknowledgeBanner}
                className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white font-label font-medium text-xs rounded-lg transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-surface p-3.5 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
