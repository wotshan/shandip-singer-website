// ── Vercel Serverless Function entry (bundled) ────────────────────────────────
//
// This module is the esbuild ENTRY for the Vercel function bundle
// (scripts/build-vercel-fn.mjs → dist/vercel/index.js). `api/index.ts` re-exports
// its default, so Vercel still detects the function at the conventional path.
//
// WHY A BUNDLE IS REQUIRED ON VERCEL. The Node.js runtime resolves ESM import
// specifiers LITERALLY — it does not do TypeScript-style extension guessing. The
// server source uses extensionless relative imports throughout ("../routers",
// "./context", "./_core/app"), which is fine for tsx/vite/esbuild but fatal once
// Vercel copies the files into /var/task: the function dies at import time with
//     Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/app'
// and every request answers 500 FUNCTION_INVOCATION_FAILED. esbuild inlines all
// server/** + shared/** + drizzle/** modules into ONE file, so the only remaining
// specifiers are bare package names that resolve from node_modules.
//
// WHY THE WEB SIGNATURE, NOT @hono/node-server. The first version of this file
// exported `getRequestListener(app.fetch)` — a Node `(req, res)` listener. That
// served every route correctly EXCEPT that the session cookie never reached the
// browser: @hono/node-server's buildOutgoingHttpHeaders() hands `set-cookie` to
// `res.writeHead()` as an ARRAY, and Vercel's Node runtime shim drops
// array-valued `set-cookie`, so admin login returned 200 with a valid user object
// but no Set-Cookie header — the dashboard then bounced straight back to the
// sign-in screen. Hono's own Vercel adapter returns a Web `(Request) => Response`
// handler instead; Vercel handles that Response natively and preserves
// `set-cookie` (including the multiple cookies logout emits).
import { handle } from "hono/vercel";
import { createApp } from "./_core/app";

const app = createApp();

export default handle(app);
