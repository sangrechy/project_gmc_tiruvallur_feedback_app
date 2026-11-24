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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[80] max-w-[92vw] sm:max-w-md flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl font-mono text-xs text-slate-800 dark:text-slate-100 animate-slideDown">
      {icons[type] || icons.info}
      <span className="font-medium font-sans">{message}</span>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
