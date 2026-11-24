import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

// Student Pages (Eagerly loaded for instant mobile TTI)
import HomePage from './pages/HomePage';
import FeedbackPage from './pages/FeedbackPage';
import ChatPage from './pages/ChatPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import PollsPage from './pages/PollsPage';

// Admin Subpages (Code-split with React.lazy to minimize initial student bundle)
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminPolls = lazy(() => import('./pages/admin/AdminPolls'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const AdminStatus = lazy(() => import('./pages/admin/AdminStatus'));

import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import { isFirebaseConfigured, auth } from './services/firebase';
import { signOut } from 'firebase/auth';

const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] dark:bg-[#07090e]">
    <div className="portal-card p-6 flex items-center space-x-3 text-sky-600 dark:text-sky-400 font-mono text-sm shadow-lg">
      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
      <span>Loading Secure Council Console...</span>
    </div>
  </div>
);

export default function App() {
  // Theme state: defaults to light theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gmc_theme');
    if (saved) return saved === 'dark';
    return false; // Default to light theme!
  });

  // Routing state
  const [currentRoute, setCurrentRoute] = useState('home');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('gmc_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthVerifying, setIsAuthVerifying] = useState(() => {
    return Boolean(localStorage.getItem('gmc_admin_session'));
  });

  // Core Data State
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [chats, setChats] = useState([]);
  const [toast, setToast] = useState(null);

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gmc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gmc_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial public data
  const loadData = async (force = false) => {
    try {
      if (force) {
        storageService.invalidateCache();
      }
      const [annList, pollList] = await Promise.all([
        storageService.getAnnouncements(force),
        storageService.getPolls(force)
      ]);
      setAnnouncements(annList);
      setPolls(pollList);

      // Only load sensitive feedback and chat data if an authenticated admin session exists
      if (adminUser) {
        const [fbList, chatList] = await Promise.all([
          storageService.getFeedbacks(force),
          storageService.getAllChats()
        ]);
        setFeedbacks(fbList);
        setChats(chatList);
      }
    } catch (err) {
      console.error("Data load error:", err);
      throw err;
    }
  };

  const handleCouncilRefresh = async () => {
    try {
      await loadData(true);
      showToast("Council feeds refreshed from cloud", "success");
    } catch (err) {
      showToast("Refresh failed: " + err.message, "error");
    }
  };

  useEffect(() => {
    loadData();
  }, [adminUser]);

  // Validate existing admin session with backend on startup
  useEffect(() => {
    const validateExistingSession = async () => {
      const saved = localStorage.getItem('gmc_admin_session');
      if (!saved) {
        setIsAuthVerifying(false);
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
          handleLogout();
          setIsAuthVerifying(false);
          return;
        }
        const tokenToVerify = parsed?.sessionToken || parsed?.token;
        if (tokenToVerify && apiService.isConfigured) {
          const result = await apiService.verifyCouncilToken(tokenToVerify);
          if (!result.valid) {
            handleLogout();
          }
        }
      } catch (err) {
        console.warn("Session validation error:", err);
        handleLogout();
      } finally {
        setIsAuthVerifying(false);
      }
    };
    validateExistingSession();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Admin session handlers
  const handleLoginSuccess = async (user) => {
    setIsAuthVerifying(false);
    // Sanitize user object to ensure raw password is NEVER persisted in browser storage
    const safeUser = {
      email: user.email || "executive.council@gmcthiruvallur.ac.in",
      name: user.name || "Council Executive",
      role: user.role || "Council Executive",
      sessionToken: user.sessionToken || null,
      expiresAt: user.expiresAt || null,
      uid: user.uid || null,
      isFirebaseUser: Boolean(user.isFirebaseUser)
    };
    setAdminUser(safeUser);
    localStorage.setItem('gmc_admin_session', JSON.stringify(safeUser));
    try {
      const [fbList, chatList] = await Promise.all([
        storageService.getFeedbacks(),
        storageService.getAllChats()
      ]);
      setFeedbacks(fbList);
      setChats(chatList);
    } catch (err) {
      console.warn("Error loading admin data on login:", err);
    }
    setCurrentRoute('admin-dashboard');
  };

  // Global Council Admin Presence Heartbeat: Active across all admin sections
  useEffect(() => {
    if (!adminUser) return;
    storageService.pingAdminPresence(adminUser.email);
    const interval = setInterval(() => {
      storageService.pingAdminPresence(adminUser.email);
    }, 45000);
    return () => clearInterval(interval);
  }, [adminUser]);

  const handleLogout = () => {
    setIsAuthVerifying(false);
    setAdminUser(null);
    setFeedbacks([]);
    setChats([]);
    localStorage.removeItem('gmc_admin_session');
    storageService.setAdminOffline();
    if (isFirebaseConfigured && auth?.currentUser) {
      signOut(auth).catch(() => {});
    }
    setCurrentRoute('home');
    showToast("Council session ended", "info");
  };

  // Operation Handlers - Optimistic state updates to eliminate redundant Firestore collection re-reads
  const handleVotePoll = async (pollId, optionIndex) => {
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;
      const currentOptions = Array.isArray(p.options) ? p.options : [];
      return {
        ...p,
        userVoted: optionIndex,
        totalVotes: (Number(p.totalVotes) || 0) + 1,
        options: currentOptions.map((opt, i) => i === optionIndex ? { ...opt, votes: (Number(opt.votes) || 0) + 1 } : opt)
      };
    }));
    await storageService.votePoll(pollId, optionIndex);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    const result = await storageService.submitFeedback(feedbackData);
    if (adminUser) {
      setFeedbacks(prev => [{ ...feedbackData, trackingId: result.trackingId, id: `fb-${Date.now()}`, status: 'Received' }, ...prev]);
    }
    return result;
  };

  const handleAddAnnouncement = async (annData) => {
    const created = await storageService.addAnnouncement(annData);
    setAnnouncements(prev => [created, ...prev.filter(a => a.id !== created.id)]);
  };

  const handleUpdateAnnouncement = async (id, updates) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    await storageService.updateAnnouncement(id, updates);
  };

  const handleDeleteAnnouncement = async (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    await storageService.deleteAnnouncement(id);
  };

  const handleDeleteMultipleAnnouncements = async (ids) => {
    setAnnouncements(prev => prev.filter(a => !ids.includes(a.id)));
    await storageService.deleteMultipleAnnouncements(ids);
  };

  const handleAddPoll = async (pollData) => {
    const created = await storageService.addPoll(pollData);
    setPolls(prev => [created, ...prev.filter(p => p.id !== created.id)]);
  };

  const handleTogglePollStatus = async (pollId, status) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status } : p));
    await storageService.togglePollStatus(pollId, status);
  };

  const handleDeletePoll = async (id) => {
    setPolls(prev => prev.filter(p => p.id !== id));
    await storageService.deletePoll(id);
  };

  const handleDeleteMultiplePolls = async (ids) => {
    setPolls(prev => prev.filter(p => !ids.includes(p.id)));
    await storageService.deleteMultiplePolls(ids);
  };

  const handleUpdateFeedbackStatus = async (id, status, notes) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status, councilNotes: notes } : f));
    await storageService.updateFeedbackStatus(id, status, notes);
  };

  const handleDeleteMultipleFeedbacks = async (ids) => {
    setFeedbacks(prev => prev.filter(f => !ids.includes(f.id)));
    await storageService.deleteMultipleFeedbacks(ids);
  };

  const handleRefreshChats = async () => {
    const updated = await storageService.getAllChats();
    setChats(updated);
  };

  const handleDeleteMultipleChats = async (sessionIds) => {
    setChats(prev => prev.filter(c => !sessionIds.includes(c.id) && !sessionIds.includes(c.sessionId)));
    await storageService.deleteMultipleChats(sessionIds);
  };

  // Unread badge count
  const unreadFeedbackCount = feedbacks.filter(f => f.status === 'Received').length;
  const activeChatsCount = chats.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#e6edf8] dark:bg-[#0c1427] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Render Main App or Admin Console */}
      {currentRoute === 'admin-dashboard' ? (
        isAuthVerifying ? (
          <AdminLoadingFallback />
        ) : adminUser ? (
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminLayout
              currentSection={adminSection}
              setCurrentSection={setAdminSection}
              onLogout={handleLogout}
              setCurrentRoute={setCurrentRoute}
              adminUser={adminUser}
              unreadCount={unreadFeedbackCount}
              activeChatsCount={activeChatsCount}
              onRefresh={handleCouncilRefresh}
            >
              {adminSection === 'dashboard' && (
                <AdminDashboard
                  feedbacks={feedbacks}
                  chats={chats}
                  polls={polls}
                  announcements={announcements}
                  setCurrentSection={setAdminSection}
                  onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                  showToast={showToast}
                />
              )}

              {adminSection === 'status' && (
                <AdminStatus showToast={showToast} />
              )}

              {adminSection === 'feedback' && (
                <AdminFeedback
                  feedbacks={feedbacks}
                  onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                  onDeleteMultipleFeedbacks={handleDeleteMultipleFeedbacks}
                  onRefreshFeedback={loadData}
                  showToast={showToast}
                />
              )}

              {adminSection === 'chat' && (
                <AdminChat
                  chats={chats}
                  onRefreshChats={handleRefreshChats}
                  onDeleteMultipleChats={handleDeleteMultipleChats}
                  showToast={showToast}
                />
              )}

              {adminSection === 'announcements' && (
                <AdminAnnouncements
                  announcements={announcements}
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  onDeleteMultipleAnnouncements={handleDeleteMultipleAnnouncements}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  showToast={showToast}
                />
              )}

              {adminSection === 'polls' && (
                <AdminPolls
                  polls={polls}
                  onAddPoll={handleAddPoll}
                  onTogglePollStatus={handleTogglePollStatus}
                  onDeletePoll={handleDeletePoll}
                  onDeleteMultiplePolls={handleDeleteMultiplePolls}
                  showToast={showToast}
                />
              )}

              {adminSection === 'reports' && (
                <AdminReports
                  feedbacks={feedbacks}
                  showToast={showToast}
                />
              )}

              {adminSection === 'management' && (
                <AdminManagement
                  showToast={showToast}
                />
              )}
            </AdminLayout>
          </Suspense>
        ) : (
          <Suspense fallback={<AdminLoadingFallback />}>
            <AdminLoginPage
              onLoginSuccess={handleLoginSuccess}
              setCurrentRoute={setCurrentRoute}
              showToast={showToast}
            />
          </Suspense>
        )
      ) : (
        <>
          <Header
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isAdminLoggedIn={Boolean(adminUser)}
          />

          <main className="flex-1">
            {currentRoute === 'home' && (
              <HomePage
                setCurrentRoute={setCurrentRoute}
                announcements={announcements}
                polls={polls}
                onVotePoll={handleVotePoll}
                showToast={showToast}
              />
            )}

            {currentRoute === 'feedback' && (
              <FeedbackPage
                onSubmitFeedback={handleSubmitFeedback}
                setCurrentRoute={setCurrentRoute}
                showToast={showToast}
              />
            )}

            {currentRoute === 'chat' && (
              <ChatPage
                setCurrentRoute={setCurrentRoute}
                showToast={showToast}
              />
            )}

            {currentRoute === 'announcements' && (
              <AnnouncementsPage
                announcements={announcements}
                setCurrentRoute={setCurrentRoute}
              />
            )}

            {currentRoute === 'polls' && (
              <PollsPage
                polls={polls}
                onVotePoll={handleVotePoll}
                showToast={showToast}
              />
            )}

            {currentRoute === 'admin-login' && (
              <Suspense fallback={<AdminLoadingFallback />}>
                <AdminLoginPage
                  onLoginSuccess={handleLoginSuccess}
                  setCurrentRoute={setCurrentRoute}
                  showToast={showToast}
                />
              </Suspense>
            )}
          </main>

          <Footer 
            setCurrentRoute={setCurrentRoute} 
            isAdminLoggedIn={!!adminUser} 
          />
          
          {/* Thumb-Friendly Mobile Bottom Navigation Bar */}
          <MobileBottomNav 
            currentRoute={currentRoute} 
            setCurrentRoute={setCurrentRoute} 
          />
        </>
      )}

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
