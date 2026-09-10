# Voice2Case

> Turn customer conversations into clear, consistent, and reviewable support cases.

<img width="1348" height="600" alt="Screenshot 2026-09-11 032135" src="https://github.com/user-attachments/assets/81e1f104-3a2c-4ae0-9fe1-927455dcc666" />


live demo → (https://voice2-case-ai-powered-customer-cal.vercel.app/)

Voice2Case is an AI-assisted customer-support documentation platform built with the MERN stack. A support agent can paste a customer conversation or upload a call recording, receive an AI-generated structured case, review every suggestion, make corrections, and save the final case for later management.

The AI assists the agent; it never becomes the final decision-maker.

## Why this project was built

After a support interaction, agents often spend valuable time manually documenting the problem, intent, sentiment, troubleshooting already attempted, urgency, and required follow-up. Manual notes can be incomplete, inconsistent, and difficult to search later.

Voice2Case reduces that administrative work by converting a conversation into a structured support case while keeping the support agent in control. The agent reviews and edits all AI-generated content before anything is saved to the database.

### Primary use case

1. A support agent receives a customer call or transcript.
2. The agent uploads the recording or pastes the conversation.
3. Audio is transcribed when necessary.
4. AI extracts key support information into a structured draft.
5. The agent reviews, edits, and approves the draft.
6. The saved case can be searched, filtered, updated, and annotated with internal notes.

## Key features

### AI-assisted documentation

- Upload valid MP3, WAV, M4A, or WebM support-call recordings.
- Paste transcripts directly when an audio recording is unavailable.
- Groq-powered Whisper transcription for uploaded audio.
- Structured AI extraction of summary, issue, customer intent, category, priority, sentiment, key information, attempted troubleshooting, follow-up, next action, escalation, and requested outcome.
- Safe handling for browser MIME inconsistencies: file extension and binary audio signature are verified before transcription.
- Manual case creation remains available if the AI service is unavailable.

### Human-in-the-loop review

- Full transcript review and editing after audio transcription.
- Every generated case field is editable before saving.
- Re-analyze a corrected transcript when required.
- AI output is stored only after support-agent approval.

### Case management

- Readable IDs such as `V2C-2026-000001`.
- Dashboard counts for total, new, in-review, resolved, high-priority, and follow-up cases.
- MongoDB-backed case insights: common category, negative sentiment, and escalation count.
- Backend search across case ID, issue, intent, summary, category, and transcript.
- Filters for status, priority, category, sentiment, and escalation.
- Newest, oldest, and highest-priority sorting.
- Case editing, status/priority updates, internal notes, and deletion.

### Security and usability

- Agent registration and login with bcrypt password hashing.
- JWT-protected API routes and protected React routes.
- Per-agent case access control.
- Upload size limit, allowed extension/MIME checks, binary signature validation, and temporary file cleanup.
- Responsive professional interface with persistent light and dark themes.
- Helpful loading, empty, error, and success states.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| AI analysis | Groq structured outputs using `openai/gpt-oss-20b` |
| Speech-to-text | Groq `whisper-large-v3-turbo` |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

The AI integration is modular. The code also supports OpenAI-compatible configuration, allowing the provider to be switched through backend environment variables.

## Architecture

```text
React + Vite client
       │
       │ HTTPS / REST API + Bearer JWT
       ▼
Express API on Render
 ├── Authentication middleware
 ├── Case, note, and dashboard controllers
 ├── Audio validation + temporary upload handling
 ├── Transcription service
 └── Structured AI analysis service
       │                         │
       ▼                         ▼
MongoDB Atlas                 Groq APIs
```

## Project structure

```text
Voice2Case/
├── client/                  # React + Vite application
│   └── src/
│       ├── main.jsx          # Routes, pages, UI components
│       ├── api.js            # Authenticated API client
│       └── styles.css         # Responsive light/dark design
├── server/                  # Express API
│   └── src/
│       ├── controllers/      # Auth, case, and AI request handling
│       ├── middleware/       # JWT and error middleware
│       ├── models/           # User, SupportCase, Note schemas
│       ├── routes/           # REST endpoints
│       └── services/         # AI, transcription, upload validation
├── README.md
└── PROJECT_DOCUMENTATION.md
```

## Run locally

### Prerequisites

- Node.js 20 or newer
- MongoDB locally or a MongoDB Atlas cluster
- A Groq API key for transcription and AI analysis (optional for manual case creation)

### 1. Install dependencies

From the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure the backend

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/voice2case
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
AI_MODEL=openai/gpt-oss-20b
TRANSCRIPTION_MODEL=whisper-large-v3-turbo
```

You may use `AI_API_KEY` instead of `GROQ_API_KEY`. Do not define both with different values.

### 3. Configure the frontend (optional locally)

Create `client/.env` only if the API is not running at the default local address:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed demo data and start

```bash
npm run seed
npm run dev
```

Open `http://localhost:5173`.

### Demo account

```text
Email:    agent@voice2case.demo
Password: Agent123!
```

This account is for local/demo use only. Do not use this password in a real production environment.

## Deployment

The live application uses:

- Frontend: [Vercel live demo](https://voice2-case-ai-powered-customer-cal.vercel.app/login)
- Backend: Render
- Database: MongoDB Atlas
- AI: Groq

For deployment, add backend secrets (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`) only in Render. Add only this public build-time value in Vercel:

```env
VITE_API_URL=https://YOUR_RENDER_SERVICE.onrender.com/api
```

Set Render's `CLIENT_URL` to the exact Vercel production URL. Never commit `.env` files, database credentials, API keys, or JWT secrets.

## Future improvements

- Role-based admin dashboard and team-wide case queues
- Pagination UI and exported case reports
- Automated test suite with integration tests
- Audit history for field changes
- Optional secure cloud storage for recordings when retention is required
- Provider-specific analytics and quality evaluation for AI output
