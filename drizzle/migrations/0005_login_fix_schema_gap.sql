-- ── 0005 — repair: the tables + columns a FRESH production migrate never got ──
--
-- READ THIS BEFORE DELETING. The fix for the root cause is the journal entry and
-- the guard test (server/migrations.test.ts); this file only repairs the DATA.
--
-- WHAT WENT WRONG
--   Two migrations were once written as `0004_*`:
--     · 0004_funny_roulette   — awards, collaborations, fan_messages, highlights,
--                               press_items, press_mentions, stats, subscribers
--                               + events.ticket_href / events.ticket_label
--     · 0004_kind_betty_ross  — faqs, tracks, videos + enquiries.budget
--
--   Two files sharing the prefix `0004_` is a collision drizzle-kit cannot
--   resolve, so `0004_funny_roulette` was never listed in meta/_journal.json —
--   which means it never ran on a fresh database. It was instead "recorded" by
--   hand: scripts/_record-migration.ts pushed its tag into the journal and
--   inserted the SQL hash straight into drizzle.__drizzle_migrations WITHOUT
--   running the SQL. On a database built up incrementally that is invisible;
--   on a fresh one the tables simply do not exist.
--
-- WHY IT LOOKED LIKE A LOGIN BUG
--   A freshly migrated database came up with 14 of the 22 tables in
--   drizzle/schema.ts. The very first read the site makes — content.getSite()
--   reads every table in one Promise.all — hit
--         error 42703: column "events"."ticket_href" does not exist
--   and the whole query answered 500 (opaque: "Something went wrong").
--   The admin login itself SUCCEEDED, because it touches only `users`. So you
--   signed in and then every screen behind the dashboard was broken — which
--   reads exactly like "admin login is broken".
--
-- EVERY STATEMENT IS IDEMPOTENT ON PURPOSE — this one migration must be correct
-- on both paths:
--   · fresh database   → 0000-0004 ran, so this creates the 8 missing tables
--   · the production DB→ some of these may already exist (hand-recorded run),
--                        so IF NOT EXISTS makes re-running a no-op
-- Run it anywhere, any number of times, and it converges on the schema.

CREATE TABLE IF NOT EXISTS "awards" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "title" text NOT NULL,
        "organisation" text DEFAULT '' NOT NULL,
        "year" text DEFAULT '' NOT NULL,
        "description" text DEFAULT '' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collaborations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "brand" text NOT NULL,
        "role" text DEFAULT '' NOT NULL,
        "description" text DEFAULT '' NOT NULL,
        "year" text DEFAULT '' NOT NULL,
        "href" text,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fan_messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "message" text NOT NULL,
        "author" text DEFAULT '' NOT NULL,
        "city" text DEFAULT '' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "highlights" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "src" text NOT NULL,
        "caption" text DEFAULT '' NOT NULL,
        "alt" text DEFAULT '' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "press_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "outlet" text NOT NULL,
        "headline" text DEFAULT '' NOT NULL,
        "quote" text DEFAULT '' NOT NULL,
        "date" text DEFAULT '' NOT NULL,
        "href" text,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "press_mentions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "label" text NOT NULL,
        "href" text,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stats" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "label" text NOT NULL,
        "value" integer DEFAULT 0 NOT NULL,
        "suffix" text DEFAULT '' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscribers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" text NOT NULL,
        "name" text DEFAULT '' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
-- Columns that came from the same stranded migration. IF NOT EXISTS so this is
-- safe whether or not the production database already picked them up.
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "ticket_href" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "ticket_label" text;--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "budget" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "awards_order_idx" ON "awards" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collaborations_order_idx" ON "collaborations" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fan_messages_order_idx" ON "fan_messages" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "highlights_order_idx" ON "highlights" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "press_items_order_idx" ON "press_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "press_mentions_order_idx" ON "press_mentions" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stats_order_idx" ON "stats" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscribers_created_idx" ON "subscribers" USING btree ("created_at");
