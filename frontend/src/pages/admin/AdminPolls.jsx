import React, { useState } from 'react';
import { Vote, Plus, Trash2, CheckCircle2, Lock, Unlock, BarChart2, X } from 'lucide-react';

export default function AdminPolls({ 
  polls, 
  onAddPoll, 
  onTogglePollStatus, 
  onDeletePoll,
  onDeleteMultiplePolls,
  showToast 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closingDate, setClosingDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState(null);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = polls.map(p => p.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleExecuteDelete = async () => {
    if (!confirmDeleteIds || confirmDeleteIds.length === 0) return;
    setIsDeleting(true);
    try {
      if (onDeleteMultiplePolls) {
        await onDeleteMultiplePolls(confirmDeleteIds);
      } else if (onDeletePoll && confirmDeleteIds.length === 1) {
        await onDeletePoll(confirmDeleteIds[0]);
      }
      showToast(`${confirmDeleteIds.length} poll${confirmDeleteIds.length > 1 ? 's' : ''} deleted`, "info");
      setSelectedIds(prev => prev.filter(id => !confirmDeleteIds.includes(id)));
      setConfirmDeleteIds(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddOptionField = () => {
    if (options.length >= 6) {
      showToast("Maximum 6 options allowed", "error");
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOptionField = (idx) => {
    if (options.length <= 2) {
      showToast("A poll must have at least 2 options", "error");
      return;
    }
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx, val) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast("Please enter a question", "error");
      return;
    }
    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      showToast("Please provide at least 2 valid options", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPoll({
        question: question.trim(),
        options: validOptions.map(text => ({ text, votes: 0 })),
        closingDate: closingDate || "2026-11-30"
      });
      setShowCreateModal(false);
      setQuestion('');
      setOptions(['', '']);
      setClosingDate('');
      showToast("Poll launched successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (poll) => {
    const newStatus = poll.status === 'active' ? 'closed' : 'active';
    try {
      await onTogglePollStatus(poll.id, newStatus);
      showToast(`Poll marked as ${newStatus}`, "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            Poll Management
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="portal-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Poll</span>
        </button>
      </div>

      {/* Multi-Select Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs font-mono">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {selectedIds.length} poll{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={() => setConfirmDeleteIds([...selectedIds])}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Select All Row */}
      {polls.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={polls.length > 0 && polls.every(p => selectedIds.includes(p.id))}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Select All Polls ({polls.length})
            </span>
          </label>

          {selectedIds.length > 0 && (
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">
              {selectedIds.length} of {polls.length} selected
            </span>
          )}
        </div>
      )}

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="portal-card p-12 text-center text-slate-400 text-xs font-mono">
            No active or archived polls. Click "Create Poll" to launch one.
          </div>
        ) : (
          polls.map((poll) => {
            const isActive = poll.status === 'active';

            return (
              <div key={poll.id} className="portal-card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(poll.id)}
                      onChange={() => handleToggleSelect(poll.id)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer mr-0.5"
                      title="Select poll"
                    />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      [{poll.status.toUpperCase()}]
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Deadline: {poll.closingDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {poll.totalVotes} Total Votes
                    </span>

                    <button
                      onClick={() => handleToggleStatus(poll)}
                      className="px-2.5 py-1 rounded text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                    >
                      {isActive ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{isActive ? "Close Poll" : "Reopen Poll"}</span>
                    </button>

                    <button
                      onClick={() => setConfirmDeleteIds([poll.id])}
                      disabled={isDeleting}
                      className="p-1.5 rounded border border-slate-300 dark:border-slate-700 hover:border-red-500 hover:text-red-500 text-slate-400 transition-colors"
                      title="Delete poll"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 dark:text-white break-words">
                  {poll.question}
                </h2>

                <div className="space-y-2">
                  {poll.options.map((opt, i) => {
                    const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300 gap-2">
                          <span className="min-w-0 break-words flex-1 pr-1">{opt.text}</span>
                          <span className="flex-shrink-0 font-bold">{pct}% ({opt.votes} votes)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-emerald-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                Create Student Poll
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Which event would you prefer for Council Week?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Voting Options ({options.length}/6)
                  </label>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Min 2, Max 6</span>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all shadow-sm"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Enter option ${idx + 1}...`}
                        className="bg-transparent border-0 focus:ring-0 text-xs sm:text-sm py-2 px-3 text-slate-900 dark:text-white placeholder-slate-400 flex-1 min-w-0 font-medium focus:outline-none"
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                          title="Remove option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOptionField}
                      className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Option ({options.length}/6)</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Closing Date
                </label>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 pb-4 px-5 sm:px-7 mt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm -mx-5 sm:-mx-7 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="portal-button-secondary text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-button-primary text-xs font-semibold active:scale-95 shadow-sm"
                >
                  {isSubmitting ? "Creating..." : "Launch Poll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteIds && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Delete {confirmDeleteIds.length > 1 ? `${confirmDeleteIds.length} Polls` : 'Poll'}?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete {confirmDeleteIds.length > 1 ? `these ${confirmDeleteIds.length} student polls` : 'this student poll'} and all recorded ballot votes from the database?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteIds(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : `Delete ${confirmDeleteIds.length > 1 ? `(${confirmDeleteIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
