import React from 'react';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-slate-200/60 dark:border-white/10 bg-[#f8fafc]/80 dark:bg-[#07090e]/80 backdrop-blur-md pt-6 sm:pt-8 pb-28 md:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
        <div className="font-mono text-slate-500 dark:text-slate-400 text-center sm:text-left">
          © {new Date().getFullYear()} GMC Thiruvallur
        </div>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl neu-pressed bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/40 dark:border-slate-800">
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
          <span className="text-slate-400 dark:text-slate-600 font-light">•</span>
          <a 
            href="mailto:sangrechy@gmail.com?subject=GMC%20Thiruvallur%20Feedback%20Portal"
            className="font-medium text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 hover:underline flex items-center space-x-1 text-[11px] transition-colors"
            title="Send an email to developer"
          >
            <Mail className="w-3 h-3 inline text-sky-500" />
            <span>Contact Developer</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
