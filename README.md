# 🏛️ GMC Thiruvallur – Student Council Portal

A lightweight, serverless **Student Council Feedback & Communication Portal** built for students of Government Medical College (GMC) Thiruvallur.

Engineered to run within **free-tier quotas** across Cloudflare Pages, Cloudflare Workers, and Firebase Spark without requiring a paid VPS or Firebase Blaze plan.

---

## ✨ Key Features

### 🎓 1. Student Portal (No Login Required)
- **Home Hub**: Latest council announcements, quick-access navigation, and active student polls with light and dark theme support.
- **Anonymous Feedback**:
  - Category selector (*Academics, Infrastructure, Hostel & Mess, Transport, Sports, Library, Clinical Postings, Others*).
  - **Privacy & PII Safeguard**: Submissions flagged by the student or detected via server/client PII filters (names, phone numbers, emails, roll numbers, room numbers) are **excluded from external AI processing** and restricted to council review.
  - Generates an anonymous tracking ID (e.g., `GMC-FB-9402`) so students can check status updates and council replies.
- **Live Chat**:
  - Ephemeral 1-on-1 chat session with a unique session ID (e.g., `GMC-X7K92`) and council online presence indicator.
  - Sessions automatically expire after 24 hours, with instant session termination and message purge on close.
- **Announcements**: Categorized, filterable campus circulars and pinned notices.
- **Student Polls**: Multiple-choice student ballots with atomic single-vote enforcement, live vote breakdown, and closed polls archive.

### 🛡️ 2. Council Admin Console (Protected Access)
- **Authentication**: Protected via Firebase Authentication (Google Sign-In / authorized council accounts) and timing-safe HMAC session tokens issued by the Cloudflare Worker.
- **Overview Dashboard**: Real-time counts for total feedback, pending reviews, active chat relays, and active polls.
- **Feedback Review**: Filter by category/status (`Received`, `In Review`, `Resolved`), view PII flags, and post timestamped responses to student tracking IDs.
- **Student Chats**: Live multi-session chat desk for responding to active student inquiries and closing completed sessions.
- **Announcement & Poll Management**: Create, pin, close, or batch-delete circulars and student polls.
- **AI Analytics & Summary**: On-demand executive synthesis powered by Gemini / Groq (with automatic PII redaction, temporal burst/anomaly detection, sentiment & category distributions, and CSV/JSON export).
- **Admin Management**: Manage authorized council accounts and inspect live backend/service health.

### 🔔 3. Real-Time Alert Integrations
- **Telegram Alert Bot**: Pushes real-time notifications to the council group when new feedback or live chat messages arrive (`/start`, `/status`, `/help`).
- **Gmail OAuth Dispatcher**: Optional email alerts for incoming student grievances via the Gmail REST API.

---

## 🏗️ Architecture & Stack

```text
                          STUDENTS (Mobile / Web)
                                     │
                                     ▼
                       ┌───────────────────────────┐
                       │    REACT FRONTEND (SPA)   │
                       │  Vite + Tailwind + Lucide │
                       │     Cloudflare Pages      │
                       └─────────────┬─────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                        ▼                         ▼
              ┌───────────────────┐    ┌────────────────────┐
              │ FIREBASE (Spark)  │    │ CLOUDFLARE WORKER  │
              │ Cloud Firestore   │    │ Auth & Rate Limits │
              │ Firebase Auth     │    │ PII Filter & AI    │
              │ Security Rules    │    │ Telegram / Gmail   │
              └───────────────────┘    └──────────┬─────────┘
                                                  │
                                      ┌───────────┼───────────┐
                                      ▼           ▼           ▼
                                  TELEGRAM     GEMINI /     GMAIL
                                   ALERTS      GROQ AI       API
```

| Layer | Technology | Plan / Quota |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Open Source |
| **Static Hosting** | Cloudflare Pages / Assets | Free Tier |
| **Serverless API** | Cloudflare Workers | Free Tier (100k req/day) |
| **Database & Auth** | Firebase Firestore & Auth | Spark Plan (Free) |
| **AI Synthesis** | Gemini API / Groq API | Free Quota |
| **Notifications** | Telegram Bot API + Gmail API | Free |

---

## ⚙️ Configuration

### 1. Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
```env
VITE_API_BASE_URL="https://gmc-thiruvallur-backend.<your-subdomain>.workers.dev"

VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

### 2. Cloudflare Worker (`worker/.dev.vars`)
Copy `worker/.dev.vars.example` to `worker/.dev.vars` for local development:
```bash
cp worker/.dev.vars.example worker/.dev.vars
```
For production, set secrets via Wrangler:
```bash
npx wrangler secret put COUNCIL_AUTH_TOKEN
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID
```

---

## 🚀 Local Development & Deployment

```bash
# Start Cloudflare Worker + Vite frontend concurrently
npm run dev

# Run frontend (Vitest) and worker (Node test) suites
npm test

# Production frontend build
npm run build

# Deploy Cloudflare Worker
npm run worker:deploy
```

### 🔒 Firestore Security Rules
Deploy [`firestore.rules`](./firestore.rules) using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📄 License
MIT
