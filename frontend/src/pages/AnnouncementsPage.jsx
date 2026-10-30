import React, { useState } from 'react';
import { Megaphone, Search, Pin, Clock, Calendar, AlertCircle } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header with Guard on Left and Syringe on Right */}
      <div className="portal-card p-6 sm:p-8 flex items-center justify-between gap-4">
        {/* Guard Sticker on Left */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 neu-circle p-2 flex items-center justify-center flex-shrink-0 sticker-float">
          <img 
            src="/stickers/gaurd.webp" 
            alt="Security Guard" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-center flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
            OFFICIAL COUNCIL NOTICES
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
            CAMPUS ANNOUNCEMENTS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Stay informed with verified clinical schedules, hostel notices, and emergency alerts
          </p>
        </div>

        {/* Syringe Sticker on Right */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 neu-circle p-2 flex items-center justify-center flex-shrink-0 sticker-float-delayed">
          <img 
            src="/stickers/syringe.png" 
            alt="Clinical Syringe" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Filter and Search Bar with Neumorphic styling */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeCategory === cat
                  ? 'neu-pressed text-sky-600 dark:text-sky-400'
                  : 'neu-button text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2.5 neu-input text-xs sm:text-sm font-mono placeholder-slate-400"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-5">
        {filtered.length > 0 ? (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className={`portal-card p-6 sm:p-7 transition-all ${
                ann.pinned ? 'ring-2 ring-sky-500/30' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  {ann.pinned && (
                    <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold neu-pill bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Pin className="w-3 h-3 text-amber-500 rotate-45" />
                      <span>PINNED</span>
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider neu-pill text-sky-600 dark:text-sky-400">
                    [{ann.category}]
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Posted: {ann.date}</span>
                  </span>
                  {ann.expiryDate && (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid until: {ann.expiryDate}</span>
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                {ann.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.description}
              </p>
            </div>
          ))
        ) : (
          <div className="portal-card p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No announcements found matching the criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
