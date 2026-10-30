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
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'Reviewing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
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
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
          OVERVIEW
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time metrics and student council operational status
        </p>
      </div>

      {/* 4 Metric Boxes matching wireframe */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Box 1: Total Feedback */}
        <div className="portal-card p-4 sm:p-5 text-center border-l-4 border-l-emerald-600">
          <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalFeedbackCount < 10 ? `0${totalFeedbackCount}` : totalFeedbackCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Feedback
          </div>
        </div>

        {/* Box 2: Unread */}
        <div className="portal-card p-4 sm:p-5 text-center border-l-4 border-l-amber-500">
          <div className="text-2xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {unreadFeedbackCount < 10 ? `0${unreadFeedbackCount}` : unreadFeedbackCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Unread
          </div>
        </div>

        {/* Box 3: Chats */}
        <div className="portal-card p-4 sm:p-5 text-center border-l-4 border-l-blue-500">
          <div className="text-2xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {activeChatsCount < 10 ? `0${activeChatsCount}` : activeChatsCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Chats
          </div>
        </div>

        {/* Box 4: Polls */}
        <div className="portal-card p-4 sm:p-5 text-center border-l-4 border-l-purple-500">
          <div className="text-2xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {activePollsCount < 10 ? `0${activePollsCount}` : activePollsCount}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 uppercase mt-1">
            Polls
          </div>
        </div>
      </div>

      {/* Recent Feedback Table matching wireframe */}
      <div className="portal-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
            RECENT FEEDBACK
          </h2>
          <button
            onClick={() => setCurrentSection('feedback')}
            className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
          >
            [VIEW ALL -&gt;]
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Tracking ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentFeedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {fb.category}
                    {fb.containsPII && (
                      <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-red-100 dark:bg-red-950 text-red-600 border border-red-200 dark:border-red-800">
                        PII
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{fb.trackingId}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(fb.status)}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedFeedback(fb)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold transition-colors"
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentSection('announcements')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1.5 shadow-sm"
          >
            <Megaphone className="w-5 h-5" />
            <span>[ANNOUNCEMENT]</span>
          </button>

          <button
            onClick={() => setCurrentSection('polls')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1.5 shadow-sm"
          >
            <Vote className="w-5 h-5" />
            <span>[CREATE POLL]</span>
          </button>

          <button
            onClick={() => setCurrentSection('events')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1.5 shadow-sm"
          >
            <Calendar className="w-5 h-5" />
            <span>[CREATE EVENT]</span>
          </button>

          <button
            onClick={() => setCurrentSection('reports')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1.5 shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            <span>[GENERATE REPORT]</span>
          </button>
        </div>
      </div>

      {/* Feedback View / Triage Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>
                  <strong>Contains Identifying Info (PII):</strong> Bypassed external AI models for student safety.
                </span>
              </div>
            )}

            {/* Content text */}
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-1">
                Student Feedback Text
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line border border-slate-200 dark:border-slate-700">
                {selectedFeedback.content}
              </div>
            </div>

            {/* AI Summary (if available) */}
            {selectedFeedback.aiAnalysis && (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span>AI TRIAGE SUMMARY</span>
                  <span>{selectedFeedback.aiAnalysis.sentiment} • Urgency: {selectedFeedback.aiAnalysis.urgency}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-sans">
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
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      selectedFeedback.status === st
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
