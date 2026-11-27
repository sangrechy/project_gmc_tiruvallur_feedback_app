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
import { formatShortDateTime, formatTimeOnly } from '../utils/dateUtils';

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
    if (isSending || !inputText.trim() || !session || session.status !== 'active') return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const newMsg = await storageService.sendChatMessage(session.sessionId, 'student', text);
      setSession(prev => {
        if (!prev) return prev;
        const exists = prev.messages?.some(m => m.id === newMsg.id);
        return {
          ...prev,
          lastActivity: new Date().toISOString(),
          messages: exists ? prev.messages : [...(prev.messages || []), newMsg]
        };
      });
      setTimeout(() => scrollToBottom(true), 40);
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
    <div className="h-[calc(100dvh-7.75rem)] md:h-[calc(100dvh-5.5rem)] max-h-[760px] max-w-3xl mx-auto px-2.5 sm:px-6 py-2 sm:py-4 flex flex-col">
      {/* Main Full-Viewport Compact Chat Card matching Council Admin UI */}
      <div className="portal-card flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Compact Single-Row Chat Top Bar (Back + Title + Online Status + End Live Session) */}
        <div className="flex-shrink-0 flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 min-w-0">
            <button
              type="button"
              onClick={() => setCurrentRoute('home')}
              className="p-1.5 !min-h-[34px] w-8 h-8 neu-button rounded-lg text-slate-600 dark:text-slate-300 flex-shrink-0"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                Live Chat
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5 truncate">
                {adminPresence.isOnline ? (
                  <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 font-semibold text-amber-600 dark:text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Away</span>
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700">•</span>
                {isConnected ? (
                  <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-slate-400">
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>Closed</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {isConnected && (
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="px-2.5 py-1.5 !min-h-[34px] rounded-lg neu-button text-red-600 dark:text-red-400 text-[11px] font-semibold flex items-center space-x-1 transition-colors flex-shrink-0 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span>End Live Session</span>
            </button>
          )}
        </div>

        {/* Ultra-Slim Single-Line Session Meta Bar (never wraps vertically on phones) */}
        <div className="flex-shrink-0 mt-2 mb-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar whitespace-nowrap text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-1.5">
            <span className="font-code font-medium text-sky-600 dark:text-sky-400 select-all">{session.sessionId}</span>
            {session.createdAt && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{formatShortDateTime(session.createdAt)}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400">
              <Cookie className="w-3 h-3" />
              <span>Cookie Session (24h)</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1">
              <Clock className="w-3 h-3 text-sky-500" />
              <span>Session auto-expires after 24 hours</span>
            </span>
          </div>
        </div>

        {/* Flex-1 Message Stream: Auto-fits exact remaining height on EVERY phone */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/90 border border-slate-200/70 dark:border-slate-800 space-y-3 overscroll-contain">
          {session.messages.map((msg) => {
            const isCouncil = msg.sender === 'council' || msg.sender === 'admin';
            const displayTime = formatShortDateTime(msg.createdAt || msg.createdAtIso, msg.timestamp || formatTimeOnly(session.createdAt));
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCouncil ? 'items-start' : 'items-end'} space-y-1`}
              >
                <div className={`flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-mono font-bold px-1 ${
                  isCouncil ? 'text-sky-700 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'
                }`}>
                  {isCouncil ? (
                    <>
                      <span className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                      </span>
                      <span>Council</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                        <User className="w-2.5 h-2.5" />
                      </span>
                      <span>You</span>
                    </>
                  )}
                  {displayTime && (
                    <span className="text-[10px] text-slate-400 font-normal">• {displayTime}</span>
                  )}
                </div>
                <div
                  className={`max-w-[88%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-sm ${
                    isCouncil
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm'
                      : 'bg-sky-600 text-white rounded-tr-sm border border-sky-600'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pinned Message Input Form — Always visible without scrolling */}
        <div className="flex-shrink-0 pt-2.5">
          {isConnected ? (
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="min-w-0 flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="portal-button-primary px-3.5 sm:px-4 py-2.5 !min-h-[42px] text-xs font-bold flex items-center justify-center space-x-1.5 flex-shrink-0 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          ) : (
            <div className="p-3 rounded-xl neu-pressed text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This live session has ended and conversation history was purged.
              </p>
              <button
                onClick={handleStartNewChat}
                className="portal-button-primary px-4 py-2 !min-h-[38px] text-xs font-semibold inline-flex items-center space-x-1.5"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
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
