import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';

export default function AdminFeedback({ feedbacks, onUpdateFeedbackStatus, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = ['ALL', 'Academics', 'Infrastructure', 'Hostel & Mess', 'Transport', 'Sports & Cultural', 'Library', 'Hospital & Clinical Postings', 'Others'];

  const filtered = feedbacks.filter((fb) => {
    const matchesSearch = fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fb.trackingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || fb.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || fb.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdate = async (id, status) => {
    try {
      await onUpdateFeedbackStatus(id, status);
      if (selectedItem?.id === id) {
        setSelectedItem(prev => ({ ...prev, status }));
      }
      showToast(`Status updated to ${status}`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
            FEEDBACK MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Confidential student grievance queue and status tracking
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search content or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1 text-xs font-mono">
          <span className="text-slate-400">Status:</span>
          {['ALL', 'Received', 'Reviewing', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono ml-auto">
          <span className="text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Submissions Table */}
      <div className="portal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Privacy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{item.trackingId}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4 max-w-xs truncate font-sans text-slate-600 dark:text-slate-300">
                    {item.content}
                  </td>
                  <td className="py-3 px-4">
                    {item.containsPII ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold">
                        PII Flagged
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        Clean AI
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-slate-300 dark:border-slate-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white font-bold transition-colors"
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

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-600">
                {selectedItem.trackingId} • {selectedItem.category}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs font-mono text-slate-400 hover:text-slate-600"
              >
                [CLOSE X]
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line border border-slate-200 dark:border-slate-700">
              {selectedItem.content}
            </div>

            {selectedItem.aiAnalysis && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-xs font-mono space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex justify-between">
                  <span>AI Sentiment: {selectedItem.aiAnalysis.sentiment}</span>
                  <span>Urgency: {selectedItem.aiAnalysis.urgency}</span>
                </div>
                <p className="font-sans text-slate-600 dark:text-slate-400">
                  {selectedItem.aiAnalysis.summary}
                </p>
              </div>
            )}

            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">
                Triage Status
              </div>
              <div className="flex gap-2">
                {['Received', 'Reviewing', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdate(selectedItem.id, st)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      selectedItem.status === st
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
