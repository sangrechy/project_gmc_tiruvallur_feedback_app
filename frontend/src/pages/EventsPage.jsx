import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, ArrowLeft, ChevronRight } from 'lucide-react';

export default function EventsPage({ events, setCurrentRoute, showToast }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const upcoming = events.filter(e => e.isUpcoming);
  const past = events.filter(e => !e.isUpcoming);
  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 bg-grid-pattern">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-300/40 dark:border-slate-800/80 text-xs font-mono">
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
          <span className="text-sky-600 dark:text-sky-400 font-bold">CAMPUS CALENDAR</span>
        </div>
      </div>

      {/* Header with Bleeding Event Celebration Mascot */}
      <div className="relative mt-12">
        
        {/* EAT STICKER: Bleeding out of top-right edge */}
        <div 
          className="sticker-bleed sticker-float-r -top-11 sm:-top-18 right-1 sm:-right-8 w-22 sm:w-36 pointer-events-auto"
          title="Campus Event Celebration Mascot"
        >
          <img 
            src="/stickers/eat.webp" 
            alt="Event Mascot Bleeding Out" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Card (overflow-visible) */}
        <div className="portal-card p-5 sm:p-10 relative overflow-visible pt-10 sm:pt-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full neu-pill text-[11px] font-semibold text-sky-600 dark:text-sky-400 mb-3 border border-sky-500/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>Collegiate Activities &amp; Symposia</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            Campus Events &amp; Conferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg leading-relaxed">
            Inter-collegiate medical symposiums, clinical workshops, annual sports meets, and student council cultural fests.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-2 ${
            activeTab === 'upcoming'
              ? 'portal-button-primary shadow-sm'
              : 'neu-button text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>Upcoming Events</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-[10px] font-mono">
            {upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-2 ${
            activeTab === 'past'
              ? 'portal-button-primary shadow-sm'
              : 'neu-button text-slate-600 dark:text-slate-300'
          }`}
        >
          <span>Past Archives</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-[10px] font-mono">
            {past.length}
          </span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayList.length > 0 ? (
          displayList.map((evt, idx) => (
            <div
              key={evt.id}
              className="portal-card p-6 flex flex-col justify-between hover:scale-[1.01] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {evt.category}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    #{idx + 1}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
                  {evt.title}
                </h2>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    <span>{evt.date}</span>
                  </div>
                  {evt.time && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.venue}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedEvent(evt);
                    showToast(`Details for "${evt.title}" opened`, "info");
                  }}
                  className="portal-button-primary px-4 py-2 text-xs font-semibold flex items-center space-x-1.5"
                >
                  <span>Event Brief</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full portal-card p-12 text-center text-slate-500 text-xs font-mono">
            No events found in this section.
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                {selectedEvent.category}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedEvent.title}
            </h3>

            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-200/40 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-300/30 dark:border-slate-800/60">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span>{selectedEvent.date}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{selectedEvent.venue}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedEvent.description}
            </p>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="portal-button-primary px-5 py-2.5 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
