import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function EventsPage({ events, showToast }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const upcoming = events.filter(e => e.isUpcoming);
  const past = events.filter(e => !e.isUpcoming);
  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          CAMPUS ACTIVITIES & CONFERENCES
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
          COLLEGE EVENTS
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Medical symposiums, clinical workshops, sports tournaments, and student council cultural nights.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          UPCOMING EVENTS ({upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          PAST EVENTS ({past.length})
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayList.length > 0 ? (
          displayList.map((evt, idx) => (
            <div
              key={evt.id}
              className="portal-card p-6 flex flex-col justify-between hover:border-emerald-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    EVENT 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {evt.category}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {evt.title}
                </h2>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
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

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedEvent(evt)}
                  className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                >
                  [DETAILS -&gt;]
                </button>

                {evt.registrationUrl && evt.registrationUrl !== "#" && evt.isUpcoming ? (
                  <a
                    href={evt.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-button-primary py-1.5 px-3.5 text-xs font-mono font-bold flex items-center space-x-1"
                  >
                    <span>REGISTER</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full portal-card p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No events found in this category.</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {selectedEvent.category}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                [CLOSE X]
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedEvent.title}
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Date: {selectedEvent.date}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time: {selectedEvent.time}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Venue: {selectedEvent.venue}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                Event Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Event link copied to clipboard!", "success");
                }}
                className="portal-button-secondary text-xs font-mono"
              >
                SHARE LINK
              </button>

              {selectedEvent.registrationUrl && selectedEvent.registrationUrl !== "#" && (
                <a
                  href={selectedEvent.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="portal-button-primary text-xs font-mono flex items-center space-x-1"
                >
                  <span>REGISTER NOW</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
