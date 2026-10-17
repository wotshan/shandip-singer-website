// ── Ambient declaration for the generated Vercel function bundle ──────────────
//
// `api/index.ts` re-exports the server bundle produced by
// `pnpm build:api:vercel` (scripts/build-vercel-fn.mjs) at dist/vercel/index.js.
// That file is a BUILD ARTIFACT: it does not exist in a fresh checkout, so
// `pnpm typecheck` (which CI runs before any build) cannot resolve the import
// and fails with
//     api/index.ts(32,23): error TS2307: Cannot find module '../dist/vercel/index.js'
//
// This wildcard ambient module gives the bundle the shape api/index.ts
// re-exports, so typecheck passes without committing build output.
declare module "*/dist/vercel/index.js" {
  /** Vercel's Web-standard function signature (named export, not default). */
  export const fetch: (request: Request) => Response | Promise<Response>;
}
