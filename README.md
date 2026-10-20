# Opportunity AI — AI-Powered Student Opportunity Discovery & Career Guidance Platform

Opportunity AI is a centralized, personalized opportunity discovery and career guidance platform for college students and recent graduates (initially tailored for India with a global-ready architecture). It replaces fragmented job boards and unreliable scrapers with **authoritative, verified opportunity data** and an **explainable 3-stage AI matching engine** that strictly forbids fabricated listings or hallucinatory eligibility claims.

---

## 🏛️ Architecture Overview

Opportunity AI follows a clean, decoupled architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                    │
│   App Router • TypeScript • Tailwind CSS • Lucide Icons     │
│   WCAG 2.2 AA Accessible • Responsive Mobile/Desktop UI     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Next.js API Route Layer                  │
│   JWT Session Auth • Zod Validations • Rate & Scope Guards  │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼────────┐       ┌──────▼──────┐
│ PostgreSQL  │         │ Grounded AI   │       │ Ingestion   │
│ Prisma ORM  │         │ Engine (3-Stg)│       │ Pipeline    │
│ 11 Entities │         │ Deterministic │       │ Deduplication│
└─────────────┘         └───────────────┘       └─────────────┘
```

### The 3-Stage Explainable Matching Engine
1. **Stage 1 (Deterministic Hard Check)**: Validates education level, year of study, and location constraints against published criteria. Unknown items are marked explicitly as unknown rather than assumed eligible.
2. **Stage 2 (Transparent Scoring)**: Calculates a normalized 0–100 alignment score across Skills (35%), Education Level (25%), Category Preference (15%), Career Goals (10%), Workplace Style (10%), and Deadline proximity (5%).
3. **Stage 3 (Source-Grounded Explanation)**: Emits human-readable rationale citing official listing text, distinguishing verified evidence from uncertainties.

---

## 🚀 Key Features

* **Real Authentication & Security**: Password hashing with `bcryptjs`, tamper-proof HTTP-only JWT sessions (`jose`), role-based access (`STUDENT` vs `ADMIN`), and enumeration-resistant account recovery.
* **Verified Opportunity Discovery**: Multi-faceted filtering (category, education level, remote/onsite, funding/stipend, deadlines) with real-time sorting.
* **Natural Language Search**: Translates student search queries (e.g. *"Find remote Python internships for second-year computer science students in India"*) into validated search filters without arbitrary SQL execution.
* **Application Tracker**: Kanban-style interactive tracker covering `Interested`, `Preparing`, `Applied`, `Assessment`, `Interview`, `Accepted`, `Rejected`, and `Withdrawn`, complete with private application notes.
* **Skill Gap & Learning Roadmap**: Compares target listing requirements with the student's stated skills, offering practical portfolio project suggestions and curated free/open learning resources (FreeCodeCamp, MDN, Kaggle, MIT OCW).
* **Source-Grounded AI Advisor & Factual Resume Drafter**: Interactive assistant grounded in primary documents, accompanied by a factual resume bullet generator that enforces user review and forbids fabricated metrics.
* **Administrator Control Center**: Staff interface for authoritative listing ingestion, URL canonicalization, Levenshtein duplicate prevention, status transitions (`VERIFIED`, `NEEDS_REVIEW`, `EXPIRED`, `SUSPICIOUS`), and audit logging.
* **Privacy & Data Sovereignty**: GDPR/DPDP-compliant full JSON data export and permanent account deletion.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19, Tailwind CSS, Lucide React |
| **Backend** | Next.js Server Components, API Route Handlers |
| **Database** | PostgreSQL 14+, Prisma ORM 6 LTS |
| **Authentication** | `bcryptjs` (passwords), `jose` (JWT HTTP-only cookies) |
| **Validation** | `zod` for request schemas and model parsing |
| **Testing** | `vitest` unit and integration test suite |

---

## 📦 Setup and Local Development Instructions

### Prerequisites
- **Node.js**: v18.18+ or v20+ (tested on Node v25.8.0)
- **PostgreSQL**: 14+ running locally or a hosted PostgreSQL URL (Supabase, Neon, AWS RDS)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd something
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is configured:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/opportunity_ai"
JWT_SECRET="your-super-secret-development-key-32chars-min!!"
COOKIE_NAME="oppai_session"
NODE_ENV="development"
AI_PROVIDER="rule-based"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize & Seed Database
Sync the PostgreSQL schema and seed authentic, verified opportunities:
```bash
npm run prisma:push
npm run seed
```

This seeds:
- Default Admin Account: `admin@opportunity.ai` / `Admin@123456`
- Demo Student Account: `student@opportunity.ai` / `Student@123456`
- 9 verified real opportunities (GSoC, PMRF, SIH, Adobe WIT, ISRO VSSC, Microsoft Student Ambassadors, etc.)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated test suite covering authentication, schema validation, matching engine, and pipeline deduplication:
```bash
npm run test
```
To run tests in watch mode:
```bash
npm run test:watch
```

---

## 🛡️ Security Architecture & Privacy Safeguards

- **Input Validation**: Strict Zod schemas on all API inputs to eliminate malformed requests and injection risks.
- **Access Control**: Role checks (`requireAdmin()`, `requireAuth()`) and strict user ownership verification on private notes and application tracker rows.
- **Data Protection**: Passwords hashed with 12 salt rounds; sensitive tokens never stored in client code or logged.
- **Privacy Controls**: Students can download their complete record (`POST /api/profile` with `action="export"`) or execute irreversible account deletion (`DELETE /api/profile`).
- **Security Headers**: Standard headers configured in `next.config.mjs` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 🚢 Production Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub or GitLab.
2. Link the repository in the Vercel dashboard.
3. Configure the Production Environment Variables in Vercel:
   - `DATABASE_URL` (Points to hosted PostgreSQL)
   - `JWT_SECRET` (Secure 32+ character random secret)
   - `COOKIE_NAME` (`oppai_session`)
   - `NODE_ENV` (`production`)
4. Set Build Command: `npm run prisma:generate && npm run build`
5. Deploy.

---

## ⚠️ Known Limitations & Disclosures

1. **Deterministic AI Engine vs External LLMs**: By default, Opportunity AI runs on a deterministic, grounded rule engine that enforces zero hallucinations and requires no external paid API keys. An external model provider (Gemini / OpenAI / Anthropic) can be configured via `AI_PROVIDER` without modifying business logic.
2. **Third-Party External Submissions**: Applications cannot be submitted directly on Opportunity AI. Students must follow the official source URL to the authoritative portal (e.g. Google, AICTE, Ministry of Education) and manually confirm submission in the tracker.
