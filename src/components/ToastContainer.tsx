import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../contexts/ToastContext';
import { cn } from '../utils/cn';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-[#00875A] shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-error shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info:    <Info className="w-5 h-5 text-primary shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: 'border-[#00875A]/30 bg-[#00875A]/5',
  error:   'border-error/30 bg-error/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  info:    'border-primary/30 bg-primary/5',
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto',
            'animate-in slide-in-from-bottom-4 fade-in duration-200',
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm font-body text-on-surface">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="p-0.5 text-on-surface-variant hover:text-on-surface rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
