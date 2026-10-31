// Unified Storage Service: Seamlessly switches between Firebase Firestore and LocalStorage
import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from "firebase/firestore";
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

  // ==================== ANNOUNCEMENTS ====================
  async getAnnouncements() {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "announcements"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore error, falling back to local:", err);
      }
    }
    const data = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    return data;
  },

  async addAnnouncement(announcement) {
    const newItem = {
      ...announcement,
      date: new Date().toISOString().split("T")[0],
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
    const created = { id: `ann-${Date.now()}`, ...newItem };
    localList.unshift(created);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(localList));
    return created;
  },

  async updateAnnouncement(id, updates) {
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
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "announcements", id));
      } catch (err) {
        console.warn("Firestore delete error:", err);
      }
    }
    const localList = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || "[]");
    const filtered = localList.filter(a => a.id !== id);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
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
    const created = { id: `evt-${Date.now()}`, ...newEvent };
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
  async getPolls() {
    const userVotes = JSON.parse(localStorage.getItem(KEYS.USER_VOTES) || "{}");
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "polls"));
        const polls = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return polls.map(p => ({
          ...p,
          userVoted: userVotes[p.id] !== undefined ? userVotes[p.id] : null
        }));
      } catch (err) {
        console.warn("Firestore error, falling back to local polls:", err);
      }
    }
    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
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

    userVotes[pollId] = optionIndex;
    localStorage.setItem(KEYS.USER_VOTES, JSON.stringify(userVotes));

    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const targetPoll = polls.find(p => p.id === pollId);
    if (targetPoll && targetPoll.options[optionIndex]) {
      targetPoll.options[optionIndex].votes += 1;
      targetPoll.totalVotes = (targetPoll.totalVotes || 0) + 1;
      localStorage.setItem(KEYS.POLLS, JSON.stringify(polls));
    }

    if (isFirebaseConfigured && db) {
      try {
        const pollRef = doc(db, "polls", pollId);
        // Record vote subcollection
        await addDoc(collection(pollRef, "votes"), {
          selectedOption: optionIndex,
          timestamp: serverTimestamp()
        });
        if (targetPoll) {
          await updateDoc(pollRef, {
            options: targetPoll.options,
            totalVotes: targetPoll.totalVotes
          });
        }
      } catch (err) {
        console.warn("Firestore vote recording warning:", err);
      }
    }

    return true;
  },

  async addPoll(pollData) {
    const newPoll = {
      ...pollData,
      totalVotes: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "polls"), newPoll);
        return { id: docRef.id, ...newPoll };
      } catch (err) {
        console.warn("Firestore error adding poll:", err);
      }
    }

    const polls = JSON.parse(localStorage.getItem(KEYS.POLLS) || "[]");
    const created = { id: `poll-${Date.now()}`, ...newPoll };
    polls.unshift(created);
    localStorage.setItem(KEYS.POLLS, JSON.stringify(polls));
    return created;
  },

  async togglePollStatus(pollId, status) {
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

  // ==================== ANONYMOUS FEEDBACK ====================
  async submitFeedback({ category, content, containsPII }) {
    const trackingId = "GMC-FB-" + Math.floor(1000 + Math.random() * 9000);
    
    // Automatic PII Detection heuristics as additional privacy safety (doctor/student titles, roll nos, rooms, phone, email)
    const piiPattern = /\b((dr\.|dr\s|prof\.|mr\.|ms\.|mrs\.)\s+[a-z]+|[0-9]{10}|(roll|reg|id)\s*(no|number|#)?\s*[:.-]?\s*[0-9]+|room\s*[0-9]+|my name is\s+[a-z]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i;
    const autoDetectedPII = piiPattern.test(content);
    const finalContainsPII = Boolean(containsPII || autoDetectedPII);

    // AI Analysis (Simulated / Prepared) - Bypassed strictly if contains PII
    let aiAnalysis = null;
    if (!finalContainsPII) {
      const lower = content.toLowerCase();
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
        category,
        sentiment,
        urgency,
        summary: content.length > 90 ? content.slice(0, 87) + "..." : content
      };
    }

    const feedbackDoc = {
      trackingId,
      category,
      content,
      containsPII: finalContainsPII,
      status: "Received",
      createdAt: new Date().toISOString(),
      aiAnalysis
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "feedback"), {
          ...feedbackDoc,
          serverTimestamp: serverTimestamp()
        });
        feedbackDoc.id = docRef.id;
      } catch (err) {
        console.warn("Firestore feedback submission fallback:", err);
      }
    }

    const feedbacks = JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
    if (!feedbackDoc.id) {
      feedbackDoc.id = `fb-${Date.now()}`;
    }
    feedbacks.unshift(feedbackDoc);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedbacks));

    return {
      success: true,
      trackingId,
      containsPII: finalContainsPII
    };
  },

  async getFeedbacks() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "feedback"));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore getFeedbacks fallback:", err);
      }
    }
    return JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || "[]");
  },

  async updateFeedbackStatus(id, newStatus, councilNotes) {
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

  // ==================== TEMPORARY LIVE CHAT ====================
  generateSessionId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "GMC-";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  async getOrCreateChatSession(requestedSessionId = null) {
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    
    // Check if session exists
    if (requestedSessionId) {
      const existing = chats.find(c => c.sessionId === requestedSessionId);
      if (existing) {
        // Check 24-hr expiry
        const hoursAgo = (Date.now() - new Date(existing.lastActivity || existing.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursAgo > 24) {
          existing.status = "expired";
          localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
        }
        return existing;
      }
    }

    // Create new session
    const sessionId = requestedSessionId || this.generateSessionId();
    const newSession = {
      id: `chat-${Date.now()}`,
      sessionId,
      status: "active",
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
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

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "chats", newSession.id), {
          sessionId,
          status: "active",
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore create chat session fallback:", err);
      }
    }

    return newSession;
  },

  async sendChatMessage(sessionId, sender, text) {
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const session = chats.find(c => c.sessionId === sessionId);
    if (!session) throw new Error("Chat session not found");
    if (session.status !== "active") throw new Error("This chat session has ended or expired");

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    session.messages.push(newMsg);
    session.lastActivity = new Date().toISOString();
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));

    // If student sent message and in demo mode, schedule a council simulation reply after 3 seconds
    if (sender === "student" && !isFirebaseConfigured) {
      setTimeout(() => {
        const liveChats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
        const s = liveChats.find(c => c.sessionId === sessionId);
        if (s && s.status === "active") {
          s.messages.push({
            id: `msg-${Date.now()}-reply`,
            sender: "council",
            text: "Thank you for sharing this with us. The council has noted this and will review it in our upcoming committee meeting.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          s.lastActivity = new Date().toISOString();
          localStorage.setItem(KEYS.CHATS, JSON.stringify(liveChats));
          window.dispatchEvent(new CustomEvent("gmc-chat-updated", { detail: { sessionId } }));
        }
      }, 2500);
    }

    return newMsg;
  },

  async endChatSession(sessionId) {
    const chats = JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
    const session = chats.find(c => c.sessionId === sessionId);
    if (session) {
      session.status = "ended";
      session.lastActivity = new Date().toISOString();
      session.messages.push({
        id: `msg-${Date.now()}-end`,
        sender: "council",
        text: "This chat session has been ended. All session contents will be safely purged according to council data retention guidelines.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
    }
    return true;
  },

  async getAllChats() {
    return JSON.parse(localStorage.getItem(KEYS.CHATS) || "[]");
  },

  // ==================== COUNCIL ADMINS ====================
  async getAdmins() {
    return JSON.parse(localStorage.getItem(KEYS.ADMINS) || "[]");
  },

  async addAdmin(adminData) {
    const admins = JSON.parse(localStorage.getItem(KEYS.ADMINS) || "[]");
    const newAdmin = {
      id: `admin-${Date.now()}`,
      ...adminData,
      status: "Active"
    };
    admins.push(newAdmin);
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(admins));
    return newAdmin;
  }
};
