import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  AlertCircle,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Cookie,
  RotateCcw,
  User
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { cookieService } from '../services/cookieService';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function ChatPage({ setCurrentRoute, showToast }) {
  const [session, setSession] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [adminPresence, setAdminPresence] = useState({ isOnline: false, lastSeen: null });
  const messagesContainerRef = useRef(null);
  const activeSessionIdRef = useRef(null);

  // Subscribe to real-time council admin presence
  useEffect(() => {
    const unsubscribe = storageService.subscribeToAdminPresence((presence) => {
      setAdminPresence(presence);
    });
    return () => unsubscribe?.();
  }, []);

  // Initialize or resume chat session using 24-hr Browser Cookies
  useEffect(() => {
    // 1. Check browser cookie first for persistent 24h session
    let activeSessionId = cookieService.getChatCookie();
    
    // Fallback to sessionStorage if cookie was blocked
    if (!activeSessionId && typeof sessionStorage !== 'undefined') {
      activeSessionId = sessionStorage.getItem('gmc_active_session_id');
    }

    async function loadChat() {
      // If Firebase is configured, ensure anonymous auth session for cloud ownership
      if (isFirebaseConfigured && auth && !auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Anonymous auth failed, continuing in ephemeral mode:", err);
        }
      }

      const s = await storageService.getOrCreateChatSession(activeSessionId);
      setSession(s);
      activeSessionIdRef.current = s.sessionId;
      
      // Store session in cookie (24-hour TTL)
      cookieService.setChatCookie(s.sessionId);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('gmc_active_session_id', s.sessionId);
      }
    }

    loadChat();

    // Listen for incoming council reply events without stale closures
    const handleChatUpdate = (e) => {
      const currentId = activeSessionIdRef.current;
      if (currentId && e.detail?.sessionId === currentId) {
        storageService.getOrCreateChatSession(currentId).then(setSession);
      }
    };
    window.addEventListener('gmc-chat-updated', handleChatUpdate);
    return () => window.removeEventListener('gmc-chat-updated', handleChatUpdate);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    if (smooth && typeof container.scrollTo === 'function') {
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      } catch {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Keep scroll smoothly at bottom inside the message container without shifting the outer page window
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom || (session?.messages?.length || 0) <= 2) {
      scrollToBottom(true);
    }
  }, [session?.messages]);

  // Real-time Firestore message subscription
  useEffect(() => {
    if (!session?.sessionId) return;
    const unsubscribe = storageService.subscribeToChat(session.sessionId, (cloudMessages) => {
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: cloudMessages
        };
      });
    });
    return () => unsubscribe?.();
  }, [session?.sessionId]);

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
      setTimeout(() => scrollToBottom(true), 50);
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
    } catch (err) {
      console.warn("Cloud endChatSession notice:", err);
    } finally {
      // Clear session cookie and session storage regardless of cloud latency
      cookieService.clearChatCookie();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('gmc_active_session_id');
      }
      try {
        const updated = await storageService.getOrCreateChatSession(session.sessionId);
        setSession(updated);
      } catch {
        // Local fallback
      }
      setShowEndModal(false);
      showToast("Live session terminated & conversation purged", "info");
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
    activeSessionIdRef.current = newS.sessionId;
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
    <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 pb-28 sm:py-10 space-y-4 sm:space-y-8 bg-grid-pattern">
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

      {/* Main Chat Container */}
      <div className="relative">
        {/* Card */}
        <div className="portal-card p-4 sm:p-8 space-y-6 relative">
          
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
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Council Presence Light */}
                {adminPresence.isOnline ? (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>COUNCIL: ONLINE</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full neu-pill text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20" title="Council representative is currently away; messages will be relayed">
                    <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                    <span>COUNCIL: AWAY</span>
                  </div>
                )}

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
          <div ref={messagesContainerRef} className="h-[52vh] sm:h-96 min-h-[300px] overflow-y-auto p-3.5 sm:p-5 rounded-2xl neu-pressed space-y-3.5 sm:space-y-4 overscroll-contain">
            {session.messages.map((msg) => {
              const isCouncil = msg.sender === 'council' || msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCouncil ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className={`flex items-center space-x-1.5 text-[11px] font-mono font-bold px-1 ${
                    isCouncil ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {isCouncil ? (
                      <>
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-2.5 h-2.5" />
                        </span>
                        <span className="uppercase tracking-wider">Council Representative</span>
                      </>
                    ) : (
                      <>
                        <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                          <User className="w-2.5 h-2.5" />
                        </span>
                        <span className="uppercase tracking-wider">You (Student)</span>
                      </>
                    )}
                    <span className="text-[10px] text-slate-400 font-normal">• {msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-sm ${
                      isCouncil
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border-2 border-sky-500/30 dark:border-sky-500/40 shadow-sm'
                        : 'bg-sky-600 text-white rounded-tr-none border border-sky-500 shadow-md shadow-sky-600/20'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Form */}
          {isConnected ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message to the council representative..."
                  disabled={isSending}
                  className="min-w-0 flex-1 px-4 py-3.5 neu-input text-base sm:text-sm placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  title="Send Message"
                  className="portal-button-primary px-4 sm:px-5 py-3.5 font-bold text-xs disabled:opacity-50 flex items-center justify-center space-x-1.5 active:scale-95 shadow-md flex-shrink-0"
                >
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>

              {/* End Chat Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pt-2 text-xs font-mono">
                <div className="text-slate-400 flex items-center space-x-1.5 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <span>Session auto-expires after 24 hours</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowEndModal(true)}
                  className="text-red-500 hover:text-red-600 font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors self-end sm:self-auto flex-shrink-0 active:scale-95"
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
