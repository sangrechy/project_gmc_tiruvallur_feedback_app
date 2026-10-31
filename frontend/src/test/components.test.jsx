import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('renders Header with official branding, 2-part theme switch, and navigation items', () => {
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
    expect(screen.getByText('Student Council Portal')).toBeInTheDocument();
    expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Announcements')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Feedback')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Live Chat')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Polls')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Events')[0]).toBeInTheDocument();
    expect(screen.getByText('Council Auth')).toBeInTheDocument();

    // Theme toggle button click
    const themeBtn = screen.getByRole('button', { name: /Toggle light and dark theme/i });
    fireEvent.click(themeBtn);
    expect(setIsDarkMode).toHaveBeenCalledWith(true);

    // Nav click
    fireEvent.click(screen.getAllByText('Feedback')[0]);
    expect(setCurrentRoute).toHaveBeenCalledWith('feedback');
  });

  it('renders HomePage hero with modern CTAs, quick access cards, and latest announcements with stickers', () => {
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

    expect(screen.getByText(/Direct, Democratic/)).toBeInTheDocument();
    expect(screen.getByText('Submit Anonymous Feedback')).toBeInTheDocument();
    expect(screen.getByText('Talk to Student Council')).toBeInTheDocument();
    expect(screen.getByText('Anonymous Feedback')).toBeInTheDocument();
    expect(screen.getByText('Temporary Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Collegiate Polls')).toBeInTheDocument();
    expect(screen.getByText('Events & Symposia')).toBeInTheDocument();

    // Verify presence of stickers
    expect(screen.getByAltText('Student Council Welcome Mascot')).toBeInTheDocument();
    expect(screen.getByAltText('Guard Mascot Bleeding Out')).toBeInTheDocument();
    expect(screen.getByAltText('Thinking Polling Mascot Bleeding Out')).toBeInTheDocument();

    // CTA routing
    fireEvent.click(screen.getByText('Submit Anonymous Feedback'));
    expect(setCurrentRoute).toHaveBeenCalledWith('feedback');

    fireEvent.click(screen.getByText('Talk to Student Council'));
    expect(setCurrentRoute).toHaveBeenCalledWith('chat');
  });

  it('allows student to submit anonymous feedback and view confirmation token with Doctor and Thumbs stickers', async () => {
    const setCurrentRoute = vi.fn();
    const showToast = vi.fn();
    const onSubmitFeedback = vi.fn().mockResolvedValue({
      success: true,
      id: 'GMC-FB-7711',
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

    expect(screen.getByText('Anonymous Feedback Portal')).toBeInTheDocument();
    expect(screen.getByText('Grievance Category')).toBeInTheDocument();
    expect(screen.getByText('Detailed Message')).toBeInTheDocument();
    expect(screen.getByAltText('GMC Doctor Mascot Bleeding Out')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Describe your concern with specific context/);
    fireEvent.change(textarea, { target: { value: 'Requesting extra study table lamps in the central reading hall.' } });

    const submitBtn = screen.getByText('Submit Anonymous Grievance');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitFeedback).toHaveBeenCalled();
      expect(screen.getByText('Feedback Received Anonymously')).toBeInTheDocument();
      expect(screen.getByText('GMC-FB-7711')).toBeInTheDocument();
      expect(screen.getByAltText('Thumbs Up Success Mascot')).toBeInTheDocument();
    });
  });

  it('renders Temporary Live Chat with cookie session, active relay, and Myself sticker', async () => {
    const setCurrentRoute = vi.fn();
    const showToast = vi.fn();

    render(
      <ChatPage
        setCurrentRoute={setCurrentRoute}
        showToast={showToast}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Student Council Live Chat')).toBeInTheDocument();
      expect(screen.getByText('Cookie Session (24h)')).toBeInTheDocument();
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
      expect(screen.getByText(/Session auto-expires after 24 hours/)).toBeInTheDocument();
      expect(screen.getByText('End Live Session')).toBeInTheDocument();
      expect(screen.getByAltText('Council Chat Representative Mascot Bleeding Out')).toBeInTheDocument();
    });
  });

  it('renders PollsPage with options, voting buttons, and Referring sticker', () => {
    const onVotePoll = vi.fn();
    const showToast = vi.fn();

    render(
      <PollsPage
        polls={INITIAL_POLLS}
        onVotePoll={onVotePoll}
        showToast={showToast}
      />
    );

    expect(screen.getByText('Student Council Polls & Ballots')).toBeInTheDocument();
    expect(screen.getByText(INITIAL_POLLS[0].question)).toBeInTheDocument();
    expect(screen.getByAltText('Thinking Mascot Bleeding Out')).toBeInTheDocument();
  });

  it('renders AnnouncementsPage and filters by category with Guard and Syringe stickers', () => {
    const setCurrentRoute = vi.fn();

    render(
      <AnnouncementsPage
        announcements={INITIAL_ANNOUNCEMENTS}
        setCurrentRoute={setCurrentRoute}
      />
    );

    expect(screen.getByText('Official Campus Announcements')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IMPORTANT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ACADEMIC' })).toBeInTheDocument();
    expect(screen.getByAltText('Guard Mascot Bleeding Out')).toBeInTheDocument();

    // Click IMPORTANT filter button
    fireEvent.click(screen.getByRole('button', { name: 'IMPORTANT' }));
    expect(screen.getByText(INITIAL_ANNOUNCEMENTS[0].title)).toBeInTheDocument();
  });

  it('allows 1-click Demo Council Admin login with FBI sticker', () => {
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

    expect(screen.getByAltText('FBI Council Security Mascot Bleeding Out')).toBeInTheDocument();

    const demoLoginBtn = screen.getByText('Instant Council Demo Access');
    fireEvent.click(demoLoginBtn);

    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'president.council@gmcthiruvallur.ac.in',
        role: 'Council President'
      })
    );
  });

  it('renders AdminDashboard overview matching metrics, triage table, and actions', () => {
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

    expect(screen.getByText('Council Executive Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Feedback')).toBeInTheDocument();
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
    expect(screen.getByText('Active Relays')).toBeInTheDocument();
    expect(screen.getByText('Active Polls')).toBeInTheDocument();
    expect(screen.getByText('Recent Anonymous Grievances')).toBeInTheDocument();
    expect(screen.getByText('Quick Management Actions')).toBeInTheDocument();
    expect(screen.getByText('Post Circular')).toBeInTheDocument();
    expect(screen.getByText('Launch Poll')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    expect(screen.getByText('Export Report')).toBeInTheDocument();
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

  it('renders Footer with official GMC accreditation and developer credit to sangrechy', () => {
    const setCurrentRoute = vi.fn();

    render(<Footer setCurrentRoute={setCurrentRoute} />);

    expect(screen.getByText('GMC THIRUVALLUR STUDENT COUNCIL')).toBeInTheDocument();
    expect(screen.getByText('Developed by')).toBeInTheDocument();
    expect(screen.getByText('sangrechy')).toBeInTheDocument();
    const githubLink = screen.getByRole('link', { name: /sangrechy/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/sangrechy');
  });
});
