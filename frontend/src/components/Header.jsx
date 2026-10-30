import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Home, 
  Megaphone, 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Calendar,
  Lock,
  Shield
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
    <header className="sticky top-0 z-50 bg-[#e6edf8]/90 dark:bg-[#0c1427]/90 backdrop-blur-md transition-colors duration-300">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding with Neumorphic Circle */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 neu-circle flex items-center justify-center text-sky-600 dark:text-sky-400 font-mono font-bold text-lg group-hover:scale-105 transition-all">
              <span className="tracking-tighter">GMC</span>
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                GMC THIRUVALLUR
              </div>
              <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 tracking-wider uppercase mt-1">
                STUDENT COUNCIL PORTAL
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle Button using theme.png */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className="p-1.5 sm:px-3 sm:py-1.5 neu-button flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-all group"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-800 shadow-inner">
                <img 
                  src="/stickers/theme.png" 
                  alt="Theme Switcher" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
                <span className="text-[11px] tracking-wider">[THEME]</span>
              </div>
            </button>

            {/* Council Admin Access with FBI Sticker */}
            <button
              onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className={`px-3 py-1.5 neu-button flex items-center space-x-2 text-xs font-mono font-bold transition-all ${
                currentRoute.startsWith('admin')
                  ? 'neu-pressed text-sky-500'
                  : 'text-slate-700 dark:text-slate-200 hover:text-sky-500'
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden md:inline">
                {isAdminLoggedIn ? "COUNCIL DASHBOARD" : "COUNCIL LOGIN"}
              </span>
              <span className="md:hidden">COUNCIL</span>
            </button>

            {/* Mobile Hamburger [≡] */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2.5 neu-circle text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Neumorphic Navigation Bar */}
        <nav className="hidden md:flex items-center justify-center space-x-3 py-2 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all font-mono ${
                  isActive
                    ? 'neu-pressed text-sky-600 dark:text-sky-400'
                    : 'neu-button text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-2 animate-fadeIn bg-[#e6edf8] dark:bg-[#0c1427]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-mono font-bold tracking-wide transition-all ${
                  isActive
                    ? 'neu-pressed text-sky-600 dark:text-sky-400'
                    : 'neu-button text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 text-sky-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
