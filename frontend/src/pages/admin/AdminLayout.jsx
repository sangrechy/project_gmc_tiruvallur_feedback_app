import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  MessageCircle, 
  Megaphone, 
  Activity, 
  LogOut, 
  ArrowLeft,
  Sparkles
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
  // Simple, Crystal-Clear Council Navigation
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback Review', icon: MessageSquare, badge: unreadCount },
    { id: 'reports', label: 'AI Analysis', icon: Sparkles },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle, badge: activeChatsCount },
    { id: 'status', label: 'App Status', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-[#07090e]/90 sticky top-0 z-40 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          
          {/* Brand */}
          <div 
            onClick={() => setCurrentSection('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="/stickers/fbi.webp" 
                alt="Council Portal" 
                className="w-full h-full object-contain"
              />
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

          {/* Top Actions: Public Site & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setCurrentRoute('home')}
              className="px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student View</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 neu-button rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Simple Mobile & Desktop Tab Bar (Fast, single-tap switching, zero clutter) */}
      <div className="bg-white/80 dark:bg-[#0b101d]/80 sticky top-16 z-30 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-start sm:justify-center space-x-1.5 sm:space-x-3 overflow-x-auto no-scrollbar scrollbar-none select-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-16">
        {children}
      </main>

    </div>
  );
}
