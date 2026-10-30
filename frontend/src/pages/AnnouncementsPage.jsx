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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            OFFICIAL COUNCIL NOTICES
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            CAMPUS ANNOUNCEMENTS
          </h1>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className={`portal-card p-6 transition-all ${
                ann.pinned
                  ? 'border-l-4 border-l-emerald-600 dark:border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  {ann.pinned && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                      <Pin className="w-3 h-3 text-amber-600 rotate-45" />
                      <span>PINNED</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
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

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
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
