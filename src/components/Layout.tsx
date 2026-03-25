import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Satellite, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  Search,
  Bell,
  UserCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Terminals', path: '/terminals', icon: Satellite },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 ion-drive-gradient text-white">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Satellite className="w-5 h-5 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">ENJOJO</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-white/10 text-white font-medium" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-label text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-label text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Bar */}
        <header className="h-20 glass-panel border-b border-outline-variant/30 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-full border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-96">
              <Search className="w-5 h-5 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search terminals, alerts..." 
                className="bg-transparent border-none outline-none text-sm font-body w-full text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            <div className="h-8 w-px bg-outline-variant/30 mx-1"></div>
            <button className="flex items-center gap-3 p-1.5 hover:bg-surface-container rounded-full transition-colors pl-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-on-surface">Admin User</p>
                <p className="text-xs text-on-surface-variant">Fleet Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                <UserCircle className="w-6 h-6" />
              </div>
            </button>
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
