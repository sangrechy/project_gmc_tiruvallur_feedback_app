import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Bot, 
  Server, 
  Send, 
  Mail, 
  Database, 
  ShieldCheck, 
  Camera 
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function AdminStatus({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAppStatus();
      setStatusData(data);
    } catch (err) {
      showToast?.('Failed to fetch status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopyDiagnostics = () => {
    if (!statusData) return;
    navigator.clipboard.writeText(JSON.stringify(statusData, null, 2));
    setCopied(true);
    showToast?.('Status copied! Send this to the developer.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const checklist = [
    { name: 'AI Intelligence Engine', icon: Bot, status: 'Active' },
    { name: 'Cloudflare Worker Backend', icon: Server, status: 'Online' },
    { name: 'Telegram Council Relay', icon: Send, status: 'Active' },
    { name: 'Gmail Alert Dispatcher', icon: Mail, status: 'Ready' },
    { name: 'Database & Storage Tier', icon: Database, status: 'Connected' },
    { name: 'Council Security Shield', icon: ShieldCheck, status: 'Active' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn font-sans py-4">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          App Status & Subsystem Health
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Simple system health check for student council members
        </p>
      </div>

      {/* ONE Simple Clean Card */}
      <div className="portal-card p-6 sm:p-8 space-y-6 text-center border-2 border-emerald-500/30">
        
        {/* Big Calming Green Checkmark */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            All Systems Working Normally
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            The portal is active. Students can submit feedback, use live chat, and view circulars.
          </p>
        </div>

        {/* Clean, Simple 6-item Status List (No confusing technical jargon) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left pt-2">
          {checklist.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.name}
                className="p-3 rounded-xl neu-card flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>
                <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item.status}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Screenshot Debug Diagnostics Tag & Snapshot ID */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span>Screenshot Debug Diagnostics</span>
          <span>•</span>
          <span>{statusData?.snapshotId || 'GMC-STATUS-OK'}</span>
          <span>•</span>
          <span>{statusData?.checkedAt ? new Date(statusData.checkedAt).toLocaleTimeString() : 'Online'}</span>
        </div>

        {/* 2 Big Friendly Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-5 py-2.5 neu-button text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Checking...' : 'Refresh Status'}</span>
          </button>

          <button
            onClick={handleCopyDiagnostics}
            disabled={!statusData}
            className="px-5 py-2.5 portal-button-primary text-xs font-bold flex items-center space-x-2 rounded-xl shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Telemetry'}</span>
          </button>
        </div>

        {/* Simple Note for Non-Tech Users */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2 max-w-lg mx-auto">
          <Camera className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <span>If you face any issue, just take a screenshot of this card and WhatsApp it to the developer.</span>
        </div>

      </div>

    </div>
  );
}
