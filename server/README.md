# FixMyBusiness — Server

Node.js / Express / MongoDB API for the FixMyBusiness AI business advisor.

## Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, GROQ_API_KEY, GROQ_MODEL
npm run dev
```

Server starts on `http://localhost:5000` by default.
Check it's alive: `GET http://localhost:5000/api/health`

## Structure

```
src/
├── config/       # env loading, database connection
├── controllers/  # request handlers (Phase 2+)
├── middleware/   # auth, error handling
├── models/       # Mongoose schemas (Phase 2+)
├── routes/       # Express routers
├── services/     # Groq AI integration, business logic (Phase 4+)
├── validators/   # Zod schemas (Phase 2+)
├── utils/        # ApiError, asyncHandler, etc.
├── app.js        # Express app assembly
└── server.js     # entry point
```

See the root `README.md` for the full product overview and complete setup guide.
