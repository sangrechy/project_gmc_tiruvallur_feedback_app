import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import HomePage from '../pages/HomePage';
import FeedbackPage from '../pages/FeedbackPage';
import ChatPage from '../pages/ChatPage';
import PollsPage from '../pages/PollsPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminReports from '../pages/admin/AdminReports';
import AdminStatus from '../pages/admin/AdminStatus';
import AdminFeedback from '../pages/admin/AdminFeedback';

import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_POLLS,
  INITIAL_FEEDBACK,
  INITIAL_CHATS
} from '../data/initialData';
import { initLocalStore } from '../services/storageService';
import { apiService } from '../services/apiService';

describe('GMC Thiruvallur UI Blackbox Test Suite', () => {
  beforeEach(() => {
    initLocalStore();
  });

  it('renders Header with council branding, 2-part theme switch, and navigation items', () => {
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
        polls={INITIAL_POLLS}
        onVotePoll={onVotePoll}
        showToast={showToast}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /Talk to Student Council/i })).toBeInTheDocument();
    expect(screen.getByText('Submit Anonymous Feedback')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Talk to Student Council/i })).toBeInTheDocument();
    expect(screen.getByText('Anonymous Feedback')).toBeInTheDocument();
    expect(screen.getByText('Temporary Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Collegiate Polls')).toBeInTheDocument();

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
      delivered: true,
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

    expect(screen.getByText('Contains specific info to be avoided by AI')).toBeInTheDocument();

    const piiToggle = screen.getByLabelText('Contains specific info to be avoided by AI');
    fireEvent.click(piiToggle);
    expect(piiToggle.checked).toBe(true);

    const textarea = screen.getByPlaceholderText(/Describe your concern with specific context/);
    fireEvent.change(textarea, { target: { value: 'Requesting extra study table lamps in the central reading hall.' } });

    const submitBtn = screen.getByText('Submit Anonymous Grievance');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitFeedback).toHaveBeenCalled();
      expect(screen.getByText('Feedback Dispatched Successfully')).toBeInTheDocument();
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

    expect(screen.getByText('Council Polls')).toBeInTheDocument();
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

    expect(screen.getByRole('heading', { level: 1, name: 'Announcements' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IMPORTANT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ACADEMIC' })).toBeInTheDocument();
    expect(screen.getByAltText('Guard Mascot Bleeding Out')).toBeInTheDocument();

    // Click IMPORTANT filter button
    fireEvent.click(screen.getByRole('button', { name: 'IMPORTANT' }));
    expect(screen.getByText(INITIAL_ANNOUNCEMENTS[0].title)).toBeInTheDocument();
  });

  it('renders AdminLoginPage with FBI mascot and allows login with credentials', async () => {
    vi.spyOn(apiService, 'verifyCouncilToken').mockResolvedValueOnce({
      valid: true,
      token: 'test-secret',
      user: {
        email: 'president.council@gmcthiruvallur.ac.in',
        name: 'Council Executive',
        role: 'Council Executive',
        token: 'test-secret'
      }
    });

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

    // Switch to Email & Passcode mode
    const emailModeBtn = screen.getByText('Email & Passcode');
    fireEvent.click(emailModeBtn);

    const emailInput = screen.getByPlaceholderText('rep.council@gmcthiruvallur.ac.in');
    const passInput = screen.getByPlaceholderText('••••••••••••');
    fireEvent.change(emailInput, { target: { value: 'president.council@gmcthiruvallur.ac.in' } });
    fireEvent.change(passInput, { target: { value: 'SecretToken123!' } });

    const submitBtn = screen.getByText('Authorize Session');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'president.council@gmcthiruvallur.ac.in',
          role: 'Council Executive'
        })
      );
    });
  });

  it('allows council login using decoupled Master Token input', async () => {
    vi.spyOn(apiService, 'verifyCouncilToken').mockResolvedValueOnce({
      valid: true,
      token: 'SecretToken123!',
      user: {
        email: 'executive.council@gmcthiruvallur.ac.in',
        name: 'Council Executive',
        role: 'Council Executive',
        token: 'SecretToken123!'
      }
    });

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

    expect(screen.getByText('Council Master Secret Token')).toBeInTheDocument();
    const tokenInput = screen.getByPlaceholderText('Enter Council Master Passcode');
    fireEvent.change(tokenInput, { target: { value: 'SecretToken123!' } });

    const authorizeBtn = screen.getByText('Authorize with Master Token');
    fireEvent.click(authorizeBtn);

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalled();
    });
  });

  it('renders AdminDashboard overview matching metrics, triage table, and quick actions', () => {
    const setCurrentSection = vi.fn();
    const onUpdateFeedbackStatus = vi.fn();
    const showToast = vi.fn();

    render(
      <AdminDashboard
        feedbacks={INITIAL_FEEDBACK}
        chats={INITIAL_CHATS}
        polls={INITIAL_POLLS}
        announcements={INITIAL_ANNOUNCEMENTS}
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
    expect(screen.getByText('Export Report')).toBeInTheDocument();
  });

  it('renders AdminFeedback with direct-reading cards and 1-click status update triggers', async () => {
    const onUpdateFeedbackStatus = vi.fn();
    const showToast = vi.fn();

    render(
      <AdminFeedback
        feedbacks={INITIAL_FEEDBACK}
        onUpdateFeedbackStatus={onUpdateFeedbackStatus}
        showToast={showToast}
      />
    );

    expect(screen.getByText('Feedback Review')).toBeInTheDocument();
    expect(screen.getByText(INITIAL_FEEDBACK[0].content)).toBeInTheDocument();

    // Verify 1-click Mark Resolved or Under Review button exists
    const markResolvedBtns = screen.getAllByRole('button', { name: /Mark Resolved/i });
    expect(markResolvedBtns.length).toBeGreaterThan(0);
    fireEvent.click(markResolvedBtns[0]);

    await waitFor(() => {
      expect(onUpdateFeedbackStatus).toHaveBeenCalled();
    });
  });

  it('renders AdminStatus with AI API, Backend, Telegram, Gmail screenshot debug telemetry', async () => {
    const showToast = vi.fn();

    render(<AdminStatus showToast={showToast} />);

    expect(screen.getByText('App Status & Subsystem Health')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Screenshot Debug Diagnostics')).toBeInTheDocument();
      expect(screen.getByText('AI Intelligence Engine')).toBeInTheDocument();
      expect(screen.getByText('Cloudflare Worker Backend')).toBeInTheDocument();
      expect(screen.getByText('Telegram Council Relay')).toBeInTheDocument();
      expect(screen.getByText('Gmail Alert Dispatcher')).toBeInTheDocument();
      expect(screen.getByText('Database & Storage Tier')).toBeInTheDocument();
      expect(screen.getByText('Council Security Shield')).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy Telemetry/i });
    expect(copyBtn).toBeInTheDocument();
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
      expect(screen.getByText(/AI Analytics & Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/EXECUTIVE AI SUMMARY/)).toBeInTheDocument();
      expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
      expect(screen.getByText('Recurring Campus Concerns')).toBeInTheDocument();
      expect(screen.getByText('Council Recommendations')).toBeInTheDocument();
    });
  });

  it('renders Footer with GMC copyright and developer credit to sangrechy', () => {
    render(<Footer />);

    expect(screen.getByText(/GMC Thiruvallur/i)).toBeInTheDocument();
    expect(screen.getByText('Developed by')).toBeInTheDocument();
    expect(screen.getByText('sangrechy')).toBeInTheDocument();
    const githubLink = screen.getByRole('link', { name: /sangrechy/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/sangrechy');
    const mailLink = screen.getByRole('link', { name: /Contact Developer/i });
    expect(mailLink).toHaveAttribute('href', 'mailto:sangrechy@gmail.com?subject=GMC%20Thiruvallur%20Feedback%20Portal');
  });

  it('renders MobileBottomNav with 5 thumb-friendly items and navigates on tap', () => {
    const setCurrentRoute = vi.fn();

    render(
      <MobileBottomNav
        currentRoute="home"
        setCurrentRoute={setCurrentRoute}
      />
    );

    expect(screen.getByRole('navigation', { name: 'Mobile Navigation' })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Notices')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Polls')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Feedback'));
    expect(setCurrentRoute).toHaveBeenCalledWith('feedback');

    fireEvent.click(screen.getByText('Live Chat'));
    expect(setCurrentRoute).toHaveBeenCalledWith('chat');
  });
});

