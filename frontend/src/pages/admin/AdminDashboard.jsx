import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  MessageCircle, 
  Vote, 
  Calendar, 
  Sparkles, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ShieldAlert,
  Megaphone,
  ChevronRight,
  Camera,
  Activity
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function AdminDashboard({ 
  feedbacks, 
  chats, 
  polls, 
  announcements, 
  events, 
  setCurrentSection,
  onUpdateFeedbackStatus,
  showToast 
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [appStatus, setAppStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    apiService.getAppStatus().then(status => {
      if (mounted) setAppStatus(status);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const totalFeedbackCount = feedbacks.length;
  const unreadFeedbackCount = feedbacks.filter(f => f.status === 'Received').length;
  const activeChatsCount = chats.filter(c => c.status === 'active').length;
  const activePollsCount = polls.filter(p => p.status === 'active').length;

  const recentFeedbacks = feedbacks.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return 'neu-pill text-amber-500 bg-amber-500/10 border border-amber-500/20';
      case 'Reviewing':
        return 'neu-pill text-sky-500 bg-sky-500/10 border border-sky-500/20';
      case 'Resolved':
        return 'neu-pill text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
      default:
        return 'neu-pill text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedFeedback) return;
    try {
      await onUpdateFeedbackStatus(selectedFeedback.id, newStatus);
      setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
      showToast(`Status updated to ${newStatus}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Header with Mascot */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
            Council Executive Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time student welfare metrics and triage operations
          </p>
        </div>

        <div className="w-14 h-14 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float-r" title="Council Officer Mascot">
          <img 
            src="/stickers/musono.webp" 
            alt="Council Officer Mascot" 
            className="w-full h-full object-contain filter drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
          />
        </div>
      </div>

      {/* 📷 Screenshot Diagnostics & Live App Status Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-[#0e131f] border border-sky-500/30 text-white shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Live App Status & Diagnostics
            </span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
              {appStatus?.snapshotId || 'GMC-DIAG'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span>{appStatus?.checkedAt ? new Date(appStatus.checkedAt).toLocaleTimeString() : 'Checking...'}</span>
            <button
              onClick={() => setCurrentSection('status')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>Full Diagnostics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Quick Subsystem Health Badges for Debug Screenshots */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-xs font-mono">
          {/* AI API */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>AI API</span>
              <span className={`w-2 h-2 rounded-full ${appStatus?.aiApi?.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <div className="mt-1 font-bold text-[11px] text-slate-200 truncate">
              {appStatus?.aiApi?.status === 'connected' ? 'CONNECTED' : 'FALLBACK'}
            </div>
          </div>

          {/* Backend */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>BACKEND</span>
              <span className={`w-2 h-2 rounded-full ${appStatus?.backend?.status === 'connected' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
            </div>
            <div className="mt-1 font-bold text-[11px] text-slate-200 truncate">
              {appStatus?.backend?.status === 'connected' ? `${appStatus.backend.latencyMs}ms` : 'EMULATED'}
            </div>
          </div>

          {/* Telegram */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>TELEGRAM</span>
              <span className={`w-2 h-2 rounded-full ${appStatus?.telegram?.status === 'connected' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>
            <div className="mt-1 font-bold text-[11px] text-slate-200 truncate">
              {appStatus?.telegram?.status === 'connected' ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>

          {/* Gmail */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>GMAIL</span>
              <span className={`w-2 h-2 rounded-full ${appStatus?.gmail?.status === 'connected' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>
            <div className="mt-1 font-bold text-[11px] text-slate-200 truncate">
              {appStatus?.gmail?.status === 'connected' ? 'READY' : 'STANDBY'}
            </div>
          </div>

          {/* Database */}
          <div className="col-span-2 sm:col-span-1 p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>DATABASE</span>
              <span className={`w-2 h-2 rounded-full ${appStatus?.database?.status === 'connected' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
            </div>
            <div className="mt-1 font-bold text-[11px] text-slate-200 truncate">
              {appStatus?.database?.status === 'connected' ? 'FIRESTORE' : 'DEMO STORE'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Boxes with Neumorphic styling */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Box 1: Total Feedback */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
            {totalFeedbackCount < 10 ? `0${totalFeedbackCount}` : totalFeedbackCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 font-mono">
            Total Feedback
          </div>
        </div>

        {/* Box 2: Unread */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">
            {unreadFeedbackCount < 10 ? `0${unreadFeedbackCount}` : unreadFeedbackCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 font-mono">
            Pending Review
          </div>
        </div>

        {/* Box 3: Chats */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-blue-500 font-mono">
            {activeChatsCount < 10 ? `0${activeChatsCount}` : activeChatsCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 font-mono">
            Active Relays
          </div>
        </div>

        {/* Box 4: Polls */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-purple-500 font-mono">
            {activePollsCount < 10 ? `0${activePollsCount}` : activePollsCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1.5 font-mono">
            Active Polls
          </div>
        </div>
      </div>

      {/* Recent Feedback Table */}
      <div className="portal-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
              Recent Anonymous Grievances
            </h2>
            <p className="text-[11px] text-slate-500">Latest incoming student feedback entries</p>
          </div>
          <button
            onClick={() => setCurrentSection('feedback')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-mono">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Tracking ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {recentFeedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-sky-500/5 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {fb.category}
                    {fb.containsPII && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] neu-pill text-red-500 bg-red-500/10 font-mono">
                        PII Sanitized
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{fb.trackingId}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 text-[10px] font-semibold ${getStatusBadge(fb.status)}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedFeedback(fb)}
                      className="px-3 py-1.5 neu-button text-sky-600 dark:text-sky-400 font-semibold text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Administrative Actions */}
      <div className="portal-card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
          Quick Management Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentSection('announcements')}
            className="p-4 rounded-2xl neu-button text-sky-600 dark:text-sky-400 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center space-y-2 hover:scale-[1.02]"
          >
            <Megaphone className="w-5 h-5" />
            <span>Post Circular</span>
          </button>

          <button
            onClick={() => setCurrentSection('polls')}
            className="p-4 rounded-2xl neu-button text-purple-600 dark:text-purple-400 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center space-y-2 hover:scale-[1.02]"
          >
            <Vote className="w-5 h-5" />
            <span>Launch Poll</span>
          </button>

          <button
            onClick={() => setCurrentSection('events')}
            className="p-4 rounded-2xl neu-button text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center space-y-2 hover:scale-[1.02]"
          >
            <Calendar className="w-5 h-5" />
            <span>Create Event</span>
          </button>

          <button
            onClick={() => setCurrentSection('reports')}
            className="p-4 rounded-2xl neu-button text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center space-y-2 hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Feedback View / Triage Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {selectedFeedback.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{selectedFeedback.trackingId}</span>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            {/* PII Flag Notice */}
            {selectedFeedback.containsPII && (
              <div className="p-3.5 rounded-xl bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <span>
                  <strong>Sanitized Entry:</strong> Identifying student references were redacted automatically before storing.
                </span>
              </div>
            )}

            {/* Content text */}
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-1.5">
                Feedback Description
              </div>
              <div className="p-4 rounded-2xl neu-pressed text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {selectedFeedback.content}
              </div>
            </div>

            {/* AI Summary (if available) */}
            {selectedFeedback.aiAnalysis && (
              <div className="p-3.5 rounded-xl neu-pressed text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between font-bold text-sky-600 dark:text-sky-400">
                  <span>AI TRIAGE SUMMARY</span>
                  <span>{selectedFeedback.aiAnalysis.sentiment} • Urgency: {selectedFeedback.aiAnalysis.urgency}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-sans">
                  {selectedFeedback.aiAnalysis.summary}
                </p>
              </div>
            )}

            {/* Change Status Action */}
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">
                Update Status
              </div>
              <div className="flex items-center space-x-2">
                {['Received', 'Reviewing', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedFeedback.status === st
                        ? 'portal-button-primary shadow-sm'
                        : 'neu-button text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
