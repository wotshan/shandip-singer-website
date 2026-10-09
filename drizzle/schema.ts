import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  bigint,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM TABLE — managed by the scaffold. The Agent MUST NOT redefine or drop
// the auth columns here; it only ADDS business tables below (DESIGN §5.1).
//
// `password_hash` is LOCAL-auth-only. It is deliberately confined to this table
// and to server/_core/auth.ts — it never appears in SessionUser or any tRPC
// output. A future SsoAuthProvider would leave it null and link identities via
// an external-subject column; business tables keep FK'ing users.id regardless,
// so switching auth providers needs no business-schema change.
// ─────────────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // null for SSO-linked users (future)
  name: text("name"),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// SYSTEM TABLE — managed by the scaffold, written by server/_core/storage.ts.
// The Agent MUST NOT redefine, rename or drop it: `_core` inserts into it, so a
// rename breaks `_core`. Rows are created by storageCommit() AFTER the upload
// landed, with size/contentType read back from object storage — never from the
// client — so a row cannot point at an object that does not exist AT COMMIT TIME.
//
// That guarantee can still go stale: the platform's owner-facing storage panel
// can delete the underlying object directly. It has no access to this app's
// database, so it cannot (and does not) delete the matching row here. A row
// existing is therefore NOT a guarantee its object still exists — treat a 404
// from `/app-storage/<key>` as an expected, handle-able case in the UI, not a
// bug. `/app-storage/<key>` is also unauthenticated (no session check), so the
// URL itself is the read capability — never store something there that must
// not leak to anyone who obtains the link.
export const files = pgTable(
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
    name: text("name").notNull(),                        // original filename, for display
    size: bigint("size", { mode: "number" }).notNull(),  // bigint: integer caps at ~2.1GB
    contentType: text("content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_owner_idx").on(t.ownerId), index("files_created_idx").on(t.createdAt)],
);

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS TABLES — Raag Sargam site content, all editable from the admin dashboard.
//
// Every table below is a single-tenant content store: the site has exactly one
// owner (the admin), so rows are NOT owner-scoped — they are the site's content.
// Writes are gated by `adminProcedure` (role === 'admin'), reads are public.
//
// `sortOrder` is the admin-controlled display order (ascending). `id` is a uuid
// so the admin UI can address a row without knowing its position.
// ─────────────────────────────────────────────────────────────────────────────

/** Single-row table (id = 'main') holding the artist's scalar profile + copy. */
export const siteSettings = pgTable("site_settings", {
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
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Social / contact channels — drives the contact rows, footer icons and carousel. */
export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),          // whatsapp | instagram | linktree | discord | linkedin | facebook | email | phone
    label: text("label").notNull(),
    value: text("value").notNull(),
    href: text("href").notNull(),
    handle: text("handle").notNull(),    // spoken label for icon-only contexts
    external: boolean("external").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("social_links_order_idx").on(t.sortOrder)],
);

/** Performance gallery. `src` is a local /images/... path or an /app-storage/... key. */
export const galleryItems = pgTable(
  "gallery_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    src: text("src").notNull(),
    width: integer("width").notNull().default(1200),
    height: integer("height").notNull().default(1600),
    caption: text("caption").notNull().default(""),
    tag: text("tag").notNull().default(""),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("gallery_items_order_idx").on(t.sortOrder)],
);

/** Upcoming performances. Only real, confirmed dates belong here. */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    date: text("date").notNull(),        // ISO YYYY-MM-DD
    time: text("time").notNull().default(""),
    venue: text("venue").notNull().default(""),
    city: text("city").notNull().default(""),
    status: text("status").notNull().default("Confirmed"), // Confirmed | On Hold
    note: text("note"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("events_order_idx").on(t.sortOrder)],
);

/** Repertoire / set types the artist performs. */
export const musicItems = pgTable(
  "music_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: text("category").notNull().default(""),
    blurb: text("blurb").notNull().default(""),
    href: text("href"),                  // optional real streaming link
    linkLabel: text("link_label"),       // optional label for that link
    duration: text("duration"),          // optional
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("music_items_order_idx").on(t.sortOrder)],
);

/** Occasions / services the artist performs at. */
export const occasions = pgTable(
  "occasions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    blurb: text("blurb").notNull().default(""),
    includes: jsonb("includes").$type<string[]>().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("occasions_order_idx").on(t.sortOrder)],
);

/** Client testimonials — only genuine, permitted quotes belong here. */
export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quote: text("quote").notNull(),
    author: text("author").notNull().default(""),
    context: text("context").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("testimonials_order_idx").on(t.sortOrder)],
);

/** Booking-calendar status per date. */
export const availabilityDays = pgTable(
  "availability_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: text("date").notNull().unique(), // ISO YYYY-MM-DD
    status: text("status").notNull().default("AVAILABLE"), // AVAILABLE | TENTATIVE | BOOKED | UNAVAILABLE
    note: text("note"),
  },
  (t) => [index("availability_days_date_idx").on(t.date)],
);

/** Enquiries submitted from the public contact form. */
export const enquiries = pgTable(
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
    message: text("message"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt)],
);
