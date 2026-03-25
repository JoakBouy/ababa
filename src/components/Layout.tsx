import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Satellite, 
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
    { name: 'Terminals', path: '/terminals', icon: Satellite },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant/30 text-on-surface">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-headline font-bold text-xl tracking-tight text-primary">Enjojo</span>
          </div>
          <p className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest">Global Ops - East Africa</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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
            onClick={() => navigate('/terminals?add=true')}
            className="w-full bg-on-surface text-surface py-3 rounded-md font-label font-bold text-xs tracking-widest uppercase hover:bg-on-surface/90 transition-colors shadow-sm"
          >
            Add Terminal
          </button>
          
          <div className="pt-4 border-t border-outline-variant/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
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
            <button className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
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
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label font-bold text-sm cursor-pointer">
              AR
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
