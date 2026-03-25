import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  BellRing, 
  SunMoon, 
  Key,
  Smartphone,
  Mail,
  Globe,
  CheckCircle2,
  Loader2,
  Server,
  Plus,
  Trash2,
  Link as LinkIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile State
  const [accountData, setAccountData] = useState({
    fullName: '',
    jobTitle: '',
    email: ''
  });

  // Starlink Accounts State
  const [starlinkAccounts, setStarlinkAccounts] = useState([
    { id: 1, email: 'admin@enjojofoundation.org', status: 'Active', terminals: 4 },
    { id: 2, email: 'kenya.ops@enjojofoundation.org', status: 'Active', terminals: 2 },
    { id: 3, email: 'rwanda.ops@enjojofoundation.org', status: 'Active', terminals: 1 },
  ]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [notifications, setNotifications] = useState({ offlineAlerts: true, weeklyReports: false });
  const [appearance, setAppearance] = useState('system');

  const handleUpdatePassword = () => {
    alert('Password update modal would open here.');
  };

  const handleManage2FA = () => {
    alert('2FA management modal would open here.');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    alert(`${key === 'offlineAlerts' ? 'Terminal Offline Alerts' : 'Weekly Reports'} ${!notifications[key] ? 'enabled' : 'disabled'}.`);
  };

  const changeAppearance = (theme: string) => {
    setAppearance(theme);
    alert(`Appearance changed to ${theme}.`);
  };

  const handleRemovePhoto = () => {
    alert('Profile photo removed.');
  };

  useEffect(() => {
    // Simulate Get Account Data API
    const timer = setTimeout(() => {
      setAccountData({
        fullName: 'Admin User',
        jobTitle: 'Fleet Manager',
        email: 'admin@enjojofoundation.org'
      });
      setIsFetching(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate Save Account Data API
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile data saved successfully.');
    }, 1500);
  };

  const handleAddStarlinkAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate linking a new Starlink account via API
    setTimeout(() => {
      setStarlinkAccounts([...starlinkAccounts, { 
        id: Date.now(), 
        email: newAccountEmail, 
        status: 'Active', 
        terminals: 0 
      }]);
      setIsAddingAccount(false);
      setNewAccountEmail('');
      setNewAccountPassword('');
      setIsSaving(false);
      alert('Starlink account linked successfully.');
    }, 1500);
  };

  const handleRemoveAccount = (id: number) => {
    if (window.confirm('Are you sure you want to remove this Starlink account? You will lose access to manage its terminals.')) {
      setStarlinkAccounts(starlinkAccounts.filter(acc => acc.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserCircle },
    { id: 'starlink', label: 'Starlink Accounts', icon: Server },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'appearance', label: 'Appearance', icon: SunMoon },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Account Settings</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage your profile, connected accounts, and preferences</p>
        </div>
        {activeTab === 'profile' && (
          <button 
            onClick={handleSaveProfile}
            disabled={isFetching || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Navigation (Sidebar for Settings) */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label font-medium transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-surface-container-high text-on-surface" 
                  : "hover:bg-surface-container text-on-surface-variant"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-primary" : "")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 relative overflow-hidden animate-in fade-in duration-300">
              {isFetching && (
                <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="font-label font-medium">Loading Account Data...</span>
                  </div>
                </div>
              )}
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" />
                Profile Details
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-4xl font-bold relative group cursor-pointer">
                    <span>{accountData.fullName ? accountData.fullName.substring(0, 2).toUpperCase() : 'AU'}</span>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  </div>
                  <button onClick={handleRemovePhoto} className="text-sm font-label font-medium text-primary hover:underline">Remove Photo</button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={accountData.fullName}
                      onChange={handleChange}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Job Title</label>
                    <input 
                      type="text" 
                      name="jobTitle"
                      value={accountData.jobTitle}
                      onChange={handleChange}
                      className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        value={accountData.email}
                        onChange={handleChange}
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
          )}

          {/* Starlink Accounts Tab */}
          {activeTab === 'starlink' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    Starlink Accounts
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">Manage authentication credentials for your Starlink fleets.</p>
                </div>
                {!isAddingAccount && (
                  <button 
                    onClick={() => setIsAddingAccount(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label font-medium hover:bg-primary-container/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Link Account
                  </button>
                )}
              </div>

              {isAddingAccount && (
                <form onSubmit={handleAddStarlinkAccount} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 mb-6 animate-in slide-in-from-top-4">
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    Link New Starlink Account
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-label font-medium text-on-surface-variant">Starlink Email</label>
                      <input 
                        type="email" 
                        required
                        value={newAccountEmail}
                        onChange={(e) => setNewAccountEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-label font-medium text-on-surface-variant">Password / API Token</label>
                      <input 
                        type="password" 
                        required
                        value={newAccountPassword}
                        onChange={(e) => setNewAccountPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Connect Account
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {starlinkAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-label font-medium text-on-surface">{account.email}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-tertiary-fixed-dim font-body flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {account.status}
                          </span>
                          <span className="text-xs text-on-surface-variant font-body">
                            {account.terminals} Terminals Linked
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveAccount(account.id)}
                      className="p-2 text-error hover:bg-error-container hover:text-on-error-container rounded-full transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {starlinkAccounts.length === 0 && (
                  <div className="text-center py-8 text-on-surface-variant font-body">
                    No Starlink accounts linked yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab (Placeholder) */}
          {activeTab === 'security' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
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
                  <button onClick={handleUpdatePassword} className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
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
                  <button onClick={handleManage2FA} className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab (Placeholder) */}
          {activeTab === 'notifications' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                  <div>
                    <h4 className="font-label font-medium text-on-surface">Terminal Offline Alerts</h4>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Get notified immediately when a terminal drops offline.</p>
                  </div>
                  <div onClick={() => toggleNotification('offlineAlerts')} className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", notifications.offlineAlerts ? "bg-primary" : "bg-outline-variant/50")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", notifications.offlineAlerts ? "left-5" : "left-1")}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                  <div>
                    <h4 className="font-label font-medium text-on-surface">Weekly Reports</h4>
                    <p className="text-sm text-on-surface-variant font-body mt-1">Receive a weekly summary of fleet performance.</p>
                  </div>
                  <div onClick={() => toggleNotification('weeklyReports')} className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", notifications.weeklyReports ? "bg-primary" : "bg-outline-variant/50")}>
                    <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", notifications.weeklyReports ? "left-5" : "left-1")}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab (Placeholder) */}
          {activeTab === 'appearance' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <SunMoon className="w-5 h-5 text-primary" />
                Appearance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div onClick={() => changeAppearance('system')} className={cn("rounded-2xl p-4 cursor-pointer transition-colors", appearance === 'system' ? "border-2 border-primary" : "border border-outline-variant/30 hover:border-outline-variant")}>
                  <div className="h-24 bg-surface-container rounded-xl mb-3 flex items-center justify-center">
                    <SunMoon className="w-8 h-8 text-on-surface-variant" />
                  </div>
                  <p className="text-center font-label font-medium text-on-surface">System Default</p>
                </div>
                <div onClick={() => changeAppearance('light')} className={cn("rounded-2xl p-4 cursor-pointer transition-colors", appearance === 'light' ? "border-2 border-primary" : "border border-outline-variant/30 hover:border-outline-variant")}>
                  <div className="h-24 bg-white rounded-xl mb-3 flex items-center justify-center border border-gray-200">
                    <SunMoon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-center font-label font-medium text-on-surface-variant">Light</p>
                </div>
                <div onClick={() => changeAppearance('dark')} className={cn("rounded-2xl p-4 cursor-pointer transition-colors", appearance === 'dark' ? "border-2 border-primary" : "border border-outline-variant/30 hover:border-outline-variant")}>
                  <div className="h-24 bg-[#1a1a1a] rounded-xl mb-3 flex items-center justify-center">
                    <SunMoon className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-center font-label font-medium text-on-surface-variant">Dark</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
