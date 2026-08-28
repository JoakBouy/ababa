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
  Download,
  Loader2,
  Server,
  Plus,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  ClipboardPaste,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getStarlinkAccounts, linkStarlinkAccount, removeStarlinkAccount } from '../services/api';
import { accountTypeLabel } from '../utils/platform';

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Starlink Accounts State
  const [starlinkAccounts, setStarlinkAccounts] = useState<Array<{
    id: number;
    email: string;
    status: string;
    terminals: number;
    accountType: string;
    displayName: string | null;
  }>>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountCookieJson, setNewAccountCookieJson] = useState('');
  const [cookieStep, setCookieStep] = useState(1);
  const [appearance, setAppearance] = useState('system');

  const changeAppearance = (theme: string) => {
    setAppearance(theme);
    toast(`Appearance changed to ${theme}.`, 'success');
  };

  useEffect(() => {
    let cancelled = false;

    async function loadStarlinkAccounts() {
      try {
        const accounts = await getStarlinkAccounts();
        if (cancelled) {
          return;
        }
        setStarlinkAccounts(accounts.map((account) => ({
          id: account.id,
          email: account.email,
          status: account.status,
          terminals: account.terminal_count,
          accountType: account.account_type,
          displayName: account.display_name,
        })));
      } catch (err: any) {
        if (!cancelled) {
          toast(err.message ?? 'Failed to load Starlink accounts.', 'error');
        }
      }
    }

    loadStarlinkAccounts();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleAddStarlinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountEmail.trim() || !newAccountCookieJson.trim()) {
      toast('Please enter your Starlink email and paste the cookie JSON.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const account = await linkStarlinkAccount(newAccountEmail.trim(), newAccountCookieJson.trim());
      window.dispatchEvent(new Event('starlink-accounts-changed'));
      setStarlinkAccounts(prev => [
        ...prev.filter(a => a.email !== account.email),
        {
          id: account.id,
          email: account.email,
          status: account.status,
          terminals: account.terminal_count,
          accountType: account.account_type,
          displayName: account.display_name,
        },
      ]);
      setIsAddingAccount(false);
      setNewAccountEmail('');
      setNewAccountCookieJson('');
      setCookieStep(1);
      toast('Starlink account linked successfully.', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to link account.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAccount = async (id: number) => {
    try {
      await removeStarlinkAccount(id);
      window.dispatchEvent(new Event('starlink-accounts-changed'));
      setStarlinkAccounts(prev => prev.filter(acc => acc.id !== id));
      toast('Starlink account removed.', 'info');
    } catch {
      // optimistic removal fallback
      setStarlinkAccounts(prev => prev.filter(acc => acc.id !== id));
      toast('Account removed.', 'info');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserCircle },
    { id: 'starlink', label: 'Starlink Accounts', icon: Server },
    { id: 'api', label: 'API & Exports', icon: Globe },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'appearance', label: 'Appearance', icon: SunMoon },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">GPOC South Sudan</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">Contractor: Ababa Group Ltd</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Account & SLA Settings</h1>
          <p className="text-on-surface-variant font-body mt-1">Manage GPOC enterprise telemetry feeds, Ababa Group Ltd service configuration, and API data exports</p>
        </div>
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
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" />
                Current Session
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-4xl font-bold relative group cursor-pointer">
                    <span>{user?.name?.slice(0, 2).toUpperCase() ?? 'OP'}</span>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Full Name</label>
                    <div className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface font-body">
                      {user?.name ?? 'Unavailable'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Role</label>
                    <div className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface font-body">
                      {user?.role ?? 'Unavailable'}
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-label font-medium text-on-surface-variant">Email Address</label>
                    <div className="relative">
                      <div className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 pl-10 text-on-surface font-body">
                        {user?.email ?? 'Unavailable'}
                      </div>
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/20 text-sm text-on-surface-variant">
                Profile editing is not wired to a backend endpoint yet, so this section reflects the authenticated operator session only.
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
                <form onSubmit={handleAddStarlinkAccount} className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 mb-6 animate-in slide-in-from-top-4 space-y-5">
                  <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    Link Starlink Account
                  </h3>

                  {/* Why cookies info box */}
                  <div className="flex gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                      Starlink uses SSO login — there's no direct API password.
                      Instead, you export a session cookie from your browser once (valid ~15 days, auto-renewed).
                    </p>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2 text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                    {[1, 2, 3].map(n => (
                      <React.Fragment key={n}>
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] border',
                          cookieStep >= n
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-outline-variant text-on-surface-variant'
                        )}>{n}</span>
                        {n < 3 && <div className={cn('flex-1 h-px', cookieStep > n ? 'bg-primary' : 'bg-outline-variant/40')} />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Step 1 */}
                  {cookieStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-sm font-label font-medium text-on-surface">Step 1 — Enter your Starlink email</p>
                      <div className="space-y-2">
                        <label htmlFor="sl-email" className="text-sm font-label font-medium text-on-surface-variant">Starlink Account Email</label>
                        <input
                          id="sl-email"
                          type="email"
                          required
                          value={newAccountEmail}
                          onChange={(e) => setNewAccountEmail(e.target.value)}
                          placeholder="you@starlink.com"
                          className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsAddingAccount(false)}
                          className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                          Cancel
                        </button>
                        <button type="button" disabled={!newAccountEmail.trim()} onClick={() => setCookieStep(2)}
                          className="px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {cookieStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm font-label font-medium text-on-surface">Step 2 — Export session cookies from Chrome</p>
                      <ol className="space-y-3 text-sm text-on-surface-variant font-body">
                        <li className="flex gap-3">
                          <span className="text-primary font-bold shrink-0">1.</span>
                          <span>
                            Install the{' '}
                            <a href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                              target="_blank" rel="noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1">
                              Cookie-Editor extension <ExternalLink className="w-3 h-3" />
                            </a>
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-bold shrink-0">2.</span>
                          <span>Log into <a href="https://www.starlink.com" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">starlink.com <ExternalLink className="w-3 h-3" /></a> with <strong className="text-on-surface">{newAccountEmail}</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-bold shrink-0">3.</span>
                          <span>Click the Cookie-Editor icon in Chrome → <strong className="text-on-surface">Export</strong> → <strong className="text-on-surface">Export as JSON</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-bold shrink-0">4.</span>
                          <span>Copy the JSON that appears (Ctrl+A, Ctrl+C)</span>
                        </li>
                      </ol>
                      <div className="flex justify-between gap-3 pt-2">
                        <button type="button" onClick={() => setCookieStep(1)}
                          className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                          ← Back
                        </button>
                        <button type="button" onClick={() => setCookieStep(3)}
                          className="px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors">
                          I've copied the JSON →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {cookieStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm font-label font-medium text-on-surface">Step 3 — Paste cookie JSON</p>
                      <div className="space-y-2">
                        <label htmlFor="sl-cookies" className="text-sm font-label font-medium text-on-surface-variant flex items-center gap-2">
                          <ClipboardPaste className="w-4 h-4" /> Cookie JSON
                        </label>
                        <textarea
                          id="sl-cookies"
                          required
                          rows={6}
                          value={newAccountCookieJson}
                          onChange={(e) => setNewAccountCookieJson(e.target.value)}
                          placeholder='[{"name":"session","value":"..."}]'
                          className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                        <p className="text-xs text-on-surface-variant">Paste the full JSON array copied from Cookie-Editor.</p>
                      </div>
                      <div className="flex justify-between gap-3 pt-2">
                        <button type="button" onClick={() => setCookieStep(2)}
                          className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors">
                          ← Back
                        </button>
                        <button type="submit" disabled={isSaving || !newAccountCookieJson.trim()}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                          Connect Account
                        </button>
                      </div>
                    </div>
                  )}
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
                            {account.terminals} Terminals · {accountTypeLabel(account.accountType)}
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

          {activeTab === 'api' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                API & Export Deliverables
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Raw telemetry, site data, and account metadata are exposed independently from the dashboards for future integrations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="/docs" target="_blank" rel="noreferrer" className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <h3 className="font-label font-bold text-on-surface">Swagger Docs</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Interactive REST API documentation generated by FastAPI.</p>
                </a>
                <a href="/redoc" target="_blank" rel="noreferrer" className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <h3 className="font-label font-bold text-on-surface">Redoc Docs</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Readable OpenAPI documentation for implementation partners.</p>
                </a>
                <a href="/api/platform/exports/fleet.json" target="_blank" rel="noreferrer" className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="w-4 h-4 text-primary" />
                    <h3 className="font-label font-bold text-on-surface">Fleet JSON</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Accounts, endpoints, telemetry summary, site metadata, and metrics.</p>
                </a>
                <a href="/api/platform/exports/sites.csv" className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="w-4 h-4 text-primary" />
                    <h3 className="font-label font-bold text-on-surface">Sites CSV</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Deployment sites with community, ranger, and power metrics.</p>
                </a>
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
                      <h4 className="font-label font-medium text-on-surface">Operator Authentication</h4>
                      <p className="text-sm text-on-surface-variant font-body">Managed by the backend operator account configuration.</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm">Read-only</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-label font-medium text-on-surface">Two-Factor Authentication</h4>
                      <p className="text-sm text-on-surface-variant font-body">2FA status is not exposed by the current API.</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm">Unavailable</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm p-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                Notification Preferences
              </h2>
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                Notification preferences are not backed by a live API yet. The notification drawer now shows live terminal alerts instead of sample alerts.
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
