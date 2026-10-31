// Cloudflare Worker API Client with graceful mock emulation
import { isFirebaseConfigured } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiService = {
  isConfigured: Boolean(API_BASE && API_BASE.startsWith("http")),
  apiBase: API_BASE,

  async getAppStatus() {
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
    } else {
      // Check direct client-side environment keys if configured
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        statusReport.aiApi.status = "connected";
        statusReport.aiApi.label = "Connected (Direct Client Gemini Key)";
      }
      if (import.meta.env.VITE_TELEGRAM_BOT_TOKEN) {
        statusReport.telegram.status = "connected";
        statusReport.telegram.label = "Configured (Direct Client Token)";
      }
    }

    return statusReport;
  },

  async generateAiReport(feedbacks, token = null) {
    let activeToken = token;
    if (!activeToken && typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("gmc_admin_session");
        activeToken = saved ? JSON.parse(saved)?.token : null;
      } catch {
        // Ignore session read error
      }
    }

    if (this.isConfigured && activeToken) {
      try {
        const res = await fetch(`${API_BASE}/api/ai/analyze`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Council-Token": activeToken.trim()
          },
          body: JSON.stringify({ feedbacks })
        });
        if (res.ok) {
          const aiData = await res.json();
          return { ...aiData, isAiGenerated: true };
        }
      } catch (err) {
        console.warn("Cloudflare Worker AI API call failed, falling back to local statistics:", err);
      }
    }

    // Client-side statistical calculation (honest metrics without fabricated AI text)
    const validFeedbacks = (feedbacks || []).filter(f => !f.containsPII);
    const categoryCount = {};
    const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
    const urgencyCount = { High: 0, Medium: 0, Low: 0 };

    validFeedbacks.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      const sent = f.aiAnalysis?.sentiment || "Neutral";
      const urg = f.aiAnalysis?.urgency || "Medium";
      sentimentCount[sent] = (sentimentCount[sent] || 0) + 1;
      urgencyCount[urg] = (urgencyCount[urg] || 0) + 1;
    });

    return {
      generatedAt: new Date().toISOString(),
      totalAnalyzed: validFeedbacks.length,
      excludedPIICount: (feedbacks || []).length - validFeedbacks.length,
      categoryDistribution: categoryCount,
      sentimentDistribution: sentimentCount,
      urgencyDistribution: urgencyCount,
      isAiGenerated: false,
      executiveSummary: validFeedbacks.length > 0
        ? `Statistical aggregation of ${validFeedbacks.length} student submissions across ${Object.keys(categoryCount).length} categories. Note: Automated AI narrative synthesis requires Cloudflare Worker with GROQ_API_KEY or GEMINI_API_KEY configured.`
        : "No non-PII feedback submissions available to analyze.",
      recurringThemes: Object.keys(categoryCount).map(c => `${c} (${categoryCount[c]} submissions)`),
      recommendations: [
        "Review open grievances in the Feedback Review section",
        "Monitor student polls for ongoing campus sentiment",
        "Issue circulars via Announcements for resolved student matters"
      ]
    };
  },

  async submitFeedback({ category, content, containsPII }) {
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
    } catch (err) {
      console.warn("Worker /api/feedback call failed, falling back to local storage:", err);
    }
    return null;
  },

  async sendChatMessage(sessionId, sender, text) {
    const targetUrl = `${API_BASE}/api/chat/message`;
    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        return {
          valid: true,
          sessionToken: data.sessionToken || cleanToken,
          expiresAt: data.expiresAt,
          role: data.role || "Council Executive",
          user: {
            email: "executive.council@gmcthiruvallur.ac.in",
            name: data.role || "Council Executive",
            role: data.role || "Council Executive",
            sessionToken: data.sessionToken || cleanToken,
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


