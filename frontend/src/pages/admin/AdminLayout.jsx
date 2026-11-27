import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  MessageCircle, 
  Megaphone, 
  Activity, 
  LogOut, 
  ArrowLeft,
  Sparkles,
  Shield,
  Vote,
  RefreshCw
} from 'lucide-react';

export default function AdminLayout({ 
  currentSection, 
  setCurrentSection, 
  onLogout, 
  setCurrentRoute, 
  adminUser,
  unreadCount = 0,
  activeChatsCount = 0,
  onRefresh,
  children 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Complete Council Navigation for Desktop Tab Bar
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'announcements', label: 'Notices', icon: Megaphone },
    { id: 'feedback', label: 'Feedback Review', icon: MessageSquare, badge: unreadCount },
    { id: 'reports', label: 'AI Analysis', icon: Sparkles },
    { id: 'polls', label: 'Polls', icon: Vote },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, badge: activeChatsCount },
    { id: 'status', label: 'App Status', icon: Activity },
  ];

  const handleRefreshClick = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleSectionSelect = (sectionId) => {
    setCurrentSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0e1116] flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-[#161a21]/95 sticky top-0 pt-[env(safe-area-inset-top,0px)] z-40 border-b border-slate-200/60 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand */}
          <div 
            onClick={() => handleSectionSelect('dashboard')}
            className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer select-none min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-sky-500" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 block leading-tight truncate">
                Council Portal
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                GMC Thiruvallur
              </span>
            </div>
          </div>

          {/* Top Actions: Refresh, Status, Public Site & Logout */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
            {/* Dedicated Council Refresh Button */}
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="px-2.5 sm:px-3 h-9 !min-h-[36px] neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center space-x-1.5 disabled:opacity-60"
              title="Refresh feeds from cloud database"
              aria-label="Refresh council data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Quick App Status Link */}
            <button
              onClick={() => handleSectionSelect('status')}
              className={`px-2.5 sm:px-3 h-9 !min-h-[36px] neu-button rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                currentSection === 'status'
                  ? 'border-sky-500 text-sky-500 bg-sky-500/10'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-500'
              }`}
              title="App Status & Cloud Diagnostics"
              aria-label="App Status"
            >
              <Activity className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Status</span>
            </button>

            <button
              onClick={() => setCurrentRoute('home')}
              className="px-2.5 sm:px-3 h-9 !min-h-[36px] neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center space-x-1.5"
              title="Switch to Student View"
              aria-label="Switch to Student View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student View</span>
            </button>

            <button
              onClick={onLogout}
              className="px-2.5 sm:px-3 h-9 !min-h-[36px] neu-button rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
              title="Logout from Council Portal"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 💻 Desktop Tab Bar (Hidden on Mobile) */}
      <div className="hidden md:block bg-white/80 dark:bg-[#161a21] sticky top-16 z-30 border-b border-slate-200/60 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center space-x-2 lg:space-x-3 overflow-x-auto select-none no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionSelect(item.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2 !min-h-[38px] rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'portal-button-primary shadow-sm'
                    : 'neu-button text-slate-700 dark:text-slate-300 hover:text-sky-500'
                }`}
              >
                <Icon className="w-4 h-4 text-sky-500" />
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
      </div>

      {/* Main Content Area (Extra bottom padding on mobile for fixed navigation bar) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 md:pb-16">
        {children}
      </main>

      {/* 📱 Council Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Council Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#161a21]/95 border-t border-slate-200/80 dark:border-white/10 pb-safe transition-colors shadow-lg select-none"
      >
        <div className="grid grid-cols-6 h-16 items-center px-1 max-w-lg mx-auto relative">
          
          {/* 1. Home / Dashboard */}
          <button
            onClick={() => handleSectionSelect('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 ${
              currentSection === 'dashboard'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'dashboard' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'dashboard' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium truncate">Home</span>
          </button>

          {/* 2. Notices / Announcements */}
          <button
            onClick={() => handleSectionSelect('announcements')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 ${
              currentSection === 'announcements'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <Megaphone className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'announcements' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'announcements' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium truncate">Notices</span>
          </button>

          {/* 3. Center Highlight: Feedback Review with Unread Badge */}
          <button
            onClick={() => handleSectionSelect('feedback')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 relative ${
              currentSection === 'feedback'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <div className={`relative p-1.5 rounded-xl transition-all ${
                currentSection === 'feedback'
                  ? 'bg-sky-500 text-white'
                  : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
              }`}>
                <MessageSquare className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full text-[9px] font-mono bg-red-500 text-white font-bold ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            <span className={`text-[10px] tracking-tight mt-1 leading-none ${currentSection === 'feedback' ? 'font-bold text-sky-500' : 'font-medium'} truncate`}>
              Review
            </span>
          </button>

          {/* 4. AI Analysis directly in Main Menu */}
          <button
            onClick={() => handleSectionSelect('reports')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 ${
              currentSection === 'reports'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <Sparkles className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'reports' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'reports' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium truncate">AI</span>
          </button>

          {/* 5. Polls */}
          <button
            onClick={() => handleSectionSelect('polls')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 ${
              currentSection === 'polls'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <Vote className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'polls' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'polls' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium truncate">Polls</span>
          </button>

          {/* 6. Live Chat */}
          <button
            onClick={() => handleSectionSelect('chat')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 transition-all active:scale-90 relative ${
              currentSection === 'chat'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="h-7 flex items-center justify-center relative">
              <MessageCircle className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'chat' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {activeChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full text-[9px] font-mono bg-sky-500 text-white font-bold ring-2 ring-white dark:ring-slate-900">
                  {activeChatsCount}
                </span>
              )}
              {currentSection === 'chat' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium truncate">Chat</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
