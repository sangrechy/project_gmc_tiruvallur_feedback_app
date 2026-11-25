import { auth, isFirebaseConfigured } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiService = {
  isConfigured: Boolean(API_BASE && API_BASE.startsWith("http")),
  apiBase: API_BASE,
  _statusCache: null,
  _statusCacheTime: 0,

  async getAppStatus(forceRefresh = false) {
    if (!forceRefresh && this._statusCache && (Date.now() - this._statusCacheTime < 60000)) {
      return this._statusCache;
    }

    const timestamp = new Date().toISOString();
    const snapshotId = "GMC-DIAG-" + Math.floor(1000 + Math.random() * 9000);

    const clientEnv = {
      resolution: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight} (DPR ${window.devicePixelRatio || 1})` : "N/A",
      platform: typeof navigator !== "undefined" ? (navigator.userAgentData?.platform || navigator.platform || "Unknown") : "N/A",
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      timestamp,
      snapshotId
    };

    const statusReport = {
      snapshotId,
      checkedAt: timestamp,
      client: clientEnv,
      backend: {
        id: "backend",
        name: "Cloudflare Worker Backend",
        status: this.isConfigured ? "pending" : "demo",
        label: this.isConfigured ? "Checking..." : "Local Emulation Mode",
        details: this.isConfigured ? `Endpoint: ${API_BASE}` : "Running offline-ready local emulation with mock serverless relay",
        latencyMs: null,
        url: API_BASE || "Mock Client Transport"
      },
      aiApi: {
        id: "ai",
        name: "AI Intelligence API",
        status: "fallback",
        label: "Client Synthesis Fallback",
        provider: "Gemini / Groq Decoupled",
        details: "Automatic PII filter & executive sentiment classification active (local fallback)"
      },
      telegram: {
        id: "telegram",
        name: "Telegram Council Bot",
        status: "standby",
        label: "Standby (Token Unset)",
        details: "2-way live chat relay & notification webhook awaiting bot token"
      },
      gmail: {
        id: "gmail",
        name: "Gmail Alert Dispatcher",
        status: "standby",
        label: "Standby (OAuth Unset)",
        details: "High-urgency grievance email notifications awaiting OAuth credentials"
      },
      database: {
        id: "database",
        name: "Database Persistence",
        status: isFirebaseConfigured ? "connected" : "demo",
        label: isFirebaseConfigured ? "Cloud Firestore (Connected)" : "Local Demo Storage (Interactive)",
        details: isFirebaseConfigured 
          ? `Connected to Firebase project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}`
          : "Persisting across sessions in browser LocalStorage with full CRUD"
      },
      auth: {
        id: "auth",
        name: "Council Auth Shield",
        status: isFirebaseConfigured ? "connected" : "standby",
        label: isFirebaseConfigured 
          ? "Firebase Auth (Active)" 
          : "Server-Verified Master Token",
        details: isFirebaseConfigured
          ? "Protected by Firebase Authentication"
          : "Serverless timing-safe verification via Cloudflare Worker"
      }
    };

    // If backend URL is configured, ping /health
    if (this.isConfigured) {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${API_BASE}/health`, {
          signal: controller.signal,
          headers: { "Accept": "application/json" }
        });
        clearTimeout(timeoutId);

        const latency = Math.round(performance.now() - startTime);
        statusReport.backend.latencyMs = latency;

        if (res.ok) {
          const data = await res.json();
          statusReport.backend.status = "connected";
          statusReport.backend.label = `Connected (${latency}ms)`;
          statusReport.backend.details = `Live Cloudflare Worker (${data.environment || "production"}) healthy`;

          // Parse services status from backend response
          if (data.services) {
            if (data.services.geminiAI || data.services.groqAI) {
              statusReport.aiApi.status = "connected";
              statusReport.aiApi.label = data.services.geminiAI ? "Connected (Gemini API Active)" : "Connected (Groq API Active)";
              statusReport.aiApi.details = "Remote serverless AI pipeline active for sentiment & executive analytics";
            }
            if (data.services.telegramBot) {
              statusReport.telegram.status = "connected";
              statusReport.telegram.label = "Connected (Webhook Active)";
              statusReport.telegram.details = "Real-time council relay bot active on Telegram network";
            }
            if (data.services.councilAuth) {
              statusReport.auth.status = "connected";
              statusReport.auth.label = "Server-Verified Council Auth (Active)";
              statusReport.auth.details = "Protected by serverless timing-safe token verification";
            }
            if (data.services.gmail) {
              statusReport.gmail.status = "connected";
              statusReport.gmail.label = "Connected (OAuth Ready)";
              statusReport.gmail.details = "High-urgency email dispatch operational";
            }
          }
        } else {
          statusReport.backend.status = "error";
          statusReport.backend.label = `HTTP ${res.status} Error`;
        }
      } catch (err) {
        statusReport.backend.status = "offline";
        statusReport.backend.label = "Worker Unreachable (Network/CORS)";
        statusReport.backend.details = err.name === "AbortError" ? "Ping timed out after 3.5s" : err.message;
      }
    }

    this._statusCache = statusReport;
    this._statusCacheTime = Date.now();
    return statusReport;
  },

  async generateAiReport(feedbacks, token = null) {
    let activeToken = token;
    let workerError = null;

    // 1. Wait for Firebase Auth hydration and try Firebase Auth ID token (Google Sign-In / Email Auth)
    if (!activeToken && auth) {
      try {
        if (typeof auth.authStateReady === "function") {
          await auth.authStateReady();
        }
        if (auth.currentUser) {
          activeToken = await auth.currentUser.getIdToken();
        }
      } catch (err) {
        console.warn("Could not retrieve Firebase ID token for AI report:", err);
      }
    }

    // 2. Try localStorage admin session token
    if (!activeToken && typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("gmc_admin_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          activeToken = parsed?.sessionToken || parsed?.token || null;
        }
      } catch {
        // Ignore session read error
      }
    }

    if (this.isConfigured && (activeToken || (typeof localStorage !== "undefined" && localStorage.getItem("gmc_admin_session")))) {
      try {
        const cleanToken = activeToken ? activeToken.trim() : "";
        const headers = { "Content-Type": "application/json" };
        if (cleanToken) {
          headers["Authorization"] = `Bearer ${cleanToken}`;
          headers["X-Council-Token"] = cleanToken;
        }
        const res = await fetch(`${API_BASE}/api/ai/analyze`, {
          method: "POST",
          headers,
          body: JSON.stringify({ feedbacks })
        });
        if (res.ok) {
          const aiData = await res.json();
          return {
            ...aiData,
            isAiGenerated: aiData.isAiGenerated ?? true
          };
        }
        const errData = await res.json().catch(() => ({}));
        workerError = errData?.error ? `HTTP ${res.status}: ${errData.error}` : `Worker returned HTTP ${res.status}`;
        console.warn("Cloudflare Worker AI API rejected request:", workerError);
      } catch (err) {
        workerError = err?.message || "Network/CORS error";
        console.warn("Cloudflare Worker AI API call failed, falling back to local statistics:", err);
      }
    } else if (this.isConfigured) {
      workerError = "Admin auth token missing (re-login to Council Console)";
    }

    // Client-side statistical calculation (honest metrics without fabricated AI text)
    const validFeedbacks = (feedbacks || []).filter(f => !f.containsPII);
    const categoryCount = {};
    const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
    const urgencyCount = { High: 0, Medium: 0, Low: 0 };

    validFeedbacks.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      let sent = f.aiAnalysis?.sentiment;
      let urg = f.aiAnalysis?.urgency;
      if (!sent) {
        const text = (f.content || "").toLowerCase();
        const neg = ["broken", "leak", "dirty", "stink", "smell", "cold", "poor", "bad", "issue", "problem", "fail", "not working", "damage", "delay", "shortage", "pain"];
        const pos = ["good", "thank", "great", "excellent", "improved", "resolved", "helpful", "appreciate", "nice", "clean", "kudos", "satisfied", "better"];
        const hasNeg = neg.some(w => text.includes(w));
        const hasPos = pos.some(w => text.includes(w));
        sent = (hasNeg && !hasPos) ? "Negative" : (hasPos && !hasNeg) ? "Positive" : "Neutral";
        urg = (hasNeg && !hasPos) ? "High" : (hasPos && !hasNeg) ? "Low" : "Medium";
      }
      sentimentCount[sent] = (sentimentCount[sent] || 0) + 1;
      urgencyCount[urg || "Medium"] = (urgencyCount[urg || "Medium"] || 0) + 1;
    });

    const reasonText = workerError
      ? ` (${workerError})`
      : " (Cloudflare Worker URL not configured)";

    return {
      generatedAt: new Date().toISOString(),
      totalAnalyzed: validFeedbacks.length,
      excludedPIICount: (feedbacks || []).length - validFeedbacks.length,
      categoryDistribution: categoryCount,
      sentimentDistribution: sentimentCount,
      isAiGenerated: false,
      aiErrorReason: workerError,
      executiveSummary: validFeedbacks.length > 0
        ? `Statistical aggregation of ${validFeedbacks.length} student submissions across ${Object.keys(categoryCount).length} categories. Note: Automated AI narrative synthesis fallback triggered${reasonText}.`
        : "No non-PII feedback submissions available to analyze."
    };
  },

  async submitFeedback({ category, content, containsPII }) {
    if (!this.isConfigured) return null;
    const targetUrl = `${API_BASE}/api/feedback`;
    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, content, containsPII })
      });
      if (res.ok) {
        return await res.json();
      }
      // Explicit server-side rejections must not be bypassed
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error || `Server rejected feedback submission (${res.status})`;
      throw new Error(errMsg);
    } catch (err) {
      if (err.message && (err.message.includes("rate limit") || err.message.includes("exceeds") || err.message.includes("empty") || err.message.includes("too short"))) {
        throw err;
      }
      console.warn("Worker /api/feedback network error, falling back to local storage:", err);
      return null;
    }
  },

  async sendChatMessage(sessionId, sender, text) {
    const targetUrl = `${API_BASE}/api/chat/message`;
    let sessionToken = null;
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("gmc_admin_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          sessionToken = parsed?.sessionToken || parsed?.token || null;
        }
      } catch {
        // Ignore session read error
      }
    }

    const headers = { "Content-Type": "application/json" };
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId, sender, text })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Worker /api/chat/message call failed, falling back to local relay:", err);
    }
    return null;
  },

  async verifyCouncilToken(token) {
    if (!token || typeof token !== "string" || !token.trim()) {
      return { valid: false, error: "Council Master Token is required" };
    }
    const cleanToken = token.trim();

    if (!this.isConfigured) {
      return {
        valid: false,
        error: "Backend authentication server is not reachable. Please ensure VITE_API_BASE_URL points to your active Cloudflare Worker."
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Council-Token": cleanToken
        },
        body: JSON.stringify({ token: cleanToken })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        if (!data.sessionToken || typeof data.sessionToken !== "string" || !data.sessionToken.startsWith("gmc_sess.")) {
          return {
            valid: false,
            error: "Authentication service failed to issue a secure cryptographic session token."
          };
        }
        return {
          valid: true,
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt,
          role: data.role || "Council Executive",
          user: {
            email: "executive.council@gmcthiruvallur.ac.in",
            name: data.role || "Council Executive",
            role: data.role || "Council Executive",
            sessionToken: data.sessionToken,
            expiresAt: data.expiresAt
          }
        };
      } else {
        return {
          valid: false,
          error: data.error || "Invalid Council Master Passcode or Session Token"
        };
      }
    } catch (err) {
      return {
        valid: false,
        error: "Authentication service connection error: " + err.message
      };
    }
  }
};


