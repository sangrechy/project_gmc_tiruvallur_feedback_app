/**
 * GMC Thiruvallur Student Council Portal - Cloudflare Worker Backend
 * Serverless API Handling with Enterprise Security Hardening & Performance Optimizations:
 * - Constant-Time Timing-Safe Token Verification
 * - In-Memory Sliding-Window IP Rate Limiting & Anti-Abuse
 * - Request Payload Size Validation & DoS Protection
 * - Input Sanitization & Anti-XSS Neutralization
 * - Security Response Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
 * - Anonymous Feedback & PII Privacy Filtering
 * - Ephemeral Live Chat & Telegram Bot 2-Way Relay
 * - AI Intelligence Analysis (Groq & Gemini APIs)
 */

// Standard Security Response Headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), camera=(), microphone=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

// Rate Limiting In-Memory Store
const rateLimitMap = new Map();

/**
 * Sliding window rate limiter per IP & endpoint
 */
function checkRateLimit(ip, endpoint, maxRequests, windowMs) {
  const now = Date.now();
  const key = `${ip}:${endpoint}`;
  let bucket = rateLimitMap.get(key);

  if (!bucket || now - bucket.startTime > windowMs) {
    bucket = { startTime: now, count: 1 };
    rateLimitMap.set(key, bucket);
    // Auto-prune stale entries if map grows large
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now - v.startTime > windowMs) rateLimitMap.delete(k);
      }
    }
    return { allowed: true, remaining: maxRequests - 1 };
  }

  bucket.count++;
  if (bucket.count > maxRequests) {
    const retryAfter = Math.ceil((bucket.startTime + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, remaining: maxRequests - bucket.count };
}

/**
 * Extract caller IP from standard Cloudflare headers (prevent X-Forwarded-For spoofing)
 */
function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Safely parse JSON body with streaming byte counter to prevent chunked payload bombs (CRIT-04)
 */
async function readJsonBodySafe(request, maxBytes = 262144) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    const err = new Error("Payload exceeds allowed limit");
    err.code = "PAYLOAD_TOO_LARGE";
    throw err;
  }

  if (!request.body) return {};

  const reader = request.body.getReader();
  let totalBytes = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.length;
    if (totalBytes > maxBytes) {
      try { await reader.cancel(); } catch {}
      const err = new Error("Payload exceeds allowed limit");
      err.code = "PAYLOAD_TOO_LARGE";
      throw err;
    }
    chunks.push(value);
  }

  if (totalBytes === 0) return {};

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  const text = new TextDecoder().decode(combined);
  return JSON.parse(text);
}

/**
 * Legacy payload length check (compatibility)
 */
function checkPayloadSize(request, maxBytes) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return false;
  }
  return true;
}

/**
 * Sanitize text input: strip null bytes, script tags, javascript: URIs, escape HTML entities
 */
