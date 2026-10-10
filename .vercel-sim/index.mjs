var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/index.ts
import { getRequestListener } from "@hono/node-server";

// server/_core/app.ts
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";

// server/routers.ts
import { z } from "zod";
import { TRPCError as TRPCError2 } from "@trpc/server";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var OPAQUE_SERVER_ERROR = "Something went wrong. Please try again.";
var t = initTRPC.context().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code !== "INTERNAL_SERVER_ERROR") return shape;
    console.error("[trpc] unhandled error", error.cause ?? error);
    const { stack: _stack, ...data } = shape.data;
    return { ...shape, message: OPAQUE_SERVER_ERROR, data };
  }
});
var router = t.router;
var middleware = t.middleware;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
var adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// server/_core/auth.ts
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";
import { compare, hash as bcryptHash } from "bcryptjs";
import { eq } from "drizzle-orm";

// server/_core/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleTcp } from "drizzle-orm/node-postgres";
import pg from "pg";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  availabilityDays: () => availabilityDays,
  awards: () => awards,
  collaborations: () => collaborations,
  enquiries: () => enquiries,
  events: () => events,
  fanMessages: () => fanMessages,
  faqs: () => faqs,
  files: () => files,
  galleryItems: () => galleryItems,
  highlights: () => highlights,
  musicItems: () => musicItems,
  occasions: () => occasions,
  pressItems: () => pressItems,
  pressMentions: () => pressMentions,
  siteSettings: () => siteSettings,
  socialLinks: () => socialLinks,
  stats: () => stats,
  subscribers: () => subscribers,
  testimonials: () => testimonials,
  tracks: () => tracks,
  users: () => users,
  videos: () => videos
});
import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  bigint,
  integer,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  // null for SSO-linked users (future)
  name: text("name"),
  role: text("role").notNull().default("user"),
  // 'user' | 'admin'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
var files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Path relative to this app's storage prefix; served at /app-storage/<key>.
    key: text("key").notNull().unique(),
    // Nullable on purpose: a public "contact form with attachment" has no
    // logged-in uploader. set null (not cascade) on user delete — this table is
    // the app's ONLY index of its objects, so deleting the row would
    // permanently lose the ability to find the file.
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    // original filename, for display
    size: bigint("size", { mode: "number" }).notNull(),
    // bigint: integer caps at ~2.1GB
    contentType: text("content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t2) => [index("files_owner_idx").on(t2.ownerId), index("files_created_idx").on(t2.createdAt)]
);
var siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("main"),
  artist: text("artist").notNull().default("Raag Sargam"),
  role: text("role").notNull().default("Professional Singer & Live Performer"),
  tagline: text("tagline").notNull().default(""),
  shortIntro: text("short_intro").notNull().default(""),
  longIntro: text("long_intro").notNull().default(""),
  email: text("email").notNull().default(""),
  phoneDisplay: text("phone_display").notNull().default(""),
  phoneHref: text("phone_href").notNull().default(""),
  whatsappDisplay: text("whatsapp_display").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  cities: text("cities").notNull().default(""),
  travelNote: text("travel_note").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
var socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    // whatsapp | instagram | linktree | discord | linkedin | facebook | email | phone
    label: text("label").notNull(),
    value: text("value").notNull(),
    href: text("href").notNull(),
    handle: text("handle").notNull(),
    // spoken label for icon-only contexts
    external: boolean("external").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("social_links_order_idx").on(t2.sortOrder)]
);
var galleryItems = pgTable(
  "gallery_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    src: text("src").notNull(),
    width: integer("width").notNull().default(1200),
    height: integer("height").notNull().default(1600),
    caption: text("caption").notNull().default(""),
    tag: text("tag").notNull().default(""),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("gallery_items_order_idx").on(t2.sortOrder)]
);
var events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    date: text("date").notNull(),
    // ISO YYYY-MM-DD
    time: text("time").notNull().default(""),
    venue: text("venue").notNull().default(""),
    city: text("city").notNull().default(""),
    status: text("status").notNull().default("Confirmed"),
    // Confirmed | On Hold
    note: text("note"),
    ticketHref: text("ticket_href"),
    // optional real ticket link
    ticketLabel: text("ticket_label"),
    // optional CTA label, e.g. "Get tickets"
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("events_order_idx").on(t2.sortOrder)]
);
var musicItems = pgTable(
  "music_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: text("category").notNull().default(""),
    blurb: text("blurb").notNull().default(""),
    href: text("href"),
    // optional real streaming link
    linkLabel: text("link_label"),
    // optional label for that link
    duration: text("duration"),
    // optional
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("music_items_order_idx").on(t2.sortOrder)]
);
var occasions = pgTable(
  "occasions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    blurb: text("blurb").notNull().default(""),
    includes: jsonb("includes").$type().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("occasions_order_idx").on(t2.sortOrder)]
);
var testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quote: text("quote").notNull(),
    author: text("author").notNull().default(""),
    context: text("context").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("testimonials_order_idx").on(t2.sortOrder)]
);
var availabilityDays = pgTable(
  "availability_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: text("date").notNull().unique(),
    // ISO YYYY-MM-DD
    status: text("status").notNull().default("AVAILABLE"),
    // AVAILABLE | TENTATIVE | BOOKED | UNAVAILABLE
    note: text("note")
  },
  (t2) => [index("availability_days_date_idx").on(t2.date)]
);
var enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    contact: text("contact").notNull(),
    email: text("email"),
    eventType: text("event_type").notNull().default(""),
    eventDate: text("event_date"),
    city: text("city").notNull().default(""),
    venue: text("venue").notNull().default(""),
    budget: text("budget").notNull().default(""),
    message: text("message"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t2) => [index("enquiries_created_idx").on(t2.createdAt)]
);
var awards = pgTable(
  "awards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    organisation: text("organisation").notNull().default(""),
    year: text("year").notNull().default(""),
    description: text("description").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("awards_order_idx").on(t2.sortOrder)]
);
var pressItems = pgTable(
  "press_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    outlet: text("outlet").notNull(),
    headline: text("headline").notNull().default(""),
    quote: text("quote").notNull().default(""),
    date: text("date").notNull().default(""),
    href: text("href"),
    // optional real article link
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("press_items_order_idx").on(t2.sortOrder)]
);
var collaborations = pgTable(
  "collaborations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brand: text("brand").notNull(),
    role: text("role").notNull().default(""),
    description: text("description").notNull().default(""),
    year: text("year").notNull().default(""),
    href: text("href"),
    // optional real link
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("collaborations_order_idx").on(t2.sortOrder)]
);
var stats = pgTable(
  "stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    value: integer("value").notNull().default(0),
    suffix: text("suffix").notNull().default(""),
    // e.g. "+", "K"
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("stats_order_idx").on(t2.sortOrder)]
);
var highlights = pgTable(
  "highlights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    src: text("src").notNull(),
    caption: text("caption").notNull().default(""),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("highlights_order_idx").on(t2.sortOrder)]
);
var fanMessages = pgTable(
  "fan_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    message: text("message").notNull(),
    author: text("author").notNull().default(""),
    city: text("city").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("fan_messages_order_idx").on(t2.sortOrder)]
);
var subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (t2) => [index("subscribers_created_idx").on(t2.createdAt)]
);
var pressMentions = pgTable(
  "press_mentions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    href: text("href"),
    // optional real link
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("press_mentions_order_idx").on(t2.sortOrder)]
);
var tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    artist: text("artist").notNull().default(""),
    src: text("src").notNull(),
    // audio file URL (or /app-storage/... key)
    cover: text("cover"),
    // optional album art
    duration: text("duration"),
    // optional, e.g. "3:42"
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("tracks_order_idx").on(t2.sortOrder)]
);
var videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    embedUrl: text("embed_url").notNull(),
    poster: text("poster"),
    // optional thumbnail
    caption: text("caption").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("videos_order_idx").on(t2.sortOrder)]
);
var faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull().default(0)
  },
  (t2) => [index("faqs_order_idx").on(t2.sortOrder)]
);

