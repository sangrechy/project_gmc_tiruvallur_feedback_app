import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

// Student Pages
import HomePage from './pages/HomePage';
import FeedbackPage from './pages/FeedbackPage';
import ChatPage from './pages/ChatPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import PollsPage from './pages/PollsPage';
import EventsPage from './pages/EventsPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Admin Subpages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminChat from './pages/admin/AdminChat';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminPolls from './pages/admin/AdminPolls';
import AdminEvents from './pages/admin/AdminEvents';
import AdminReports from './pages/admin/AdminReports';
import AdminManagement from './pages/admin/AdminManagement';
import AdminStatus from './pages/admin/AdminStatus';

import { storageService } from './services/storageService';
import { isFirebaseConfigured } from './services/firebase';
import { ShieldCheck, Sparkles, Database } from 'lucide-react';

export default function App() {
  // Theme state: defaults to dark theme with blue shade
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('gmc_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark theme with blue shade as requested!
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
  const [events, setEvents] = useState([]);
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

  // Load initial data
  const loadData = async () => {
    try {
      const [annList, evtList, pollList, fbList, chatList] = await Promise.all([
        storageService.getAnnouncements(),
        storageService.getEvents(),
        storageService.getPolls(),
        storageService.getFeedbacks(),
        storageService.getAllChats()
      ]);
      setAnnouncements(annList);
      setEvents(evtList);
      setPolls(pollList);
      setFeedbacks(fbList);
      setChats(chatList);
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Admin session handlers
  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    localStorage.setItem('gmc_admin_session', JSON.stringify(user));
    setCurrentRoute('admin-dashboard');
  };

  const handleLogout = () => {
    setAdminUser(null);
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

  const handleAddEvent = async (eventData) => {
    await storageService.addEvent(eventData);
    const updated = await storageService.getEvents();
    setEvents(updated);
  };

  const handleDeleteEvent = async (id) => {
    await storageService.deleteEvent(id);
    const updated = await storageService.getEvents();
    setEvents(updated);
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
              events={events}
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

          {adminSection === 'events' && (
            <AdminEvents
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
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
      ) : (
        <>
          <Header
            currentRoute={currentRoute}
            setCurrentRoute={setCurrentRoute}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            isAdminLoggedIn={Boolean(adminUser)}
          />

          <main className="flex-1 pb-28 sm:pb-24 md:pb-0">
            {currentRoute === 'home' && (
              <HomePage
                setCurrentRoute={setCurrentRoute}
                announcements={announcements}
                events={events}
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

            {currentRoute === 'events' && (
              <EventsPage
                events={events}
                setCurrentRoute={setCurrentRoute}
                showToast={showToast}
              />
            )}

            {currentRoute === 'admin-login' && (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                setCurrentRoute={setCurrentRoute}
                showToast={showToast}
              />
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
