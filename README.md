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
Key frontend variables:
```env
# Council Master Secret Token (Decoupled Authentication)
# Council members enter this token on the login page to unlock admin clearance!
VITE_COUNCIL_AUTH_TOKEN="your-secure-passcode-here"

# Cloudflare Worker Backend URL (Optional - leave empty for standalone/local mode)
VITE_API_BASE_URL="https://gmc-thiruvallur-backend.your-subdomain.workers.dev"

# Firebase Keys (Optional - leave blank if using built-in local store)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```
*(If left blank, the app runs in interactive local review mode with zero crashes!)*

### 2. Cloudflare Worker Configuration (`worker/.dev.vars`)
Copy `worker/.dev.vars.example` to `worker/.dev.vars`:
```bash
cp worker/.dev.vars.example worker/.dev.vars
```
For production deployment, upload secrets securely via Wrangler:
```bash
npx wrangler secret put COUNCIL_AUTH_TOKEN
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put GEMINI_API_KEY
```

---

## ⚡ 1-Click Deployment to Cloudflare Pages (100% Free)

You can deploy this portal entirely on Cloudflare's generous free tier ($0/month):
- **Cloudflare Pages**: Unlimited bandwidth, free custom domain with SSL, 500 builds/month.
- **Cloudflare Workers**: 100,000 requests/day, 10ms CPU time per request.

### Step 1: Deploy Frontend on Cloudflare Pages

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository: `project_gmc_tiruvallur_feedback_app`.
4. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm --prefix frontend run build` (or `npm run build`)
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/` (leave empty / root)
5. Add **Environment Variables** (in Cloudflare Pages dashboard under **Settings > Environment Variables**):
   - `NODE_VERSION` = `20`
   - `VITE_COUNCIL_AUTH_TOKEN` = `your-secret-council-passcode` *(e.g. `gmc-council-admin-2026`)*
   - `VITE_API_BASE_URL` = *(Your Cloudflare Worker URL from Step 2, or leave empty for standalone)*
6. Click **Save and Deploy**!
   Your portal is instantly live at `https://<your-project>.pages.dev` with SPA deep-linking and security headers enabled!

### Step 2: Deploy Backend Serverless Worker (Cloudflare Workers)

1. Open your terminal in the `worker/` directory:
   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   ```
2. Your worker will be live at `https://gmc-thiruvallur-backend.<your-subdomain>.workers.dev`.
3. Add your secrets:
   ```bash
   npx wrangler secret put COUNCIL_AUTH_TOKEN   # Enter the same secret as VITE_COUNCIL_AUTH_TOKEN
   npx wrangler secret put GROQ_API_KEY          # Free from https://console.groq.com
   npx wrangler secret put GEMINI_API_KEY        # Free from https://aistudio.google.com
   npx wrangler secret put TELEGRAM_BOT_TOKEN    # Free from @BotFather
   npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID # Council group chat ID
   ```
4. Copy your Worker URL and paste it into Cloudflare Pages `VITE_API_BASE_URL` environment variable.

---

## 🚀 Local Development Quick Start

### 1. Run Everything Concurrently
```bash
# Starts both Cloudflare Worker (port 8787) and Vite React Frontend (port 3000)
npm run dev
```

### 2. Run Test Suite
```bash
# Runs both Frontend Vitest tests and Serverless Worker Node test runner
npm test
```

### 3. Build for Production
```bash
npm run build
```

---

## 🛡️ Database Security (`firestore.rules`)
If using Cloud Firestore, deploy production security rules:
```bash
firebase deploy --only firestore:rules
```
- **Feedback**: Anonymous write-only; only authenticated council members can read/modify.
- **Live Chat**: 24-hour expiration check; only active sessions permit message appending.
- **Announcements, Polls, Events**: Public read; write restricted to authenticated council admins.

---

## 📄 License
MIT © GMC Thiruvallur Student Council

