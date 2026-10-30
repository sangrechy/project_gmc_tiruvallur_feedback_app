import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  AlertCircle,
  LogOut
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function ChatPage({ setCurrentRoute, showToast }) {
  const [session, setSession] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or resume chat session
  useEffect(() => {
    let activeSessionId = sessionStorage.getItem('gmc_active_session_id');
    
    async function loadChat() {
      const s = await storageService.getOrCreateChatSession(activeSessionId);
      setSession(s);
      sessionStorage.setItem('gmc_active_session_id', s.sessionId);
    }

    loadChat();

    // Listen for incoming message updates
    const handleChatUpdate = (e) => {
      if (e.detail?.sessionId === activeSessionId) {
        storageService.getOrCreateChatSession(activeSessionId).then(setSession);
      }
    };
    window.addEventListener('gmc-chat-updated', handleChatUpdate);
    return () => window.removeEventListener('gmc-chat-updated', handleChatUpdate);
  }, []);

  // Auto-scroll on new message
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
      setShowEndModal(false);
      showToast("Chat session ended", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleStartNewChat = async () => {
    sessionStorage.removeItem('gmc_active_session_id');
    const newS = await storageService.getOrCreateChatSession();
    sessionStorage.setItem('gmc_active_session_id', newS.sessionId);
    setSession(newS);
    showToast("New chat session started", "success");
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-500 font-mono">
        Connecting to GMC Council Live Chat...
      </div>
    );
  }

  const isConnected = session.status === 'active';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar matching wireframe */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/50 dark:border-slate-800/80 text-xs font-mono">
        <span className="font-bold text-slate-800 dark:text-slate-200">GMC STUDENT COUNCIL</span>
        <span className="text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">
          TEMPORARY CHAT
        </span>
      </div>

      <div className="portal-card p-6 sm:p-8 space-y-6">
        {/* Title & Connection Status with Mascot */}
        <div className="border-b border-slate-200/50 dark:border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 neu-circle p-1.5 flex items-center justify-center flex-shrink-0 sticker-float">
                <img 
                  src="/stickers/myself.webp" 
                  alt="Council Chat Representative" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-mono uppercase tracking-tight">
                  CHAT WITH STUDENT COUNCIL
                </h1>
                <div className="text-[11px] font-mono text-slate-400">
                  Direct encrypted ephemeral channel
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Your Session ID:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400 neu-pill px-3 py-0.5">
                {session.sessionId}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Status:</span>
              {isConnected ? (
                <span className="flex items-center space-x-1.5 font-bold text-emerald-500 neu-pill px-3 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CONNECTED</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 font-bold text-slate-400 neu-pill px-3 py-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{session.status.toUpperCase()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message Container Area with Neumorphic Inset */}
        <div className="h-96 overflow-y-auto p-4 rounded-2xl neu-pressed space-y-4">
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
                      ? 'portal-card text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm'
                      : 'portal-button-primary text-white rounded-tr-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box matching wireframe */}
        {isConnected ? (
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-4 py-3.5 neu-input text-xs sm:text-sm placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                title="Send Message"
                className="portal-button-primary px-5 py-3.5 font-mono font-bold disabled:opacity-50"
              >
                <span>[-&gt;]</span>
              </button>
            </div>

            {/* Inactivity Expiry Notice */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>Session expires after 24 hours of inactivity.</span>
              </div>
            </div>

            {/* End Chat CTA */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="text-xs font-mono font-bold text-red-500 hover:text-red-600 uppercase tracking-wider py-1.5 px-4 neu-button transition-colors"
              >
                [ END CHAT ]
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-2xl neu-pressed text-center space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              This conversation is marked as <strong>{session.status}</strong>. Messages can no longer be sent to this session.
            </p>
            <button
              onClick={handleStartNewChat}
              className="portal-button-primary font-mono text-xs font-bold px-6 py-3"
            >
              [ START NEW LIVE CHAT ]
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal to End Chat */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 neu-circle mx-auto p-2 flex items-center justify-center text-red-500">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-mono">
              End Live Chat Session?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ending the session will close communication. In accordance with council data privacy rules, conversation logs will be safely purged.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleEndChat}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono transition-colors shadow-sm"
              >
                YES, END CHAT
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="portal-button-secondary px-4 py-2.5 text-xs font-bold font-mono"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
