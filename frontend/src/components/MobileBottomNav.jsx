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
    { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-[#161a21] border-t border-slate-200 dark:border-slate-800 pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center min-h-[48px] gap-0.5 select-none active:opacity-70 transition-opacity"
            >
              <span className={`flex items-center justify-center h-7 w-12 rounded-full transition-colors duration-150 ${
                isActive
                  ? 'bg-sky-600/10 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className={`text-[10px] leading-none ${
                isActive ? 'font-semibold text-sky-700 dark:text-sky-300' : 'font-medium text-slate-500 dark:text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
