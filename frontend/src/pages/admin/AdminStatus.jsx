import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Copy, 
  Check, 
  Server, 
  Bot, 
  Send, 
  Mail, 
  Database, 
  ShieldCheck, 
  Monitor, 
  Wifi, 
  Clock, 
  Sparkles,
  Camera,
  ExternalLink,
  Info
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
      showToast?.('Failed to fetch system status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh every 30 seconds while on this tab
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyDiagnostics = () => {
    if (!statusData) return;
    const jsonStr = JSON.stringify(statusData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    showToast?.('Diagnostic telemetry copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return {
          pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
          dot: 'bg-emerald-500',
          text: 'CONNECTED'
        };
      case 'demo':
        return {
          pill: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
          dot: 'bg-sky-500',
          text: 'LOCAL DEMO'
        };
      case 'fallback':
        return {
          pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
          dot: 'bg-amber-500',
          text: 'FALLBACK'
        };
      case 'standby':
        return {
          pill: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30',
          dot: 'bg-slate-400',
          text: 'STANDBY'
        };
      case 'offline':
      case 'error':
        return {
          pill: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
          dot: 'bg-red-500',
          text: 'OFFLINE'
        };
      default:
        return {
          pill: 'bg-slate-500/15 text-slate-500 border border-slate-500/30',
          dot: 'bg-slate-400',
          text: 'CHECKING'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
              App Status & Subsystem Health
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time diagnostics and service connectivity monitor for screenshot debugging
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 neu-button text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-all"
            title="Ping all services"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Pinging...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleCopyDiagnostics}
            disabled={!statusData}
            className="px-3.5 py-2 portal-button-primary text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
            title="Copy sanitized JSON diagnostics"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* 📷 HIGH-CONTRAST SCREENSHOT DEBUG CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#07090e] to-slate-950 text-white border-2 border-sky-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-sky-400">
              Screenshot Debug Diagnostics
            </span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
              {statusData?.snapshotId || 'GMC-DIAG-INIT'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{statusData?.checkedAt ? new Date(statusData.checkedAt).toLocaleString() : 'Checking...'}</span>
          </div>
        </div>

        {/* 6 Key Indicator Pills for Instant Visual Debugging */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* AI API */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>AI API</span>
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusData?.aiApi?.status === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  statusData?.aiApi?.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span>{statusData?.aiApi?.status === 'connected' ? 'CONNECTED' : 'FALLBACK'}</span>
              </span>
            </div>
          </div>

          {/* Backend */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>BACKEND</span>
              <Server className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusData?.backend?.status === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  statusData?.backend?.status === 'connected' ? 'bg-emerald-400' : 'bg-sky-400'
                }`} />
                <span>
                  {statusData?.backend?.status === 'connected' 
                    ? `${statusData.backend.latencyMs}ms` 
                    : 'EMULATED'}
                </span>
              </span>
            </div>
          </div>

          {/* Telegram */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>TELEGRAM</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusData?.telegram?.status === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  statusData?.telegram?.status === 'connected' ? 'bg-emerald-400' : 'bg-slate-400'
                }`} />
                <span>{statusData?.telegram?.status === 'connected' ? 'ACTIVE' : 'STANDBY'}</span>
              </span>
            </div>
          </div>

          {/* Gmail */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>GMAIL</span>
              <Mail className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusData?.gmail?.status === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  statusData?.gmail?.status === 'connected' ? 'bg-emerald-400' : 'bg-slate-400'
                }`} />
                <span>{statusData?.gmail?.status === 'connected' ? 'READY' : 'STANDBY'}</span>
              </span>
            </div>
          </div>

          {/* Database */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>DATABASE</span>
              <Database className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusData?.database?.status === 'connected' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  statusData?.database?.status === 'connected' ? 'bg-emerald-400' : 'bg-sky-400'
                }`} />
                <span>{statusData?.database?.status === 'connected' ? 'FIRESTORE' : 'DEMO STORE'}</span>
              </span>
            </div>
          </div>

          {/* Client Network */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>CLIENT</span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{statusData?.client?.online ? 'ONLINE' : 'OFFLINE'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer in Screenshot Card */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-slate-400 gap-1">
          <span>Client: {statusData?.client?.resolution} • {statusData?.client?.platform}</span>
          <span className="text-sky-400">GMC Thiruvallur Student Council Portal v1.0.0</span>
        </div>
      </div>

      {/* DETAILED DIAGNOSTICS DECK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: AI Engine */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  AI Intelligence Engine
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Gemini 1.5 Flash / Groq LLM</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.aiApi.status).pill}`}>
                {statusData.aiApi.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.aiApi?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>PII Redaction: Active</span>
            <span>Sentiment Triage: Active</span>
          </div>
        </div>

        {/* Card 2: Cloudflare Worker */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Cloudflare Worker Backend
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Edge Serverless Gateway</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.backend.status).pill}`}>
                {statusData.backend.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.backend?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between truncate">
            <span>Route: /health, /api/feedback</span>
            <span>Latency: {statusData?.backend?.latencyMs ? `${statusData.backend.latencyMs}ms` : 'Emulated'}</span>
          </div>
        </div>

        {/* Card 3: Telegram Bot */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Telegram Council Relay
                </h3>
                <span className="text-[11px] font-mono text-slate-500">2-Way Live Chat Bridge</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.telegram.status).pill}`}>
                {statusData.telegram.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.telegram?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Bot: @GMCTiruvallurCouncilBot</span>
            <span>Webhook: Decoupled</span>
          </div>
        </div>

        {/* Card 4: Gmail Dispatcher */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Gmail Alert Dispatcher
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Automated Grievance Notifications</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.gmail.status).pill}`}>
                {statusData.gmail.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.gmail?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Channel: council@gmcthiruvallur.ac.in</span>
            <span>Trigger: Urgent Grievance</span>
          </div>
        </div>

        {/* Card 5: Database Tier */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Database & Storage Tier
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Firestore / Offline Storage</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.database.status).pill}`}>
                {statusData.database.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.database?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Rules: v2 Security Active</span>
            <span>Sync: Real-time</span>
          </div>
        </div>

        {/* Card 6: Council Security Shield */}
        <div className="portal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Council Security Shield
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Decoupled Master Token</span>
              </div>
            </div>
            {statusData && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${getStatusBadge(statusData.auth.status).pill}`}>
                {statusData.auth.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {statusData?.auth?.details}
          </p>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Privilege: Full Admin Triage</span>
            <span>Session: Active</span>
          </div>
        </div>
      </div>

      {/* Troubleshooting & Debugging Note */}
      <div className="p-4 rounded-2xl neu-pressed text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 dark:text-slate-200">How to use this for debugging:</strong>
          <p>
            Whenever a service shows an unexpected state or you want to verify live connectivity, simply capture a screenshot of this page or click <span className="font-mono text-sky-600 dark:text-sky-400">Copy Telemetry</span> and send it directly to the developer (<a href="https://github.com/sangrechy" target="_blank" rel="noreferrer" className="underline font-semibold text-sky-500">sangrechy</a>). All credentials remain strictly decoupled and never leak in the snapshot.
          </p>
        </div>
      </div>
    </div>
  );
}
