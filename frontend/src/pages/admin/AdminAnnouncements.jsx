import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Pin, Calendar, Clock, X, AlertCircle } from 'lucide-react';

export default function AdminAnnouncements({ 
  announcements, 
  onAddAnnouncement, 
  onDeleteAnnouncement, 
  onDeleteMultipleAnnouncements,
  onUpdateAnnouncement, 
  showToast 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IMPORTANT');
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
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
    const allIds = announcements.map(a => a.id);
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
      if (onDeleteMultipleAnnouncements) {
        await onDeleteMultipleAnnouncements(confirmDeleteIds);
      } else if (onDeleteAnnouncement && confirmDeleteIds.length === 1) {
        await onDeleteAnnouncement(confirmDeleteIds[0]);
      }
      showToast(`${confirmDeleteIds.length} announcement${confirmDeleteIds.length > 1 ? 's' : ''} removed`, "info");
      setSelectedIds(prev => prev.filter(id => !confirmDeleteIds.includes(id)));
      setConfirmDeleteIds(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const handleTogglePin = async (ann) => {
    try {
      await onUpdateAnnouncement(ann.id, { pinned: !ann.pinned });
      showToast(ann.pinned ? "Announcement unpinned" : "Announcement pinned to top", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
            Announcements
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="portal-button-primary w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Multi-Select Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-[68px] md:top-[124px] z-30 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 shadow-lg border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs font-mono">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {selectedIds.length} announcement{selectedIds.length > 1 ? 's' : ''} selected
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
      {announcements.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={announcements.length > 0 && announcements.every(a => selectedIds.includes(a.id))}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Select All Announcements ({announcements.length})
            </span>
          </label>

          {selectedIds.length > 0 && (
            <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold">
              {selectedIds.length} of {announcements.length} selected
            </span>
          )}
        </div>
      )}

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
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ann.id)}
                    onChange={() => handleToggleSelect(ann.id)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer mr-0.5"
                    title="Select announcement"
                  />
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
                  onClick={() => setConfirmDeleteIds([ann.id])}
                  disabled={isDeleting}
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 animate-fadeIn">
          <div className="portal-card max-w-lg w-full max-h-[82dvh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                New Campus Announcement
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

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/50 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
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
                  className="portal-button-primary px-4 py-2 text-xs font-semibold shadow-sm active:scale-95"
                >
                  {isSubmitting ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteIds && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-lg animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Delete {confirmDeleteIds.length > 1 ? `${confirmDeleteIds.length} Announcements` : 'Announcement'}?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete {confirmDeleteIds.length > 1 ? `these ${confirmDeleteIds.length} campus announcements` : 'this campus announcement'} from the Council notice board and database?
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
