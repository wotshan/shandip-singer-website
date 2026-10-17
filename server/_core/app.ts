// ── Application factory (transport-agnostic) ──────────────────────────────────
//
// This is the ONE place the route table is defined. Two runtimes serve the exact
// same app instance so dev, Docker and Vercel cannot drift apart:
//
//   • server/_core/index.ts → a resident Node process (@hono/node-server).
//                             Used by `pnpm dev:api` and the Dockerfile/Cloud Run.
//   • api/index.ts          → a Vercel Serverless Function (Node.js runtime).
//
// Nothing here touches the filesystem or opens a listener: those are the two
// things a serverless runtime must NOT do at import time. The listener lives in
// index.ts; the SPA read lives behind mountClient() (prod-only).
import { Hono } from "hono";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveAppStorage } from "./storage";
import { getJob } from "./jobs";
import { mountClient } from "./serve";

/** JSON health probe, the one shape both hosts answer. */
const health = (c: Context) => c.json({ ok: true });

export function createApp(): Hono {
  const app = new Hono();

  // ── Health ────────────────────────────────────────────────────────────────
  // Served at BOTH paths on purpose. The Node runtime exposes the API at the
  // root (/health); a Vercel Function in `api/` is mounted under /api, so the
  // same handler answers at /api/health there. Advertising both keeps one
  // published URL working under either host without an env-var switch.
  app.get("/health", health);
  app.get("/api/health", health);

  // ── tRPC ──────────────────────────────────────────────────────────────────
  // Mounted under /trpc (Node runtime, and Vercel when its function mount
  // prefix is stripped) AND under /api/trpc (Vercel when the prefix is kept).
  // Both registrations point at the SAME router, so it does not matter which
  // one a given host uses — the client's hard-coded `/trpc` URL resolves either
  // way. This is deliberate insurance against an undocumented difference in how
  // a serverless host forwards the path; it costs one extra middleware mount.
  //
  // WHY THE WRAPPER, NOT `app.use(path, trpc)`. On Vercel's Node.js runtime a
  // bare `app.use(path, trpcServer(...))` mount LOSES the `Set-Cookie` header:
  // the adapter returns `c.body(res.body, res)`, and when Hono's compose assigns
  // that Response via `context.res = res` the cookie never reaches the wire.
  // Admin login then answered 200 with a valid user object but no session
  // cookie, so the dashboard bounced straight back to the sign-in screen.
  // Awaiting the adapter and returning `c.res` instead makes Hono build the
  // final Response from its prepared headers (which DO carry Set-Cookie), and
  // Vercel forwards it — verified end-to-end on the live deployment.
  const trpc = trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createContext(c),
  });
  const trpcMount = async (c: Context) => {
    // The adapter's handler is typed `Promise<void | Response>`; on this mount it
    // always returns the tRPC Response, so narrow it for the header/body reads.
    const res = (await trpc(c, async () => {})) as Response;
    const body = await res.arrayBuffer();
    // Build the final response through Hono's own builder (c.body). Vercel's
    // Node.js runtime forwards Set-Cookie only for a Hono-built response; a raw
    // `new Response(...)` returned from a middleware mount loses it. c.body()
    // starts from Hono's prepared headers, which is where setCookie() wrote the
    // session cookie, so the cookie survives; the adapter's other headers
    // (content-type, vary) are copied over explicitly.
    const out = c.body(body, res.status as ContentfulStatusCode);
    res.headers.forEach((v, k) => {
      if (k.toLowerCase() !== "set-cookie") out.headers.set(k, v);
    });
    return out;
  };
  app.use("/trpc/*", trpcMount);
  app.use("/api/trpc/*", trpcMount);

  // ── Scoped per-app file storage ───────────────────────────────────────────
  // 307 → short-lived signed S3 URL. Registered under the same two prefixes as
  // tRPC so an uploaded image's `/app-storage/<key>` src keeps resolving on
  // whichever host serves it.
  app.all("/app-storage/*", (c) => serveAppStorage(c));
  app.all("/api/app-storage/*", (c) => serveAppStorage(c));

  // ── Platform-signed scheduled-job callback ────────────────────────────────
  // The body runs in THIS app's runtime; the platform only triggers on schedule.
  // Until the platform signature scheme exists we REQUIRE a signature header, so
  // a registered job can never be triggered by an anonymous caller.
  // TODO(§8.4): replace the presence check with real HMAC verification.
  app.post("/api/_jobs/:name", async (c) => {
    const signature = c.req.header("x-platform-signature");
    if (!signature /* || !verifyPlatformSignature(c, signature) */) {
      return c.text("unauthorized (job callback signature required — DESIGN §8.4)", 401);
    }
    const handler = getJob(c.req.param("name"));
    if (!handler) return c.text("no such job", 404);
    try {
      await handler();
      return c.json({ ok: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[jobs] "${c.req.param("name")}" failed`, err);
      return c.text("job failed", 500);
    }
  });

  // ── Client ────────────────────────────────────────────────────────────────
  // Prod serves the built SPA from dist/public (serve.ts is the ONLY runtime fs
  // read); dev is served by Vite, which proxies the API back here.
  mountClient(app);

  return app;
}
