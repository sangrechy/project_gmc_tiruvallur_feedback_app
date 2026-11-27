import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />
  };

  return (
    <div className="fixed top-[max(env(safe-area-inset-top,0px),12px)] left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-[80] flex items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg font-mono text-xs text-slate-800 dark:text-slate-100 animate-slideDown">
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <span className="flex-shrink-0">{icons[type] || icons.info}</span>
        <span className="font-medium font-sans leading-snug break-words">{message}</span>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
