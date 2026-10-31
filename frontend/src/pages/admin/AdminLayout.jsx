import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity,
  MessageSquare, 
  MessageCircle, 
  Megaphone, 
  Vote, 
  Calendar, 
  BarChart3, 
  Users, 
  LogOut, 
  ArrowLeft,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ 
  currentSection, 
  setCurrentSection, 
  onLogout, 
  setCurrentRoute, 
  adminUser,
  unreadCount,
  activeChatsCount,
  children 
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  // 4 + Essential Core Menus (Home, Feedback Review, Announcements, Live Chat, Polls, App Status)
  const primaryMenuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback Review', icon: MessageSquare, badge: unreadCount },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, badge: activeChatsCount },
    { id: 'polls', label: 'Polls & Ballots', icon: Vote },
    { id: 'status', label: 'App Status', icon: Activity },
  ];

  // Secondary Tools (Available without cluttering main flow)
  const secondaryMenuItems = [
    { id: 'events', label: 'Events & CME', icon: Calendar },
    { id: 'reports', label: 'AI Summary Reports', icon: BarChart3 },
    { id: 'management', label: 'Council Settings', icon: Users },
  ];

  const handleSelectSection = (id) => {
    setCurrentSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] flex flex-col font-sans transition-colors duration-300 bg-grid-pattern">
      {/* Admin Top Header with FBI security sticker */}
      <header className="bg-[#f8fafc]/90 dark:bg-[#07090e]/90 sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 text-xs">
          
          {/* Brand & Council Identifier */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 neu-circle text-slate-700 dark:text-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => handleSelectSection('dashboard')}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 neu-card p-1 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-slate-100 font-sans block leading-tight">
                  Council Admin
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  GMC Thiruvallur
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions: App Status + Public Site + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => handleSelectSection('status')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
              title="Click to view App Status & Diagnostics"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="font-bold hidden sm:inline">App Status</span>
            </button>

            <button
              onClick={() => setCurrentRoute('home')}
              className="px-2.5 sm:px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors hidden sm:flex items-center space-x-1"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student View</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 neu-button font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors rounded-xl"
              title="Sign out of Council Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Mobile Top Quick-Tab Strip (Fast 1-thumb switching between core pages) */}
      <div className="lg:hidden bg-[#f8fafc]/95 dark:bg-[#07090e]/95 sticky top-16 z-30 px-3 py-2 border-b border-slate-200/60 dark:border-white/10 overflow-x-auto scrollbar-none flex items-center space-x-2">
        {primaryMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectSection(item.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'portal-button-primary shadow-sm'
                  : 'neu-button text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-sky-500" />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-500 text-white font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
        
        {/* Left Sidebar Navigation (Desktop & Mobile Drawer) */}
        <aside
          className={`lg:w-64 flex-shrink-0 portal-card p-4 h-fit ${
            mobileNavOpen ? 'block fixed inset-x-4 top-24 z-50 shadow-2xl max-h-[80vh] overflow-y-auto' : 'hidden lg:block'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Council Menu
          </div>

          {/* Primary Core Menu Items */}
          <nav className="space-y-1.5">
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'portal-button-primary shadow-sm'
                      : 'neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-sky-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapsible Secondary Tools */}
          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
            <button
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span>More Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
            </button>

            {showMoreTools && (
              <div className="space-y-1.5 mt-2 animate-fadeIn">
                {secondaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSection(item.id)}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'portal-button-primary shadow-sm'
                          : 'neu-button text-slate-600 dark:text-slate-400 hover:text-sky-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Back to Public Student Portal */}
          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80">
            <button
              onClick={() => setCurrentRoute('home')}
              className="w-full flex items-center space-x-2 px-3 py-2 neu-button rounded-xl text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Student Public Portal</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
