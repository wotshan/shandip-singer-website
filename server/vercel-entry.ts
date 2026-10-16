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
// The listener is created here (not in server/_core/index.ts) because that file
// calls serve() and opens a port — something a serverless runtime must not do.
import { getRequestListener } from "@hono/node-server";
import { createApp } from "./_core/app";

const app = createApp();

export default getRequestListener(app.fetch);
