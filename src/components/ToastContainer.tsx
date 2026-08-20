import React, { useEffect } from 'react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { playSound } from '../services/sound';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onRemove,
}) => {
  const handleClose = (id: string) => {
    playSound('click');
    if (onDismiss) onDismiss(id);
    if (onRemove) onRemove(id);
  };

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      const duration = toast.duration || 3500;
      return setTimeout(() => {
        if (onDismiss) onDismiss(toast.id);
        if (onRemove) onRemove(toast.id);
      }, duration);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, onDismiss, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 sm:bottom-6 sm:top-auto sm:right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0 animate-in fade-in duration-200">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900 border-slate-700 text-white shadow-xl';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50 shadow-lg';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-950/50 shadow-lg';
          icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/50 shadow-lg';
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else {
          bgClass = 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/50 shadow-lg';
          icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            onClick={() => handleClose(toast.id)}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 cursor-pointer hover:scale-[1.02] ${bgClass}`}
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              {icon}
              <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                {toast.title && <div className="font-bold text-xs uppercase tracking-wide opacity-90 mb-0.5">{toast.title}</div>}
                <div>{toast.message}</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose(toast.id);
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors p-1.5 rounded-xl shrink-0"
              aria-label="Закрыть уведомление"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
