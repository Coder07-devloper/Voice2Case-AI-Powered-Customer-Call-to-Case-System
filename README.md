# VOICE2CASE

Voice2Case is a MERN customer-support tool that turns call transcripts (or configured audio recordings) into structured, editable support cases. It keeps a human support agent in charge: AI output is always reviewed before a case is saved.

## Features

- Agent registration/login with bcrypt password hashing and JWT-protected APIs
- Transcript analysis through OpenAI structured JSON output
- OpenAI Whisper audio transcription for MP3, WAV, M4A, and WebM uploads
- Manual case creation when AI is unavailable
- Editable review screen, case IDs, notes, search, filters, sorting, deletion, and status updates
- Database-backed dashboard statistics and insights
- Responsive, accessible light and dark professional UI

## Stack and architecture

React + Vite talks to an Express REST API. Express uses Mongoose/MongoDB for `User`, `SupportCase`, and `Note` documents. AI and transcription are isolated in `server/src/services`, so they can be replaced without changing routes or the UI.

## Setup

1. Install Node.js 20+ and MongoDB locally (or create a MongoDB Atlas cluster).
2. Copy `.env.example` into `server/.env`, set a strong `JWT_SECRET`, and update `MONGODB_URI`.
3. Optionally add `AI_API_KEY` to enable AI analysis and transcription. The app supports OpenAI (`gpt-4o-mini` / `whisper-1`) or Groq (`openai/gpt-oss-20b` / `whisper-large-v3-turbo`). Set `AI_PROVIDER` to `openai` or `groq`. The app still permits manual transcript-to-case entry without it.
4. Copy the client configuration line from `.env.example` into `client/.env` if your API is not at its default URL.
5. Run `npm run install:all`, then `npm run seed`, then `npm run dev`.

Open `http://localhost:5173`. The health endpoint is `http://localhost:5000/api/health`.

### Demo agent

`agent@voice2case.demo` / `Agent123!` (seed/development only; do not use this account or password in production).

## Key API endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/cases`, `GET|PATCH|DELETE /api/cases/:caseId`
- `GET|POST /api/cases/:caseId/notes`, `GET /api/cases/stats`
- `POST /api/ai/analyze`, `POST /api/ai/transcribe`
- `GET /api/health`

## Deployment

Deploy the client to Vercel and server to Render, point `VITE_API_URL` to the deployed `/api` URL, set `CLIENT_URL` to the Vercel origin, and use MongoDB Atlas for `MONGODB_URI`. Add all environment variables in each platform’s dashboard; never commit `.env` files.

## Screenshots

Run the application locally and add screenshots here if desired.
