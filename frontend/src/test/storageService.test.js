import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, initLocalStore } from '../services/storageService';

describe('Storage Service Blackbox & Unit Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    initLocalStore();
  });

  describe('Anonymous Feedback Pipeline', () => {
    it('generates a unique tracking ID and records feedback cleanly without PII', async () => {
      const res = await storageService.submitFeedback({
        category: 'Academics',
        content: 'The microphone in Lecture Hall 2 needs battery replacement.',
        containsPII: false
      });

      expect(res.success).toBe(true);
      expect(res.trackingId).toMatch(/^GMC-FB-\d{4}$/);
      expect(res.containsPII).toBe(false);

      const all = await storageService.getFeedbacks();
      const item = all.find(f => f.trackingId === res.trackingId);
      expect(item).toBeDefined();
      expect(item.category).toBe('Academics');
      expect(item.status).toBe('Received');
      expect(item.aiAnalysis).not.toBeNull();
      expect(item.aiAnalysis.category).toBe('Academics');
    });

    it('honestly reports delivered=false when cloud database is not connected', async () => {
      const res = await storageService.submitFeedback({
        category: 'Hostel',
        content: 'Extra hot water supply required during morning hours.',
        containsPII: false
      });

      expect(res.success).toBe(true);
      expect(res.delivered).toBe(false); // Honest delivery status: false when cloud Firestore is not connected
    });

    it('strictly isolates and flags feedback declaring PII, suppressing AI processing', async () => {
      const res = await storageService.submitFeedback({
        category: 'Hostel & Mess',
        content: 'My name is Suresh from Room 302, please check the water tap.',
        containsPII: true
      });

      expect(res.success).toBe(true);
      expect(res.containsPII).toBe(true);

      const all = await storageService.getFeedbacks();
      const item = all.find(f => f.trackingId === res.trackingId);
      expect(item.containsPII).toBe(true);
      expect(item.aiAnalysis).toBeNull(); // AI bypassed!
    });

    it('heuristically auto-detects identifying information even if student missed checkbox', async () => {
      const res = await storageService.submitFeedback({
        category: 'Transport',
        content: 'Contact Dr. K. Ramesh or roll 45 regarding bus timing.',
        containsPII: false // User did not tick, but text has PII!
      });

      expect(res.containsPII).toBe(true); // Auto-detected!
      const all = await storageService.getFeedbacks();
      const item = all.find(f => f.trackingId === res.trackingId);
      expect(item.aiAnalysis).toBeNull();
    });

    it('allows council to triage and update status (Received -> Reviewing -> Resolved)', async () => {
      const res = await storageService.submitFeedback({
        category: 'Infrastructure',
        content: 'Library air conditioner filter cleaned.',
        containsPII: false
      });

      const all = await storageService.getFeedbacks();
      const item = all.find(f => f.trackingId === res.trackingId);

      await storageService.updateFeedbackStatus(item.id, 'Reviewing');
      let updated = await storageService.getFeedbacks();
      expect(updated.find(f => f.id === item.id).status).toBe('Reviewing');

      await storageService.updateFeedbackStatus(item.id, 'Resolved');
      updated = await storageService.getFeedbacks();
      expect(updated.find(f => f.id === item.id).status).toBe('Resolved');
    });
  });

  describe('Temporary Live Chat Pipeline', () => {
    it('creates an ephemeral session with format GMC-XXXXX and initial greeting', async () => {
      const session = await storageService.getOrCreateChatSession();
      expect(session.sessionId).toMatch(/^GMC-[A-Z0-9]{5}$/);
      expect(session.status).toBe('active');
      expect(session.messages.length).toBeGreaterThanOrEqual(1);
      expect(session.messages[0].sender).toBe('council');
    });

    it('appends student messages and updates last activity timestamp', async () => {
      const session = await storageService.getOrCreateChatSession();
      const msg = await storageService.sendChatMessage(session.sessionId, 'student', 'When does the sports room open?');

      expect(msg.text).toBe('When does the sports room open?');
      expect(msg.sender).toBe('student');

      const reloaded = await storageService.getOrCreateChatSession(session.sessionId);
      expect(reloaded.messages.some(m => m.text === 'When does the sports room open?')).toBe(true);
    });

    it('safely terminates session on endChatSession and blocks further messages', async () => {
      const session = await storageService.getOrCreateChatSession();
      await storageService.endChatSession(session.sessionId);

      const reloaded = await storageService.getOrCreateChatSession(session.sessionId);
      expect(reloaded.status).toBe('ended');

      // Attempting to send message to ended session throws error
      await expect(
        storageService.sendChatMessage(session.sessionId, 'student', 'Is anyone there?')
      ).rejects.toThrow(/ended/);
    });
  });

  describe('Student Polls & Democratic Voting', () => {
    it('records vote and prevents duplicate voting by the same student', async () => {
      const polls = await storageService.getPolls();
      const target = polls[0];
      const initialVotes = target.options[0].votes;

      // First vote succeeds
      await storageService.votePoll(target.id, 0);
      const updated = await storageService.getPolls();
      const updatedPoll = updated.find(p => p.id === target.id);
      expect(updatedPoll.options[0].votes).toBe(initialVotes + 1);
      expect(updatedPoll.userVoted).toBe(0);

      // Duplicate vote throws error
      await expect(storageService.votePoll(target.id, 1)).rejects.toThrow(/already voted/);
    });

    it('allows council to create and toggle poll status', async () => {
      const newPoll = await storageService.addPoll({
        question: 'Preferred clinical symposium topic?',
        options: [{ text: 'Cardiology', votes: 0 }, { text: 'Neurology', votes: 0 }]
      });

      expect(newPoll.id).toBeDefined();
      expect(newPoll.status).toBe('active');

      await storageService.togglePollStatus(newPoll.id, 'closed');
      const all = await storageService.getPolls();
      expect(all.find(p => p.id === newPoll.id).status).toBe('closed');
    });
  });

  describe('Announcements & Events Management', () => {
    it('creates, pins, and deletes campus announcements', async () => {
      const created = await storageService.addAnnouncement({
        title: 'Emergency Dissection Hall Sanitation Notice',
        category: 'IMPORTANT',
        description: 'Sanitation drive scheduled for Friday morning.',
        pinned: true
      });

      expect(created.id).toBeDefined();
      expect(created.pinned).toBe(true);

      const list = await storageService.getAnnouncements();
      expect(list.some(a => a.id === created.id)).toBe(true);

      await storageService.deleteAnnouncement(created.id);
      const afterDelete = await storageService.getAnnouncements();
      expect(afterDelete.some(a => a.id === created.id)).toBe(false);
    });

    it('creates and deletes college events', async () => {
      const created = await storageService.addEvent({
        title: 'CME on Antibiotic Stewardship',
        category: 'Academic / Symposium',
        date: '28 November 2026',
        venue: 'GMC Seminar Hall'
      });

      const events = await storageService.getEvents();
      expect(events.some(e => e.id === created.id)).toBe(true);

      await storageService.deleteEvent(created.id);
      const afterDelete = await storageService.getEvents();
      expect(afterDelete.some(e => e.id === created.id)).toBe(false);
    });
  });
});
