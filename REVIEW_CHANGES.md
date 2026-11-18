# Review fixes

- Updated Gemini text model fallback to `gemini-3.5-flash-lite` in service requests.
- Removed obsolete visitor API-key setup instructions from the landing page and setup guide.
- Corrected backend scripts: `npm run dev` (nodemon), `npm start` (node), `npm test` (vitest).
- Excluded secrets, dependency folders, and generated build artifacts from the distributable ZIP.

## Run locally

1. `npm ci` in project root.
2. `cd server && npm ci`; copy `.env.example` to `.env` and set your existing Gemini API key locally.
3. In server: `npm run dev`. In another terminal, project root: `npm run dev`.
4. Check `/api/gemini/models` and submit a custom lesson.

## Pending verification

Browser interaction, speech, embeddings, real-number generation, dependency vulnerability remediation, and production deployment have **not** been verified by this patch.