function sanitizeInput(str, maxLength = 5000) {
  if (typeof str !== "string") return "";
  return str
    .slice(0, maxLength)
    .replace(/\0/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Constant-time string equality using SHA-256 digest comparison
 * Completely eliminates timing side-channel attacks on authorization tokens
 */
async function timingSafeEqualStrings(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const enc = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const u8A = new Uint8Array(hashA);
  const u8B = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < u8A.length; i++) {
    diff |= u8A[i] ^ u8B[i];
  }
  return diff === 0;
}

/**
 * Base64URL string/buffer encoder
 */
function base64UrlEncode(bufferOrString) {
  let base64;
  if (typeof bufferOrString === "string") {
    base64 = btoa(bufferOrString);
  } else {
    const bytes = new Uint8Array(bufferOrString);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Base64URL string decoder to byte array
 */
function base64UrlDecodeToBytes(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive a dedicated 256-bit HMAC signing key from master passcode (HIGH-06)
 * Eliminates offline dictionary/brute-force attacks against the raw master passcode
 */
async function deriveSigningKey(secretKey) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`GMC_PORTAL_SESSION_KEY_DERIVATION_V1:${secretKey}`)
  );
  return new Uint8Array(hash);
}

/**
 * Generate a cryptographically signed, short-lived session token (HMAC-SHA256)
 * Prevents raw master passcodes from ever being stored in browser localStorage
 */
async function createSessionToken(payload, secretKey) {
  const enc = new TextEncoder();
  const derivedKeyBytes = await deriveSigningKey(secretKey);
  const key = await crypto.subtle.importKey(
    "raw",
    derivedKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const payloadJson = JSON.stringify(payload);
  const b64Payload = base64UrlEncode(payloadJson);
  const dataToSign = enc.encode(`gmc_sess.${b64Payload}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const b64Sig = base64UrlEncode(signatureBuffer);
  return `gmc_sess.${b64Payload}.${b64Sig}`;
}

/**
 * Verify a short-lived session token (HMAC-SHA256 signature + expiration)
 */
async function verifySessionToken(token, secretKey) {
  if (typeof token !== "string" || !token.startsWith("gmc_sess.")) {
    return { valid: false, error: "Malformed session token format" };
  }
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "gmc_sess") {
    return { valid: false, error: "Malformed session token format" };
  }
  const b64Payload = parts[1];
  const b64Sig = parts[2];

  try {
    const enc = new TextEncoder();
    const derivedKeyBytes = await deriveSigningKey(secretKey);
    const key = await crypto.subtle.importKey(
      "raw",
      derivedKeyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const dataToVerify = enc.encode(`gmc_sess.${b64Payload}`);
    const sigBytes = base64UrlDecodeToBytes(b64Sig);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, dataToVerify);
    if (!isValid) {
      return { valid: false, error: "Invalid session signature" };
    }

    const payloadJson = atob(b64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, error: "Session token has expired", expired: true };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: "Session token verification failed" };
  }
}

/**
 * Universal admin authorization check for operational endpoints.
 * Strictly requires a signed, unexpired session token (HMAC-SHA256).
 * Raw master passcodes are rejected on operational endpoints to prevent
 * session expiry bypass and enforce the 8-hour token lifetime.
 */
async function authenticateAdminRequest(request, configuredToken) {
  if (!configuredToken) return false;
  const authHdr = request.headers.get("Authorization") || "";
  let token = authHdr.startsWith("Bearer ")
    ? authHdr.slice(7).trim()
    : (request.headers.get("X-Council-Token") || "").trim();
  if (!token) return false;

  // Operational endpoints strictly require signed session tokens
  if (token.startsWith("gmc_sess.")) {
    const sessionRes = await verifySessionToken(token, configuredToken);
    return sessionRes.valid;
  }

  // Raw master passcodes cannot directly access operational endpoints;
  // they must first be exchanged at /api/auth/verify for a session token.
  return false;
}

/**
 * Escape Markdown special characters for Telegram Bot API
 */
function escapeTelegramMarkdown(str) {
  if (typeof str !== "string") return "";
  return str.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

/**
 * Compute CORS headers dynamically based on ALLOWED_ORIGINS
 */
function getCorsHeaders(env = {}, request = null) {
  const origin = request?.headers?.get("Origin") || "";
  const isProd = env?.ENVIRONMENT === "production";
  let allowed;

  if (env?.ALLOWED_ORIGINS) {
    allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  } else if (env?.ENVIRONMENT === "test") {
    allowed = ["*"];
  } else if (isProd) {
    // Strictly trusted production origins (HIGH-05: no localhost in production)
    allowed = [
      env?.PORTAL_URL || "https://gmc-thiruvallur-portal.pages.dev",
      "https://project-gmc-tiruvallur-feedback-app.pages.dev"
    ];
  } else {
    // Development local origins
    allowed = [
      env?.PORTAL_URL || "https://gmc-thiruvallur-portal.pages.dev",
      "https://project-gmc-tiruvallur-feedback-app.pages.dev",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173"
    ];
  }
  const isAllowed = allowed.includes("*") || (origin && allowed.includes(origin));

  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Council-Token",
    "Access-Control-Max-Age": "86400",
  };

  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = allowed.includes("*") ? (origin || "*") : origin;
    if (origin) {
      headers["Vary"] = "Origin";
    }
  }

  return headers;
}

/**
 * Create JSON response with comprehensive security & CORS headers
 */
function jsonResponse(data, status = 200, env = {}, request = null, extraHeaders = {}) {
  const cors = getCorsHeaders(env, request);
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      ...securityHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const isTestEnv = env.ENVIRONMENT === "test";
    const clientIp = getClientIp(request);

    // 1. Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(env, request) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 2. Health check & configuration status (with cache-control)
      if (path === "/" || path === "/health" || path === "/api/health") {
        return jsonResponse(
          {
            status: "healthy",
            college: env.COLLEGE_NAME || "GMC Thiruvallur",
            environment: env.ENVIRONMENT || "production",
            security: {
              rateLimiter: true,
              timingSafeAuth: true,
              inputSanitization: true,
              piiProtection: true,
            },
            services: {
              councilAuth: Boolean(env.COUNCIL_AUTH_TOKEN),
              telegramBot: Boolean(env.TELEGRAM_BOT_TOKEN),
              groqAI: Boolean(env.GROQ_API_KEY),
              geminiAI: Boolean(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.GOOGLE_API_KEY),
              gmail: Boolean(env.GMAIL_CLIENT_ID && env.GMAIL_REFRESH_TOKEN),
              firebase: Boolean(env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID),
            },
            timestamp: new Date().toISOString(),
          },
          200,
          env,
          request,
          { "Cache-Control": "no-cache" }
        );
      }

      // 3. Council Token Authentication & Verification Endpoint
      if (path === "/api/auth/verify" && request.method === "POST") {
        // Enforce rate limiting against brute force attempts (15 attempts / 5 mins)
        if (!isTestEnv) {
          const limit = checkRateLimit(clientIp, "auth_verify", 15, 5 * 60 * 1000);
          if (!limit.allowed) {
            return jsonResponse(
              {
                valid: false,
                authenticated: false,
                error: `Too many authorization attempts. Please retry in ${limit.retryAfter}s.`,
              },
              429,
              env,
              request,
              { "Retry-After": String(limit.retryAfter) }
            );
          }
        }

        let providedToken = "";
        try {
          const body = await readJsonBodySafe(request, 16384);
          providedToken = typeof body?.token === "string" ? body.token : "";
        } catch (err) {
          if (err?.code === "PAYLOAD_TOO_LARGE") {
            return jsonResponse({ error: "Payload too large" }, 413, env, request);
          }
          // If body is empty or invalid JSON, fallback to header inspection
        }

        if (!providedToken) {
          const authHeader = request.headers.get("Authorization") || "";
          if (authHeader.startsWith("Bearer ")) {
            providedToken = authHeader.slice(7).trim();
          } else {
            providedToken = request.headers.get("X-Council-Token") || "";
          }
        }

        const cleanProvided = typeof providedToken === "string" ? providedToken.trim() : "";
        const configuredToken = env.COUNCIL_AUTH_TOKEN ? env.COUNCIL_AUTH_TOKEN.trim() : "";

        if (!configuredToken) {
          return jsonResponse(
            {
              valid: false,
              authenticated: false,
              error: "Council authentication is not configured on the server. Please set COUNCIL_AUTH_TOKEN in Worker secrets.",
            },
            503,
            env,
            request,
            { "Cache-Control": "no-store, max-age=0" }
          );
        }

        if (cleanProvided.startsWith("gmc_sess.")) {
          const sessionResult = await verifySessionToken(cleanProvided, configuredToken);
          if (sessionResult.valid) {
            return jsonResponse(
              {
                valid: true,
                authenticated: true,
                role: sessionResult.payload?.role || "Council Executive",
                sessionToken: cleanProvided,
                expiresAt: sessionResult.payload?.exp,
                college: env.COLLEGE_NAME || "GMC Thiruvallur",
                message: "Session token validated",
              },
              200,
              env,
              request,
              { "Cache-Control": "no-store, max-age=0" }
            );
          } else {
            return jsonResponse(
              {
                valid: false,
                authenticated: false,
                error: sessionResult.error || "Session token expired or invalid",
              },
              401,
              env,
              request,
              { "Cache-Control": "no-store, max-age=0" }
            );
          }
        }

        // Constant-time comparison eliminates timing side-channel attacks
        const isMatch = cleanProvided ? await timingSafeEqualStrings(cleanProvided, configuredToken) : false;

        if (isMatch) {
          const expiresAt = Date.now() + 8 * 3600 * 1000; // 8-hour session token
          const sessionToken = await createSessionToken(
            {
              sub: "council_admin",
              role: "Council Executive",
              college: env.COLLEGE_NAME || "GMC Thiruvallur",
              iat: Date.now(),
              exp: expiresAt,
              jti: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Math.random())
            },
            configuredToken
          );

          return jsonResponse(
            {
              valid: true,
              authenticated: true,
              role: "Council Executive",
              sessionToken,
              expiresAt,
              college: env.COLLEGE_NAME || "GMC Thiruvallur",
              message: "Council authentication successful",
            },
            200,
            env,
            request,
            { "Cache-Control": "no-store, max-age=0" }
          );
        } else {
          return jsonResponse(
            {
              valid: false,
              authenticated: false,
              error: "Invalid Council Master Passcode or Session Token",
            },
            401,
            env,
            request,
            { "Cache-Control": "no-store, max-age=0" }
          );
        }
      }

      // 4. Feedback Submission Endpoint
      if (path === "/api/feedback" && request.method === "POST") {
        // Enforce rate limiting against spam (20 submissions / 10 mins)
        if (!isTestEnv) {
          const limit = checkRateLimit(clientIp, "feedback_submit", 20, 10 * 60 * 1000);
          if (!limit.allowed) {
            return jsonResponse(
              { error: `Rate limit reached. Please wait ${limit.retryAfter}s before submitting again.` },
              429,
              env,
              request,
              { "Retry-After": String(limit.retryAfter) }
            );
          }
        }

        let body;
        try {
          body = await readJsonBodySafe(request, 65536);
        } catch (err) {
          if (err?.code === "PAYLOAD_TOO_LARGE") {
            return jsonResponse({ error: "Payload exceeds 64KB maximum size" }, 413, env, request);
          }
          return jsonResponse({ error: "Invalid JSON payload" }, 400, env, request);
        }

        const rawCategory = body?.category || "General Council Inquiry";
        const rawContent = body?.content || "";
        const declaredPII = Boolean(body?.containsPII);

        // Sanitize input text, redact category PII, and enforce bounds
        const category = redactPiiText(sanitizeInput(rawCategory, 100));
        const content = sanitizeInput(rawContent, 4000);

        if (!content || content.length < 5) {
          return jsonResponse({ error: "Content is too short or empty" }, 400, env, request);
        }

        const trackingId = "GMC-FB-" + Math.floor(1000 + Math.random() * 9000);

        // Server-side PII check (doctor/student titles, phone numbers, roll nos, rooms, emails)
        const piiRegex = /\b((dr\.|dr\s|prof\.|mr\.|ms\.|mrs\.)\s+[a-z]+|(?:\+91[\-\s]?)?[6-9]\d{9}|[0-9]{10,12}|(?:roll|reg(?:istration)?|student\s*id)\s*(?:(?:no|number|#)?\s*(?:is|[:.-])?)\s*\d+|(?:hostel\s+)?room\s*(?:no\.?)?\s*\d+|my name is\s+[a-z]+|i am\s+[a-z]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i;
        const autoDetectedPII = piiRegex.test(content);
        const finalContainsPII = Boolean(declaredPII || autoDetectedPII);

        // Telegram Council Alert (Generic alert without PII contents)
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID) {
          const safeCategory = escapeTelegramMarkdown(category);
          const safeTrackingId = escapeTelegramMarkdown(trackingId);
          const alertMsg =
            `📢 *New Anonymous Feedback Submitted*\n\n` +
            `📂 *Category:* ${safeCategory}\n` +
            `🏷 *Tracking ID:* \`${safeTrackingId}\`\n` +
            `🔒 *Contains PII Flag:* ${finalContainsPII ? "⚠️ YES (AI Excluded)" : "NO"}\n` +
            `⏱ *Received At:* ${new Date().toLocaleTimeString()}\n\n` +
            `_Review in Council Admin Dashboard or reply with /feedback for statistics._`;

          ctx.waitUntil(sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_ADMIN_CHAT_ID, alertMsg));
        }

        // Gmail Council Alert (OAuth2 REST API)
        if (env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN) {
          const emailSubject = `[GMC Feedback] New Submission: ${category} (${trackingId})`;
          const emailBody =
            `GMC Thiruvallur Student Council Notification\n\n` +
            `A new student grievance has been registered on the portal.\n\n` +
            `• Category: ${category}\n` +
            `• Tracking ID: ${trackingId}\n` +
            `• PII Status: ${finalContainsPII ? "Flagged (Personal Information Excluded)" : "Clean"}\n` +
            `• Timestamp: ${new Date().toLocaleString()}\n\n` +
            `Access the Council Admin Dashboard to triage and take action:\n` +
            `${env.PORTAL_URL || "https://gmc-tiruvallur-feedback-app.studentcouncil26gmchtrl.workers.dev"}/admin/login`;

          ctx.waitUntil(sendGmailAlert(env, emailSubject, emailBody).catch((err) => console.error("Gmail alert error:", err)));
        }

        return jsonResponse(
          {
            success: true,
            trackingId,
            containsPII: finalContainsPII,
            telegramAlertSent: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID),
            message: "Feedback validated and tracking reference token generated",
          },
          200,
          env,
          request
        );
      }

      // 5. Live Chat Relay Endpoint
      if (path === "/api/chat/message" && request.method === "POST") {
        // Enforce rate limiting against message spam (60 messages / minute)
        if (!isTestEnv) {
          const limit = checkRateLimit(clientIp, "chat_message", 60, 60 * 1000);
          if (!limit.allowed) {
            return jsonResponse(
              { error: `Chat rate limit reached. Please wait ${limit.retryAfter}s.` },
              429,
              env,
              request,
              { "Retry-After": String(limit.retryAfter) }
            );
          }
        }

        let body;
        try {
          body = await readJsonBodySafe(request, 32768);
        } catch (err) {
          if (err?.code === "PAYLOAD_TOO_LARGE") {
            return jsonResponse({ error: "Payload exceeds 32KB limit" }, 413, env, request);
          }
          return jsonResponse({ error: "Invalid JSON payload" }, 400, env, request);
        }

        const sessionId = sanitizeInput(body?.sessionId || "", 50);
        let sender = "student";
        if (body?.sender === "admin" || body?.sender === "council") {
          const confToken = env.COUNCIL_AUTH_TOKEN ? env.COUNCIL_AUTH_TOKEN.trim() : "";
          const isAdmin = await authenticateAdminRequest(request, confToken);
          if (isAdmin) {
            sender = "council";
          }
        }
        const text = sanitizeInput(body?.text || "", 2000);

        if (!sessionId || !text) {
          return jsonResponse({ error: "Invalid chat payload" }, 400, env, request);
        }

        // If student sent message, notify Telegram Council Bot (CRIT-02: redact student PII before notification)
        if (sender === "student" && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID) {
          const safeSessionId = escapeTelegramMarkdown(sessionId);
          const safeText = escapeTelegramMarkdown(redactPiiText(text));
          const chatMsg =
            `💬 *Student Live Chat Message*\n` +
            `🆔 *Session:* \`${safeSessionId}\`\n\n` +
            `"${safeText}"\n\n` +
            `👉 *Log in to Council Executive Portal to participate in this session.*`;

          ctx.waitUntil(sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_ADMIN_CHAT_ID, chatMsg));
        }

        return jsonResponse(
          {
            success: true,
            sessionId,
            delivered: true,
          },
          200,
          env,
          request
        );
      }

      // 6. Telegram Webhook Handler (with secret token verification)
      if (path === "/api/telegram/webhook" && request.method === "POST") {
        // Fail closed in production if webhook secret is not set (CRIT-03)
        if (!isTestEnv && !env.TELEGRAM_WEBHOOK_SECRET) {
          return jsonResponse({ error: "Telegram webhook secret is not configured" }, 503, env, request);
        }

        // Verify X-Telegram-Bot-Api-Secret-Token
        if (env.TELEGRAM_WEBHOOK_SECRET) {
          const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
          const isSecretValid = await timingSafeEqualStrings(secretToken, env.TELEGRAM_WEBHOOK_SECRET);
          if (!isSecretValid) {
            return jsonResponse({ error: "Unauthorized webhook request" }, 401, env, request);
          }
        }

        let update;
        try {
          update = await readJsonBodySafe(request, 65536);
        } catch {
          return jsonResponse({ error: "Invalid webhook payload" }, 400, env, request);
        }

        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text.trim();

          // Verify sender identity if TELEGRAM_ADMIN_CHAT_ID is set
          const senderId = String(update.message?.chat?.id || update.message?.from?.id);
          const adminId = env.TELEGRAM_ADMIN_CHAT_ID ? String(env.TELEGRAM_ADMIN_CHAT_ID) : "";

          if (adminId && senderId !== adminId) {
            // Unauthorized user messaging bot - ignore silently to avoid command execution or data leakage
            return jsonResponse({ ok: true }, 200, env, request);
          }

          const reply = await handleTelegramCommand(text, chatId, env);
          if (reply) {
            await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, reply);
          }
        }
        return jsonResponse({ ok: true }, 200, env, request);
      }

      // 7. AI Intelligence Triage Endpoint (Groq / Gemini)
      if (path === "/api/ai/analyze" && request.method === "POST") {
        // Enforce council authorization on expensive AI endpoints
        const confToken = env.COUNCIL_AUTH_TOKEN ? env.COUNCIL_AUTH_TOKEN.trim() : "";
        const isAuth = await authenticateAdminRequest(request, confToken);

        if (!isTestEnv && !isAuth) {
          return jsonResponse({ error: "Unauthorized: Valid council access token required for AI triage" }, 401, env, request);
        }

        // Enforce rate limiting on expensive AI endpoints (15 calls / 5 mins)
        if (!isTestEnv) {
          const limit = checkRateLimit(clientIp, "ai_analyze", 15, 5 * 60 * 1000);
          if (!limit.allowed) {
            return jsonResponse(
              { error: `AI analysis rate limit reached. Please retry in ${limit.retryAfter}s.` },
              429,
              env,
              request,
              { "Retry-After": String(limit.retryAfter) }
            );
          }
        }

        let body;
        try {
          body = await readJsonBodySafe(request, 262144);
        } catch (err) {
          if (err?.code === "PAYLOAD_TOO_LARGE") {
            return jsonResponse({ error: "Payload exceeds 256KB limit" }, 413, env, request);
          }
          return jsonResponse({ error: "Invalid JSON payload" }, 400, env, request);
        }
        const rawFeedbacks = Array.isArray(body?.feedbacks) ? body.feedbacks : [];

        // STRICT PRIVACY: Filter out any feedback declaring or detecting PII (server-side regex enforcement)
        const piiRegex = /\b((dr\.|dr\s|prof\.|mr\.|ms\.|mrs\.)\s+[a-z]+|(?:\+91[\-\s]?)?[6-9]\d{9}|[0-9]{10,12}|(?:roll|reg(?:istration)?|student\s*id)\s*(?:(?:no|number|#)?\s*(?:is|[:.-])?)\s*\d+|(?:hostel\s+)?room\s*(?:no\.?)?\s*\d+|my name is\s+[a-z]+|i am\s+[a-z]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/i;
        const eligibleFeedbacks = rawFeedbacks.filter((f) => !f.containsPII && !piiRegex.test(f.content || ""));

        let aiReport = null;

        // Try Groq API first
        if (env.GROQ_API_KEY && eligibleFeedbacks.length > 0) {
          try {
            aiReport = await generateGroqAnalysis(env.GROQ_API_KEY, eligibleFeedbacks, rawFeedbacks.length);
          } catch (err) {
            console.warn("Groq AI failed, falling back:", err);
          }
        }

        // Try Gemini API if Groq wasn't configured or failed
        const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.GOOGLE_API_KEY;
        if (!aiReport && geminiKey && eligibleFeedbacks.length > 0) {
          try {
            aiReport = await generateGeminiAnalysis(geminiKey, eligibleFeedbacks, rawFeedbacks.length);
          } catch (err) {
            console.warn("Gemini AI failed, falling back:", err);
          }
        }

        // Fallback heuristic report if no AI key configured or online calls failed
        if (!aiReport) {
          aiReport = generateLocalHeuristicReport(rawFeedbacks, eligibleFeedbacks);
        }

        return jsonResponse(aiReport, 200, env, request);
      }

      // 8. Static Assets Fallback (Cloudflare Workers with Static Assets)
      if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
        return env.ASSETS.fetch(request);
      }

      return jsonResponse({ error: "Endpoint not found" }, 404, env, request);
    } catch (err) {
      console.error("Worker Execution Error:", err);
      return jsonResponse({ error: "Internal server processing error" }, 500, env, request);
    }
  },
};

