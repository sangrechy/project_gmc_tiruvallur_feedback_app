import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  AlertCircle,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Cookie,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { cookieService } from '../services/cookieService';

export default function ChatPage({ setCurrentRoute, showToast }) {
  const [session, setSession] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or resume chat session using 24-hr Browser Cookies
  useEffect(() => {
    // 1. Check browser cookie first for persistent 24h session
    let activeSessionId = cookieService.getChatCookie();
    
    // Fallback to sessionStorage if cookie was blocked
    if (!activeSessionId && typeof sessionStorage !== 'undefined') {
      activeSessionId = sessionStorage.getItem('gmc_active_session_id');
    }

    async function loadChat() {
      const s = await storageService.getOrCreateChatSession(activeSessionId);
      setSession(s);
      
      // Store session in cookie (24-hour TTL)
      cookieService.setChatCookie(s.sessionId);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('gmc_active_session_id', s.sessionId);
      }
    }

    loadChat();

    // Listen for incoming council reply events
    const handleChatUpdate = (e) => {
      if (e.detail?.sessionId === activeSessionId) {
        storageService.getOrCreateChatSession(activeSessionId).then(setSession);
      }
    };
    window.addEventListener('gmc-chat-updated', handleChatUpdate);
    return () => window.removeEventListener('gmc-chat-updated', handleChatUpdate);
  }, []);

  // Smooth scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session || session.status !== 'active') return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await storageService.sendChatMessage(session.sessionId, 'student', text);
      const updated = await storageService.getOrCreateChatSession(session.sessionId);
      setSession(updated);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!session) return;
    try {
      await storageService.endChatSession(session.sessionId);
      const updated = await storageService.getOrCreateChatSession(session.sessionId);
      setSession(updated);
      
      // Clear session cookie upon closing
      cookieService.clearChatCookie();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('gmc_active_session_id');
      }

      setShowEndModal(false);
      showToast("Live session terminated & conversation purged", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleStartNewChat = async () => {
    cookieService.clearChatCookie();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('gmc_active_session_id');
    }

    const newS = await storageService.getOrCreateChatSession();
    cookieService.setChatCookie(newS.sessionId);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('gmc_active_session_id', newS.sessionId);
    }

    setSession(newS);
    showToast("New temporary chat channel initialized", "success");
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-slate-500 font-mono text-xs">
        Initializing student council chat...
      </div>
    );
  }

  const isConnected = session.status === 'active';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 bg-grid-pattern">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-300/40 dark:border-slate-800/80 text-xs font-mono">
        <button 
          onClick={() => setCurrentRoute('home')}
          className="flex items-center space-x-1 text-slate-500 hover:text-sky-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center space-x-1 text-slate-400">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-sky-600 dark:text-sky-400 font-bold">LIVE CHAT</span>
        </div>
      </div>

      {/* Main Chat Container with Bleeding Myself Mascot */}
      <div className="relative mt-12">
        
        {/* MYSELF STICKER: Bleeding out of the top-right corner */}
        <div 
          className="sticker-bleed sticker-float-r -top-12 sm:-top-18 right-1 sm:-right-8 w-22 sm:w-36 pointer-events-auto"
          title="Student Council Live Chat Representative"
        >
          <img 
            src="/stickers/myself.webp" 
            alt="Council Chat Representative Mascot Bleeding Out" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Card (overflow-visible to let mascot bleed out) */}
        <div className="portal-card p-4 sm:p-8 space-y-6 relative overflow-visible pt-10 sm:pt-10">
          
          {/* Header Banner */}
          <div className="border-b border-slate-200/60 dark:border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full neu-pill text-[11px] font-semibold text-sky-600 dark:text-sky-400 mb-2 border border-sky-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>24-Hour Temporary Chat</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                  Student Council Live Chat
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct two-way confidential communication with elected representatives
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 24-hr Cookie Badge */}
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Cookie className="w-3 h-3" />
                  <span>Cookie Session (24h)</span>
                </div>

                {/* Connection Status */}
                {isConnected ? (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse-dot" />
                    <span>CONNECTED</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full neu-pill text-[10px] font-mono text-slate-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>CLOSED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Session Token Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/40 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-300/30 dark:border-slate-800/60">
              <div className="flex items-center space-x-2">
                <span>Session Hash:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 select-all">
                  {session.sessionId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Self-purges after 24 hours of inactivity
              </div>
            </div>
          </div>

          {/* Message Stream with Neumorphic Inset */}
          <div className="h-96 overflow-y-auto p-4 sm:p-5 rounded-2xl neu-pressed space-y-4">
            {session.messages.map((msg) => {
              const isCouncil = msg.sender === 'council';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCouncil ? 'items-start' : 'items-end'}`}
                >
                  <div className="text-[10px] font-mono font-bold mb-1 px-1 text-slate-400">
                    {isCouncil ? "Council Representative" : "You"} • {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                      isCouncil
                        ? 'portal-card text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm border border-slate-300/40 dark:border-slate-800'
                        : 'portal-button-primary text-white dark:text-slate-950 rounded-tr-sm shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          {isConnected ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message to the council representative..."
                  disabled={isSending}
                  className="flex-1 px-4 py-3.5 neu-input text-xs sm:text-sm placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  title="Send Message"
                  className="portal-button-primary px-5 py-3.5 font-semibold text-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* End Chat Bar */}
              <div className="flex items-center justify-between pt-2 text-xs font-mono">
                <div className="text-slate-400 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Session auto-expires after 24 hours</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowEndModal(true)}
                  className="text-red-500 hover:text-red-600 font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>End Live Session</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl neu-pressed text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                This live session has been concluded. The conversation history is frozen and will be automatically purged by the server.
              </p>
              <button
                onClick={handleStartNewChat}
                className="portal-button-primary px-6 py-2.5 text-xs font-semibold inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Live Chat Session</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal to End Chat */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 neu-card mx-auto flex items-center justify-center text-red-500">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
              Terminate Live Session?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Terminating will close the connection and clear your 24h browser session cookie. All conversation logs will be safely purged.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleEndChat}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Terminate Session
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="portal-button-secondary px-4 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
