import "dotenv/config"; // load .env into process.env before env.ts reads it.
// No-op when .env is absent (platform injects real env) and never overrides
// already-set vars — so it's safe in prod. MUST stay the first import.
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { env } from "./env";

// ── Resident Node runtime ────────────────────────────────────────────────────
// One process serves the tRPC API, the scoped storage proxy, the job callbacks
// and (in prod) the built SPA. This is what `pnpm dev:api` and the Docker image
// run; the Vercel path shares the exact same route table via createApp().
//
// The route table itself lives in ./app.ts so this file is ONLY the listener —
// the piece a serverless host must not have.
const app = createApp();

const port = env.isProd ? env.port : env.apiPort;
serve({ fetch: app.fetch, port });
// eslint-disable-next-line no-console
console.log(`[server] listening on :${port} (${env.isProd ? "prod" : "dev-api"})`);
