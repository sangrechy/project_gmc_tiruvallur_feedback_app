import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import HomePage from '../pages/HomePage';
import FeedbackPage from '../pages/FeedbackPage';
import ChatPage from '../pages/ChatPage';
import PollsPage from '../pages/PollsPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import EventsPage from '../pages/EventsPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminReports from '../pages/admin/AdminReports';

import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_POLLS,
  INITIAL_FEEDBACK,
  INITIAL_CHATS
} from '../data/initialData';
import { initLocalStore } from '../services/storageService';

describe('GMC Thiruvallur UI Blackbox Test Suite', () => {
  beforeEach(() => {
    initLocalStore();
  });
  it('renders Header with official branding, theme switch, and navigation items', () => {
    const setCurrentRoute = vi.fn();
    const setIsDarkMode = vi.fn();

    render(
      <Header
        currentRoute="home"
        setCurrentRoute={setCurrentRoute}
        isDarkMode={false}
        setIsDarkMode={setIsDarkMode}
        isAdminLoggedIn={false}
      />
    );

    expect(screen.getByText('GMC THIRUVALLUR')).toBeInTheDocument();
    expect(screen.getByText('STUDENT COUNCIL PORTAL')).toBeInTheDocument();
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('ANNOUNCEMENTS')).toBeInTheDocument();
    expect(screen.getByText('FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('CHAT')).toBeInTheDocument();
    expect(screen.getByText('POLLS')).toBeInTheDocument();
    expect(screen.getByText('EVENTS')).toBeInTheDocument();
    expect(screen.getByText('COUNCIL LOGIN')).toBeInTheDocument();

    // Theme toggle click
    const themeBtn = screen.getByLabelText('Toggle Theme');
    fireEvent.click(themeBtn);
    expect(setIsDarkMode).toHaveBeenCalledWith(true);

    // Nav click
    fireEvent.click(screen.getByText('FEEDBACK'));
    expect(setCurrentRoute).toHaveBeenCalledWith('feedback');
  });

  it('renders HomePage hero with wireframe CTAs, quick access cards, and latest announcements', () => {
    const setCurrentRoute = vi.fn();
    const onVotePoll = vi.fn();
    const showToast = vi.fn();

    render(
      <HomePage
        setCurrentRoute={setCurrentRoute}
        announcements={INITIAL_ANNOUNCEMENTS}
        events={INITIAL_EVENTS}
        polls={INITIAL_POLLS}
        onVotePoll={onVotePoll}
        showToast={showToast}
      />
    );

    expect(screen.getByText(/WELCOME TO GMC/)).toBeInTheDocument();
    expect(screen.getByText('SUBMIT FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('TALK TO COUNCIL')).toBeInTheDocument();
    expect(screen.getByText('ANONYMOUS FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('TEMPORARY LIVE CHAT')).toBeInTheDocument();
    expect(screen.getByText('STUDENT POLLS')).toBeInTheDocument();
    expect(screen.getByText('EVENTS & ACTIVITIES')).toBeInTheDocument();

    // CTA routing
    fireEvent.click(screen.getByText('SUBMIT FEEDBACK'));
    expect(setCurrentRoute).toHaveBeenCalledWith('feedback');

    fireEvent.click(screen.getByText('TALK TO COUNCIL'));
    expect(setCurrentRoute).toHaveBeenCalledWith('chat');
  });

  it('allows student to submit anonymous feedback and view confirmation token', async () => {
    const setCurrentRoute = vi.fn();
    const showToast = vi.fn();
    const onSubmitFeedback = vi.fn().mockResolvedValue({
      success: true,
      trackingId: 'GMC-FB-7711',
      containsPII: false
    });

    render(
      <FeedbackPage
        onSubmitFeedback={onSubmitFeedback}
        setCurrentRoute={setCurrentRoute}
        showToast={showToast}
      />
    );

    expect(screen.getByText('ANONYMOUS FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('SELECT CATEGORY')).toBeInTheDocument();
    expect(screen.getByText('YOUR FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('PRIVACY CHECK')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Write your feedback here/);
    fireEvent.change(textarea, { target: { value: 'Requesting extra study table lamps in the central reading hall.' } });

    const submitBtn = screen.getByText(/SUBMIT FEEDBACK/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitFeedback).toHaveBeenCalled();
      expect(screen.getByText('FEEDBACK RECEIVED')).toBeInTheDocument();
      expect(screen.getByText('GMC-FB-7711')).toBeInTheDocument();
    });
  });

  it('renders Temporary Live Chat with active session ID and message flow', async () => {
    const setCurrentRoute = vi.fn();
    const showToast = vi.fn();

    render(
      <ChatPage
        setCurrentRoute={setCurrentRoute}
        showToast={showToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Your Session ID:/)).toBeInTheDocument();
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
      expect(screen.getByText(/Session expires after 24 hours/)).toBeInTheDocument();
      expect(screen.getByText(/\[ END CHAT \]/)).toBeInTheDocument();
    });
  });

  it('renders PollsPage with options and voting buttons', () => {
    const onVotePoll = vi.fn();
    const showToast = vi.fn();

    render(
      <PollsPage
        polls={INITIAL_POLLS}
        onVotePoll={onVotePoll}
        showToast={showToast}
      />
    );

    expect(screen.getByText('STUDENT POLLS & VOTING')).toBeInTheDocument();
    expect(screen.getByText(INITIAL_POLLS[0].question)).toBeInTheDocument();
  });

  it('renders AnnouncementsPage and filters by category', () => {
    const setCurrentRoute = vi.fn();

    render(
      <AnnouncementsPage
        announcements={INITIAL_ANNOUNCEMENTS}
        setCurrentRoute={setCurrentRoute}
      />
    );

    expect(screen.getByText('CAMPUS ANNOUNCEMENTS')).toBeInTheDocument();
    expect(screen.getByText('ALL')).toBeInTheDocument();
    expect(screen.getByText('IMPORTANT')).toBeInTheDocument();
    expect(screen.getByText('ACADEMIC')).toBeInTheDocument();

    // Click IMPORTANT filter
    fireEvent.click(screen.getByText('IMPORTANT'));
    expect(screen.getByText(INITIAL_ANNOUNCEMENTS[0].title)).toBeInTheDocument();
  });

  it('allows 1-click Demo Council Admin login', () => {
    const onLoginSuccess = vi.fn();
    const setCurrentRoute = vi.fn();
    const showToast = vi.fn();

    render(
      <AdminLoginPage
        onLoginSuccess={onLoginSuccess}
        setCurrentRoute={setCurrentRoute}
        showToast={showToast}
      />
    );

    const demoLoginBtn = screen.getByText(/ONE-CLICK DEMO ADMIN LOGIN/);
    fireEvent.click(demoLoginBtn);

    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'president.council@gmcthiruvallur.ac.in',
        role: 'Council President'
      })
    );
  });

  it('renders AdminDashboard overview matching wireframe 4-boxes and quick actions', () => {
    const setCurrentSection = vi.fn();
    const onUpdateFeedbackStatus = vi.fn();
    const showToast = vi.fn();

    render(
      <AdminDashboard
        feedbacks={INITIAL_FEEDBACK}
        chats={INITIAL_CHATS}
        polls={INITIAL_POLLS}
        announcements={INITIAL_ANNOUNCEMENTS}
        events={INITIAL_EVENTS}
        setCurrentSection={setCurrentSection}
        onUpdateFeedbackStatus={onUpdateFeedbackStatus}
        showToast={showToast}
      />
    );

    expect(screen.getByText('OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Polls')).toBeInTheDocument();
    expect(screen.getByText('RECENT FEEDBACK')).toBeInTheDocument();
    expect(screen.getByText('QUICK ACTIONS')).toBeInTheDocument();
    expect(screen.getByText(/\[ANNOUNCEMENT\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[CREATE POLL\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[CREATE EVENT\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[GENERATE REPORT\]/)).toBeInTheDocument();
  });

  it('renders AdminReports with AI distribution metrics and export triggers', async () => {
    const showToast = vi.fn();

    render(
      <AdminReports
        feedbacks={INITIAL_FEEDBACK}
        showToast={showToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AI REPORTS & ANALYTICS')).toBeInTheDocument();
      expect(screen.getByText(/EXECUTIVE AI SUMMARY/)).toBeInTheDocument();
      expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
      expect(screen.getByText('Recurring Campus Concerns')).toBeInTheDocument();
      expect(screen.getByText('Council Recommendations')).toBeInTheDocument();
    });
  });
});
