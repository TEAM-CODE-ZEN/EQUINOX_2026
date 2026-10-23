# CampusAccord

> **"Every concern heard. Every action tracked."**

CampusAccord is a professional, responsive, AI-powered campus issue management, duplicate detection, and community coordination platform built for collegiate institutions. Designed for students, campus wardens, maintenance supervisors, and administrators, it transforms chaotic campus complaints into organized, actionable, and trackable workflows.

---

## 🌟 Key Highlights & Architecture

- **AI-Powered Triage & Routing**: Automatically interprets student complaint descriptions and attached photographs using Google Gemini (`gemini-2.5-flash`), categorizing them into responsible departments (**Maintenance**, **Mess**, **Security**, **Internet / Connectivity**, **Events / Clubs**) with priority scoring and visible evidence verification.
- **Intelligent Duplicate Detection**: Prevents ten duplicate reports of the same broken water cooler from overwhelming facilities teams. Automatically matches active issues in the same campus area and invites students to join the report with a single tap.
- **Atomic +1 Endorsements**: Endorsement counter increments idempotently per student, elevating urgent shared problems to top priority while preventing artificial count inflation.
- **Role-Based Governance**: Dedicated role flows for **Students**, **Campus Staff** (Wardens, Maintenance Workers, Security, Mess Supervisors), and **Administrators**, strictly authorized with zero client-side privilege escalation.
- **Committee Governance**: Full lifecycle for student committee nominations proposed by Admins and reviewed/approved by Campus Wardens with permanent audit logging.
- **Verified Help & Safety Resources**: Instant, unblocked access to official 24/7 helplines, including the **National Anti-Ragging Helpline** (`1800-180-5522`) and **Tele-MANAS Mental Health Helpline** (`14416` / `1800-891-4416`), completely decoupled from AI triage.
- **Dual-Mode Operation**:
  - **Demo Mode**: Instant zero-credential evaluation mode seeded with realistic campus scenarios (leaking water coolers, mess quality reports, Wi-Fi drops, tap leaks, and committee proposals) with a 1-click role switcher.
  - **Production Mode**: Seamlessly connects to Google Firebase (Auth, Firestore, Cloud Storage) and a secure Node/Cloud Functions backend for live Gemini processing.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom Campus Navy palette and accessible components
- **Icons**: Lucide Icons
- **Backend / Proxy**: Node.js & Express (or Firebase Cloud Functions)
- **AI Integration**: Google Gen AI SDK (`@google/genai`) with server-side proxy
- **Database & Storage**: Cloud Firestore & Cloud Storage with strict Security Rules
- **Validation**: Zod schema validation

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd EQUINOX_2026
npm install
```

### 2. Configure Environment (Optional for Demo Mode)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

CampusAccord runs out-of-the-box in **Demo Mode** without requiring external credentials.

To enable live Gemini AI analysis, set your API key in the server environment:
```env
# Server-side only (never exposed to frontend bundle!)
GEMINI_API_KEY=AIzaSy...your_gemini_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To launch the secure server-side Gemini API proxy:
```bash
npm run server
```

---

## 🔒 Security Architecture & Admin Provisioning

### 1. Server-Side Secret Isolation
The Google Gemini API Key and Admin Bootstrap credentials are **strictly restricted to the server environment**. They are never bundled into client-side JavaScript, never sent to the browser, and excluded from version control via `.gitignore`.

### 2. First-Admin Bootstrap Protocol
CampusAccord does **not** hardcode administrator passwords. The first system administrator is provisioned securely via a server-side bootstrap endpoint:
```http
POST /api/admin/bootstrap
Content-Type: application/json

{
  "bootstrapSecret": "<ADMIN_BOOTSTRAP_SECRET>",
  "userUid": "<FIREBASE_USER_UID>",
  "email": "admin@campus.edu"
}
```
*After provisioning the first administrator, remove `ADMIN_BOOTSTRAP_SECRET` from the server environment to permanently disable the bootstrap route.*

### 3. Firestore & Cloud Storage Security Rules
- `firestore.rules`: Enforces default-deny, role-based authorization, immutable audit comments, and restricted access for sensitive/confidential student reports.
- `storage.rules`: Validates image MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforces a strict 5MB upload ceiling.

---

## 🤖 Gemini Model Configuration

The Gemini model ID is centrally managed on the backend and in `src/services/aiConfig.ts`. Switching models does **not** require rewriting frontend components.

To switch models, update `GEMINI_MODEL` in your server environment:
```env
# Recommended models:
GEMINI_MODEL=gemini-2.5-flash
# or
GEMINI_MODEL=gemini-1.5-flash
```

---

## 📋 Pre-Push Security Checklist

Before pushing changes to GitHub:
- [x] Verify `.gitignore` contains `.env`, `.env.*`, `serviceAccountKey.json`, and `*.local`
- [x] Confirm no API keys or private keys are committed in source files
- [x] Run `npm run build` to verify clean TypeScript compilation and bundle generation
- [x] Test responsive views on mobile and desktop viewports

---

## 👥 Demo Profiles (1-Click Switcher)

When evaluating CampusAccord in demo mode, use the profile switcher in the top-right header to test different user journeys:
1. **Aarav Sharma (Student)**: Room B-304, Block B. Can raise issues, +1 endorse shared facility tickets, and view personalized feed.
2. **Dr. Radhika Iyer (Warden)**: Campus Staff. Can review ticket triage, assign workers, approve committee memberships, and publish announcements.
3. **Rajesh Kumar (Maintenance Worker)**: Campus Staff. Can inspect assigned maintenance tickets, add internal notes, and mark issues resolved.
4. **Prof. Vikram Sen (Admin)**: Full administrative authority to manage users, propose committee members, and configure campus routing rules.

---

## 📄 License
This project was developed for the Equinox 2026 Hackathon.
