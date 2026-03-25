import React from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  BellRing, 
  SunMoon, 
  Key,
  Smartphone,
  Mail,
  Globe,
  CheckCircle2
} from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Account Settings</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage your profile, security, and preferences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation (Sidebar for Settings) */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-high text-on-surface font-label font-medium transition-colors text-left">
            <UserCircle className="w-5 h-5 text-primary" />
            Profile Information
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-label font-medium transition-colors text-left">
            <ShieldCheck className="w-5 h-5" />
            Security & Authentication
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-label font-medium transition-colors text-left">
            <BellRing className="w-5 h-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant font-label font-medium transition-colors text-left">
            <SunMoon className="w-5 h-5" />
            Appearance
          </button>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Section */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Profile Details
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-4xl font-bold relative group cursor-pointer">
                  <span>AU</span>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </div>
                <button className="text-sm font-label font-medium text-primary hover:underline">Remove Photo</button>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-label font-medium text-on-surface-variant">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="Admin User"
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-label font-medium text-on-surface-variant">Job Title</label>
                  <input 
                    type="text" 
                    defaultValue="Fleet Manager"
                    className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-label font-medium text-on-surface-variant">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      defaultValue="admin@enjojofoundation.org"
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 pl-10 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/20">
              <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Regional Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-label font-medium text-on-surface-variant">Timezone</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 pl-10 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body appearance-none">
                      <option>(UTC+03:00) East Africa Time</option>
                      <option>(UTC+00:00) Coordinated Universal Time</option>
                      <option>(UTC-08:00) Pacific Time</option>
                    </select>
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-label font-medium text-on-surface-variant">Language</label>
                  <select className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body appearance-none">
                    <option>English (US)</option>
                    <option>French</option>
                    <option>Swahili</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Snapshot */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Security Snapshot
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-label font-medium text-on-surface">Password</h4>
                    <p className="text-sm text-on-surface-variant font-body">Last changed 45 days ago</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                  Update
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-label font-medium text-on-surface">Two-Factor Authentication</h4>
                    <p className="text-sm text-tertiary-fixed-dim font-body flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enabled (Authenticator App)
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
