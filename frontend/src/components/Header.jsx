import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldAlert, 
  Home, 
  Megaphone, 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Calendar,
  Lock
} from 'lucide-react';

export default function Header({ currentRoute, setCurrentRoute, isDarkMode, setIsDarkMode, isAdminLoggedIn }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
    { id: 'feedback', label: 'FEEDBACK', icon: MessageSquarePlus },
    { id: 'chat', label: 'CHAT', icon: MessageCircle },
    { id: 'polls', label: 'POLLS', icon: Vote },
    { id: 'events', label: 'EVENTS', icon: Calendar },
  ];

  const handleNavClick = (id) => {
    setCurrentRoute(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg font-mono">GMC</span>
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                GMC THIRUVALLUR
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mt-0.5">
                STUDENT COUNCIL PORTAL
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle Button [THEME] */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1 text-xs font-mono font-medium"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span className="hidden sm:inline">[THEME]</span>
            </button>

            {/* Council Admin Access Button */}
            <button
              onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
                currentRoute.startsWith('admin')
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isAdminLoggedIn ? "COUNCIL DASHBOARD" : "COUNCIL LOGIN"}</span>
              <span className="md:hidden">COUNCIL</span>
            </button>

            {/* Mobile Hamburger [≡] */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 py-2 border-t border-slate-100 dark:border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
