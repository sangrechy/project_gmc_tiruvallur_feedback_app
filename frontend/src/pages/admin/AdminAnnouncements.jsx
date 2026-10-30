import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Pin, Calendar, Clock, Edit2 } from 'lucide-react';

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
      showToast("Please fill in title and description", "error");
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
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await onDeleteAnnouncement(id);
      showToast("Announcement deleted", "info");
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
            ANNOUNCEMENT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish notices, set expiry dates, and pin urgent alerts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="portal-button-primary text-xs font-mono font-bold flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>[CREATE ANNOUNCEMENT]</span>
        </button>
      </div>

      {/* Announcements Table */}
      <div className="portal-card overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
            <tr>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Posted Date</th>
              <th className="py-3 px-4">Pinned</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {announcements.map((ann) => (
              <tr key={ann.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    [{ann.category}]
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-sm truncate">
                  {ann.title}
                </td>
                <td className="py-3 px-4 text-slate-500">{ann.date}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleTogglePin(ann)}
                    className={`p-1 rounded transition-colors ${
                      ann.pinned ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-300 hover:text-slate-600'
                    }`}
                    title={ann.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className={`w-4 h-4 ${ann.pinned ? 'rotate-45' : ''}`} />
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1 rounded text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase">
                New Campus Announcement
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600"
              >
                [CLOSE X]
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Revision for Clinical Rotations"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="HOSTEL">HOSTEL</option>
                    <option value="EVENTS">EVENTS</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Text
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full text of the announcement..."
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Pin to top of student announcements
                </span>
              </label>

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
                  {isSubmitting ? "PUBLISHING..." : "PUBLISH ANNOUNCEMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
