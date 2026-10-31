import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function AdminReports({ feedbacks, showToast }) {
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const saved = localStorage.getItem('gmc_admin_session');
      const token = saved ? JSON.parse(saved)?.token : null;
      const data = await apiService.generateAiReport(feedbacks, token);
      setReportData(data);
      if (data?.isAiGenerated) {
        showToast("AI intelligence report generated via Cloudflare Worker", "success");
      } else {
        showToast("Feedback statistical distribution calculated", "info");
      }
    } catch (err) {
      showToast("Failed to generate report: " + err.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [feedbacks.length]);

  const exportJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmc_council_ai_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast("Report exported as JSON", "success");
  };

  const exportCSV = () => {
    if (!feedbacks || feedbacks.length === 0) return;
    const headers = "ID,TrackingID,Category,Status,ContainsPII,Sentiment,Urgency,Content\n";
    const sanitizeCSVCell = (val) => {
      if (val === null || val === undefined) return '""';
      let s = String(val);
      if (/^[=+\-@\t\r]/.test(s)) {
        s = "'" + s;
      }
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = feedbacks.map(f => {
      const cleanId = sanitizeCSVCell(f.id);
      const cleanTrack = sanitizeCSVCell(f.trackingId);
      const cleanCat = sanitizeCSVCell(f.category);
      const cleanStatus = sanitizeCSVCell(f.status);
      const cleanPII = sanitizeCSVCell(Boolean(f.containsPII));
      const sent = sanitizeCSVCell(f.aiAnalysis?.sentiment || "N/A");
      const urg = sanitizeCSVCell(f.aiAnalysis?.urgency || "N/A");
      const cleanContent = sanitizeCSVCell(f.content || "");
      return `${cleanId},${cleanTrack},${cleanCat},${cleanStatus},${cleanPII},${sent},${urg},${cleanContent}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmc_feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast("Feedback exported as CSV", "success");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
            AI Analytics &amp; Summary
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="portal-button-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? "Analyzing..." : "Refresh AI Report"}</span>
          </button>

          <button
            onClick={exportCSV}
            className="portal-button-secondary px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="portal-button-secondary px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            title="Export JSON"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {reportData ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="portal-card p-6 border-l-4 border-l-emerald-600 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>EXECUTIVE AI SUMMARY</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
              "{reportData.executiveSummary}"
            </p>
            <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-4 pt-1">
              <span>Analyzed: {reportData.totalAnalyzed} feedback items</span>
              <span>•</span>
              <span className="text-amber-500">
                {reportData.excludedPIICount} flagged submissions excluded from AI model
              </span>
            </div>
          </div>

          {/* Visual Distribution Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Breakdown */}
            <div className="portal-card p-6 space-y-4">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Sentiment Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(reportData.sentimentDistribution || {}).map(([sent, count]) => {
                  const total = reportData.totalAnalyzed || 1;
                  const pct = Math.round((count / total) * 100);
                  const color = sent === 'Positive' ? 'bg-emerald-500' : sent === 'Negative' ? 'bg-red-500' : 'bg-blue-500';

                  return (
                    <div key={sent} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{sent}</span>
                        <span>{pct}% ({count})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="portal-card p-6 space-y-4">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Category Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(reportData.categoryDistribution || {}).map(([cat, count]) => {
                  const total = reportData.totalAnalyzed || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                        <span>{pct}% ({count})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div className="h-2.5 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recurring Themes & Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="portal-card p-6 space-y-3">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Recurring Campus Concerns
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans">
                {reportData.recurringThemes?.map((theme, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="font-mono text-emerald-600 font-bold">•</span>
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="portal-card p-6 space-y-3">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Council Recommendations
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans">
                {reportData.recommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="font-mono text-blue-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="portal-card p-12 text-center text-slate-400 font-mono text-xs">
          Loading AI reports...
        </div>
      )}
    </div>
  );
}
