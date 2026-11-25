import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle,
  RefreshCw, 
  Copy, 
  Check, 
  Bot, 
  Server, 
  Send, 
  Mail, 
  Database, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function AdminStatus({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const fetchStatus = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await apiService.getAppStatus(forceRefresh);
      setStatusData(data);
    } catch (err) {
      showToast?.('Failed to fetch status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(false);
  }, []);

  const handleCopyDiagnostics = () => {
    if (!statusData) return;
    navigator.clipboard.writeText(JSON.stringify(statusData, null, 2));
    setCopied(true);
    showToast?.('Status telemetry copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const isBackendOnline = statusData?.backend?.status === 'connected';
  const latency = statusData?.backend?.latencyMs;
  const isAiOnline = statusData?.aiApi?.status === 'connected';
  const isDbConnected = statusData?.database?.status === 'connected';
  const isTelegramConfigured = statusData?.telegram?.status === 'connected';
  const isGmailConfigured = statusData?.gmail?.status === 'connected';

  const allCoreOnline = isBackendOnline && isDbConnected;

  const checklist = [
    { 
      name: 'Cloudflare Worker Backend', 
      icon: Server, 
      status: isBackendOnline ? (latency !== null && latency !== undefined ? `Online (${latency}ms)` : 'Online') : 'Offline',
      color: isBackendOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
      dotColor: isBackendOnline ? 'bg-emerald-500' : 'bg-red-500'
    },
    { 
      name: 'Database Tier (Firestore)', 
      icon: Database, 
      status: isDbConnected ? 'Connected' : 'Local Fallback',
      color: isDbConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400',
      dotColor: isDbConnected ? 'bg-emerald-500' : 'bg-amber-400'
    },
    { 
      name: 'AI Intelligence Engine', 
      icon: Bot, 
      status: isAiOnline ? 'Active (Gemini / Groq)' : 'Not Configured',
      color: isAiOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400',
      dotColor: isAiOnline ? 'bg-emerald-500' : 'bg-amber-400'
    },
    { 
      name: 'Telegram Council Relay', 
      icon: Send, 
      status: isTelegramConfigured ? 'Active' : 'Not Configured',
      color: isTelegramConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500',
      dotColor: isTelegramConfigured ? 'bg-emerald-500' : 'bg-slate-400'
    },
    { 
      name: 'Gmail Alert Dispatcher', 
      icon: Mail, 
      status: isGmailConfigured ? 'Active' : 'Not Configured',
      color: isGmailConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500',
      dotColor: isGmailConfigured ? 'bg-emerald-500' : 'bg-slate-400'
    },
    { 
      name: 'Council Security Shield', 
      icon: ShieldCheck, 
      status: 'Active (Timing-Safe)',
      color: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-500'
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn font-sans py-4">
      
      {/* Title */}
      <div className="text-center pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          App Status &amp; Subsystem Health
        </h1>
      </div>

      {/* Honest Status Card */}
      <div className={`portal-card p-6 sm:p-8 space-y-6 text-center border-2 ${
        allCoreOnline ? 'border-emerald-500/30' : 'border-amber-500/30'
      }`}>
        
        {/* Status Indicator Icon & Title */}
        <div className="space-y-3">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            allCoreOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {allCoreOnline ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {allCoreOnline ? 'Core Systems Operational' : 'Degraded / Partial Services'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {allCoreOnline 
              ? 'Cloudflare serverless backend and Firebase database are connected and operational.'
              : 'One or more subsystem services are disconnected or running in local fallback mode.'}
          </p>
        </div>

        {/* 6-item Real-time Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-xl mx-auto text-left pt-2">
          {checklist.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.name}
                className="p-3 rounded-xl neu-card flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Icon className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>
                <span className={`inline-flex items-center space-x-1 text-[11px] sm:text-xs font-bold flex-shrink-0 whitespace-nowrap ${item.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dotColor}`} />
                  <span>{item.status}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Telemetry Snapshot ID & Timestamp */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span>Live Telemetry</span>
          <span>•</span>
          <span>{statusData?.snapshotId || 'GMC-DIAG'}</span>
          <span>•</span>
          <span>{statusData?.checkedAt ? new Date(statusData.checkedAt).toLocaleTimeString() : 'Online'}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchStatus(true)}
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
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Telemetry JSON'}</span>
          </button>
        </div>

        {/* Official Subsystem Notice */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-2 max-w-lg mx-auto">
          <Activity className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <span>Real-time subsystem telemetry queried directly from serverless diagnostic endpoints.</span>
        </div>

      </div>

    </div>
  );
}
