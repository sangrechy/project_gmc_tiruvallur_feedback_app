import React, { useState } from 'react';
import { Vote, Plus, Trash2, CheckCircle2, Lock, Unlock, BarChart2 } from 'lucide-react';

export default function AdminPolls({ polls, onAddPoll, onTogglePollStatus, showToast }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closingDate, setClosingDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      {/* Polls List */}
      <div className="space-y-4">
        {polls.map((poll) => {
          const isActive = poll.status === 'active';

          return (
            <div key={poll.id} className="portal-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    [{poll.status.toUpperCase()}]
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Deadline: {poll.closingDate}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
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
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {poll.question}
              </h2>

              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-700 dark:text-slate-300">
                        <span>{opt.text}</span>
                        <span>{pct}% ({opt.votes} votes)</span>
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
        })}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase">
                Create Student Poll
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600"
              >
                [CLOSE X]
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Which event would you prefer for Council Week?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    Voting Options (min 2, max 6)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    className="text-xs font-mono font-bold text-emerald-600 hover:underline"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Closing Date
                </label>
                <input
                  type="date"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="portal-button-secondary text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-button-primary text-xs font-mono font-bold"
                >
                  {isSubmitting ? "CREATING..." : "LAUNCH POLL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
