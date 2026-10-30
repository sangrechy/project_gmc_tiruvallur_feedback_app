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
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'feedback', label: 'FEEDBACK', icon: MessageSquare, badge: unreadCount },
    { id: 'chat', label: 'LIVE CHAT', icon: MessageCircle, badge: activeChatsCount },
    { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
    { id: 'polls', label: 'POLLS', icon: Vote },
    { id: 'events', label: 'EVENTS', icon: Calendar },
    { id: 'reports', label: 'AI REPORTS', icon: BarChart3 },
    { id: 'management', label: 'ADMIN MANAGEMENT', icon: Users },
  ];

  const handleSelectSection = (id) => {
    setCurrentSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      {/* Admin Top Header matching wireframe */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 rounded hover:bg-slate-800"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="font-extrabold tracking-wider text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>GMC COUNCIL ADMIN</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400 hidden sm:inline">
              {adminUser?.email || "ADMIN"}
            </span>
            <span className="text-slate-700">|</span>
            <button
              onClick={onLogout}
              className="font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Navigation matching wireframe */}
        <aside
          className={`lg:w-64 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 h-fit shadow-sm ${
            mobileNavOpen ? 'block fixed inset-x-4 top-20 z-50 shadow-2xl' : 'hidden lg:block'
          }`}
        >
          <div className="text-[10px] font-mono font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">
            COUNCIL NAVIGATION
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentRoute('home')}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Student Portal View</span>
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
