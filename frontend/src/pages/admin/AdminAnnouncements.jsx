import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Pin, Calendar, Clock, X, AlertCircle } from 'lucide-react';

export default function AdminAnnouncements({ announcements, onAddAnnouncement, onDeleteAnnouncement, onUpdateAnnouncement, showToast }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IMPORTANT');
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("Please enter title and description", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddAnnouncement({
        title: title.trim(),
        category,
        description: description.trim(),
        pinned,
        expiryDate: expiryDate || "2026-12-31"
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setPinned(false);
      setExpiryDate('');
      showToast("Announcement published successfully!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this announcement?")) return;
    try {
      await onDeleteAnnouncement(id);
      showToast("Announcement removed", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleTogglePin = async (ann) => {
    try {
      await onUpdateAnnouncement(ann.id, { pinned: !ann.pinned });
      showToast(ann.pinned ? "Announcement unpinned" : "Announcement pinned to top", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish circulars, notices, and alerts directly to the campus board
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="portal-button-primary text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List (Responsive Cards for Mobile & Clean Table for Desktop) */}
      <div className="space-y-3 sm:space-y-4">
        {announcements.length === 0 ? (
          <div className="portal-card p-12 text-center text-slate-400 text-xs">
            No announcements currently published. Click "Post Announcement" to create one.
          </div>
        ) : (
          announcements.map((ann) => (
            <div 
              key={ann.id}
              className={`portal-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
                ann.pinned ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-slate-200/60 dark:border-white/5'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {ann.category}
                  </span>
                  {ann.pinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                      <Pin className="w-3 h-3 rotate-45" />
                      <span>Pinned</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {ann.date}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ann.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-800 w-full sm:w-auto justify-end flex-shrink-0">
                <button
                  onClick={() => handleTogglePin(ann)}
                  className={`p-2 rounded-xl neu-button text-xs font-semibold flex items-center space-x-1 transition-colors ${
                    ann.pinned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={ann.pinned ? "Unpin notice" : "Pin notice to top"}
                >
                  <Pin className={`w-3.5 h-3.5 ${ann.pinned ? 'rotate-45' : ''}`} />
                  <span className="sm:hidden text-xs">{ann.pinned ? 'Unpin' : 'Pin'}</span>
                </button>

                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 rounded-xl neu-button text-red-500 hover:text-red-600 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  title="Delete notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sm:hidden text-xs">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Campus Announcement
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update: Internal Clinical Assessment 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="CLINICAL">CLINICAL</option>
                    <option value="HOSTEL">HOSTEL</option>
                    <option value="EVENTS">EVENTS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Circular Text
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the full text of the circular or announcement..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="pinCheck" className="text-slate-700 dark:text-slate-300 text-xs cursor-pointer font-medium">
                  Pin to top of campus notice board
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 neu-button rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-button-primary px-4 py-2 text-xs font-semibold"
                >
                  {isSubmitting ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
