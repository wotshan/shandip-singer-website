// ── Vercel Serverless Function entry ──────────────────────────────────────────
//
// Every file under `api/` is deployed by Vercel as a Function. This one serves
// the whole backend (tRPC + /app-storage + job callbacks + the SPA fallback):
// `vercel.json` routes /trpc, /app-storage and the SPA fallback here.
//
// WHY THIS IS A THIN RE-EXPORT. Vercel's Node.js runtime resolves ESM import
// specifiers LITERALLY — it does not guess extensions the way tsx/vite/esbuild
// do. Importing the server source directly from here ("../server/_core/app")
// therefore worked in dev but died in production with
//     Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/app'
// and every request answered 500 FUNCTION_INVOCATION_FAILED — the admin-dashboard
// sign-in failure this repo fixes.
//
// The server is now BUNDLED into a single self-contained file by
// `pnpm build:api:vercel` (scripts/build-vercel-fn.mjs, entry server/vercel-entry.ts),
// which inlines every server/** + shared/** + drizzle/** module so the only
// remaining specifiers are bare package names that resolve from node_modules.
// This file just re-exports that bundle's default (a Node request listener), so
// Vercel still detects the function at the conventional `api/index.ts` path.
//
// WHAT DOES NOT WORK HERE (deliberate, documented in the README):
//   • In-memory state does not persist between invocations. The admin login
//     rate-limiter (server/admin.ts) is an in-process Map, so on Vercel it is
//     per-instance and best-effort rather than a hard global limit.
//   • Background timers / long-running processes cannot survive a response.
//     Anything scheduled must use the platform job callback, not setInterval.
//   • The filesystem is read-only apart from /tmp, and /tmp is per-instance.
//     That is why the SPA is read from the bundled build output, never written.
// The bundle exports a NAMED `fetch` (Vercel's Web-standard function signature);
// a default export would be treated as `(req, res) => void` and ignored.
export { fetch } from "../dist/vercel/index.js";
