// ── Application factory (transport-agnostic) ─────────────────────────────────
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
import { setCookie } from "hono/cookie";
import { trpcServer } from "@hono/trpc-server";
import { router, publicProcedure } from "./trpc";
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

  // TEMP DEBUG (remove after diagnosis): proves whether the host forwards
  // Set-Cookie from a Web Response at all.
  app.get("/_debug/cookie", (c) => {
    c.header("Set-Cookie", "dbg=1; Path=/; HttpOnly; Secure; SameSite=None");
    return c.json({ ok: true });
  });
  app.get("/_debug/stream", (c) => {
    c.header("Set-Cookie", "dbg2=1; Path=/; HttpOnly; Secure; SameSite=None");
    const stream = new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(new TextEncoder().encode('{"ok":true}'));
        ctrl.close();
      },
    });
    return c.body(stream, 200, { "content-type": "application/json" });
  });
  app.get("/_debug/setcookie", (c) => {
    setCookie(c, "sc", "1", { path: "/", httpOnly: true, secure: true, sameSite: "None", partitioned: true });
    return c.json({ ok: true });
  });
  app.get("/_debug/setcookie-nopart", (c) => {
    setCookie(c, "scn", "1", { path: "/", httpOnly: true, secure: true, sameSite: "None" });
    return c.json({ ok: true });
  });
  app.get("/_debug/trpclike", (c) => {
    setCookie(c, "tl", "1", { path: "/", httpOnly: true, secure: true, sameSite: "None", partitioned: true });
    const r = new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", vary: "trpc-accept, accept" },
    });
    return c.body(r.body, r);
  });
  app.use("/_debug/mw/*", async (c) => {
    setCookie(c, "mw", "1", { path: "/", httpOnly: true, secure: true, sameSite: "None", partitioned: true });
    const r = new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", vary: "trpc-accept, accept" },
    });
    return c.body(r.body, r);
  });
  // Real trpcServer on a debug path: isolates the adapter from the app router.
  const dbgTrpc = trpcServer({
    router: router({
      ping: publicProcedure.mutation(async ({ ctx }) => {
        setCookie(ctx.c, "dt", "1", { path: "/", httpOnly: true, secure: true, sameSite: "None", partitioned: true });
        return { ok: true };
      }),
    }),
    createContext: (_o, c) => ({ c }),
  });
  app.use("/_debug/trpcmw/*", dbgTrpc);
  app.use("/_debug/trpchdr/*", async (c) => {
    await dbgTrpc(c, async () => {});
    const hdrs: Record<string, string> = {};
    c.res.headers.forEach((v, k) => { hdrs[k] = v; });
    return c.json({ sc: c.res.headers.getSetCookie(), hdrs });
  });
  app.use("/_debug/trpcappend/*", async (c) => {
    await dbgTrpc(c, async () => {});
    c.header("Set-Cookie", "ap=1; Path=/; HttpOnly; Secure; SameSite=None", { append: true });
    return c.res;
  });

  // ── tRPC ──────────────────────────────────────────────────────────────────
  // Mounted under /trpc (Node runtime, and Vercel when its function mount
  // prefix is stripped) AND under /api/trpc (Vercel when the prefix is kept).
  // Both registrations point at the SAME router, so it does not matter which
  // one a given host uses — the client's hard-coded `/trpc` URL resolves either
  // way. This is deliberate insurance against an undocumented difference in how
  // a serverless host forwards the path; it costs one extra middleware mount.
  const trpc = trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createContext(c),
  });
  app.use("/trpc/*", trpc);
  app.use("/api/trpc/*", trpc);

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
      return c.text("unauthorized (job callback signature required \u2014 DESIGN \u00a78.4)", 401);
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
