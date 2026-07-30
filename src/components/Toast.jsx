import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0" />,
    error: <XCircle className="w-5 h-5 text-[#ef4444] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#adc6ff] shrink-0" />,
  };

  const borders = {
    success: 'border-[#4edea3]/40 shadow-[#4edea3]/10',
    warning: 'border-[#f59e0b]/40 shadow-[#f59e0b]/10',
    error: 'border-[#ef4444]/40 shadow-[#ef4444]/10',
    info: 'border-[#adc6ff]/40 shadow-[#adc6ff]/10',
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-md w-full animate-bounce-in">
      <div className={`glass-panel p-4 rounded-xl border ${borders[toast.type || 'info']} shadow-2xl flex items-start gap-3 text-slate-100`}>
        {icons[toast.type || 'info']}
        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-slate-100">{toast.title}</h4>
          {toast.message && <p className="text-slate-300 text-xs mt-0.5">{toast.message}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
