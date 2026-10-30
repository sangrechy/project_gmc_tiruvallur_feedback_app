import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session || session.status !== 'active') return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await storageService.sendChatMessage(session.sessionId, 'student', text);
      // Reload session
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
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 text-xs font-mono">
        <span className="font-bold text-slate-800 dark:text-slate-200">GMC STUDENT COUNCIL</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
          TEMPORARY CHAT
        </span>
      </div>

      <div className="portal-card p-6 sm:p-8 space-y-6">
        {/* Title & Connection Status */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
            CHAT WITH STUDENT COUNCIL
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Your Session ID:</span>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {session.sessionId}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Status:</span>
              {isConnected ? (
                <span className="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CONNECTED</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 font-bold text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{session.status.toUpperCase()}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message Container Area */}
        <div className="h-96 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          {session.messages.map((msg) => {
            const isCouncil = msg.sender === 'council';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCouncil ? 'items-start' : 'items-end'}`}
              >
                <div className="text-[10px] font-mono font-bold mb-1 px-1 text-slate-500 dark:text-slate-400">
                  {isCouncil ? "Council" : "You"} • {msg.timestamp}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    isCouncil
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-sm shadow-sm'
                      : 'bg-emerald-600 text-white rounded-tr-sm shadow-sm'
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
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                title="Send Message"
                className="portal-button-primary px-5 py-3 rounded-xl font-mono font-bold disabled:opacity-50"
              >
                <span>[-&gt;]</span>
              </button>
            </div>

            {/* Inactivity Expiry Notice */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Session expires after 24 hours of inactivity.</span>
              </div>
            </div>

            {/* End Chat CTA */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="text-xs font-mono font-bold text-red-600 dark:text-red-400 hover:text-red-700 uppercase tracking-wider py-1 px-3 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                [ END CHAT ]
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-center space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              This conversation is marked as <strong>{session.status}</strong>. Messages can no longer be sent to this session.
            </p>
            <button
              onClick={handleStartNewChat}
              className="portal-button-primary font-mono text-xs font-bold"
            >
              [ START NEW LIVE CHAT ]
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal to End Chat */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="portal-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              End Live Chat Session?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ending the session will close communication. In accordance with council data privacy rules, conversation logs will be safely purged.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleEndChat}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono transition-colors"
              >
                YES, END CHAT
              </button>
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono transition-colors"
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