/**
 * Handle Telegram Bot Commands
 */
async function handleTelegramCommand(text, chatId, env) {
  const parts = text.split(" ");
  const command = parts[0].toLowerCase();

  switch (command) {
    case "/start":
    case "/help":
      return (
        `🏛 *GMC Thiruvallur Student Council Bot*\n\n` +
        `This bot delivers real-time notifications when new grievances or live chat messages arrive from students.\n\n` +
        `*COMMANDS:*\n` +
        `• /status — Check worker alert service health\n` +
        `• /help — Show command information\n\n` +
        `👉 To triage feedback, manage live chats, or publish circulars, access the Council Executive Dashboard at your deployed URL.`
      );

    case "/status":
      return (
        `🟢 *Council Alert Service Status: Online*\n\n` +
        `• College: ${env.COLLEGE_NAME || "GMC Thiruvallur"}\n` +
        `• Environment: ${env.ENVIRONMENT || "production"}\n` +
        `• Telegram Notification Relay: Active`
      );

    default:
      return `⚠️ Unknown command. Type /help for assistance, or manage student services via the Council Admin Portal.`;
  }
}

/**
 * Send a message via Telegram Bot API with timeout protection
 */
async function sendTelegramMessage(botToken, chatId, text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    // Redact botToken from any logged error strings (MED-08)
    const errMsg = botToken ? String(err?.message || err).replace(botToken, "[REDACTED_BOT_TOKEN]") : String(err?.message || err);
    console.error("Failed to send Telegram message:", errMsg);
    return false;
  }
}

