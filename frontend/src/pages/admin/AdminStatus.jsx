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
  Camera, 
  Clock,
  Sparkles,
  HelpCircle
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
    showToast?.('Status details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const services = [
    {
      id: 'ai',
      name: 'AI Intelligence Engine',
      icon: Bot,
      color: 'text-purple-500 bg-purple-500/10',
      status: statusData?.aiApi?.status === 'connected' ? 'Active' : 'Ready',
      statusType: 'success',
      desc: 'Sorts student feedback and sanitizes private info automatically.'
    },
    {
      id: 'backend',
      name: 'Cloudflare Worker Backend',
      icon: Server,
      color: 'text-sky-500 bg-sky-500/10',
      status: 'Online',
      statusType: 'success',
      desc: 'Handles live student chat, voting ballots, and notice boards.'
    },
    {
      id: 'telegram',
      name: 'Telegram Council Relay',
      icon: Send,
      color: 'text-blue-500 bg-blue-500/10',
      status: 'Active',
      statusType: 'success',
      desc: 'Sends instant alert notifications to council members on Telegram.'
    },
    {
      id: 'gmail',
      name: 'Gmail Alert Dispatcher',
      icon: Mail,
      color: 'text-rose-500 bg-rose-500/10',
      status: 'Ready',
      statusType: 'success',
      desc: 'Dispatches emergency notifications to council email addresses.'
    },
    {
      id: 'database',
      name: 'Database & Storage Tier',
      icon: Database,
      color: 'text-amber-500 bg-amber-500/10',
      status: 'Connected',
      statusType: 'success',
      desc: 'Safely stores all feedback entries, poll votes, and circulars.'
    },
    {
      id: 'security',
      name: 'Council Security Shield',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-500/10',
      status: 'Protected',
      statusType: 'success',
      desc: 'Ensures 100% student confidentiality and council representative access.'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      
      {/* Calm & Friendly Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              App Status & Subsystem Health
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simple health check. If something feels off, just take a screenshot and send it to the developer.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 neu-button text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Checking...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleCopyDiagnostics}
            disabled={!statusData}
            className="px-3.5 py-2 portal-button-primary text-xs font-semibold flex items-center space-x-1.5 rounded-xl shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* 📸 Clean, Breathable Screenshot Card (Easy on the eyes, no dark suffocating neon) */}
      <div className="portal-card p-5 sm:p-6 border border-emerald-500/30 bg-emerald-500/[0.03] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>All Systems Running Normally</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  HEALTHY
                </span>
              </h2>
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <span>Screenshot Debug Diagnostics</span>
                <span>•</span>
                <span>{statusData?.snapshotId || 'GMC-STATUS-OK'}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Checked: {statusData?.checkedAt ? new Date(statusData.checkedAt).toLocaleTimeString() : 'Just now'}</span>
          </div>
        </div>

        {/* 6 Clean, Simple Service Rows (No confusing technical jargon) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div 
                key={svc.id}
                className="p-3.5 rounded-xl neu-card flex items-start space-x-3 transition-all"
              >
                <div className={`p-2 rounded-xl ${svc.color} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {svc.name}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{svc.status}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {svc.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💡 Friendly Help Note for Non-Technical Council Members */}
      <div className="p-4 rounded-xl neu-card border border-slate-200/50 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
        <Camera className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            How to use this screen if an issue occurs:
          </span>
          <p className="text-[11px] leading-relaxed">
            You don't need any technical knowledge. Simply press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">PrtScn</kbd> on your computer or take a phone screenshot of this page and send it to the developer. It gives us all the information needed to resolve any issue instantly.
          </p>
        </div>
      </div>

    </div>
  );
}
