import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ setCurrentRoute }) {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Council Info */}
          <div className="text-center md:text-left">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight font-mono">
              GMC STUDENT COUNCIL
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your Voice. Your Campus. Your Council.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button 
              onClick={() => setCurrentRoute('home')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              About
            </button>
            <span>•</span>
            <button 
              onClick={() => setCurrentRoute('chat')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Contact Council
            </button>
            <span>•</span>
            <button 
              onClick={() => setCurrentRoute('feedback')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => setCurrentRoute('admin-login')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
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