// server/_core/env.ts
function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
var isProd = process.env.NODE_ENV === "production";
var RESERVED_ENV_KEYS = /* @__PURE__ */ new Set([
  "DATABASE_URL",
  "DB_DRIVER",
  "DB_POOL_MAX",
  "JWT_SECRET",
  "AUTH_PROVIDER",
  "APP_SLUG",
  "APP_STORAGE_PRESIGN_URL",
  "APP_STORAGE_TOKEN",
  "NODE_ENV",
  "PORT",
  "API_PORT"
]);
var SETTINGS_HINT = `Add it in Settings \u2192 Environment variables (${isProd ? "prod" : "dev"})`;
function userVar(name) {
  if (RESERVED_ENV_KEYS.has(name)) {
    throw new Error(
      `${name} is a platform variable \u2014 read it from env.* instead of env.config/env.secret`
    );
  }
  return process.env[name];
}
var env = {
  isProd,
  databaseUrl: required("DATABASE_URL"),
  // DB driver select (see db.ts). "tcp" = node-postgres pool (default, portable,
  // right for a resident process); "http" = Neon serverless HTTP (Neon DSN +
  // scale-to-zero only). Absent ⇒ "tcp" so the template works on any Postgres.
  dbDriver: process.env.DB_DRIVER ?? "tcp",
  // Max TCP connections this app's pool may hold. Only the "tcp" driver has a
  // pool; "http" opens a connection per request and ignores this.
  //
  // 5, not node-postgres' default of 10: that default suits an app that owns its
  // database server. On the platform every app gets its own database on ONE
  // SHARED cluster, so the number that matters is (apps under active iteration
  // x max), and a handful of idle-but-open pools can exhaust the cluster's
  // connection slots long before any single app needs ten.
  //
  // `|| 5` also catches a non-numeric value: `Number("八")` is NaN, and a pool
  // built with max: NaN is a subtle production fault rather than a startup error.
  dbPoolMax: Math.max(1, Number(process.env.DB_POOL_MAX) || 5),
  jwtSecret: required("JWT_SECRET"),
  authProvider: process.env.AUTH_PROVIDER ?? "local",
  appSlug: process.env.APP_SLUG ?? "app",
  port: Number(process.env.PORT ?? 3e3),
  apiPort: Number(process.env.API_PORT ?? 3001),
  storage: {
    presignUrl: process.env.APP_STORAGE_PRESIGN_URL ?? "",
    token: process.env.APP_STORAGE_TOKEN ?? ""
  },
  /**
   * A user-supplied, PLAINTEXT configuration value set in the settings panel.
   * Pass `fallback` when a sensible default exists.
   *
   * Call this where you use the value, not at module top level — a top-level
   * call would let one unset variable take down the whole app, including
   * every page that does not need it.
   */
  config(name, fallback) {
    const v = userVar(name);
    if (v === void 0 || v === "") {
      if (fallback !== void 0) return fallback;
      throw new Error(`Missing configuration: ${name}. ${SETTINGS_HINT}.`);
    }
    return v;
  },
  /**
   * A user-supplied SECRET set in the settings panel.
   *
   * Deliberately no `fallback` parameter: a secret with a default is
   * self-contradictory — falling back to a fake key would only turn "no key
   * configured" into "the third party returned 401", moving the failure as
   * far from its cause as possible.
   */
  secret(name) {
    const v = userVar(name);
    if (!v) {
      throw new Error(`Missing secret: ${name}. ${SETTINGS_HINT}.`);
    }
    return v;
  }
};

// server/_core/db.ts
function makeTcp() {
  const pool = new pg.Pool({
    connectionString: env.databaseUrl,
    max: env.dbPoolMax,
    connectionTimeoutMillis: 1e4,
    idleTimeoutMillis: 3e4,
    query_timeout: 2e4,
    statement_timeout: 2e4
  });
  pool.on("error", (err) => console.error("[db] idle client error", err));
  return drizzleTcp(pool, { schema: schema_exports });
}
var driver = env.dbDriver === "http" ? drizzleHttp(neon(env.databaseUrl), { schema: schema_exports }) : makeTcp();
var db = driver;

// shared/constants.ts
function sessionCookieName(slug) {
  return `app_session_${slug}`;
}

// server/_core/session-cookie.ts
var SESSION_MAX_AGE = 60 * 60 * 24 * 30;
var HTTPS_HOST_SUFFIXES = [
  ".teamily.run",
  ".chainopera.run",
  // Retired apps roots, kept while anything may still answer on them:
  // chainopera.io still resolves; teamily.site is under a registry serverHold.
  ".chainopera.io"
];
function sessionCookieOptions(https) {
  if (https) {
    return {
      httpOnly: true,
      path: "/",
      maxAge: SESSION_MAX_AGE,
      sameSite: "None",
      secure: true,
      partitioned: true
      // Hono 会写成 ; Partitioned
    };
  }
  return {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "Lax",
    secure: false
  };
}
function sessionCookieClearOptions() {
  return [
    { path: "/", sameSite: "None", secure: true, partitioned: true },
    { path: "/", sameSite: "None", secure: true },
    { path: "/", sameSite: "Lax", secure: true },
    { path: "/", sameSite: "Lax", secure: false }
  ];
}
function requestIsSecure(c) {
  if (urlIsHttps(c.req.url)) return true;
  const forwardedHost = firstHop(c.req.header("x-forwarded-host"));
  const host = firstHop(c.req.header("host"));
  if (hostIsHttpsApp(forwardedHost) || hostIsHttpsApp(host)) return true;
  if (firstHop(c.req.header("x-forwarded-proto"))?.toLowerCase() === "https") return true;
  if ((c.req.header("x-forwarded-ssl") ?? "").trim().toLowerCase() === "on") return true;
  if (urlIsHttps(c.req.header("origin")) || urlIsHttps(c.req.header("referer"))) return true;
  return false;
}
function firstHop(raw) {
  const hop = raw?.split(",")[0]?.trim();
  return hop || void 0;
}
function hostIsHttpsApp(host) {
  if (!host) return false;
  const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";
  return HTTPS_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}
function urlIsHttps(raw) {
  if (!raw || !raw.includes("://")) return false;
  try {
    return new URL(raw).protocol === "https:";
  } catch {
    return false;
  }
}

