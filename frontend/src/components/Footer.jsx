import React from 'react';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer({ setCurrentRoute, isAdminLoggedIn }) {
  return (
    <footer className="mt-20 border-t border-slate-200/60 dark:border-white/10 bg-[#f8fafc]/80 dark:bg-[#07090e]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Main Footer Row */}
        <div className="portal-card p-4 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          
          {/* Council Info & Brand */}
          <div className="text-center md:text-left flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 neu-card flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 font-mono text-base flex-shrink-0">
              GMC
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base tracking-tight font-sans">
                GMC THIRUVALLUR STUDENT COUNCIL
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Campus Representation • Student Welfare
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold">
            <button 
              onClick={() => setCurrentRoute('home')}
              className="px-3.5 py-2 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentRoute('announcements')}
              className="px-3.5 py-2 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Announcements
            </button>
            <button 
              onClick={() => setCurrentRoute('feedback')}
              className="px-3.5 py-2 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Feedback
            </button>
            <button 
              onClick={() => setCurrentRoute('chat')}
              className="px-3.5 py-2 neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500 transition-colors"
            >
              Live Chat
            </button>
            <button 
              onClick={() => setCurrentRoute(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className="px-3.5 py-2 neu-button text-sky-600 dark:text-sky-400 font-bold transition-colors"
            >
              {isAdminLoggedIn ? 'Council Dashboard' : 'Council Login'}
            </button>
          </div>

          {/* Developer Credit & Copyright */}
          <div className="text-center md:text-right text-xs font-sans space-y-2">
            <div className="font-mono text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} GMC Thiruvallur
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl neu-pressed bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/40 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Developed by</span>
              <a 
                href="https://github.com/sangrechy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 text-[11px]"
              >
                <span>sangrechy</span>
                <Github className="w-3 h-3 ml-0.5 inline" />
              </a>
            </div>
          </div>
        </div>

        {/* Confidentiality & Institutional Guarantee Strip */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3 border-t border-slate-300/30 dark:border-slate-800/50">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Direct, Democratic &amp; Confidential Campus Voice</span>
          </div>
          <div className="flex items-center space-x-3 font-mono">
            <button 
              onClick={() => setCurrentRoute(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className="text-slate-500 hover:text-sky-500 underline transition-colors cursor-pointer"
            >
              Council Admin Portal
            </button>
            <span className="text-slate-400">
              GMC Thiruvallur, Tamil Nadu
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
