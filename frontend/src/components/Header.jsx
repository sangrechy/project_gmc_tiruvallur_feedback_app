import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Megaphone, 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  Calendar,
  ChevronRight
} from 'lucide-react';

export default function Header({ currentRoute, setCurrentRoute, isDarkMode, setIsDarkMode, isAdminLoggedIn }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'polls', label: 'Polls', icon: Vote },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  const handleNavClick = (id) => {
    setCurrentRoute(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafc]/85 dark:bg-[#07090e]/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Institution Brand & Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 portal-card flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform duration-200">
              <span className="font-mono text-base font-black tracking-tight">GMC</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                  GMC THIRUVALLUR
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 status-pulse-dot" />
                  Official
                </span>
              </div>
              <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 tracking-wider uppercase">
                Student Council Portal
              </div>
            </div>
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-200/50 dark:bg-[#141c2e]/80 border border-slate-300/40 dark:border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'portal-button-primary shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-inherit' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Switch (portfolio_2026 style) + Council Login */}
          <div className="flex items-center space-x-3.5">
            
            {/* THEME TOGGLE (Day / Night with Mascot Preview as in portfolio_2026) */}
            <div className="theme-toggle-container">
              <div 
                className="theme-jane-preview"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
                aria-hidden="true"
              >
                <img 
                  src={isDarkMode ? "/stickers/theme_dark.png" : "/stickers/theme_light.png"} 
                  alt="Theme Mascot Preview" 
                  id="theme-jane"
                  className="w-full h-full object-contain select-none"
                />
              </div>

              <button 
                id="theme-toggle-btn" 
                className="theme-pill-btn" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle light and dark theme"
                title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
              >
                <span className="pill-slider">
                  <span className="pill-icon">
                    {isDarkMode ? '🌙' : '☀️'}
                  </span>
                </span>
              </button>
            </div>

            {/* Council Admin Access with FBI Sticker */}
            <button
              onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className={`relative px-3.5 py-2 neu-button flex items-center space-x-2 text-xs font-semibold rounded-xl transition-all group ${
                currentRoute.startsWith('admin')
                  ? 'border-sky-500 text-sky-500 bg-sky-500/10'
                  : 'text-slate-700 dark:text-slate-200 hover:text-sky-500'
              }`}
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 -my-1 filter drop-shadow(0 2px 4px rgba(0,0,0,0.3)) group-hover:scale-110 transition-transform">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security Clearance Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden md:inline font-mono font-bold tracking-tight">
                {isAdminLoggedIn ? "Council Dashboard" : "Council Auth"}
              </span>
              <span className="md:hidden font-mono font-bold">Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2.5 neu-circle text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tablet Secondary Nav Bar */}
        <div className="hidden md:flex lg:hidden items-center justify-center space-x-2 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'portal-button-primary'
                    : 'neu-button text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 space-y-2 border-t border-slate-200/60 dark:border-white/10 bg-[#f8fafc] dark:bg-[#07090e] animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'portal-button-primary'
                    : 'neu-button text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-sky-500" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
