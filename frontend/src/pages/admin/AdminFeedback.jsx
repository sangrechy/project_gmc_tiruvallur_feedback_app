import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  MessageCircle,
  Filter,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function AdminFeedback({ feedbacks, onUpdateFeedbackStatus, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const categories = [
    'ALL', 
    'Academics', 
    'Infrastructure', 
    'Hostel & Mess', 
    'Transport', 
    'Sports & Cultural', 
    'Library', 
    'Hospital & Clinical Postings', 
    'Others'
  ];

  // Counts
  const totalCount = feedbacks.length;
  const needsReviewCount = feedbacks.filter(f => f.status === 'Received').length;
  const inReviewCount = feedbacks.filter(f => f.status === 'Reviewing').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'Resolved').length;

  const filtered = feedbacks.filter((fb) => {
    const matchesSearch = 
      fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fb.councilNotes && fb.councilNotes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'Received' ? fb.status === 'Received' :
      statusFilter === 'Reviewing' ? fb.status === 'Reviewing' :
      statusFilter === 'Resolved' ? fb.status === 'Resolved' : true;

    const matchesCategory = categoryFilter === 'ALL' || fb.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateStatus = async (id, newStatus, notes) => {
    setIsUpdating(true);
    try {
      await onUpdateFeedbackStatus(id, newStatus, notes);
      showToast(`Feedback updated to ${newStatus}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async (id, currentStatus) => {
    if (!noteText.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdateFeedbackStatus(id, currentStatus, noteText.trim());
      setEditingNoteId(null);
      setNoteText('');
      showToast("Council note recorded", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Tracking ID copied", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Hostel & Mess':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Academics':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'Infrastructure':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Hospital & Clinical Postings':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Feedback Review
          </h1>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search grievances or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Quick Filter Bar (Status Pills + Category Selector) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scrollbar-none pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap select-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'portal-button-primary shadow-sm'
                : 'neu-button text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('Received')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Received'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'neu-button text-amber-600 dark:text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Needs Review ({needsReviewCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Reviewing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Reviewing'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'neu-button text-sky-600 dark:text-sky-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>In Review ({inReviewCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              statusFilter === 'Resolved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'neu-button text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved ({resolvedCount})</span>
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="text-slate-400 hidden sm:inline">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Direct-Reading Message Stream (Card Feed) */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="portal-card p-12 text-center space-y-3">
            <div className="w-12 h-12 neu-circle mx-auto flex items-center justify-center text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No feedback matching your view
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === 'Received' 
                ? "Awesome! No pending grievances waiting for initial review." 
                : "No student messages match the selected filters."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isNeedsReview = item.status === 'Received';
            const isReviewing = item.status === 'Reviewing';
            const isResolved = item.status === 'Resolved';
            const isEditingThisNote = editingNoteId === item.id;

            return (
              <div 
                key={item.id} 
                className={`portal-card p-5 sm:p-6 transition-all border ${
                  isNeedsReview 
                    ? 'border-amber-500/30 bg-amber-500/[0.02]' 
                    : isReviewing 
                    ? 'border-sky-500/30 bg-sky-500/[0.02]' 
                    : 'border-slate-200/60 dark:border-white/5'
                }`}
              >
                {/* Card Top: Category, Tracking ID, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/50 dark:border-slate-800/80 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>

                    {/* Tracking ID with Copy Button */}
                    <button
                      onClick={() => handleCopy(item.id, item.trackingId)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors"
                      title="Click to copy Tracking ID"
                    >
                      <span>{item.trackingId}</span>
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {item.containsPII ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        Auto-Sanitized
                      </span>
                    ) : item.aiAnalysis ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.aiAnalysis.urgency === 'High'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                      }`}>
                        AI: {item.aiAnalysis.urgency} Urgency • {item.aiAnalysis.sentiment}
                      </span>
                    ) : null}
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isNeedsReview && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Needs Review</span>
                      </span>
                    )}
                    {isReviewing && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Under Review</span>
                      </span>
                    )}
                    {isResolved && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Middle: Student Message (Full text, clearly formatted, easy to read) */}
                <div className="py-4 space-y-2">
                  <p className="text-sm sm:text-base font-normal text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Submitted: {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently'}
                  </div>
                </div>

                {/* Council Action Note (If any) */}
                {item.councilNotes && (
                  <div className="mb-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200">
                    <span className="font-bold block text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                      Council Action Note:
                    </span>
                    <p className="mt-1 font-sans">{item.councilNotes}</p>
                  </div>
                )}

                {/* Inline Council Note Editor */}
                {isEditingThisNote && (
                  <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 space-y-2 animate-fadeIn">
                    <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                      Add Council Note / Action Update:
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="e.g., Forwarded to Hostel Warden. Inspection scheduled for tomorrow morning."
                      rows={2}
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-sans focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveNote(item.id, item.status)}
                        disabled={isUpdating || !noteText.trim()}
                        className="portal-button-primary px-3 py-1.5 text-xs font-semibold"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => { setEditingNoteId(null); setNoteText(''); }}
                        className="px-3 py-1.5 neu-button text-xs font-semibold text-slate-600 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Bottom: 1-Tap Status Change Buttons */}
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mark Under Review */}
                    {!isReviewing && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Reviewing', item.councilNotes)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl neu-button text-sky-600 dark:text-sky-400 text-xs font-semibold hover:border-sky-500 flex items-center space-x-1.5 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mark Under Review</span>
                      </button>
                    )}

                    {/* Mark Resolved */}
                    {!isResolved && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Resolved', item.councilNotes)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {/* Reopen if Resolved */}
                    {isResolved && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Received', item.councilNotes)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-xl neu-button text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Reopen Grievance</span>
                      </button>
                    )}
                  </div>

                  {/* Add Note Button */}
                  {!isEditingThisNote && (
                    <button
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setNoteText(item.councilNotes || '');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.councilNotes ? 'Edit Note' : '+ Add Note'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
