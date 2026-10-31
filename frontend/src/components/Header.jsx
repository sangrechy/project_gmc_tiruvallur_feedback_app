import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Megaphone, 
  MessageSquarePlus, 
  MessageCircle, 
  Vote, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Header({ currentRoute, setCurrentRoute, isDarkMode, setIsDarkMode, isAdminLoggedIn }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'polls', label: 'Polls', icon: Vote },
  ];

  const handleNavClick = (id) => {
    setCurrentRoute(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafc]/90 dark:bg-[#07090e]/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Institution Brand & Logo (Responsive for small phones) */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 sm:space-x-3.5 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 portal-card flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <span className="font-mono text-xs sm:text-base font-black tracking-tight">GMC</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-slate-100 font-sans truncate">
                  GMC THIRUVALLUR
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-sky-600 dark:text-sky-400 tracking-wider uppercase truncate">
                Student Council Portal
              </div>
            </div>
          </div>

          {/* Desktop Center Navigation (hidden on mobile/tablet) */}
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

          {/* Right Controls: Compact Mobile-Friendly Theme Switch + Council Login */}
          <div className="flex items-center space-x-2 sm:space-x-3.5 flex-shrink-0">
            
            {/* THEME TOGGLE (portfolio_2026 pattern, scaled cleanly for mobile) */}
            <div className="theme-toggle-container">
              <div 
                className="theme-jane-preview hidden sm:flex"
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
              aria-label="Council Administration Portal"
              className={`relative px-2.5 sm:px-3.5 py-1.5 sm:py-2 neu-button flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold rounded-xl transition-all group ${
                currentRoute.startsWith('admin')
                  ? 'border-sky-500 text-sky-500 bg-sky-500/10'
                  : 'text-slate-700 dark:text-slate-200 hover:text-sky-500'
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md overflow-hidden flex-shrink-0 filter drop-shadow(0 2px 4px rgba(0,0,0,0.3)) group-hover:scale-110 transition-transform">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security Clearance Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden md:inline font-mono font-bold tracking-tight">
                {isAdminLoggedIn ? "Council Dashboard" : "Council Auth"}
              </span>
              <span className="md:hidden font-mono text-[11px] font-bold">Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 neu-circle text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 space-y-2 border-t border-slate-200/60 dark:border-white/10 bg-[#f8fafc] dark:bg-[#07090e] shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[46px] ${
                  isActive
                    ? 'portal-button-primary'
                    : 'neu-button text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-sky-500" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            );
          })}

          {/* Dedicated Council Auth Link in Mobile Drawer */}
          <button
            onClick={() => handleNavClick(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all min-h-[46px] border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-2"
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-bold">{isAdminLoggedIn ? "Council Dashboard" : "Council Auth"}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}
    </header>
  );
}
