# Cleaning Leads Service

This service provides an HTTP API for running a Playwright-based cleaning script to process leads in the Unity CRM. The default `index.js` is a placeholder; replace it with your actual cleaning script.

- `GET /health` – health check, returns `{ ok: true }`.
- `GET /run?token=TOKEN&pages=5` – runs the cleaning script for a given number of pages. Requires a query param `token` that matches the `RUN_TOKEN` environment variable. Returns the script output.
- `POST /run` – body `{ "pages": 5 }` and header `x-run-token: TOKEN` – runs the script via POST.

To run locally:
1. Install dependencies: `npm install` and `npx playwright install chromium`.
2. Set environment variables `CRM_EMAIL`, `CRM_PASSWORD`, `RUN_TOKEN`, and `PAGES_TO_PROCESS` (optional).
3. Start the server: `npm start`.
4. Hit the `/run` endpoint via GET or POST.

**Note**: Replace the placeholder `index.js` with the real Playwright script to perform the cleaning actions.