/**
 * Obtain a short-lived Gmail OAuth2 access token using the stored refresh token
 */
async function getGmailAccessToken(clientId, clientSecret, refreshToken) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Gmail token (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Dispatch an email notification using Google Gmail REST API v1
 */
async function sendGmailAlert(env, subject, bodyText) {
  const recipient = env.COUNCIL_RECIPIENT_EMAIL || env.GMAIL_SENDER_EMAIL;
  if (!recipient) return;

  const accessToken = await getGmailAccessToken(
    env.GMAIL_CLIENT_ID,
    env.GMAIL_CLIENT_SECRET,
    env.GMAIL_REFRESH_TOKEN
  );

  const sender = env.GMAIL_SENDER_EMAIL || "me";
  const rawEmail = [
    `From: ${sender}`,
    `To: ${recipient}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    bodyText,
  ].join("\r\n");

  // Base64URL encode the raw RFC 2822 message
  const utf8Bytes = new TextEncoder().encode(rawEmail);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Url = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64Url }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Gmail API send failed (${res.status}):`, errText);
  }
}

/**
 * Redact identifying tokens (phone numbers, emails, roll numbers, names, rooms)
 * to ensure that no student PII is transmitted to external AI endpoints or notification channels
 */
function redactPiiText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi, "[EMAIL]")
    .replace(/(?:\+91[\-\s]?)?[6-9]\d{4}[\s\-]?\d{5}|\b\d{10,12}\b/g, "[PHONE/ID]")
    .replace(/\b(?:roll|reg(?:istration)?|student\s*id)\s*(?:(?:no|number|#)?\s*(?:is|[:.-])?)\s*\d+/gi, "[STUDENT-ID]")
    .replace(/\b((?:dr\.|dr\s|prof\.|mr\.|ms\.|mrs\.)\s+[a-z]+)\b/gi, "[PERSON]")
    .replace(/\b(?:my name is|i am)\s+[a-z]+/gi, "[PERSON-CLAIM]")
    .replace(/\b(?:hostel\s+)?room\s*(?:no\.?)?\s*\d+/gi, "[ROOM]");
}

/**
 * Groq AI Inference with timeout & safety guards
 */
/**
 * Heuristic sentiment and urgency detector based on contextual text signals
 */
function detectHeuristicSentiment(content) {
  const text = (content || "").toLowerCase();
  const negativeSignals = [
    "broken", "leak", "dirty", "stink", "smell", "cold", "poor", "bad",
    "issue", "problem", "fail", "not working", "damage", "worst", "delay",
    "lack", "shortage", "pain", "unhygienic", "mosquito", "drainage"
  ];
  const positiveSignals = [
    "good", "thank", "great", "excellent", "improved", "resolved", "helpful",
    "appreciate", "nice", "clean", "well", "kudos", "satisfied", "better"
  ];

  const hasNeg = negativeSignals.some((w) => text.includes(w));
  const hasPos = positiveSignals.some((w) => text.includes(w));

  if (hasNeg && !hasPos) return { sentiment: "Negative", urgency: "High" };
  if (hasPos && !hasNeg) return { sentiment: "Positive", urgency: "Low" };
  return { sentiment: "Neutral", urgency: "Medium" };
}

/**
 * Groq AI Inference with tuned prompt & structured sentiment classification
 */
async function generateGroqAnalysis(apiKey, feedbacks, totalRawCount = feedbacks.length) {
  const sanitizedSubmissions = feedbacks.map((f, idx) => ({
    id: idx,
    trackingId: f.trackingId || `REF-${idx + 1}`,
    category: sanitizeInput(f.category, 100),
    content: redactPiiText(sanitizeInput(f.content, 4000)),
  }));

  const systemPrompt = "You are the Senior AI Triage & Analytics Officer for Government Medical College (GMC) Thiruvallur Student Council. Analyze the student grievance submissions objectively. Classify every submission's sentiment accurately into Positive, Neutral, or Negative (grievances and complaints are Negative; praise and appreciation are Positive; inquiries and neutral suggestions are Neutral). Calculate exact counts for sentimentDistribution and urgencyDistribution.";

  const userContent = `<student_submissions>\n${JSON.stringify(sanitizedSubmissions)}\n</student_submissions>\n\nReturn JSON conforming to schema:
{
  "executiveSummary": "string",
  "sentimentDistribution": { "Positive": 0, "Neutral": 0, "Negative": 0 },
  "urgencyDistribution": { "High": 0, "Medium": 0, "Low": 0 },
  "recurringThemes": ["string"],
  "recommendations": ["string"],
  "itemAnalysis": [{ "id": 0, "sentiment": "Positive|Neutral|Negative", "urgency": "High|Medium|Low", "summary": "string" }]
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) throw new Error("Groq API returned " + res.status);
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);

  return compileReportData(feedbacks, parsed, totalRawCount);
}

/**
 * Google Gemini AI Inference with tuned prompt, sentiment classification & candidate model fallback
 */
async function generateGeminiAnalysis(apiKey, feedbacks, totalRawCount = feedbacks.length) {
  const sanitizedSubmissions = feedbacks.map((f, idx) => ({
    id: idx,
    trackingId: f.trackingId || `REF-${idx + 1}`,
    category: sanitizeInput(f.category, 100),
    content: redactPiiText(sanitizeInput(f.content, 4000)),
  }));

  const prompt = `You are the Senior AI Triage & Analytics Officer for Government Medical College (GMC) Thiruvallur Student Council.
Analyze the student grievance submissions inside <student_submissions>.

TASK REQUIREMENTS:
1. Objectively classify the sentiment of each submission:
   - "Negative": Grievances, complaints, broken infrastructure, dirty facilities, mess problems, delays, or academic distress.
   - "Positive": Appreciation, constructive praise, gratitude for improvements, or resolved issues.
   - "Neutral": Objective inquiries, schedule questions, or neutral suggestions without strong emotional tone.
2. Calculate honest counts for sentimentDistribution (Positive, Neutral, Negative) and urgencyDistribution (High, Medium, Low).
3. Provide a high-level executiveSummary tailored for the GMC Thiruvallur Student Council and college leadership.
4. Extract key recurringThemes and actionable recommendations to resolve top issues.
5. Provide an itemAnalysis array mapping back to each submission by its id.

<student_submissions>
${JSON.stringify(sanitizedSubmissions)}
</student_submissions>

Respond ONLY with valid JSON strictly conforming to this schema:
{
  "executiveSummary": "string",
  "sentimentDistribution": { "Positive": 0, "Neutral": 0, "Negative": 0 },
  "urgencyDistribution": { "High": 0, "Medium": 0, "Low": 0 },
  "recurringThemes": ["string"],
  "recommendations": ["string"],
  "itemAnalysis": [
    {
      "id": 0,
      "sentiment": "Positive|Neutral|Negative",
      "urgency": "High|Medium|Low",
      "summary": "string"
    }
  ]
}`;

  // Candidate models with fallback in case of high demand spikes (503)
  const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
  let parsed = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          parsed = JSON.parse(rawText);
          break;
        }
      } else {
        lastError = new Error(`Gemini model ${model} returned ${res.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!parsed) throw (lastError || new Error("Gemini AI analysis failed across all models"));

  return compileReportData(feedbacks, parsed, totalRawCount);
}

function compileReportData(feedbacks, aiParsed, totalRawCount = feedbacks.length) {
  const categoryCount = {};
  feedbacks.forEach((f) => {
    categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
  });

  const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
  const urgencyCount = { High: 0, Medium: 0, Low: 0 };

  if (aiParsed?.sentimentDistribution && typeof aiParsed.sentimentDistribution === "object") {
    sentimentCount.Positive = Number(aiParsed.sentimentDistribution.Positive) || 0;
    sentimentCount.Neutral = Number(aiParsed.sentimentDistribution.Neutral) || 0;
    sentimentCount.Negative = Number(aiParsed.sentimentDistribution.Negative) || 0;
  } else {
    feedbacks.forEach((f) => {
      const detected = f.aiAnalysis?.sentiment ? { sentiment: f.aiAnalysis.sentiment } : detectHeuristicSentiment(f.content);
      sentimentCount[detected.sentiment] = (sentimentCount[detected.sentiment] || 0) + 1;
    });
  }

  if (aiParsed?.urgencyDistribution && typeof aiParsed.urgencyDistribution === "object") {
    urgencyCount.High = Number(aiParsed.urgencyDistribution.High) || 0;
    urgencyCount.Medium = Number(aiParsed.urgencyDistribution.Medium) || 0;
    urgencyCount.Low = Number(aiParsed.urgencyDistribution.Low) || 0;
  } else {
    feedbacks.forEach((f) => {
      const urg = f.aiAnalysis?.urgency || detectHeuristicSentiment(f.content).urgency;
      urgencyCount[urg] = (urgencyCount[urg] || 0) + 1;
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalAnalyzed: feedbacks.length,
    excludedPIICount: Math.max(0, totalRawCount - feedbacks.length),
    categoryDistribution: categoryCount,
    sentimentDistribution: sentimentCount,
    urgencyDistribution: urgencyCount,
    executiveSummary: aiParsed?.executiveSummary || "Analysis complete.",
    recurringThemes: Array.isArray(aiParsed?.recurringThemes) ? aiParsed.recurringThemes : [],
    recommendations: Array.isArray(aiParsed?.recommendations) ? aiParsed.recommendations : [],
    itemAnalysis: Array.isArray(aiParsed?.itemAnalysis) ? aiParsed.itemAnalysis : [],
  };
}

function generateLocalHeuristicReport(allFeedbacks, cleanFeedbacks) {
  const categoryCount = {};
  const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
  const urgencyCount = { High: 0, Medium: 0, Low: 0 };

  cleanFeedbacks.forEach((f) => {
    categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
    const detected = f.aiAnalysis?.sentiment && f.aiAnalysis?.urgency
      ? f.aiAnalysis
      : detectHeuristicSentiment(f.content);
    sentimentCount[detected.sentiment] = (sentimentCount[detected.sentiment] || 0) + 1;
    urgencyCount[detected.urgency] = (urgencyCount[detected.urgency] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const topCategories = sortedCategories.slice(0, 3).map(([cat, count]) => `${cat} (${count} submission${count > 1 ? "s" : ""})`);

  const summary = cleanFeedbacks.length > 0
    ? `Heuristic aggregation of ${cleanFeedbacks.length} student submissions across ${Object.keys(categoryCount).length} categories${topCategories.length > 0 ? ", led by " + topCategories.join(", ") : ""}. Note: Automated narrative synthesis requires GROQ_API_KEY or GEMINI_API_KEY configured in worker secrets.`
    : "No non-PII feedback submissions available for heuristic aggregation.";

  const recurringThemes = topCategories.length > 0
    ? topCategories.map((c) => `Category volume: ${c}`)
    : ["No active grievance trends registered."];

  const recommendations = [
    "Review open high-urgency grievances in the Feedback Review section.",
    "Verify campus infrastructure and schedule follow-ups with relevant committees.",
    "Broadcast timely resolution circulars to students via Council Announcements.",
  ];

  return {
    generatedAt: new Date().toISOString(),
    totalAnalyzed: cleanFeedbacks.length,
    excludedPIICount: Math.max(0, allFeedbacks.length - cleanFeedbacks.length),
    categoryDistribution: categoryCount,
    sentimentDistribution: sentimentCount,
    urgencyDistribution: urgencyCount,
    executiveSummary: summary,
    recurringThemes,
    recommendations,
    itemAnalysis: [],
  };
}
