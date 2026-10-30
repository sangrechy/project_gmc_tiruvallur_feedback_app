# 🏛️ GMC Thiruvallur – Student Council Portal

Official, modern, and serverless **Student Council Portal & Management System** for Government Medical College (GMC) Thiruvallur (~500 medical students).

Engineered to operate strictly within **100% Free-Tier quotas** without requiring a paid Firebase Blaze plan or dedicated VPS.

---

## 🌟 Key Features

### 1. Student Portal (Zero Login Required)
- **Home Hub**: Official branding, latest announcements, quick action cards, upcoming events preview, active polls voting widget. Light and Dark theme support.
- **Anonymous Feedback**:
  - Category selector (*Academics, Infrastructure, Hostel & Mess, Transport, Sports, Library, Clinical Postings, Others*).
  - Detailed feedback textarea.
  - **Mandatory Privacy Check**: *"My feedback contains names or identifying information"*. Any submission declaring or heuristically detected to contain identifying information (PII) is **strictly excluded from external AI processing** and flagged for council review only.
  - Generates an anonymous reference tracking ID (e.g., `GMC-FB-9402`).
- **Temporary Live Chat**:
  - Ephemeral chat session with a unique session ID (e.g., `GMC-X7K92`).
  - Real-time two-way dialogue with elected council representatives.
  - Sessions automatically expire after 24 hours of inactivity according to privacy guidelines.
  - End Chat action with instant session closure.
- **Announcements**: Categorized, filterable, pinned/important alerts, posted and expiry dates.
- **Student Polls**: Interactive multiple-choice democratic voting with live vote percentage visualizer and closed polls archive.
- **College Events**: Upcoming medical symposiums, clinical workshops, sports meets, cultural fests, venue & date details, and registration links.

### 2. Council Admin Dashboard (Protected Access)
- **Firebase Authentication** or instant **1-Click Interactive Demo Login** for effortless offline/local review.
- **Overview Metrics**: Total feedback submissions, unread grievance queue, active live chats, active polls.
- **Feedback Triage**: Search, filter by category/status (`Received`, `Reviewing`, `Resolved`), inspect PII safety tags, and view AI sentiment summaries.
- **Live Chat Desk**: Real-time monitor of student sessions with instant web reply interface.
- **Announcement Management**: Publish, pin, edit, delete, and set notice expiration.
- **Poll Management**: Create polls with dynamic options (2–6 choices), set deadlines, close/reopen, and review vote distributions.
- **Event Management**: Create and manage upcoming and past college activities with venue details and registration URLs.
- **AI Reports Hub**: Sentiment distribution, category breakdown, recurring student concerns, actionable council recommendations, and **CSV / JSON export**.
- **Admin Management**: Authorized council member list and Telegram Admin Bot command cheatsheet.

### 3. Telegram Admin Bot Integration (`@GMCThiruvallurCouncilBot`)
- Council members can manage the portal and respond to students from their phone via Telegram:
  - `/announce [Category] Title - Description` – Publish campus announcement
  - `/edit` & `/delete` – Manage notices
  - `/poll Question | Opt1 | Opt2` – Launch student voting
  - `/event Title | Date | Venue` – Broadcast college event
  - `/chat` – List active temporary student live chats
  - `/reply <sessionId> <message>` – Reply directly to student web chat
  - `/feedback` – View feedback volume and sentiment metrics
  - `/issues` – View open high-priority student grievances
  - `/report` – Trigger instant on-demand AI executive summary

---

## 🏗️ Architecture & Technology Stack

```
                          STUDENTS (Web Browser)
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │    REACT FRONTEND (SPA)   │
                      │  Vite + Tailwind + Lucide │
                      │  (Hosted: Cloudflare Pages│
                      └─────────────┬─────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
             ┌───────────────────┐    ┌────────────────────┐
             │ FIREBASE (Spark)  │    │ CLOUDFLARE WORKER  │
             │ Firestore DB      │    │ Serverless Backend │
             │ Firebase Auth     │    │ Webhooks & AI API  │
             │ Security Rules    │    │ Gmail Alerts       │
             └───────────────────┘    └──────────┬─────────┘
                                                 │
                                     ┌───────────┼───────────┐
                                     ▼           ▼           ▼
                                 TELEGRAM      GROQ /      GMAIL
                                   BOT        GEMINI AI     API
```

| Layer | Technology | Quota / Cost |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Open Source |
| **Frontend Hosting** | Cloudflare Pages | Free (Unlimited bandwidth) |
| **Serverless Backend** | Cloudflare Workers | Free (100,000 requests/day) |
| **Database & Auth** | Firebase Firestore & Auth | Spark Plan (Free) |
| **AI Inference** | Groq API (`llama-3.3-70b`) / Gemini API | Free Quota |
| **Chat & Alerts** | Telegram Bot API + Gmail API | Free |

> **Cost Guarantee:** No Firebase Blaze plan is required. All privileged backend tasks run through Cloudflare Workers.

---

## 🔒 Decoupled Tokens & Safe Configuration

All tokens and credentials are decoupled into environment variables.
**The portal functions immediately in Interactive Local Mode out of the box** even before you enter your keys!

### 1. Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
Fill in your Firebase web app keys (from [Firebase Console](https://console.firebase.google.com) > Project Settings > Your Apps):
```env
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_API_BASE_URL=""
```
*(If left blank, the app will run in local demo mode with rich sample data!)*

### 2. Cloudflare Worker Configuration (`worker/.dev.vars`)
Copy `worker/.dev.vars.example` to `worker/.dev.vars`:
```bash
cp worker/.dev.vars.example worker/.dev.vars
```
For production deployment, upload secrets securely via Wrangler:
```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put GEMINI_API_KEY
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install frontend packages
cd frontend
npm install

# Return to root
cd ..
```

### 2. Run Locally
```bash
# Start frontend on http://localhost:3000
npm run dev

# (Optional) Start local Cloudflare Worker in a separate terminal
npm run worker:dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🛡️ Database Security (`firestore.rules`)
Deploy production security rules to Firebase:
```bash
firebase deploy --only firestore:rules
```
- **Feedback**: Anonymous write-only; only authenticated council members can read/modify.
- **Live Chat**: 24-hour expiration check; only active sessions permit message appending.
- **Announcements, Polls, Events**: Public read; write restricted to authenticated council admins.

---

## 📄 License
MIT © GMC Thiruvallur Student Council
