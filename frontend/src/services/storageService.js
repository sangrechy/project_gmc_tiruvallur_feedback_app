// Unified Storage Service: Seamlessly switches between Firebase Firestore and LocalStorage
import { db, auth, isFirebaseConfigured } from "./firebase";
import { apiService } from "./apiService";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  where,
  serverTimestamp,
  runTransaction,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_POLLS,
  INITIAL_FEEDBACK,
  INITIAL_CHATS,
  COUNCIL_ADMINS
} from "../data/initialData";

// LocalStorage Keys
const KEYS = {
  ANNOUNCEMENTS: "gmc_announcements",
  EVENTS: "gmc_events",
  POLLS: "gmc_polls",
  FEEDBACK: "gmc_feedback",
  CHATS: "gmc_chats",
  ADMINS: "gmc_admins",
  USER_VOTES: "gmc_user_votes",
};

// Initialize LocalStorage with seed data if empty
export function initLocalStore() {
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(KEYS.EVENTS)) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(KEYS.POLLS)) {
    localStorage.setItem(KEYS.POLLS, JSON.stringify(INITIAL_POLLS));
  }
  if (!localStorage.getItem(KEYS.FEEDBACK)) {
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(INITIAL_FEEDBACK));
  }
  if (!localStorage.getItem(KEYS.CHATS)) {
    localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
  }
  if (!localStorage.getItem(KEYS.ADMINS)) {
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(COUNCIL_ADMINS));
  }
  if (!localStorage.getItem(KEYS.USER_VOTES)) {
    localStorage.setItem(KEYS.USER_VOTES, JSON.stringify({}));
  }
}

initLocalStore();

