import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer({ setCurrentRoute }) {
  return (
    <footer className="mt-16 py-10 transition-colors bg-[#e6edf8] dark:bg-[#0c1427]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="portal-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Council Info */}
          <div className="text-center md:text-left flex items-center space-x-3">
            <div className="w-10 h-10 neu-circle flex items-center justify-center font-mono font-bold text-sky-600 dark:text-sky-400">
              GMC
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base tracking-tight font-mono">
                GMC STUDENT COUNCIL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your Voice. Your Campus. Your Council.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono font-medium">
            <button 
              onClick={() => setCurrentRoute('home')}
              className="px-3 py-1.5 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setCurrentRoute('chat')}
              className="px-3 py-1.5 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Contact Council
            </button>
            <button 
              onClick={() => setCurrentRoute('feedback')}
              className="px-3 py-1.5 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setCurrentRoute('admin-login')}
              className="px-3 py-1.5 neu-button text-sky-600 dark:text-sky-400 font-bold transition-colors"
            >
              Admin Portal
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div>© {new Date().getFullYear()} GMC Thiruvallur</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Government Medical College & Hospital, Thiruvallur
            </div>
          </div>
        </div>

        {/* Confidentiality Guarantee Bar */}
        <div className="mt-6 pt-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Strict Zero-Trace Anonymous Submissions • 24h Ephemeral Live Chat Relayed</span>
          </div>
          <div>
            Built with care for 500+ GMC Medical Students
          </div>
        </div>
      </div>
    </footer>
  );
}
