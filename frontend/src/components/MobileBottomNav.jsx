import React from 'react';
import { 
  Home, 
  Megaphone, 
  MessageSquarePlus, 
  MessageCircle, 
  Vote 
} from 'lucide-react';

export default function MobileBottomNav({ currentRoute, setCurrentRoute }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Notices', icon: Megaphone },
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus, highlight: true },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'polls', label: 'Polls', icon: Vote },
  ];

  const handleNavClick = (id) => {
    setCurrentRoute(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#f8fafc]/95 dark:bg-[#07090e]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 pb-safe transition-colors shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 items-center px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 transition-all active:scale-90 select-none relative ${
                isActive 
                  ? 'text-sky-600 dark:text-sky-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {item.highlight ? (
                <div className={`p-2 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 -translate-y-2 scale-110' 
                    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 -translate-y-1'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-sky-500 dark:text-sky-400' : ''}`} />
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
                  )}
                </div>
              )}
              <span className={`text-[10px] tracking-tight mt-1 leading-none ${item.highlight && isActive ? 'font-black text-sky-500' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