export const storageService = {
  isLive: isFirebaseConfigured,

  // In-memory cache to reduce redundant Firestore collection read cycles
  _announcementsCache: null,
  _announcementsCacheTime: 0,
  _pollsCache: null,
  _pollsCacheTime: 0,
  _feedbacksCache: null,
  _feedbacksCacheTime: 0,

  invalidateCache(key) {
    if (!key || key === 'announcements') {
      this._announcementsCache = null;
      this._announcementsCacheTime = 0;
    }
    if (!key || key === 'polls') {
      this._pollsCache = null;
      this._pollsCacheTime = 0;
    }
    if (!key || key === 'feedback') {
      this._feedbacksCache = null;
      this._feedbacksCacheTime = 0;
    }
  },

  // ==================== ANNOUNCEMENTS ====================
  async getAnnouncements(force = false) {
    if (!force && this._announcementsCache && Date.now() - this._announcementsCacheTime < 30000) {
      return this._announcementsCache;
    }

    let data = null;
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "announcements"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore error, falling back to local:", err);
      }
    }
    if (!data) {
      data = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    }

    this._announcementsCache = data;
    this._announcementsCacheTime = Date.now();
    return data;
  },

  async addAnnouncement(announcement) {
    this.invalidateCache('announcements');
    const cleanTitle = (announcement.title || "").trim().slice(0, 200);
    const cleanCategory = (announcement.category || "General").trim().slice(0, 100);
    const cleanDesc = (announcement.description || announcement.content || "").trim().slice(0, 5000);

    if (!cleanTitle) {
      throw new Error("Announcement title is required.");
    }

    const newItem = {
      ...announcement,
      title: cleanTitle,
      category: cleanCategory,
      description: cleanDesc,
      date: announcement.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "announcements"), newItem);
        return { id: docRef.id, ...newItem };
      } catch (err) {
        console.warn("Firestore error adding announcement:", err);
      }
    }

    const localList = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    const created = { id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...newItem };
    localList.unshift(created);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(localList));
    return created;
  },

  async updateAnnouncement(id, updates) {
    this.invalidateCache('announcements');
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "announcements", id), updates);
      } catch (err) {
        console.warn("Firestore update error:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    const updated = localList.map(a => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    return true;
  },

  async deleteAnnouncement(id) {
    return this.deleteMultipleAnnouncements([id]);
  },

  async deleteMultipleAnnouncements(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return true;
    this.invalidateCache('announcements');

    // 1. Remove from LocalStorage
    const localList = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    const filtered = localList.filter(a => !ids.includes(a.id));
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));

    // 2. Remove from Cloud Firestore in a single atomic batch (1 HTTP request instead of N)
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => {
          batch.delete(doc(db, "announcements", id));
        });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore delete multiple announcements error:", err);
        throw new Error("Failed to delete announcements from cloud: " + err.message);
      }
    }
    return true;
  },

  // ==================== EVENTS ====================
  async getEvents() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "events"));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore error, falling back to local:", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
  },

  async addEvent(eventData) {
    const newEvent = {
      ...eventData,
      isUpcoming: true,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "events"), newEvent);
        return { id: docRef.id, ...newEvent };
      } catch (err) {
        console.warn("Firestore add event error:", err);
      }
    }

    const list = JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
    const created = { id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...newEvent };
    list.unshift(created);
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(list));
    return created;
  },

  async deleteEvent(id) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (err) {
        console.warn("Firestore delete event error:", err);
      }
    }
    const list = JSON.parse(localStorage.getItem(KEYS.EVENTS) || "[]");
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(filtered));
    return true;
  },

  // ==================== POLLS ====================
  async getPolls(force = false) {
    const userVotes = JSON.parse(localStorage.getItem(KEYS.USER_VOTES) || "{}");
    let polls = null;

    if (!force && this._pollsCache && Date.now() - this._pollsCacheTime < 20000) {
      polls = this._pollsCache;
    } else {
      if (isFirebaseConfigured && db) {
        try {
          const snap = await getDocs(collection(db, "polls"));
          polls = snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              closingDate: data.closingDate?.toDate ? data.closingDate.toDate().toISOString().split("T")[0] : data.closingDate
            };
          });
        } catch (err) {
          console.warn("Firestore error, falling back to local polls:", err);
        }
      }
      if (!polls) {
        polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
      }
      this._pollsCache = polls;
      this._pollsCacheTime = Date.now();
    }

    return polls.map(p => ({
      ...p,
      userVoted: userVotes[p.id] !== undefined ? userVotes[p.id] : null
    }));
  },

  async votePoll(pollId, optionIndex) {
    const userVotes = JSON.parse(localStorage.getItem(KEYS.USER_VOTES) || "{}");
    if (userVotes[pollId] !== undefined) {
      throw new Error("You have already voted in this poll!");
    }

    if (isFirebaseConfigured && db) {
      if (auth && !auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Anonymous auth failed for voting:", err);
        }
      }
      const voterUid = auth?.currentUser?.uid;
      if (!voterUid) {
        throw new Error("Authentication required to cast ballot in poll.");
      }

      const pollRef = doc(db, "polls", pollId);
      await runTransaction(db, async (transaction) => {
        const pollSnap = await transaction.get(pollRef);
        if (!pollSnap.exists()) {
          throw new Error("Poll not found");
        }
        const pollData = pollSnap.data();
        if (pollData.status !== "active") {
          throw new Error("This poll is closed and no longer accepting votes.");
        }
        if (pollData.closingDate) {
          const deadline = pollData.closingDate?.toMillis
            ? pollData.closingDate.toMillis()
            : new Date(pollData.closingDate.includes("T") ? pollData.closingDate : `${pollData.closingDate}T23:59:59Z`).getTime();
          if (Date.now() > deadline) {
            throw new Error("This poll has passed its closing deadline and is no longer accepting votes.");
          }
        }
        if (!pollData.options || !pollData.options[optionIndex]) {
          throw new Error("Invalid poll option selected.");
        }

        // 1. Verify voter has not already cast ballot
        const voteDocRef = doc(db, "polls", pollId, "votes", voterUid);
        const existingVoteSnap = await transaction.get(voteDocRef);
        if (existingVoteSnap.exists()) {
          throw new Error("You have already voted in this poll!");
        }

        const updatedOptions = pollData.options.map((opt, idx) => {
          const currentCount = Number(opt.votes) || 0;
          if (idx === optionIndex) {
            return { text: opt.text, votes: currentCount + 1 };
          }
          return { text: opt.text, votes: currentCount };
        });

        // 2. Atomically record individual ballot doc bound to voter UID
        transaction.set(voteDocRef, {
          selectedOption: optionIndex,
          timestamp: serverTimestamp()
        });

        // 3. Atomically update poll options and increment totalVotes by 1 in same commit
        transaction.update(pollRef, {
          options: updatedOptions,
          totalVotes: (Number(pollData.totalVotes) || 0) + 1
        });
      });
    }

    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const targetPoll = polls.find(p => p.id === pollId);
    if (!targetPoll) throw new Error("Poll not found");
    if (targetPoll.status !== "active") throw new Error("This poll is closed and no longer accepting votes.");
    if (targetPoll.closingDate) {
      const deadline = new Date(targetPoll.closingDate.includes("T") ? targetPoll.closingDate : `${targetPoll.closingDate}T23:59:59Z`).getTime();
      if (Date.now() > deadline) {
        throw new Error("This poll has passed its closing deadline and is no longer accepting votes.");
      }
    }
    if (!targetPoll.options || !targetPoll.options[optionIndex]) {
      throw new Error("Invalid poll option selected.");
    }

    userVotes[pollId] = optionIndex;
    localStorage.setItem(KEYS.USER_VOTES, JSON.stringify(userVotes));

    targetPoll.options[optionIndex].votes += 1;
    targetPoll.totalVotes = (targetPoll.totalVotes || 0) + 1;
    localStorage.setItem(KEYS.POLLS, JSON.stringify(polls));
    this.invalidateCache('polls');

    return true;
  },

  async addPoll(pollData) {
    this.invalidateCache('polls');
    const cleanQuestion = (pollData.question || "").trim().slice(0, 300);
    const cleanCategory = (pollData.category || "General").trim().slice(0, 100);
    const cleanOptions = (Array.isArray(pollData.options) ? pollData.options : [])
      .slice(0, 10)
      .map(opt => {
        if (typeof opt === "string") {
          return { text: opt.trim().slice(0, 200), votes: 0 };
        }
        return {
          ...opt,
          text: (opt.text || "").trim().slice(0, 200),
          votes: Number(opt.votes) || 0
        };
      });

    if (!cleanQuestion || cleanOptions.length < 2) {
      throw new Error("A valid poll question and at least 2 options are required.");
    }

    const closingTimestamp = pollData.closingDate
      ? Timestamp.fromDate(new Date(pollData.closingDate.includes("T") ? pollData.closingDate : `${pollData.closingDate}T23:59:59Z`))
      : null;

    const newPoll = {
      ...pollData,
      question: cleanQuestion,
      category: cleanCategory,
      options: cleanOptions,
      totalVotes: 0,
      status: "active",
      ...(closingTimestamp ? { closingDate: closingTimestamp } : {}),
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "polls"), newPoll);
        return {
          id: docRef.id,
          ...newPoll,
          closingDate: pollData.closingDate || null
        };
      } catch (err) {
        console.warn("Firestore error adding poll:", err);
      }
    }

    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const created = {
      id: `poll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...newPoll,
      closingDate: pollData.closingDate || null
    };
    polls.unshift(created);
    localStorage.setItem(KEYS.POLLS, JSON.stringify(polls));
    return created;
  },

  async togglePollStatus(pollId, status) {
    this.invalidateCache('polls');
    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const updated = polls.map(p => p.id === pollId ? { ...p, status } : p);
    localStorage.setItem(KEYS.POLLS, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "polls", pollId), { status });
      } catch (err) {
        console.warn("Firestore toggle poll status error:", err);
      }
    }
    return true;
  },

  async deletePoll(pollId) {
    return this.deleteMultiplePolls([pollId]);
  },

  async deleteMultiplePolls(pollIds) {
    if (!Array.isArray(pollIds) || pollIds.length === 0) return true;
    this.invalidateCache('polls');

    // 1. Remove from LocalStorage
    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const filtered = polls.filter(p => !pollIds.includes(p.id));
    localStorage.setItem(KEYS.POLLS, JSON.stringify(filtered));

    const userVotes = JSON.parse(localStorage.getItem(KEYS.USER_VOTES) || "{}");
    pollIds.forEach(id => delete userVotes[id]);
    localStorage.setItem(KEYS.USER_VOTES, JSON.stringify(userVotes));

    // 2. Remove from Cloud Firestore in a single atomic batch
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        for (const pollId of pollIds) {
          const pollRef = doc(db, "polls", pollId);
          batch.delete(pollRef);
        }
        await batch.commit();
      } catch (err) {
        console.warn("Firestore delete multiple polls error:", err);
        throw new Error("Failed to delete polls from cloud: " + err.message);
      }
    }
    return true;
  },

  // ==================== ANONYMOUS FEEDBACK ====================
  async submitFeedback({ category, content, containsPII }) {
    const cleanContent = typeof content === "string" ? content.trim().slice(0, 5000) : "";
    const cleanCategory = typeof category === "string" ? category.trim().slice(0, 100) : "General";

    if (!cleanContent) {
      throw new Error("Feedback content is required.");
    }

    // If backend worker is available, dispatch to serverless API
    let backendResult = null;
    if (apiService.isConfigured) {
      try {
        backendResult = await apiService.submitFeedback({
          category: cleanCategory,
          content: cleanContent,
          containsPII
        });
      } catch (err) {
        // Enforce server-side rate limits and validation; do not bypass to Firestore
        if (err.message && (err.message.includes("rate limit") || err.message.includes("rejected") || err.message.includes("exceeds") || err.message.includes("empty") || err.message.includes("too short"))) {
          throw err;
        }
        console.warn("Backend feedback submission skipped/failed:", err);
      }
    }

    const trackingId = backendResult?.trackingId || ("GMC-FB-" + Math.floor(1000 + Math.random() * 9000));
    
    // Automatic PII Detection heuristics as additional privacy safety (doctor/student titles, phone numbers, roll nos, rooms, emails)
    const piiPattern = /\b((dr\.|dr\s|prof\.|mr\.|ms\.|mrs\.)\s+[a-z]+|(?:\+91[\-\s]?)?[6-9]\d{9}|[0-9]{10,12}|(?:roll|reg(?:istration)?|student\s*id)\s*(?:(?:no|number|#)?\s*(?:is|[:.-])?)\s*\d+|(?:hostel\s+)?room\s*(?:no\.?)?\s*\d+|my name is\s+[a-z]+|i am\s+[a-z]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i;
    const autoDetectedPII = piiPattern.test(cleanContent);
    const finalContainsPII = backendResult?.containsPII !== undefined
      ? backendResult.containsPII
      : Boolean(containsPII || autoDetectedPII);

    // AI Analysis (Simulated / Prepared) - Bypassed strictly if contains PII
    let aiAnalysis = null;
    if (!finalContainsPII) {
      const lower = cleanContent.toLowerCase();
      let sentiment = "Neutral";
      let urgency = "Medium";
      if (lower.includes("urgent") || lower.includes("danger") || lower.includes("broken") || lower.includes("failed") || lower.includes("bad")) {
        urgency = "High";
        sentiment = "Negative";
      } else if (lower.includes("thank") || lower.includes("good") || lower.includes("great") || lower.includes("excellent")) {
        sentiment = "Positive";
        urgency = "Low";
      }

      aiAnalysis = {
        category: cleanCategory,
        sentiment,
        urgency,
        summary: cleanContent.length > 90 ? cleanContent.slice(0, 87) + "..." : cleanContent
      };
    }

    const feedbackDoc = {
      trackingId,
      category: cleanCategory,
      content: cleanContent,
      containsPII: finalContainsPII,
      status: "Received",
      createdAt: new Date().toISOString(),
      aiAnalysis
    };

    let deliveredToServer = false;

    // Delivery is ONLY considered true if the grievance was durably written to Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        if (auth && !auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (authErr) {
            console.warn("Anonymous auth failed for feedback:", authErr);
          }
        }
        // Strip client-side aiAnalysis before writing to Firestore:
        // Firestore security rules strictly reserve aiAnalysis to council admins
        const { aiAnalysis: _omit, ...cloudDoc } = feedbackDoc;
        const docRef = await addDoc(collection(db, "feedback"), {
          ...cloudDoc,
          serverTimestamp: serverTimestamp()
        });
        feedbackDoc.id = docRef.id;
        deliveredToServer = true;
      } catch (err) {
        console.warn("Firestore feedback submission error, stored locally:", err);
      }
    }

    const feedbacks = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
    if (!feedbackDoc.id) {
      feedbackDoc.id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
    feedbacks.unshift(feedbackDoc);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedbacks));
    this.invalidateCache('feedback');

    return {
      success: true,
      delivered: deliveredToServer,
      trackingId,
      containsPII: finalContainsPII,
      piiDetected: finalContainsPII,
      alertDispatched: Boolean(backendResult?.telegramAlertSent)
    };
  },

  async getFeedbacks(force = false) {
    if (!force && this._feedbacksCache && Date.now() - this._feedbacksCacheTime < 20000) {
      return this._feedbacksCache;
    }

    let data = null;
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "feedback"));
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        if (err.code === "permission-denied") {
          console.error("Firestore feedback read permission-denied: Council clearance required.");
          return [];
        }
        console.warn("Firestore getFeedbacks error:", err);
      }
    }
    if (!data) {
      data = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
    }

    this._feedbacksCache = data;
    this._feedbacksCacheTime = Date.now();
    return data;
  },

  async updateFeedbackStatus(id, newStatus, councilNotes) {
    this.invalidateCache('feedback');
    const list = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
    const updated = list.map(f => {
      if (f.id === id) {
        return { 
          ...f, 
          status: newStatus,
          ...(councilNotes !== undefined ? { councilNotes } : {})
        };
      }
      return f;
    });
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        const updateData = { status: newStatus };
        if (councilNotes !== undefined) updateData.councilNotes = councilNotes;
        await updateDoc(doc(db, "feedback", id), updateData);
      } catch (err) {
        console.warn("Firestore update feedback status error:", err);
      }
    }
    return true;
  },

  async deleteFeedback(id) {
    return this.deleteMultipleFeedbacks([id]);
  },

  async deleteMultipleFeedbacks(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return true;
    this.invalidateCache('feedback');

    // 1. Remove from LocalStorage
    const list = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
    const updated = list.filter(f => !ids.includes(f.id));
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(updated));

    // 2. Remove from Cloud Firestore in a single atomic batch commit
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        ids.forEach(id => batch.delete(doc(db, "feedback", id)));
        await batch.commit();
      } catch (err) {
        console.warn("Firestore delete multiple feedback error:", err);
        throw new Error("Failed to delete from cloud: " + err.message);
      }
    }
    return true;
  },

  // ==================== TEMPORARY LIVE CHAT ====================
  generateSessionId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "GMC-";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buffer = new Uint8Array(10);
      crypto.getRandomValues(buffer);
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(buffer[i] % chars.length);
      }
    } else {
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return code;
  },

  async getOrCreateChatSession(requestedSessionId = null) {
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const isNewSession = !requestedSessionId;
    const sessionId = (typeof requestedSessionId === "string" && requestedSessionId.trim())
      ? requestedSessionId.trim().slice(0, 50)
      : this.generateSessionId();

    if (isFirebaseConfigured && auth && !auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn("Anonymous auth failed for chat session:", err);
      }
    }
    const currentUserUid = auth?.currentUser?.uid || "anon-student";

    // Check if session exists in memory/local first
    let existing = chats.find(c => c.sessionId === sessionId);
    if (existing) {
      // Check 24-hr expiry
      const hoursAgo = (Date.now() - new Date(existing.lastActivity || existing.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursAgo > 24) {
        existing.status = "expired";
        localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
      }
    }

    // If Firebase is configured, sync with Cloud Firestore
    if (isFirebaseConfigured && db) {
      try {
        const chatRef = doc(db, "chats", sessionId);

        if (isNewSession) {
          // Initialize fresh chat document in Firestore with ownerUid so student messages can be added
          try {
            await setDoc(chatRef, {
              sessionId,
              status: "active",
              createdAt: serverTimestamp(),
              lastActivity: serverTimestamp(),
              ownerUid: currentUserUid
            });
          } catch (createErr) {
            console.warn("Firestore new chat doc create error:", createErr);
          }
        } else {
          // Try to fetch existing session from cloud
          try {
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
              const cloudData = chatSnap.data();
              const messagesSnap = await getDocs(collection(chatRef, "messages"));
              const cloudMessages = messagesSnap.docs.map(m => ({ id: m.id, ...m.data() }));
              cloudMessages.sort((a, b) => {
                const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.timestamp || 0).getTime();
                const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.timestamp || 0).getTime();
                return timeA - timeB;
              });

              const syncedSession = {
                id: sessionId,
                sessionId,
                status: cloudData.status || "active",
                createdAt: cloudData.createdAt?.toDate ? cloudData.createdAt.toDate().toISOString() : (existing?.createdAt || new Date().toISOString()),
                lastActivity: cloudData.lastActivity?.toDate ? cloudData.lastActivity.toDate().toISOString() : (existing?.lastActivity || new Date().toISOString()),
                ownerUid: cloudData.ownerUid || currentUserUid,
                messages: cloudMessages.length > 0 ? cloudMessages : (existing?.messages || [])
              };

              const idx = chats.findIndex(c => c.sessionId === sessionId);
              if (idx >= 0) chats[idx] = syncedSession;
              else chats.unshift(syncedSession);
              localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
              return syncedSession;
            } else {
              // Ensure doc exists in cloud
              await setDoc(chatRef, {
                sessionId,
                status: "active",
                createdAt: serverTimestamp(),
                lastActivity: serverTimestamp(),
                ownerUid: currentUserUid
              });
            }
          } catch (fetchErr) {
            console.warn("Firestore existing chat fetch warning:", fetchErr);
          }
        }
      } catch (err) {
        console.warn("Firestore getOrCreateChatSession sync warning:", err);
      }
    }

    if (existing) return existing;

    // Create new session
    const newSession = {
      id: sessionId,
      sessionId,
      status: "active",
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ownerUid: currentUserUid,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          sender: "council",
          text: "Hello! Welcome to the GMC Student Council temporary chat. How can we help you?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    chats.unshift(newSession);
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
    return newSession;
  },

  async sendChatMessage(sessionId, sender, text) {
    const cleanSessionId = typeof sessionId === "string" ? sessionId.trim().slice(0, 50) : "";
    const cleanText = typeof text === "string" ? text.trim().slice(0, 2000) : "";
    const cleanSender = (sender === "council" || sender === "admin") ? "council" : "student";

    if (!cleanSessionId || !cleanText) {
      throw new Error("Valid session ID and non-empty message text are required.");
    }

    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const session = chats.find(c => c.sessionId === cleanSessionId);
    if (!session) throw new Error("Chat session not found");
    if (session.status !== "active") throw new Error("This chat session has ended or expired");

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sessionId: cleanSessionId,
      sender: cleanSender,
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    session.messages.push(newMsg);
    session.lastActivity = new Date().toISOString();
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));

    // Persist to Cloud Firestore if connected
    if (isFirebaseConfigured && db) {
      try {
        const chatRef = doc(db, "chats", cleanSessionId);
        await addDoc(collection(chatRef, "messages"), {
          sessionId: cleanSessionId,
          sender: cleanSender === "council" ? "admin" : "student",
          text: cleanText,
          timestamp: newMsg.timestamp,
          createdAt: serverTimestamp()
        });
        try {
          await updateDoc(chatRef, {
            lastActivity: serverTimestamp()
          });
        } catch {
          // Non-critical if lastActivity update fails
        }
      } catch (err) {
        // Rollback local addition if cloud write failed so "Sent" truthfully means saved (MED-07: filter by id)
        session.messages = session.messages.filter(m => m.id !== newMsg.id);
        localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
        console.error("Firestore chat message write failed:", err);
        throw new Error("Failed to deliver message to cloud server: " + (err.message || "network error"));
      }
    }

    // Relay to backend worker (for Telegram Bot notification relay)
    try {
      apiService.sendChatMessage(cleanSessionId, cleanSender, cleanText);
    } catch (err) {
      console.warn("Backend chat relay error:", err);
    }

    return newMsg;
  },

  /**
   * Real-time listener for incoming chat messages via Firestore onSnapshot
   */
  subscribeToChat(sessionId, callback) {
    if (!isFirebaseConfigured || !db || !sessionId) {
      return () => {};
    }
    try {
      const chatRef = doc(db, "chats", sessionId);
      const q = query(collection(chatRef, "messages"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudMessages = snapshot.docs.map(m => ({ id: m.id, ...m.data() }));
        cloudMessages.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.timestamp || 0).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
        });
        if (cloudMessages.length > 0) {
          callback(cloudMessages);
        }
      }, (err) => {
        console.warn("Real-time chat snapshot listener warning:", err);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Failed to subscribe to chat messages:", err);
      return () => {};
    }
  },

  async endChatSession(sessionId) {
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const session = chats.find(c => c.sessionId === sessionId);
    if (session) {
      session.status = "ended";
      session.lastActivity = new Date().toISOString();
      // Purge conversation message content locally to uphold student privacy promises
      session.messages = [{
        id: `msg-${Date.now()}-end`,
        sender: "council",
        text: "This chat session has been ended. All session contents have been safely purged according to council data retention guidelines.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }];
      localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
    }

    // Update Cloud Firestore status to ended and purge cloud messages to honor privacy
    if (isFirebaseConfigured && db) {
      try {
        const chatRef = doc(db, "chats", sessionId);
        await updateDoc(chatRef, {
          status: "ended",
          endedAt: serverTimestamp()
        });
        const messagesSnap = await getDocs(collection(chatRef, "messages"));
        const deleteOps = messagesSnap.docs.map(m => deleteDoc(m.ref));
        await Promise.all(deleteOps);
      } catch (err) {
        console.error("Firestore endChatSession error:", err);
        throw new Error("Failed to purge session messages from cloud: " + err.message);
      }
    }
    return true;
  },

  async deleteChatSession(sessionId) {
    return this.deleteMultipleChats([sessionId]);
  },

  async deleteMultipleChats(sessionIds) {
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) return true;

    // 1. Remove from LocalStorage
    const list = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const updated = list.filter(c => !sessionIds.includes(c.id) && !sessionIds.includes(c.sessionId));
    localStorage.setItem(KEYS.CHATS, JSON.stringify(updated));

    // 2. Remove from Cloud Firestore in a single atomic batch commit
    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        for (const sessionId of sessionIds) {
          const chatRef = doc(db, "chats", sessionId);
          const messagesSnap = await getDocs(collection(chatRef, "messages"));
          messagesSnap.docs.forEach(m => batch.delete(m.ref));
          batch.delete(chatRef);
        }
        await batch.commit();
      } catch (err) {
        console.warn("Firestore delete multiple chats error:", err);
        throw new Error("Failed to delete chat sessions from cloud: " + err.message);
      }
    }
    return true;
  },

  async getAllChats() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "chats"));
        const chatPromises = snap.docs.map(async (d) => {
          const chatData = d.data();
          const messagesSnap = await getDocs(collection(d.ref, "messages"));
          const messages = messagesSnap.docs.map(m => ({ id: m.id, ...m.data() }));
          messages.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.timestamp || 0).getTime();
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.timestamp || 0).getTime();
            return timeA - timeB;
          });
          return {
            id: d.id,
            sessionId: chatData.sessionId || d.id,
            status: chatData.status || "active",
            createdAt: chatData.createdAt?.toDate ? chatData.createdAt.toDate().toISOString() : new Date().toISOString(),
            lastActivity: chatData.lastActivity?.toDate ? chatData.lastActivity.toDate().toISOString() : new Date().toISOString(),
            ownerUid: chatData.ownerUid || null,
            messages: messages.length > 0 ? messages : (chatData.messages || [])
          };
        });
        const cloudChats = await Promise.all(chatPromises);
        // Exclude chats older than 24h to fulfill 24-hr privacy lifecycle
        const activeOrRecentChats = cloudChats.filter(c => {
          const ageHours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
          return ageHours <= 24;
        });
        if (activeOrRecentChats.length > 0) {
          localStorage.setItem(KEYS.CHATS, JSON.stringify(activeOrRecentChats));
          return activeOrRecentChats;
        }
        return [];
      } catch (err) {
        if (err.code === "permission-denied") {
          console.error("Firestore getAllChats permission-denied: Council clearance required.");
          return [];
        }
        console.warn("Firestore getAllChats error:", err);
        return [];
      }
    }
    const localChats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    return localChats.filter(c => {
      const ageHours = (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      return ageHours <= 24;
    });
  },

  // ==================== COUNCIL ADMINS ====================
  async getAdmins() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "admins"));
        const cloudAdmins = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (cloudAdmins.length > 0) {
          localStorage.setItem(KEYS.ADMINS, JSON.stringify(cloudAdmins));
          return cloudAdmins;
        }
      } catch (err) {
        console.warn("Firestore getAdmins fallback to local:", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.ADMINS) || "[]");
  },

  async addAdmin(adminData) {
    const cleanEmail = (adminData.email || "").trim().toLowerCase();
    const newAdmin = {
      ...adminData,
      email: cleanEmail,
      status: "Active"
    };

    if (isFirebaseConfigured && db && cleanEmail) {
      try {
        await setDoc(doc(db, "admins", cleanEmail), newAdmin);
        return { id: cleanEmail, ...newAdmin };
      } catch (err) {
        console.warn("Firestore addAdmin fallback to local:", err);
      }
    }

    const admins = JSON.parse(localStorage.getItem(KEYS.ADMINS) || "[]");
    const created = {
      id: cleanEmail || `admin-${Date.now()}`,
      ...newAdmin
    };
    admins.push(created);
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
    return created;
  }
};
