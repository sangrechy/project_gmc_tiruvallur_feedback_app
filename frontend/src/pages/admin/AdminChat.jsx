import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Bot, 
  ArrowLeft,
  ShieldCheck 
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function AdminChat({ chats, onRefreshChats, showToast }) {
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMobileChatView, setShowMobileChatView] = useState(false);

  const selectedSession = chats.find(c => c.id === selectedChatId) || chats[0];

  const handleSelectChat = (id) => {
    setSelectedChatId(id);
    setShowMobileChatView(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;

    setIsSending(true);
    try {
      await storageService.sendChatMessage(selectedSession.sessionId, 'council', replyText.trim());
      setReplyText('');
      await onRefreshChats();
      showToast("Council reply delivered to student", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;
    try {
      await storageService.endChatSession(selectedSession.sessionId);
      await onRefreshChats();
      showToast("Chat session closed", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Live Student Chat
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Read live student messages and send council replies directly
          </p>
        </div>

        {/* Telegram Relay Status Box */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-mono">
          <Bot className="w-4 h-4 text-sky-500" />
          <span>Telegram Relay: Ready (/chat, /reply)</span>
        </div>
      </div>

      {/* Main 2-Column Chat Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active Sessions List (Hidden on mobile if chat view is active) */}
        <div className={`portal-card p-4 space-y-3 lg:col-span-1 ${showMobileChatView ? 'hidden lg:block' : 'block'}`}>
          <div className="text-xs font-mono font-bold text-slate-400 uppercase px-1">
            Student Sessions ({chats.length})
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active student chat sessions
              </div>
            ) : (
              chats.map((c) => {
                const isSelected = c.id === selectedChatId;
                const lastMsg = c.messages?.[c.messages.length - 1];
                const isActive = c.status === 'active';

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChat(c.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                        : 'border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {c.sessionId}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-sans">
                      {lastMsg ? `${lastMsg.sender === 'council' ? 'Council: ' : 'Student: '}${lastMsg.text}` : 'No messages'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Window & Reply Desk */}
        <div className={`portal-card p-4 sm:p-6 lg:col-span-2 flex flex-col justify-between space-y-4 ${!showMobileChatView ? 'hidden lg:flex' : 'flex'}`}>
          {selectedSession ? (
            <>
              {/* Chat Session Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setShowMobileChatView(false)}
                    className="lg:hidden p-1.5 neu-button rounded-lg text-slate-600 dark:text-slate-300"
                    title="Back to all chat sessions"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        Session {selectedSession.sessionId}
                      </span>
                      {selectedSession.status === 'active' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Active: {selectedSession.lastActivity ? new Date(selectedSession.lastActivity).toLocaleTimeString() : 'Recently'}
                    </div>
                  </div>
                </div>

                {selectedSession.status === 'active' && (
                  <button
                    onClick={handleEndSession}
                    className="px-2.5 py-1.5 rounded-xl neu-button text-red-500 hover:text-red-600 font-mono text-xs font-semibold transition-colors"
                  >
                    Close Session
                  </button>
                )}
              </div>

              {/* Messages Container */}
              <div className="h-80 sm:h-96 overflow-y-auto p-4 rounded-xl bg-slate-100/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3">
                {selectedSession.messages?.map((msg) => {
                  const isCouncil = msg.sender === 'council';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCouncil ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] font-mono text-slate-400 mb-0.5 px-1">
                        {isCouncil ? "Council" : "Student"} • {msg.timestamp}
                      </div>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed ${
                          isCouncil
                            ? 'bg-sky-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Bar */}
              {selectedSession.status === 'active' ? (
                <form onSubmit={handleSendReply} className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type council reply to ${selectedSession.sessionId}...`}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-sans focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="portal-button-primary px-4 py-2.5 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 text-center text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  This student session is closed.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 font-sans text-xs">
              Select an active student session to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
