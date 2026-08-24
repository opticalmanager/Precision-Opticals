import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />;
        let borderClass = 'border-stone-800';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-[#C85A1B] shrink-0 mt-0.5" />;
          borderClass = 'border-[#C85A1B]';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
          borderClass = 'border-rose-500';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
          borderClass = 'border-amber-500';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#1C1917] text-white p-4 shadow-2xl border-l-4 ${borderClass} flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div className="space-y-0.5">
                <h5 className="font-serif text-xs font-bold tracking-wider uppercase text-amber-100">
                  {toast.title}
                </h5>
                {toast.message && (
                  <p className="text-stone-300 text-xs font-sans leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white p-0.5 transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
