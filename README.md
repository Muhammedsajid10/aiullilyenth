# AI ഉള്ളിൽ എന്താണ്? · AI Ullil Enthaanu?

A Malayalam-first interactive learning application that helps children understand Large Language Models (LLMs) through visual explanations, hands-on activities, and AI-powered lessons.

## Features

- Malayalam and English learning interface
- Interactive five-step LLM learning experience
- Tokenization, word vectors, attention, and next-word prediction demonstrations
- Gemini-powered custom lessons
- Gemini text-to-speech with WAV audio playback
- Browser-based speech narration
- Real token counts and word embeddings
- Mobile-responsive interface and light/dark themes
- Offline access to built-in lessons after caching

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS

**Backend:** Node.js, Express, Zod

**AI:** Google Gemini API using @google/genai

**Testing:** Vitest, Supertest

## Local Setup

Requires Node.js 22.12+ and npm.

### Frontend

```bash
npm ci
npm run dev
```

### Backend

Open another terminal:

```bash
cd server
npm ci
```

Create `server/.env` using `server/.env.example` as a template:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_TEXT_MODEL=gemini-3.5-flash-lite
GEMINI_SPEECH_MODEL=gemini-3.8-flash-tts
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The frontend uses Vite's development proxy to access the backend at `http://localhost:5000`.

Never commit your real API key or `.env` file.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/health | Backend health check |
| GET | /api/gemini/models | Available Gemini models |
| POST | /api/gemini/explain | Malayalam explanation |
| POST | /api/gemini/lesson | Generate structured lessons |
| POST | /api/gemini/speech | Generate speech audio |
| POST | /api/gemini/real-numbers | Token counts and embeddings |

The Gemini API key stays on the backend. Visitors do not need to enter their own keys.

## How It Works

1. Choose a built-in lesson or enter a sentence.
2. Explore teaching tokens.
3. Inspect illustrative word vectors.
4. Visualize attention calculations.
5. Explore next-word predictions.

The educational visualizations use simplified mathematical examples. They do not reveal actual internal model computations.

## Testing

From the project root:

```bash
npm test -- --run
npx tsc --noEmit
npm run build
```

Latest local verification: 57 tests passed across 7 test files, TypeScript checks passed, and the production build completed successfully.

## Deployment

### Backend — Render

- Root directory: `server`
- Build command: `npm ci`
- Start command: `npm start`
- Add `GEMINI_API_KEY` as a private environment variable.
- Configure `CORS_ORIGINS` for the production frontend origin if needed.
- Verify the deployed `/api/health` endpoint.

### Frontend — Vercel

- Framework: Vite
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`

**Important:** Frontend requests currently use relative `/api/...` paths. Production hosting requires a rewrite/proxy to the backend or an appropriate API base URL implementation. Vite's development proxy does not apply in production.

Do not expose the Gemini API key through frontend environment variables.

## Security Notes

- Server-managed Gemini API key
- Input validation with Zod
- API rate limiting
- Child-appropriate content checks
- No user accounts or authentication

Before public launch, review API abuse prevention, quotas, and costs.

## Credits

Based on the original AI Ullil Enthaanu project by [SajadYoosuf](https://github.com/SajadYoosuf).

This version includes backend-managed Gemini integration, speech generation improvements, and application reliability fixes.

Research references: [SOURCES.md](SOURCES.md).

## Documentation

- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Gemini Speech Generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- [Research and Teaching Scope](SOURCES.md)