// server/_core/auth.ts
var COOKIE = sessionCookieName(env.appSlug);
var secretKey = new TextEncoder().encode(env.jwtSecret);
function toSessionUser(row) {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}
var LocalAuthProvider = class {
  async getSession(c) {
    const token = getCookie(c, COOKIE);
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const userId = payload.sub;
      if (!userId) return null;
      const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return row ? toSessionUser(row) : null;
    } catch {
      return null;
    }
  }
  async login(c, email, password) {
    const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    const hash = row?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
    const ok = await compare(password, hash);
    if (!row || !row.passwordHash || !ok) throw new AuthError("Invalid email or password");
    await this.#setSession(c, row.id);
    return toSessionUser(row);
  }
  async logout(c) {
    for (const opt of sessionCookieClearOptions()) {
      deleteCookie(c, COOKIE, opt);
    }
  }
  async #setSession(c, userId) {
    const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("30d").sign(secretKey);
    setCookie(c, COOKIE, token, sessionCookieOptions(env.isProd || requestIsSecure(c)));
  }
};
var SsoAuthProvider = class {
  async getSession() {
    throw new Error("SsoAuthProvider not implemented (reserved seam \u2014 DESIGN \xA75.1).");
  }
  async login() {
    throw new Error("SsoAuthProvider not implemented (reserved seam \u2014 DESIGN \xA75.1).");
  }
  async logout() {
    throw new Error("SsoAuthProvider not implemented (reserved seam \u2014 DESIGN \xA75.1).");
  }
};
var AuthError = class extends Error {
};
var _provider;
function authProvider() {
  if (!_provider) _provider = env.authProvider === "sso" ? new SsoAuthProvider() : new LocalAuthProvider();
  return _provider;
}

