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
import { isFirebaseConfigured } from './services/firebase';

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
  const loadData = async () => {
    try {
      const [annList, pollList] = await Promise.all([
        storageService.getAnnouncements(),
        storageService.getPolls()
      ]);
      setAnnouncements(annList);
      setPolls(pollList);

      // Only load sensitive feedback and chat data if an authenticated admin session exists
      if (adminUser) {
        const [fbList, chatList] = await Promise.all([
          storageService.getFeedbacks(),
          storageService.getAllChats()
        ]);
        setFeedbacks(fbList);
        setChats(chatList);
      }
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Admin session handlers
  const handleLoginSuccess = async (user) => {
    setAdminUser(user);
    localStorage.setItem('gmc_admin_session', JSON.stringify(user));
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

  const handleLogout = () => {
    setAdminUser(null);
    setFeedbacks([]);
    setChats([]);
    localStorage.removeItem('gmc_admin_session');
    setCurrentRoute('home');
    showToast("Council session ended", "info");
  };

  // Operation Handlers
  const handleVotePoll = async (pollId, optionIndex) => {
    await storageService.votePoll(pollId, optionIndex);
    const updatedPolls = await storageService.getPolls();
    setPolls(updatedPolls);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    const result = await storageService.submitFeedback(feedbackData);
    const updated = await storageService.getFeedbacks();
    setFeedbacks(updated);
    return result;
  };

  const handleAddAnnouncement = async (annData) => {
    await storageService.addAnnouncement(annData);
    const updated = await storageService.getAnnouncements();
    setAnnouncements(updated);
  };

  const handleUpdateAnnouncement = async (id, updates) => {
    await storageService.updateAnnouncement(id, updates);
    const updated = await storageService.getAnnouncements();
    setAnnouncements(updated);
  };

  const handleDeleteAnnouncement = async (id) => {
    await storageService.deleteAnnouncement(id);
    const updated = await storageService.getAnnouncements();
    setAnnouncements(updated);
  };

  const handleAddPoll = async (pollData) => {
    await storageService.addPoll(pollData);
    const updated = await storageService.getPolls();
    setPolls(updated);
  };

  const handleTogglePollStatus = async (pollId, status) => {
    await storageService.togglePollStatus(pollId, status);
    const updated = await storageService.getPolls();
    setPolls(updated);
  };

  const handleUpdateFeedbackStatus = async (id, status, notes) => {
    await storageService.updateFeedbackStatus(id, status, notes);
    const updated = await storageService.getFeedbacks();
    setFeedbacks(updated);
  };

  const handleRefreshChats = async () => {
    const updated = await storageService.getAllChats();
    setChats(updated);
  };

  // Unread badge count
  const unreadFeedbackCount = feedbacks.filter(f => f.status === 'Received').length;
  const activeChatsCount = chats.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#e6edf8] dark:bg-[#0c1427] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Render Main App or Admin Console */}
      {currentRoute === 'admin-dashboard' && adminUser ? (
        <Suspense fallback={<AdminLoadingFallback />}>
          <AdminLayout
            currentSection={adminSection}
            setCurrentSection={setAdminSection}
            onLogout={handleLogout}
            setCurrentRoute={setCurrentRoute}
            adminUser={adminUser}
            unreadCount={unreadFeedbackCount}
            activeChatsCount={activeChatsCount}
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
                showToast={showToast}
              />
            )}

            {adminSection === 'chat' && (
              <AdminChat
                chats={chats}
                onRefreshChats={handleRefreshChats}
                showToast={showToast}
              />
            )}

            {adminSection === 'announcements' && (
              <AdminAnnouncements
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
                showToast={showToast}
              />
            )}

            {adminSection === 'polls' && (
              <AdminPolls
                polls={polls}
                onAddPoll={handleAddPoll}
                onTogglePollStatus={handleTogglePollStatus}
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
