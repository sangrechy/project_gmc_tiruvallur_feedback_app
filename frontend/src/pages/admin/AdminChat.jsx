import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Bot, 
  ShieldCheck 
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function AdminChat({ chats, onRefreshChats, showToast }) {
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedSession = chats.find(c => c.id === selectedChatId) || chats[0];

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
      showToast("Chat session terminated", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono uppercase tracking-tight">
            LIVE CHAT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active temporary student sessions & Telegram Bot webhook relay
          </p>
        </div>

        {/* Telegram Bot Relay Status Box */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono">
          <Bot className="w-4 h-4 text-blue-600" />
          <span>Telegram Relay: Ready (/chat, /reply)</span>
        </div>
      </div>

      {/* Main 2-Column Chat Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Sessions List */}
        <div className="portal-card p-4 space-y-3 lg:col-span-1">
          <div className="text-xs font-mono font-bold text-slate-500 uppercase px-1">
            Active Student Sessions ({chats.length})
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {chats.map((c) => {
              const isSelected = c.id === selectedChatId;
              const lastMsg = c.messages?.[c.messages.length - 1];
              const isActive = c.status === 'active';

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChatId(c.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {c.sessionId}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate font-sans">
                    {lastMsg ? `${lastMsg.sender === 'council' ? 'Council: ' : 'Student: '}${lastMsg.text}` : 'No messages'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window & Reply Desk */}
        <div className="portal-card p-6 lg:col-span-2 flex flex-col justify-between space-y-4">
          {selectedSession ? (
            <>
              {/* Chat Session Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      Session {selectedSession.sessionId}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Last active: {selectedSession.lastActivity ? new Date(selectedSession.lastActivity).toLocaleTimeString() : 'Recently'}
                  </div>
                </div>

                {selectedSession.status === 'active' && (
                  <button
                    onClick={handleEndSession}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 font-mono text-xs font-bold transition-colors"
                  >
                    [END SESSION]
                  </button>
                )}
              </div>

              {/* Messages Container */}
              <div className="h-80 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
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
                        className={`max-w-[85%] p-3 rounded-xl text-xs font-medium leading-relaxed ${
                          isCouncil
                            ? 'bg-emerald-600 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
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
                    placeholder={`Reply to student in ${selectedSession.sessionId}...`}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="portal-button-primary px-4 py-2.5 text-xs font-mono font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>REPLY</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 text-center text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  This session is closed. No further replies can be sent.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 font-mono text-xs">
              Select an active student session to begin responding.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
