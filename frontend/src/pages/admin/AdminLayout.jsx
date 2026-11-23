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
  RefreshCw,
  Menu,
  X
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Simple, Crystal-Clear Council Navigation for Desktop
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback Review', icon: MessageSquare, badge: unreadCount },
    { id: 'reports', label: 'AI Analysis', icon: Sparkles },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
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
    setShowMoreMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = ['reports', 'status'].includes(currentSection);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-[#07090e]/90 sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between h-16">
          
          {/* Brand */}
          <div 
            onClick={() => handleSectionSelect('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block leading-tight">
                Council Portal
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                GMC Thiruvallur
              </span>
            </div>
          </div>

          {/* Top Actions: Refresh, Public Site & Logout */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Dedicated Council Refresh Button */}
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="px-2.5 sm:px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center space-x-1.5 disabled:opacity-60"
              title="Refresh feeds from cloud database"
              aria-label="Refresh council data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setCurrentRoute('home')}
              className="px-2.5 sm:px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center space-x-1.5"
              title="Switch to Student View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Student View</span>
            </button>

            <button
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
              title="Logout from Council Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 💻 Desktop Tab Bar (Hidden on Mobile) */}
      <div className="hidden md:block bg-white/80 dark:bg-[#0b101d]/80 sticky top-16 z-30 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center space-x-2 lg:space-x-3 overflow-x-auto select-none no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionSelect(item.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
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

      {/* 📱 Council Mobile Bottom Navigation Bar (Matching Home Notice Menu layout, Feedback Review at center) */}
      <nav
        aria-label="Council Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#f8fafc]/95 dark:bg-[#07090e]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 pb-safe transition-colors shadow-2xl select-none"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1.5 max-w-md mx-auto relative">
          
          {/* 1. Home / Dashboard */}
          <button
            onClick={() => handleSectionSelect('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 ${
              currentSection === 'dashboard'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'dashboard' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'dashboard' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium">Home</span>
          </button>

          {/* 2. Notices / Announcements */}
          <button
            onClick={() => handleSectionSelect('announcements')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 ${
              currentSection === 'announcements'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Megaphone className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'announcements' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'announcements' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium">Notices</span>
          </button>

          {/* 3. Center Highlight: Feedback Review with Unread Badge */}
          <button
            onClick={() => handleSectionSelect('feedback')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 relative ${
              currentSection === 'feedback'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative p-2.5 rounded-2xl transition-all ${
              currentSection === 'feedback'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 -translate-y-2 scale-110'
                : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 -translate-y-1'
            }`}>
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-red-500 text-white font-extrabold ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${currentSection === 'feedback' ? 'font-black text-sky-500' : 'font-medium'}`}>
              Review
            </span>
          </button>

          {/* 4. Polls */}
          <button
            onClick={() => handleSectionSelect('polls')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 ${
              currentSection === 'polls'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Vote className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'polls' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {currentSection === 'polls' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium">Polls</span>
          </button>

          {/* 5. Live Chat / More Actions */}
          <button
            onClick={() => handleSectionSelect('chat')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 relative ${
              currentSection === 'chat'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MessageCircle className={`w-5 h-5 transition-transform duration-200 ${currentSection === 'chat' ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
              {activeChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-sky-500 text-white font-extrabold ring-2 ring-white dark:ring-slate-900">
                  {activeChatsCount}
                </span>
              )}
              {currentSection === 'chat' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none font-medium">Chat</span>
          </button>
        </div>

        {/* Mobile Sub-Bar / Quick Switcher for AI Analysis and App Status */}
        <div className="flex items-center justify-center space-x-3 py-1 px-2 border-t border-slate-200/50 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/60 text-[10px] font-mono">
          <button
            onClick={() => handleSectionSelect('reports')}
            className={`px-2.5 py-0.5 rounded-full flex items-center space-x-1 transition-colors ${
              currentSection === 'reports'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-sky-500'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Reports</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={() => handleSectionSelect('status')}
            className={`px-2.5 py-0.5 rounded-full flex items-center space-x-1 transition-colors ${
              currentSection === 'status'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-500 hover:text-sky-500'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>App Status</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
