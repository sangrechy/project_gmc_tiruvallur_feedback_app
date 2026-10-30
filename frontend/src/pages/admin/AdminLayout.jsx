import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  MessageCircle, 
  Megaphone, 
  Vote, 
  Calendar, 
  BarChart3, 
  Users, 
  LogOut, 
  ArrowLeft,
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

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback Triage', icon: MessageSquare, badge: unreadCount },
    { id: 'chat', label: 'Live Relays', icon: MessageCircle, badge: activeChatsCount },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'polls', label: 'Student Polls', icon: Vote },
    { id: 'events', label: 'Events & CME', icon: Calendar },
    { id: 'reports', label: 'AI Synthesis Reports', icon: BarChart3 },
    { id: 'management', label: 'Admin Security', icon: Users },
  ];

  const handleSelectSection = (id) => {
    setCurrentSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#edf2f9] dark:bg-[#090e1a] flex flex-col font-sans transition-colors duration-300 bg-grid-pattern">
      {/* Admin Top Header with FBI security sticker */}
      <header className="bg-[#edf2f9]/90 dark:bg-[#090e1a]/90 sticky top-0 z-40 border-b border-slate-300/40 dark:border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 neu-circle text-slate-700 dark:text-slate-200"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 neu-card p-1 flex items-center justify-center">
                <img 
                  src="/stickers/fbi.webp" 
                  alt="FBI Council Security Mascot" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-slate-100 font-sans">
                GMC Council Administration
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] hidden sm:inline">
              {adminUser?.email || "council.rep@gmcthiruvallur.ac.in"}
            </span>
            <span className="text-slate-400">|</span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 neu-button font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <aside
          className={`lg:w-64 flex-shrink-0 portal-card p-4 h-fit ${
            mobileNavOpen ? 'block fixed inset-x-4 top-20 z-50 shadow-2xl' : 'hidden lg:block'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Management Deck
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'portal-button-primary shadow-sm'
                      : 'neu-button text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-sky-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono neu-pill bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/80">
            <button
              onClick={() => setCurrentRoute('home')}
              className="w-full flex items-center space-x-2 px-3 py-2 neu-button rounded-xl text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Student Portal</span>
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
