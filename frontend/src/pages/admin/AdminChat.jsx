import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  X,
  User
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
      showToast("Reply sent to student", "success");
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
      showToast("Chat closed", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Helper to get friendly topic preview from messages
  const getChatPreview = (chat) => {
    const studentMsg = chat.messages?.find(m => m.sender === 'student');
    if (studentMsg) return studentMsg.text;
    const lastMsg = chat.messages?.[chat.messages.length - 1];
    return lastMsg ? lastMsg.text : 'New message';
  };

  return (
    <div className="space-y-4 animate-fadeIn font-sans max-w-5xl mx-auto">
      
      {/* Friendly Header (No Telegram dev relay jargon!) */}
      <div className="pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Chats
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Read messages from students and reply directly
        </p>
      </div>

      {/* WhatsApp-style 2-Column Chat Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]">
        
        {/* Left: Chat List (Hidden on mobile if chat conversation is open) */}
        <div className={`portal-card p-3 sm:p-4 space-y-2 lg:col-span-1 ${showMobileChatView ? 'hidden lg:block' : 'block'}`}>
          <div className="text-xs font-bold text-slate-500 uppercase px-1 pb-1 flex items-center justify-between">
            <span>Conversations</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {chats.length}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active student chats right now.
              </div>
            ) : (
              chats.map((c, index) => {
                const isSelected = c.id === selectedChatId;
                const preview = getChatPreview(c);
                const isActive = c.status === 'active';
                const lastMsg = c.messages?.[c.messages.length - 1];

                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectChat(c.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                        : 'border-slate-200/60 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          Student #{index + 1}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {lastMsg?.timestamp || 'Today'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {preview}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        <div className={`portal-card p-4 sm:p-5 lg:col-span-2 flex flex-col justify-between space-y-3 ${!showMobileChatView ? 'hidden lg:flex' : 'flex'}`}>
          {selectedSession ? (
            <>
              {/* Chat Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowMobileChatView(false)}
                    className="lg:hidden p-1.5 neu-button rounded-xl text-slate-600 dark:text-slate-300"
                    title="Back to all conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>

                  <div>
                    <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                      Chat with Student
                    </h2>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active Conversation</span>
                    </span>
                  </div>
                </div>

                {selectedSession.status === 'active' && (
                  <button
                    onClick={handleEndSession}
                    className="px-3 py-1.5 rounded-xl neu-button text-red-500 hover:text-red-600 text-xs font-semibold transition-colors"
                  >
                    End Chat
                  </button>
                )}
              </div>

              {/* Messages Bubble Area */}
              <div className="h-80 sm:h-96 overflow-y-auto p-4 rounded-xl bg-slate-100/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3">
                {selectedSession.messages?.map((msg) => {
                  const isCouncil = msg.sender === 'council';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCouncil ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                        {isCouncil ? "You (Council)" : "Student"} • {msg.timestamp}
                      </span>
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

              {/* Message Reply Input */}
              {selectedSession.status === 'active' ? (
                <form onSubmit={handleSendReply} className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the student..."
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="portal-button-primary px-4 py-2.5 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              ) : (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  This chat has ended.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">
              Select a conversation on the left to read and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
