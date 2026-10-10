// ── Vercel Serverless Function entry ─────────────────────────────────────────
//
// Every file under `api/` is deployed by Vercel as a Function. This one serves
// the whole backend (tRPC + /app-storage + job callbacks + the SPA fallback):
// `vercel.json` routes /trpc, /app-storage and the SPA fallback here.
//
// WHY A NODE LISTENER AND NOT THE HONO DEFAULT EXPORT. Vercel detects a Hono
// `export default app` only when the file is named server.ts / src/server.ts.
// Our server/ directory is the app's own source tree, and re-exporting from
// `server.ts` at the root would shadow the `server/` directory during module
// resolution — a real conflict, not a hypothetical one. Exporting a Node
// request listener instead is Vercel's other documented signature for the
// Node.js runtime, and `getRequestListener` is @hono/node-server's own adapter
// (the same one its `serve()` uses internally), so runtime behaviour is
// identical to the Docker/Cloud Run path.
//
// PATH PRESERVATION: Vercel forwards the ORIGINAL request path to the function,
// so createApp() still sees `/trpc/...` and `/app-storage/...`. The app also
// mounts those handlers under `/api/...` (server/_core/app.ts), so the backend
// keeps working even if a host ever delivers the mount prefix too.
//
// WHAT DOES NOT WORK HERE (deliberate, documented in the README):
//   • In-memory state does not persist between invocations. The admin login
//     rate-limiter (server/admin.ts) is an in-process Map, so on Vercel it is
//     per-instance and best-effort rather than a hard global limit.
//   • Background timers / long-running processes cannot survive a response.
//     Anything scheduled must use the platform job callback, not setInterval.
//   • The filesystem is read-only apart from /tmp, and /tmp is per-instance.
//     That is why the SPA is read from the bundled build output, never written.
import { getRequestListener } from "@hono/node-server";
import { createApp } from "../server/_core/app";

const app = createApp();

export default getRequestListener(app.fetch);
