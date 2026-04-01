import React, { useEffect, useState } from 'react';
import {
  ClipboardPaste,
  ExternalLink,
  Info,
  Link as LinkIcon,
  Loader2,
  Server,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { linkStarlinkAccount, type StarlinkAccount } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface StarlinkSetupModalProps {
  open: boolean;
  onClose: () => void;
  onLinked?: (account: StarlinkAccount) => void;
  defaultEmail?: string;
  dismissible?: boolean;
}

export default function StarlinkSetupModal({
  open,
  onClose,
  onLinked,
  defaultEmail = '',
  dismissible = true,
}: StarlinkSetupModalProps) {
  const { toast } = useToast();
  const [cookieStep, setCookieStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState(defaultEmail);
  const [newAccountCookieJson, setNewAccountCookieJson] = useState('');

  useEffect(() => {
    if (open) {
      setNewAccountEmail((current) => current || defaultEmail);
    }
  }, [defaultEmail, open]);

  if (!open) {
    return null;
  }

  const resetForm = () => {
    setCookieStep(1);
    setNewAccountCookieJson('');
  };

  const handleClose = () => {
    if (!dismissible) {
      return;
    }
    resetForm();
    onClose();
  };

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
      onLinked?.(account);
      resetForm();
      toast('Starlink account linked successfully.', 'success');
      onClose();
    } catch (err: any) {
      toast(err.message ?? 'Failed to link account.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex items-start justify-between gap-4 bg-surface-container-low/40">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              Link Starlink Account
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Remote mode needs a valid Starlink browser session so the backend can load your real fleet.
            </p>
          </div>
          {dismissible && (
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
              aria-label="Close setup modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleAddStarlinkAccount} className="p-6 space-y-5">
          <div className="flex gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-on-surface-variant leading-relaxed">
              Use cookies from <span className="font-bold text-on-surface">starlink.com</span>. If your export includes other third-party cookies too, that is usually fine as long as the Starlink session cookies are present.
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] border',
                    cookieStep >= n
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-on-surface-variant',
                  )}
                >
                  {n}
                </span>
                {n < 3 && <div className={cn('flex-1 h-px', cookieStep > n ? 'bg-primary' : 'bg-outline-variant/40')} />}
              </React.Fragment>
            ))}
          </div>

          {cookieStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-label font-medium text-on-surface">Step 1 — Enter your Starlink email</p>
              <div className="space-y-2">
                <label htmlFor="sl-email-modal" className="text-sm font-label font-medium text-on-surface-variant">
                  Starlink Account Email
                </label>
                <input
                  id="sl-email-modal"
                  type="email"
                  required
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  placeholder="you@starlink.com"
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-body"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {dismissible && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors"
                  >
                    Not Now
                  </button>
                )}
                <button
                  type="button"
                  disabled={!newAccountEmail.trim()}
                  onClick={() => setCookieStep(2)}
                  className="px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {cookieStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-label font-medium text-on-surface">Step 2 — Export cookies from starlink.com</p>
              <ol className="space-y-3 text-sm text-on-surface-variant font-body">
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">1.</span>
                  <span>
                    Install the{' '}
                    <a
                      href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Cookie-Editor extension <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">2.</span>
                  <span>
                    Log into{' '}
                    <a
                      href="https://www.starlink.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      starlink.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    with <strong className="text-on-surface">{newAccountEmail}</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">3.</span>
                  <span>Click the Cookie-Editor icon, then choose <strong className="text-on-surface">Export</strong> and <strong className="text-on-surface">Export as JSON</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold shrink-0">4.</span>
                  <span>Copy the full JSON and return here to paste it.</span>
                </li>
              </ol>
              <div className="flex justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCookieStep(1)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCookieStep(3)}
                  className="px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors"
                >
                  I&apos;ve copied it
                </button>
              </div>
            </div>
          )}

          {cookieStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-label font-medium text-on-surface">Step 3 — Paste cookie JSON</p>
              <div className="space-y-2">
                <label htmlFor="sl-cookies-modal" className="text-sm font-label font-medium text-on-surface-variant flex items-center gap-2">
                  <ClipboardPaste className="w-4 h-4" />
                  Cookie JSON
                </label>
                <textarea
                  id="sl-cookies-modal"
                  required
                  rows={8}
                  value={newAccountCookieJson}
                  onChange={(e) => setNewAccountCookieJson(e.target.value)}
                  placeholder='[{"name":"session","value":"..."}]'
                  className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-on-surface-variant">
                  Paste the full JSON array exported from Cookie-Editor while logged into starlink.com.
                </p>
                <p className="text-xs text-on-surface-variant">
                  If you see an XSRF-token error, the export usually came from the wrong site or from a session that was not fully logged into Starlink.
                </p>
              </div>
              <div className="flex justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCookieStep(2)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface font-label font-medium hover:bg-surface-container transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !newAccountCookieJson.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary font-label font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                  Connect Account
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
