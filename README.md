# FixMyBusiness — AI Business Problem Solver

An AI-powered advisor that helps small-business owners understand their actual
business problems and get a customized, budget-conscious diagnosis and
seven-day action plan — generated per-business by Groq (Llama 3.3 70B), never from
fixed templates or demo data.

## Table of Contents

- [Product Overview](#product-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Authentication Flow](#authentication-flow)
- [AI Workflow](#ai-workflow)
- [Database Models](#database-models)
- [Troubleshooting](#troubleshooting)
- [Deployment Notes](#deployment-notes)
- [Security Notes](#security-notes)
- [Future Improvements](#future-improvements)

## Product Overview

Small-business owners often know *something* is wrong (fewer customers, more
complaints, rising costs) but not exactly *why*, or what to actually do about
it with a limited budget. FixMyBusiness walks an owner through:

1. Setting up a business profile (only the fields they actually know).
2. Describing the exact problem, in their own words.
3. Answering a couple of AI-generated follow-up questions where data is missing.
4. Getting a diagnosis: possible causes (labeled as hypotheses, not facts),
   budget-aware recommendations, explicit assumptions/risks/data gaps, and a
   personalized seven-day action plan.
5. Tracking each day's task to completion with notes.

Every diagnosis is generated live by Groq from the specific business and
problem data submitted — there is no fixed/demo diagnosis and no fixed action
plan template anywhere in the codebase.

## Features

- Email/password auth with JWT, bcrypt-hashed passwords
- Multiple business profiles per user, each with its own category/context
- AI diagnosis scoped to only the data actually provided (no assumed website,
  employees, inventory, etc.)
- Follow-up question loop that refines the diagnosis with new answers
- Seven-day action plan with per-task cost estimate, priority, expected
  output, completion tracking, timestamps, and notes
- Dashboard with real aggregated stats and a progress chart (Recharts)
- Diagnosis history with delete + confirmation
- Fully responsive Bootstrap 5 / React-Bootstrap UI

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, React Router 6, Bootstrap 5,
React-Bootstrap, Lucide React, Axios, Recharts

**Backend:** Node.js, Express, MongoDB + Mongoose, Zod, JWT, bcryptjs, Helmet,
CORS, dotenv

**AI:** Groq — OpenAI-compatible `chat/completions` REST API, `Authorization: Bearer`
header, `response_format: {type: "json_object"}`, response validated with Zod
before it's ever saved or returned to the client

## Folder Structure

```
fixmybusiness/
├── client/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI: Navbar, cards, forms, dialogs
│   │   ├── context/            # AuthContext
│   │   ├── layouts/            # AppLayout (authenticated), PublicLayout
│   │   ├── pages/               # One file per route
│   │   ├── services/           # apiClient + authApi/businessApi/diagnosisApi/dashboardApi
│   │   ├── types/               # Shared TypeScript interfaces
│   │   └── utils/               # formatting helpers
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/              # env loading, MongoDB connection
│   │   ├── controllers/         # request handlers
│   │   ├── middleware/          # requireAuth, error handler
│   │   ├── models/              # User, Business, Diagnosis (Mongoose)
│   │   ├── routes/              # Express routers
│   │   ├── services/            # groq.service.js — the AI integration
│   │   ├── validators/          # Zod schemas (request AND AI response)
│   │   └── utils/                # ApiError, asyncHandler, jwt, password, progress
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod` or a free MongoDB Atlas cluster)
- A Groq API key from [console.groq.com/keys](https://console.groq.com/keys) (free, no credit card required)

### 1. MongoDB

Local:
```bash
mongod --dbpath /path/to/your/data
```
Or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and copy
its connection string.

### 2. Groq API key

Get a free key at https://console.groq.com/keys — no credit card required.
Pick a currently-available model name (check https://console.groq.com/docs/models
for the latest list; `llama-3.3-70b-versatile` is a solid default) — do
**not** hardcode a specific model in code; it's read from `GROQ_MODEL`.

### 3. Server

```bash
cd server
npm install
cp .env.example .env
# edit .env — set MONGODB_URI, JWT_SECRET, GROQ_API_KEY, GROQ_MODEL
npm run dev
```

Verify: `GET http://localhost:5000/api/health` → `{ "status": "ok", ... }`

### 4. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

**`server/.env`**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fixmybusiness
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

## API Routes

**Auth**
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns `{user, token}` |
| POST | `/api/auth/login` | — | Returns `{user, token}` |
| GET | `/api/auth/me` | ✅ | Current user |
| POST | `/api/auth/logout` | ✅ | Stateless — client discards token |

**Businesses** (all ✅ auth required, scoped to owner)
| Method | Route |
|---|---|
| GET | `/api/businesses` |
| POST | `/api/businesses` |
| GET | `/api/businesses/:id` |
| PUT | `/api/businesses/:id` |
| DELETE | `/api/businesses/:id` (cascades to its diagnoses) |

**Diagnoses** (✅ auth required)
| Method | Route |
|---|---|
| POST | `/api/diagnoses` — runs the AI diagnosis, saves result |
| GET | `/api/diagnoses` — history summaries |
| GET | `/api/diagnoses/:id` |
| POST | `/api/diagnoses/:id/follow-up` — submits answers, re-runs the diagnosis |
| DELETE | `/api/diagnoses/:id` |

**Action Plans** (✅ auth required)
| Method | Route |
|---|---|
| GET | `/api/action-plans/:diagnosisId` |
| PATCH | `/api/action-plans/:diagnosisId/tasks/:taskId` — `{completed: boolean}` |
| PATCH | `/api/action-plans/:diagnosisId/tasks/:taskId/notes` — `{notes: string}` |

**Dashboard**
| Method | Route |
|---|---|
| GET | `/api/dashboard/stats` ✅ |

**Health**
| Method | Route |
|---|---|
| GET | `/api/health` |

All errors follow: `{ "message": string, "code": string, "details": string[] }`

## Authentication Flow

1. Register/login returns a JWT (`{sub: userId}`, signed with `JWT_SECRET`).
2. Client stores the token in `localStorage` and attaches
   `Authorization: Bearer <token>` via an Axios interceptor.
3. `requireAuth` middleware verifies the token and sets `req.userId` — **every**
   controller uses `req.userId`, never a client-supplied id, to scope queries.
4. A 401 response (invalid/expired token) triggers an automatic client-side
   logout and redirect to `/login`.

## AI Workflow

1. `POST /api/diagnoses` validates the request with Zod, loads the business
   (ownership-checked), and calls `services/groq.service.js`.
2. `buildUserPrompt()` includes **only** the fields the user actually provided —
   blank optional fields are omitted rather than sent as "N/A", so the model
   doesn't anchor on placeholders. A fixed system instruction (sent as the
   `system` message) forbids generic advice and forces the model to separate
   evidence from assumptions, list follow-up questions where data is missing,
   and respect the stated budget.
3. Groq's OpenAI-compatible `chat/completions` endpoint is called with
   `response_format: {type: "json_object"}`.
4. The raw text response is `JSON.parse`'d, then validated against a strict
   Zod schema (`aiResponse.validator.js`) requiring, among other things,
   **exactly 7** action-plan tasks.
5. If parsing or validation fails at any step, a real `502`/`500` error is
   thrown and logged server-side — the API never falls back to fake or fixed
   data.
6. On success, the validated diagnosis is saved to MongoDB and returned.
7. `POST /api/diagnoses/:id/follow-up` re-runs the same pipeline, additionally
   passing the previous diagnosis summary and the owner's new answers so
   the model can sharpen (not restart) the diagnosis. Already-completed action
   items are preserved by task id where the refined plan reuses them.

## Database Models

**User** — `name`, `email` (unique), `passwordHash` (bcrypt, never returned
by the API), timestamps.

**Business** — `userId`, `name`, `category` (enum), `location`,
`description`, `productsOrServices`, `targetCustomers`, `monthlyBudget`,
`goal`, plus optional `monthlyRevenue`, `customerCount`, `averageOrderValue`,
`websiteUrl`, `socialMediaPresence`, `employeeCount`.

**Diagnosis** — `userId`, `businessId`, problem-submission fields
(`problem`, `problemDuration`, `severity`, `recentChanges`,
`previousAttempts`, `desiredOutcome`, `additionalContext`, `currentMetrics`),
accumulated `answers` map, and the AI output: `summary`, `confidence`,
`possibleCauses[]`, `recommendations[]`, `followUpQuestions[]`,
`dataLimitations[]`, `assumptions[]`, `risks[]`, `actionPlan[]` (exactly 7
embedded tasks with `id`, `day`, `title`, `description`, `priority`,
`estimatedCost`, `expectedOutput`, `completed`, `completedAt`, `notes`), and
`status` (`draft` / `diagnosed` / `in_progress` / `completed`, kept in sync
automatically as tasks are completed).

## Troubleshooting

- **`GROQ_API_KEY or GROQ_MODEL not set` warning at startup** — the server
  runs fine for auth/business CRUD, but any diagnosis request will fail with
  `AI_NOT_CONFIGURED`. Fill in both vars in `server/.env`.
- **`AI_SCHEMA_INVALID` / `AI_INVALID_JSON` errors** — the model returned
  something that didn't match the expected shape. The exact model text is
  logged server-side (`console.error`); the user only sees a safe generic
  message. Usually resolved by retrying, or by checking that `GROQ_MODEL` is
  a real, currently-available model name.
- **CORS errors in the browser console** — make sure `CLIENT_URL` in
  `server/.env` exactly matches the origin your frontend is served from
  (including port).
- **`401 Unauthorized` right after login** — check that `client/.env`'s
  `VITE_API_URL` points at the running server, and that the browser's
  `localStorage` isn't holding a stale token from a previous `JWT_SECRET`.
- **MongoDB connection refused** — confirm `mongod` is running and
  `MONGODB_URI` in `server/.env` is correct; the server exits on failed
  connection rather than starting in a broken state.

## Deployment Notes

- Set `NODE_ENV=production` and use a long, random `JWT_SECRET` in production.
- Point `MONGODB_URI` at a managed cluster (e.g., MongoDB Atlas) rather than a
  local instance.
- Set `CLIENT_URL` to your deployed frontend's exact origin.
- Build the client with `npm run build` (output in `client/dist`) and serve it
  as static files from your host of choice (Vercel, Netlify, Nginx, etc.);
  point its `VITE_API_URL` at your deployed API's `/api` base.
- Run the server behind a process manager (pm2, systemd) or a container;
  `helmet()` is already applied, but put a reverse proxy / TLS in front of it
  for production traffic.
- Never commit `.env` files — only the `.env.example` templates are tracked.

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds); plaintext passwords are
  never logged or stored.
- Every business/diagnosis/action-plan route requires a valid JWT, and every
  query is scoped by `req.userId` taken from the verified token — a
  client-supplied `userId` or `businessId` in the body is never trusted for
  authorization.
- `GROQ_API_KEY` only ever lives on the server; the frontend calls the
  backend, never the AI provider directly.
- All AI responses are validated against a Zod schema before being saved or
  returned — malformed output produces a real, logged error, never fake data.
- Helmet sets standard security headers; CORS is restricted to `CLIENT_URL`.
- Error responses never leak stack traces or internal details to the client.

## Future Improvements

- Profile editing (name/email/password change) on the Settings page
- Refresh tokens / shorter-lived access tokens
- Rate limiting on auth and diagnosis endpoints
- Multi-language support for prompts and UI
- Export a diagnosis + action plan as PDF
- Team accounts (multiple users per business)
