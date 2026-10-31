import React, { useState } from 'react';
import { Megaphone, Search, Pin, Clock, ArrowLeft } from 'lucide-react';

export default function AnnouncementsPage({ announcements, setCurrentRoute }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'IMPORTANT', 'ACADEMIC', 'HOSTEL', 'EVENTS'];

  const filtered = announcements.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 bg-grid-pattern">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10 text-xs font-mono">
        <button 
          onClick={() => setCurrentRoute('home')}
          className="flex items-center space-x-1 text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center space-x-1 text-slate-400">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-sky-600 dark:text-sky-400 font-bold">OFFICIAL DISPATCHES</span>
        </div>
      </div>

      {/* Announcements Header Card with Bleeding Guard (Syringe removed) */}
      <div className="relative mt-12">
        
        {/* GUARD STICKER: Bleeding out of top-left edge */}
        <div 
          className="sticker-bleed sticker-float-l -top-12 sm:-top-16 -left-3 sm:-left-6 md:-left-8 w-24 sm:w-32 md:w-36 pointer-events-auto"
          title="Council Campus Security Guard"
        >
          <img 
            src="/stickers/gaurd.webp" 
            alt="Guard Mascot Bleeding Out" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Header Card (overflow-visible) */}
        <div className="portal-card p-6 sm:p-10 text-center relative overflow-visible pt-10 sm:pt-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full neu-pill text-[11px] font-semibold mb-3">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Verified Administrative Board</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-sans tracking-tight">
            Official Campus Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
            Direct clinical rotations, university examination circulars, hostel administrative notices, and emergency advisories.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeCategory === cat
                  ? 'portal-button-primary shadow-sm'
                  : 'neu-button text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-10 pr-4 py-2.5 neu-input text-xs sm:text-sm placeholder-slate-400"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-5">
        {filtered.length > 0 ? (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className={`portal-card p-6 sm:p-7 transition-all hover:scale-[1.01] ${
                ann.pinned ? 'ring-1 ring-sky-500/40' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  {ann.pinned && (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Pin className="w-3 h-3 text-amber-500 rotate-45" />
                      <span>PINNED</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider neu-pill">
                    {ann.category}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ann.date}</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {ann.title}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {ann.description}
              </p>
            </div>
          ))
        ) : (
          <div className="portal-card p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
            No circulars found matching your selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
