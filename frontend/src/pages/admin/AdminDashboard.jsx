import React, { useState } from 'react';
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
  Megaphone
} from 'lucide-react';

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

  const totalFeedbackCount = feedbacks.length;
  const unreadFeedbackCount = feedbacks.filter(f => f.status === 'Received').length;
  const activeChatsCount = chats.filter(c => c.status === 'active').length;
  const activePollsCount = polls.filter(p => p.status === 'active').length;

  const recentFeedbacks = feedbacks.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return 'neu-pill text-amber-500 bg-amber-500/10';
      case 'Reviewing':
        return 'neu-pill text-sky-500 bg-sky-500/10';
      case 'Resolved':
        return 'neu-pill text-emerald-500 bg-emerald-500/10';
      default:
        return 'neu-pill text-slate-400 bg-slate-500/10';
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
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono uppercase tracking-tight">
            OVERVIEW
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time metrics and student council operational status
          </p>
        </div>

        <div className="w-12 h-12 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float">
          <img 
            src="/stickers/musono.webp" 
            alt="Council Admin Mascot" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 4 Metric Boxes matching wireframe with Neumorphic styling */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Box 1: Total Feedback */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
            {totalFeedbackCount < 10 ? `0${totalFeedbackCount}` : totalFeedbackCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Feedback
          </div>
        </div>

        {/* Box 2: Unread */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">
            {unreadFeedbackCount < 10 ? `0${unreadFeedbackCount}` : unreadFeedbackCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Unread
          </div>
        </div>

        {/* Box 3: Chats */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-blue-500 font-mono">
            {activeChatsCount < 10 ? `0${activeChatsCount}` : activeChatsCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Chats
          </div>
        </div>

        {/* Box 4: Polls */}
        <div className="portal-card p-5 text-center">
          <div className="text-2xl sm:text-4xl font-extrabold text-purple-500 font-mono">
            {activePollsCount < 10 ? `0${activePollsCount}` : activePollsCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Polls
          </div>
        </div>
      </div>

      {/* Recent Feedback Table matching wireframe */}
      <div className="portal-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono uppercase tracking-wider">
            RECENT FEEDBACK
          </h2>
          <button
            onClick={() => setCurrentSection('feedback')}
            className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700"
          >
            [VIEW ALL -&gt;]
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Tracking ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {recentFeedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-sky-500/5 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                    {fb.category}
                    {fb.containsPII && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] neu-pill text-red-500 bg-red-500/10">
                        PII
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{fb.trackingId}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold ${getStatusBadge(fb.status)}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedFeedback(fb)}
                      className="px-3 py-1.5 neu-button text-sky-600 dark:text-sky-400 font-bold"
                    >
                      [VIEW]
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions matching wireframe */}
      <div className="portal-card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono uppercase tracking-wider">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentSection('announcements')}
            className="p-4 rounded-2xl neu-button text-sky-600 dark:text-sky-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <Megaphone className="w-5 h-5" />
            <span>[ANNOUNCEMENT]</span>
          </button>

          <button
            onClick={() => setCurrentSection('polls')}
            className="p-4 rounded-2xl neu-button text-purple-600 dark:text-purple-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <Vote className="w-5 h-5" />
            <span>[CREATE POLL]</span>
          </button>

          <button
            onClick={() => setCurrentSection('events')}
            className="p-4 rounded-2xl neu-button text-blue-600 dark:text-blue-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <Calendar className="w-5 h-5" />
            <span>[CREATE EVENT]</span>
          </button>

          <button
            onClick={() => setCurrentSection('reports')}
            className="p-4 rounded-2xl neu-button text-amber-600 dark:text-amber-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>[GENERATE REPORT]</span>
          </button>
        </div>
      </div>

      {/* Feedback View / Triage Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {selectedFeedback.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{selectedFeedback.trackingId}</span>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                [CLOSE X]
              </button>
            </div>

            {/* PII Flag Notice */}
            {selectedFeedback.containsPII && (
              <div className="p-3.5 rounded-xl bg-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                <span>
                  <strong>Contains Identifying Info (PII):</strong> Bypassed external AI models for student safety.
                </span>
              </div>
            )}

            {/* Content text */}
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-1.5">
                Student Feedback Text
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
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedFeedback.status === st
                        ? 'neu-pressed text-sky-500'
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
