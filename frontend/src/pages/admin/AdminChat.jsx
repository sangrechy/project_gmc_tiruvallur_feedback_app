import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  X,
  User,
  RefreshCw,
  Trash2,
  Shield
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { formatShortDateTime, formatTimeOnly } from '../../utils/dateUtils';

export default function AdminChat({ 
  chats, 
  onRefreshChats, 
  onDeleteMultipleChats, 
  showToast 
}) {
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMobileChatView, setShowMobileChatView] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteSessions, setConfirmDeleteSessions] = useState(null);

  const selectedSession = chats.find(c => c.id === selectedChatId) || chats[0];

  // Council presence heartbeat ping
  useEffect(() => {
    storageService.pingAdminPresence();
    const interval = setInterval(() => {
      storageService.pingAdminPresence();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to real-time incoming messages for the active conversation
  useEffect(() => {
    if (!selectedSession?.sessionId) return;
    const unsubscribe = storageService.subscribeToChat(selectedSession.sessionId, () => {
      onRefreshChats?.();
    });
    return () => unsubscribe?.();
  }, [selectedSession?.sessionId]);

  const handleSelectChat = (id) => {
    setSelectedChatId(id);
    setShowMobileChatView(true);
  };

  const handleToggleSelectChat = (sessionId, e) => {
    e.stopPropagation();
    setSelectedChatIds(prev => 
      prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handleSelectAllChats = () => {
    const allSessionIds = chats.map(c => c.sessionId || c.id);
    const allSelected = allSessionIds.length > 0 && allSessionIds.every(id => selectedChatIds.includes(id));
    if (allSelected) {
      setSelectedChatIds([]);
    } else {
      setSelectedChatIds(allSessionIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedChatIds([]);
  };

  const handleExecuteDelete = async () => {
    if (!confirmDeleteSessions || confirmDeleteSessions.length === 0) return;
    setIsDeleting(true);
    try {
      if (onDeleteMultipleChats) {
        await onDeleteMultipleChats(confirmDeleteSessions);
      }
      showToast(`${confirmDeleteSessions.length} chat conversation${confirmDeleteSessions.length > 1 ? 's' : ''} deleted`, "success");
      
      setSelectedChatIds(prev => prev.filter(id => !confirmDeleteSessions.includes(id)));
      
      // If active conversation was deleted, pick another
      if (selectedSession && confirmDeleteSessions.includes(selectedSession.sessionId || selectedSession.id)) {
        const remaining = chats.filter(c => !confirmDeleteSessions.includes(c.sessionId || c.id));
        setSelectedChatId(remaining[0]?.id || null);
        setShowMobileChatView(false);
      }
      setConfirmDeleteSessions(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
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
      
      {/* Friendly Header */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
          Student Chats
        </h1>
      </div>

      {/* Multi-Select Bulk Action Sticky Bar */}
      {selectedChatIds.length > 0 && (
        <div className="sticky top-[68px] md:top-[124px] z-30 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 shadow-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs font-mono">
              {selectedChatIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {selectedChatIds.length} conversation{selectedChatIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={() => setConfirmDeleteSessions([...selectedChatIds])}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedChatIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp-style 2-Column Chat Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]">
        
        {/* Left: Chat List (Hidden on mobile if chat conversation is open) */}
        <div className={`portal-card p-3 sm:p-4 space-y-2 lg:col-span-1 ${showMobileChatView ? 'hidden lg:block' : 'block'}`}>
          <div className="text-xs font-bold text-slate-500 uppercase px-1 pb-1 flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={chats.length > 0 && chats.every(c => selectedChatIds.includes(c.sessionId || c.id))}
                onChange={handleSelectAllChats}
                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
              />
              <span>Conversations ({chats.length})</span>
            </label>
            {selectedChatIds.length > 0 && (
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
                {selectedChatIds.length} selected
              </span>
            )}
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
                const sessionId = c.sessionId || c.id;
                const isChecked = selectedChatIds.includes(sessionId);

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectChat(c.id)}
                    className={`group relative w-full p-3 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 shadow-sm'
                        : 'border-slate-200/60 dark:border-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center space-x-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectChat(sessionId, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                          title="Select conversation"
                        />
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          Student #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {formatShortDateTime(lastMsg?.createdAt || lastMsg?.createdAtIso || c.lastActivity || c.createdAt, lastMsg?.timestamp || 'Recent')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteSessions([sessionId]);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pl-5.5">
                      {preview}
                    </p>
                  </div>
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
                    <span className={`text-[11px] font-medium flex items-center space-x-1 ${
                      selectedSession.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedSession.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>
                        {selectedSession.status === 'active' ? 'Active Conversation' : 'Closed Conversation'}
                        {selectedSession.createdAt ? ` • Started ${formatShortDateTime(selectedSession.createdAt)}` : ''}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedSession.status === 'active' && (
                    <button
                      onClick={handleEndSession}
                      className="px-3 py-1.5 rounded-xl neu-button text-red-500 hover:text-red-600 text-xs font-semibold transition-colors"
                    >
                      End Chat
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteSessions([selectedSession.sessionId || selectedSession.id])}
                    className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-xs transition-colors"
                    title="Delete this conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Bubble Area */}
              <div className="h-80 sm:h-96 overflow-y-auto p-3.5 sm:p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-4">
                {selectedSession.messages?.map((msg) => {
                  const isCouncil = msg.sender === 'council' || msg.sender === 'admin';
                  const displayTime = formatShortDateTime(msg.createdAt || msg.createdAtIso, msg.timestamp || formatTimeOnly(selectedSession.createdAt));
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCouncil ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className={`flex items-center space-x-1.5 text-[11px] font-mono font-bold px-1 ${
                        isCouncil ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {isCouncil ? (
                          <>
                            <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-2.5 h-2.5" />
                            </span>
                            <span className="uppercase tracking-wider">You (Council)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                              <User className="w-2.5 h-2.5" />
                            </span>
                            <span className="uppercase tracking-wider">Student (Anonymous)</span>
                          </>
                        )}
                        {displayTime && (
                          <span className="text-[10px] text-slate-400 font-normal">• {displayTime}</span>
                        )}
                      </div>
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-sm ${
                          isCouncil
                            ? 'bg-sky-600 text-white rounded-tr-none border border-sky-500 shadow-sky-600/20'
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
                    className="min-w-0 flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="portal-button-primary px-3 sm:px-4 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <Send className="w-3.5 h-3.5 flex-shrink-0" />
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

      {/* Confirmation Modal */}
      {confirmDeleteSessions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center space-x-3 text-red-500 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Delete {confirmDeleteSessions.length > 1 ? `${confirmDeleteSessions.length} Conversations` : 'Conversation'}?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete {confirmDeleteSessions.length > 1 ? `these ${confirmDeleteSessions.length} chat sessions` : 'this chat session'} and all student messages from the Council records and cloud database?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setConfirmDeleteSessions(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : `Delete ${confirmDeleteSessions.length > 1 ? `(${confirmDeleteSessions.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
