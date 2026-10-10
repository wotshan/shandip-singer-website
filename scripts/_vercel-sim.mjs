// TEMPORARY verification harness for the Vercel serverless entry.
//
// `vercel build` needs an authenticated token (browser login), which this
// sandbox cannot do. So this simulates the same thing Vercel does — bundle the
// `api/` function and RUN it over real HTTP — to prove the serverless entry has
// no broken imports and actually serves the app. Deleted before commit.
import http from "node:http";
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Inside the app tree on purpose: `packages: "external"` leaves
// `@hono/node-server` etc. resolved at runtime, so the bundle must sit where
// node_modules is reachable (exactly like Vercel, which keeps node_modules).
const OUT_DIR = "./.vercel-sim";

// 1. Bundle exactly as a Vercel Node function would (external node_modules).
mkdirSync(OUT_DIR, { recursive: true });
const bundle = spawnSync(
  "npx",
  ["esbuild", "api/index.ts", "--bundle", "--platform=node", "--format=esm",
   "--packages=external", `--outfile=${OUT_DIR}/index.mjs`],
  { encoding: "utf8", cwd: process.cwd() },
);
console.log("── bundle stderr ──");
console.log((bundle.stderr || "").trim() || "(clean)");
if (!existsSync(`${OUT_DIR}/index.mjs`)) {
  console.log("BUNDLE_RESULT=FAIL (no output file)");
  process.exit(1);
}
console.log("BUNDLE_RESULT=OK");

// 2. Import the bundled function and serve it over real HTTP.
const mod = await import(pathToFileURL(`${OUT_DIR}/index.mjs`).href);
const handler = mod.default;
console.log("HANDLER_TYPE=" + typeof handler);

const server = http.createServer(handler);
await new Promise((r) => server.listen(0, r));
const { port } = server.address();

async function probe(path, expect) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`);
  const ct = res.headers.get("content-type") ?? "";
  const body = await res.text();
  const head = body.slice(0, 90).replace(/\s+/g, " ");
  console.log(`${path} → ${res.status} [${ct.split(";")[0]}] ${head}`);
  return res.status === expect;
}

const results = {
  "/health": await probe("/health", 200),
  "/api/health": await probe("/api/health", 200),
  // tRPC mount must be handled by the API (JSON error), NOT swallowed by the
  // SPA fallback (which would return the HTML shell). Proves path routing.
  "/trpc/nope": await probe("/trpc/nope", 404),
  "/api/trpc/nope": await probe("/api/trpc/nope", 404),
  // A client route must fall through to the built SPA (index.html).
  "/gallery": await probe("/gallery", 200),
};

server.close();

// /trpc returning the SPA would be an HTML 200; assert it did not.
const trpcRes = await fetch(`http://127.0.0.1:1/x`).catch(() => null);
void trpcRes;

console.log("── RESULT ──");
const allOk = Object.values(results).every(Boolean);
console.log(JSON.stringify(results));
console.log(allOk ? "VERCEL_FUNCTION_SIM=PASS" : "VERCEL_FUNCTION_SIM=FAIL");
process.exit(allOk ? 0 : 1);