// server/_core/storage.ts
import { and, count, desc, eq as eq2, isNull } from "drizzle-orm";
var StorageError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "StorageError";
  }
  code;
};
function canonicalKey(relKey) {
  const stripped = relKey.replace(/^\/+/, "");
  if (!stripped) throw new StorageError("empty storage key", "forbidden");
  for (const segment of stripped.split("/")) {
    if (segment === "" || segment === "." || segment === "..") {
      throw new StorageError(`unsafe storage key (diverges from platform normalization): ${relKey}`, "forbidden");
    }
  }
  return stripped;
}
async function callStorage(op, path2, contentType) {
  if (!env.storage.presignUrl || !env.storage.token) {
    throw new StorageError(
      "App storage not configured (APP_STORAGE_PRESIGN_URL / APP_STORAGE_TOKEN).",
      "not_configured"
    );
  }
  const res = await fetch(env.storage.presignUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${env.storage.token}` },
    body: JSON.stringify({ op, path: path2, contentType })
  });
  if (res.status === 404) throw new StorageError(`no such object: ${path2}`, "not_found");
  if (!res.ok) throw new StorageError(`storage ${op} failed: ${res.status}`, "failed");
  const body = await res.json();
  if (typeof body.path === "string" && body.path !== path2) {
    throw new StorageError(
      `storage key normalization disagrees with the platform: sent ${path2}, platform used ${body.path}`,
      "forbidden"
    );
  }
  return body;
}
async function storageGet(relKey) {
  const [row] = await db.select().from(files).where(eq2(files.key, canonicalKey(relKey))).limit(1);
  return row ?? null;
}
async function assertNotOwnedByOther(relKey, ownerId) {
  if (!ownerId) return;
  const existing = await storageGet(relKey);
  if (existing?.ownerId && existing.ownerId !== ownerId) {
    throw new StorageError(`key already owned by another user: ${canonicalKey(relKey)}`, "forbidden");
  }
}
async function storageCommit(relKey, opts = {}) {
  const key = canonicalKey(relKey);
  await assertNotOwnedByOther(key, opts.ownerId);
  const meta = await callStorage("head", key);
  const values = {
    key,
    ownerId: opts.ownerId ?? null,
    name: opts.name ?? key.split("/").pop() ?? key,
    size: meta.size,
    contentType: meta.contentType
  };
  const [row] = await db.insert(files).values(values).onConflictDoUpdate({
    target: files.key,
    set: { name: values.name, size: values.size, contentType: values.contentType }
  }).returning();
  return row;
}
var MAX_LIMIT = 200;
function page(opts) {
  return {
    limit: Math.max(1, Math.min(opts.limit ?? 50, MAX_LIMIT)),
    offset: Math.max(0, opts.offset ?? 0)
  };
}
async function storageListByOwner(ownerId, opts = {}) {
  const { limit, offset } = page(opts);
  return db.select().from(files).where(eq2(files.ownerId, ownerId)).orderBy(desc(files.createdAt)).limit(limit).offset(offset);
}
async function deleteRowThenObject(key, where) {
  const removed = await db.delete(files).where(where).returning();
  if (removed.length === 0) return false;
  await callStorage("delete", key);
  return true;
}
async function storageDeleteOwned(ownerId, relKey) {
  const key = canonicalKey(relKey);
  return deleteRowThenObject(key, and(eq2(files.key, key), eq2(files.ownerId, ownerId)));
}
async function storagePutUrl(relKey, contentType, opts = {}) {
  const key = canonicalKey(relKey);
  await assertNotOwnedByOther(key, opts.ownerId);
  const { url } = await callStorage("put", key, contentType);
  return { uploadUrl: url, publicPath: `/app-storage/${key}` };
}
async function serveAppStorage(c) {
  const raw = c.req.path.replace(/^\/app-storage\//, "");
  try {
    const key = canonicalKey(raw);
    const { url } = await callStorage("get", key);
    c.header("Cache-Control", "no-store");
    return c.redirect(url, 307);
  } catch {
    return c.text("Not found", 404);
  }
}

// server/admin.ts
import { eq as eq3 } from "drizzle-orm";
var ADMIN_USERNAME = "shanislive";
var ADMIN_NAME = "Raag Sargam";
var ADMIN_PASSWORD_HASH = "$2b$10$8LjdTxB8h7x1DyQ8PEjmmezfbMoZFI10PyjxF9U0sSaFM0XluZ3P.";
async function ensureAdminUser() {
  const [existing] = await db.select().from(users).where(eq3(users.email, ADMIN_USERNAME)).limit(1);
  if (existing) {
    if (existing.role !== "admin" || existing.passwordHash !== ADMIN_PASSWORD_HASH || existing.name !== ADMIN_NAME) {
      await db.update(users).set({ role: "admin", passwordHash: ADMIN_PASSWORD_HASH, name: ADMIN_NAME }).where(eq3(users.id, existing.id));
    }
    return;
  }
  await db.insert(users).values({
    email: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD_HASH,
    name: ADMIN_NAME,
    role: "admin"
  });
}
var WINDOW_MS = 15 * 60 * 1e3;
var MAX_ATTEMPTS = 5;
var attempts = /* @__PURE__ */ new Map();
function rateLimit(key) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t2) => now - t2 < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    const oldest = recent[0] ?? now;
    attempts.set(key, recent);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1e3)) };
  }
  recent.push(now);
  attempts.set(key, recent);
  return { ok: true };
}
function clearRateLimit(key) {
  attempts.delete(key);
}

// server/db.ts
import { asc, desc as desc2, eq as eq4 } from "drizzle-orm";
var resourceTables = {
  socials: socialLinks,
  gallery: galleryItems,
  events,
  music: musicItems,
  occasions,
  testimonials,
  availability: availabilityDays,
  awards,
  press: pressItems,
  collaborations,
  stats,
  highlights,
  fanMessages,
  pressMentions,
  tracks,
  videos,
  faqs
};
var RESOURCE_NAMES = Object.keys(resourceTables);
function isResourceName(name) {
  return Object.prototype.hasOwnProperty.call(resourceTables, name);
}
function tableFor(name) {
  return resourceTables[name];
}
function orderColumn(name) {
  const table = tableFor(name);
  return name === "availability" ? table.date : table.sortOrder;
}
async function listResource(name) {
  return db.select().from(tableFor(name)).orderBy(asc(orderColumn(name)));
}
async function createResource(name, values) {
  const rows = await db.insert(tableFor(name)).values(values).returning();
  return rows[0];
}
async function updateResource(name, id, values) {
  const table = tableFor(name);
  const rows = await db.update(table).set(values).where(eq4(table.id, id)).returning();
  return rows[0] ?? null;
}
async function deleteResource(name, id) {
  const table = tableFor(name);
  const removed = await db.delete(table).where(eq4(table.id, id)).returning();
  return removed.length > 0;
}
async function getSettings() {
  const [row] = await db.select().from(siteSettings).where(eq4(siteSettings.id, "main")).limit(1);
  return row ?? null;
}
async function upsertSettings(values) {
  const rows = await db.insert(siteSettings).values({ id: "main", ...values }).onConflictDoUpdate({
    target: siteSettings.id,
    set: { ...values, updatedAt: /* @__PURE__ */ new Date() }
  }).returning();
  return rows[0];
}
async function createEnquiry(values) {
  const rows = await db.insert(enquiries).values({
    name: values.name,
    contact: values.contact,
    email: values.email ?? null,
    eventType: values.eventType,
    eventDate: values.eventDate ?? null,
    city: values.city,
    venue: values.venue,
    budget: values.budget ?? "",
    message: values.message ?? null
  }).returning();
  return rows[0];
}
async function listEnquiries() {
  return db.select().from(enquiries).orderBy(desc2(enquiries.createdAt));
}
async function setEnquiryRead(id, read) {
  const rows = await db.update(enquiries).set({ read }).where(eq4(enquiries.id, id)).returning();
  return rows[0] ?? null;
}
async function deleteEnquiry(id) {
  const removed = await db.delete(enquiries).where(eq4(enquiries.id, id)).returning();
  return removed.length > 0;
}
async function createSubscriber(values) {
  const rows = await db.insert(subscribers).values({ email: values.email.trim().toLowerCase(), name: values.name?.trim() ?? "" }).onConflictDoNothing({ target: subscribers.email }).returning();
  return rows[0] ?? null;
}
async function listSubscribers() {
  return db.select().from(subscribers).orderBy(desc2(subscribers.createdAt));
}
async function deleteSubscriber(id) {
  const removed = await db.delete(subscribers).where(eq4(subscribers.id, id)).returning();
  return removed.length > 0;
}
async function getSiteContent() {
  const [
    settings,
    socials,
    gallery,
    events2,
    music,
    occasions2,
    testimonials2,
    availability,
    awards2,
    press,
    collaborations2,
    stats2,
    highlights2,
    fanMessages2,
    pressMentions2,
    tracks2,
    videos2,
    faqs2
  ] = await Promise.all([
    getSettings(),
    listResource("socials"),
    listResource("gallery"),
    listResource("events"),
    listResource("music"),
    listResource("occasions"),
    listResource("testimonials"),
    listResource("availability"),
    listResource("awards"),
    listResource("press"),
    listResource("collaborations"),
    listResource("stats"),
    listResource("highlights"),
    listResource("fanMessages"),
    listResource("pressMentions"),
    listResource("tracks"),
    listResource("videos"),
    listResource("faqs")
  ]);
  return {
    settings: {
      artist: settings?.artist ?? "Raag Sargam",
      role: settings?.role ?? "Professional Singer & Live Performer",
      tagline: settings?.tagline ?? "",
      shortIntro: settings?.shortIntro ?? "",
      longIntro: settings?.longIntro ?? "",
      email: settings?.email ?? "",
      phoneDisplay: settings?.phoneDisplay ?? "",
      phoneHref: settings?.phoneHref ?? "",
      whatsappDisplay: settings?.whatsappDisplay ?? "",
      whatsapp: settings?.whatsapp ?? "",
      cities: settings?.cities ?? "",
      travelNote: settings?.travelNote ?? ""
    },
    socials,
    gallery,
    events: events2,
    music,
    occasions: occasions2,
    testimonials: testimonials2,
    availability,
    awards: awards2,
    press,
    collaborations: collaborations2,
    stats: stats2,
    highlights: highlights2,
    fanMessages: fanMessages2,
    pressMentions: pressMentions2,
    tracks: tracks2,
    videos: videos2,
    faqs: faqs2
  };
}

// server/routers.ts
var authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await authProvider().logout(ctx.c);
    return { ok: true };
  })
});
function clientKey(c) {
  const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || c.req.header("x-real-ip") || "unknown";
}
var adminRouter = router({
  login: publicProcedure.input(z.object({ username: z.string().min(1), password: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const key = clientKey(ctx.c);
    const limit = rateLimit(key);
    if (!limit.ok) {
      throw new TRPCError2({
        code: "TOO_MANY_REQUESTS",
        message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`
      });
    }
    if (input.username.trim().toLowerCase() !== ADMIN_USERNAME) {
      throw new TRPCError2({ code: "UNAUTHORIZED", message: "Invalid username or password." });
    }
    await ensureAdminUser();
    try {
      const user = await authProvider().login(ctx.c, ADMIN_USERNAME, input.password);
      if (user.role !== "admin") {
        await authProvider().logout(ctx.c);
        throw new TRPCError2({ code: "FORBIDDEN", message: "This account is not an administrator." });
      }
      clearRateLimit(key);
      return user;
    } catch (e) {
      if (e instanceof AuthError) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: "Invalid username or password." });
      }
      throw e;
    }
  })
});
var resourceSchemas = {
  socials: z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.string().default(""),
    href: z.string().min(1),
    handle: z.string().default(""),
    external: z.boolean().default(true),
    sortOrder: z.number().int().default(0)
  }),
  gallery: z.object({
    src: z.string().min(1),
    width: z.number().int().positive().default(1200),
    height: z.number().int().positive().default(1600),
    caption: z.string().default(""),
    tag: z.string().default(""),
    alt: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  events: z.object({
    title: z.string().min(1),
    date: z.string().min(1),
    time: z.string().default(""),
    venue: z.string().default(""),
    city: z.string().default(""),
    status: z.enum(["Confirmed", "On Hold"]).default("Confirmed"),
    note: z.string().nullable().default(null),
    ticketHref: z.string().nullable().default(null),
    ticketLabel: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  music: z.object({
    title: z.string().min(1),
    category: z.string().default(""),
    blurb: z.string().default(""),
    href: z.string().nullable().default(null),
    linkLabel: z.string().nullable().default(null),
    duration: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  occasions: z.object({
    title: z.string().min(1),
    blurb: z.string().default(""),
    includes: z.array(z.string()).default([]),
    sortOrder: z.number().int().default(0)
  }),
  testimonials: z.object({
    quote: z.string().min(1),
    author: z.string().default(""),
    context: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  availability: z.object({
    date: z.string().min(1),
    status: z.enum(["AVAILABLE", "TENTATIVE", "BOOKED", "UNAVAILABLE"]).default("AVAILABLE"),
    note: z.string().nullable().default(null)
  }),
  awards: z.object({
    title: z.string().min(1),
    organisation: z.string().default(""),
    year: z.string().default(""),
    description: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  press: z.object({
    outlet: z.string().min(1),
    headline: z.string().default(""),
    quote: z.string().default(""),
    date: z.string().default(""),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  collaborations: z.object({
    brand: z.string().min(1),
    role: z.string().default(""),
    description: z.string().default(""),
    year: z.string().default(""),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  stats: z.object({
    label: z.string().min(1),
    value: z.number().int().default(0),
    suffix: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  highlights: z.object({
    src: z.string().min(1),
    caption: z.string().default(""),
    alt: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  fanMessages: z.object({
    message: z.string().min(1),
    author: z.string().default(""),
    city: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  pressMentions: z.object({
    label: z.string().min(1),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  tracks: z.object({
    title: z.string().min(1),
    artist: z.string().default(""),
    src: z.string().min(1),
    cover: z.string().nullable().default(null),
    duration: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0)
  }),
  videos: z.object({
    title: z.string().min(1),
    embedUrl: z.string().min(1),
    poster: z.string().nullable().default(null),
    caption: z.string().default(""),
    sortOrder: z.number().int().default(0)
  }),
  faqs: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    sortOrder: z.number().int().default(0)
  })
};
var resourceName = z.string().refine(isResourceName, { message: "Unknown resource" });
var contentRouter = router({
  getSite: publicProcedure.query(() => getSiteContent()),
  list: adminProcedure.input(z.object({ resource: resourceName })).query(({ input }) => listResource(input.resource)),
  create: adminProcedure.input(z.object({ resource: resourceName, values: z.record(z.string(), z.unknown()) })).mutation(({ input }) => {
    const name = input.resource;
    const parsed = resourceSchemas[name].parse(input.values);
    return createResource(name, parsed);
  }),
  update: adminProcedure.input(z.object({ resource: resourceName, id: z.string().min(1), values: z.record(z.string(), z.unknown()) })).mutation(async ({ input }) => {
    const name = input.resource;
    const parsed = resourceSchemas[name].partial().parse(input.values);
    const row = await updateResource(name, input.id, parsed);
    if (!row) throw new TRPCError2({ code: "NOT_FOUND", message: "That item no longer exists." });
    return row;
  }),
  remove: adminProcedure.input(z.object({ resource: resourceName, id: z.string().min(1) })).mutation(async ({ input }) => {
    const ok = await deleteResource(input.resource, input.id);
    if (!ok) throw new TRPCError2({ code: "NOT_FOUND", message: "That item no longer exists." });
    return { ok: true };
  })
});
var settingsRouter = router({
  get: adminProcedure.query(() => getSettings()),
  update: adminProcedure.input(
    z.object({
      artist: z.string().min(1),
      role: z.string().min(1),
      tagline: z.string().default(""),
      shortIntro: z.string().default(""),
      longIntro: z.string().default(""),
      email: z.string().default(""),
      phoneDisplay: z.string().default(""),
      phoneHref: z.string().default(""),
      whatsappDisplay: z.string().default(""),
      whatsapp: z.string().default(""),
      cities: z.string().default(""),
      travelNote: z.string().default("")
    })
  ).mutation(({ input }) => upsertSettings(input))
});
var enquiriesRouter = router({
  create: publicProcedure.input(
    z.object({
      name: z.string().min(1),
      contact: z.string().min(1),
      email: z.string().optional(),
      eventType: z.string().default(""),
      eventDate: z.string().optional(),
      city: z.string().default(""),
      venue: z.string().default(""),
      budget: z.string().optional(),
      message: z.string().optional()
    })
  ).mutation(
    ({ input }) => createEnquiry({
      name: input.name,
      contact: input.contact,
      email: input.email || null,
      eventType: input.eventType,
      eventDate: input.eventDate || null,
      city: input.city,
      venue: input.venue,
      budget: input.budget || "",
      message: input.message || null
    })
  ),
  list: adminProcedure.query(() => listEnquiries()),
  setRead: adminProcedure.input(z.object({ id: z.string().min(1), read: z.boolean() })).mutation(async ({ input }) => {
    const row = await setEnquiryRead(input.id, input.read);
    if (!row) throw new TRPCError2({ code: "NOT_FOUND", message: "That enquiry no longer exists." });
    return row;
  }),
  remove: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ input }) => {
    const ok = await deleteEnquiry(input.id);
    if (!ok) throw new TRPCError2({ code: "NOT_FOUND", message: "That enquiry no longer exists." });
    return { ok: true };
  })
});
function sanitizeBasename(name) {
  const last = name.split(/[/\\]/).pop() ?? "";
  const dot = last.lastIndexOf(".");
  const rawStem = dot > 0 ? last.slice(0, dot) : last;
  const rawExt = dot > 0 ? last.slice(dot + 1) : "";
  const stem = rawStem.replace(/[^A-Za-z0-9._-]/g, "").replace(/^\.+/, "") || "upload";
  const ext = rawExt.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  return ext ? `${stem}.${ext}` : stem;
}
var filesRouter = router({
  uploadUrl: adminProcedure.input(z.object({ name: z.string().min(1), contentType: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const key = `${crypto.randomUUID()}-${sanitizeBasename(input.name)}`;
    try {
      const { uploadUrl, publicPath } = await storagePutUrl(key, input.contentType, {
        ownerId: ctx.user.id
      });
      return { key, uploadUrl, publicPath };
    } catch (e) {
      if (e instanceof StorageError && e.code === "failed") {
        throw new TRPCError2({
          code: "BAD_REQUEST",
          message: "upload rejected by storage \u2014 allowed types: png/jpeg/gif/webp/avif, pdf, text/plain, csv, json, mpeg/wav audio, mp4/webm video"
        });
      }
      throw e;
    }
  }),
  commit: adminProcedure.input(z.object({ key: z.string().min(1), name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    try {
      return await storageCommit(input.key, { ownerId: ctx.user.id, name: input.name });
    } catch (e) {
      if (e instanceof StorageError && e.code === "not_found") {
        throw new TRPCError2({ code: "NOT_FOUND", message: "upload not found \u2014 did the PUT succeed?" });
      }
      if (e instanceof StorageError && e.code === "forbidden") {
        throw new TRPCError2({ code: "FORBIDDEN", message: "that key belongs to another user" });
      }
      throw e;
    }
  }),
  list: adminProcedure.query(({ ctx }) => storageListByOwner(ctx.user.id)),
  remove: adminProcedure.input(z.object({ key: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    try {
      return await storageDeleteOwned(ctx.user.id, input.key);
    } catch (e) {
      if (e instanceof StorageError && e.code === "forbidden") {
        throw new TRPCError2({ code: "BAD_REQUEST", message: "malformed key" });
      }
      throw e;
    }
  })
});
var subscribersRouter = router({
  create: publicProcedure.input(z.object({ email: z.string().email(), name: z.string().optional() })).mutation(({ input }) => createSubscriber({ email: input.email, name: input.name })),
  list: adminProcedure.query(() => listSubscribers()),
  remove: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ input }) => {
    const ok = await deleteSubscriber(input.id);
    if (!ok) throw new TRPCError2({ code: "NOT_FOUND", message: "That subscriber no longer exists." });
    return { ok: true };
  })
});
var appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  content: contentRouter,
  settings: settingsRouter,
  enquiries: enquiriesRouter,
  subscribers: subscribersRouter,
  files: filesRouter
});

// server/_core/context.ts
async function createContext(c) {
  const user = await authProvider().getSession(c);
  return { c, db, user };
}

// server/_core/jobs.ts
var registry = /* @__PURE__ */ new Map();
function getJob(name) {
  return registry.get(name);
}

// server/_core/serve.ts
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
var PUBLIC_DIR = resolvePublicDir();
function resolvePublicDir() {
  let dir = import.meta.dirname;
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, "package.json"))) {
      return path.join(dir, "dist", "public");
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve("dist/public");
}
function mountClient(app2) {
  if (!env.isProd) return;
  app2.use("/*", serveStatic({ root: PUBLIC_DIR }));
  app2.get("*", async (c) => {
    const html = await readFile(path.join(PUBLIC_DIR, "index.html"), "utf-8");
    return c.html(html);
  });
}

// server/_core/app.ts
var health = (c) => c.json({ ok: true });
function createApp() {
  const app2 = new Hono();
  app2.get("/health", health);
  app2.get("/api/health", health);
  const trpc = trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createContext(c)
  });
  app2.use("/trpc/*", trpc);
  app2.use("/api/trpc/*", trpc);
  app2.all("/app-storage/*", (c) => serveAppStorage(c));
  app2.all("/api/app-storage/*", (c) => serveAppStorage(c));
  app2.post("/api/_jobs/:name", async (c) => {
    const signature = c.req.header("x-platform-signature");
    if (!signature) {
      return c.text("unauthorized (job callback signature required \u2014 DESIGN \xA78.4)", 401);
    }
    const handler = getJob(c.req.param("name"));
    if (!handler) return c.text("no such job", 404);
    try {
      await handler();
      return c.json({ ok: true });
    } catch (err) {
      console.error(`[jobs] "${c.req.param("name")}" failed`, err);
      return c.text("job failed", 500);
    }
  });
  mountClient(app2);
  return app2;
}

// api/index.ts
var app = createApp();
var index_default = getRequestListener(app.fetch);
export {
  index_default as default
};
