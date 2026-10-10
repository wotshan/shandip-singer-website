import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

// The ONE place the runtime touches the filesystem (DESIGN §5.1). In prod the
// single Hono process serves the built SPA from dist/public + an index.html
// SPA fallback. In dev this is a no-op: Vite owns the client on PORT and proxies
// API calls here. Swapping this shim (e.g. edge Static Assets) is all it takes
// to move off Node — business code never reads fs.
//
// PATH RESOLUTION IS CWD-INDEPENDENT. `root` is derived from the MODULE location
// (import.meta.dirname), then walked up to the app root, so the SPA is found
// whether the process started from the app root (Cloud Run sets WORKDIR /app) or
// from anywhere else. The previous relative "./dist/public" assumed cwd === app
// root; a host that starts the process elsewhere would then 404 every asset.
// Walk up until package.json is found, falling back to the historical relative
// path so behaviour is never worse than before.
const PUBLIC_DIR = resolvePublicDir();

function resolvePublicDir(): string {
  let dir = import.meta.dirname; // …/server/_core
  for (let i = 0; i < 6; i++) {
    // package.json marks the app root; PUBLIC_DIR itself is never the root.
    if (existsSync(path.join(dir, "package.json"))) {
      return path.join(dir, "dist", "public");
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve("dist/public");
}

export function mountClient(app: Hono): void {
  if (!env.isProd) return;
  app.use("/*", serveStatic({ root: PUBLIC_DIR }));
  app.get("*", async (c) => {
    const html = await readFile(path.join(PUBLIC_DIR, "index.html"), "utf-8");
    return c.html(html);
  });
}
