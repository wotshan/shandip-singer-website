// ── Bundle the Vercel serverless function into ONE self-contained ESM file ────
//
// WHY THIS EXISTS. Vercel's Node.js runtime resolves ESM import specifiers
// literally. The server source uses extensionless relative imports
// ("../routers", "./context", "./_core/app"), which Node cannot resolve after the
// files are copied to /var/task — the function then dies at import time with
//     Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/_core/app'
// and every request answers 500 FUNCTION_INVOCATION_FAILED. That is exactly the
// admin-dashboard sign-in failure this build step fixes.
//
// Bundling inlines every server/** + shared/** + drizzle/** module into
// dist/vercel/index.js, so the only specifiers left are bare package names.
//
// `packages: "external"` keeps node_modules OUT of the bundle; @vercel/nft then
// traces and copies exactly the packages that are actually imported (hono,
// @hono/node-server, @hono/trpc-server, @trpc/server, drizzle-orm, pg,
// @neondatabase/serverless, jose, bcryptjs, superjson, zod).
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/vercel-entry.ts"],
  bundle: true,
  platform: "node",
  packages: "external", // keep node_modules external; traced + installed at runtime
  format: "esm",
  outfile: "dist/vercel/index.js",
  logLevel: "info",
});
