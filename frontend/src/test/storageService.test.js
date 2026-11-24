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
      expect(res.submittedAt).toBeDefined();
      expect(res.containsPII).toBe(false);

      const all = await storageService.getFeedbacks();
      const item = all.find(f => f.trackingId === res.trackingId);
      expect(item).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.submittedAtMs).toBeGreaterThan(0);
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

    it('allows council to delete single and multiple feedback messages', async () => {
      const fb1 = await storageService.submitFeedback({
        category: 'Hostel & Mess',
        content: 'Test delete feedback item 1',
        containsPII: false
      });
      const fb2 = await storageService.submitFeedback({
        category: 'Transport',
        content: 'Test delete feedback item 2',
        containsPII: false
      });

      const allBefore = await storageService.getFeedbacks();
      const item1 = allBefore.find(f => f.trackingId === fb1.trackingId);
      const item2 = allBefore.find(f => f.trackingId === fb2.trackingId);
      expect(item1).toBeDefined();
      expect(item2).toBeDefined();

      // Test single delete
      await storageService.deleteFeedback(item1.id);
      let afterSingle = await storageService.getFeedbacks();
      expect(afterSingle.some(f => f.id === item1.id)).toBe(false);
      expect(afterSingle.some(f => f.id === item2.id)).toBe(true);

      // Test multiple delete
      await storageService.deleteMultipleFeedbacks([item2.id]);
      let afterMultiple = await storageService.getFeedbacks();
      expect(afterMultiple.some(f => f.id === item2.id)).toBe(false);
    });
  });

  describe('Temporary Live Chat Pipeline', () => {
    it('creates an ephemeral session with format GMC-XXXXX and initial greeting', async () => {
      const session = await storageService.getOrCreateChatSession();
      expect(session.sessionId).toMatch(/^GMC-[A-Z0-9]{8,16}$/);
      expect(session.id).toBe(session.sessionId); // Ensured document key matches sessionId
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

    it('retrieves all chats via getAllChats for admin dashboard triage', async () => {
      const session = await storageService.getOrCreateChatSession();
      await storageService.sendChatMessage(session.sessionId, 'student', 'Hello Council!');

      const allChats = await storageService.getAllChats();
      expect(Array.isArray(allChats)).toBe(true);
      expect(allChats.some(c => c.sessionId === session.sessionId)).toBe(true);
    });

    it('safely terminates session on endChatSession, purges message content, and blocks further messages', async () => {
      const session = await storageService.getOrCreateChatSession();
      await storageService.sendChatMessage(session.sessionId, 'student', 'Private confidential question');
      await storageService.endChatSession(session.sessionId);

      const reloaded = await storageService.getOrCreateChatSession(session.sessionId);
      expect(reloaded.status).toBe('ended');
      // Messages are purged, retaining only the privacy termination notice
      expect(reloaded.messages.length).toBe(1);
      expect(reloaded.messages[0].text).toMatch(/purged/i);

      // Attempting to send message to ended session throws error
      await expect(
        storageService.sendChatMessage(session.sessionId, 'student', 'Is anyone there?')
      ).rejects.toThrow(/ended/);
    });

    it('allows council to delete single and multiple chat sessions', async () => {
      const s1 = await storageService.getOrCreateChatSession();
      const s2 = await storageService.getOrCreateChatSession();

      const allBefore = await storageService.getAllChats();
      expect(allBefore.some(c => c.sessionId === s1.sessionId)).toBe(true);
      expect(allBefore.some(c => c.sessionId === s2.sessionId)).toBe(true);

      // Single delete
      await storageService.deleteChatSession(s1.sessionId);
      let afterSingle = await storageService.getAllChats();
      expect(afterSingle.some(c => c.sessionId === s1.sessionId)).toBe(false);
      expect(afterSingle.some(c => c.sessionId === s2.sessionId)).toBe(true);

      // Multiple delete
      await storageService.deleteMultipleChats([s2.sessionId]);
      let afterMultiple = await storageService.getAllChats();
      expect(afterMultiple.some(c => c.sessionId === s2.sessionId)).toBe(false);
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

    it('rejects votes when a poll is closed or has passed its deadline', async () => {
      // Test 1: Closed poll
      const closedPoll = await storageService.addPoll({
        question: 'Closed voting test?',
        options: [{ text: 'Choice A', votes: 0 }, { text: 'Choice B', votes: 0 }]
      });
      await storageService.togglePollStatus(closedPoll.id, 'closed');
      await expect(storageService.votePoll(closedPoll.id, 0)).rejects.toThrow(/closed/i);

      // Test 2: Expired deadline
      const expiredPoll = await storageService.addPoll({
        question: 'Past deadline poll?',
        options: [{ text: 'Choice A', votes: 0 }, { text: 'Choice B', votes: 0 }],
        closingDate: '2020-01-01'
      });
      await expect(storageService.votePoll(expiredPoll.id, 0)).rejects.toThrow(/closing deadline/i);
    });

    it('allows council to create, toggle, and batch delete polls', async () => {
      const p1 = await storageService.addPoll({
        question: 'Preferred clinical symposium topic?',
        options: [{ text: 'Cardiology', votes: 0 }, { text: 'Neurology', votes: 0 }]
      });
      const p2 = await storageService.addPoll({
        question: 'Preferred sports week schedule?',
        options: [{ text: 'December', votes: 0 }, { text: 'January', votes: 0 }]
      });

      expect(p1.id).toBeDefined();
      expect(p2.id).toBeDefined();

      await storageService.togglePollStatus(p1.id, 'closed');
      let all = await storageService.getPolls(true);
      expect(all.find(p => p.id === p1.id).status).toBe('closed');

      // Test single delete
      await storageService.deletePoll(p1.id);
      all = await storageService.getPolls(true);
      expect(all.some(p => p.id === p1.id)).toBe(false);
      expect(all.some(p => p.id === p2.id)).toBe(true);

      // Test multiple delete
      await storageService.deleteMultiplePolls([p2.id]);
      all = await storageService.getPolls(true);
      expect(all.some(p => p.id === p2.id)).toBe(false);
    });
  });

  describe('Announcements & Events Management', () => {
    it('creates, pins, and batch deletes campus announcements', async () => {
      const a1 = await storageService.addAnnouncement({
        title: 'Emergency Dissection Hall Sanitation Notice',
        category: 'IMPORTANT',
        description: 'Sanitation drive scheduled for Friday morning.',
        pinned: true
      });
      const a2 = await storageService.addAnnouncement({
        title: 'Clinical Ward Posting Schedule Rev 2',
        category: 'ACADEMIC',
        description: 'Updated roster for 3rd year postings.',
        pinned: false
      });

      expect(a1.id).toBeDefined();
      expect(a1.pinned).toBe(true);
      expect(a2.id).toBeDefined();

      let list = await storageService.getAnnouncements(true);
      expect(list.some(a => a.id === a1.id)).toBe(true);
      expect(list.some(a => a.id === a2.id)).toBe(true);

      // Test single delete
      await storageService.deleteAnnouncement(a1.id);
      list = await storageService.getAnnouncements(true);
      expect(list.some(a => a.id === a1.id)).toBe(false);
      expect(list.some(a => a.id === a2.id)).toBe(true);

      // Test multiple delete
      await storageService.deleteMultipleAnnouncements([a2.id]);
      list = await storageService.getAnnouncements(true);
      expect(list.some(a => a.id === a2.id)).toBe(false);
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
