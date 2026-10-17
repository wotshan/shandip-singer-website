-- ── 0006 — DB-backed upload storage (fallback when object storage is absent) ──
--
-- READ THIS BEFORE DELETING. This migration is ADDITIVE and NON-DESTRUCTIVE: it
-- creates one new table and touches nothing that already exists. Every statement
-- is idempotent, so it is correct on a fresh database and on the live one.
--
-- WHY IT EXISTS
--   The admin image picker (client/src/components/admin/ImageField.tsx) uploads
--   through the platform's scoped object-storage proxy, which needs
--   APP_STORAGE_PRESIGN_URL + APP_STORAGE_TOKEN. This deployment was not
--   provisioned by the platform, so neither var exists, storagePutUrl threw
--   StorageError("not_configured"), and the router let it escape — the client
--   only ever saw the opaque "Something went wrong. Please try again." on both
--   the Gallery photo form and the Video Reel poster form.
--
--   `uploads` is the fallback backend: when the platform proxy is not
--   configured, the bytes are stored here and served back from
--   /app-storage/<key> (server/_core/storage.ts → serveAppStorage). When the
--   proxy IS configured, nothing ever writes to this table.
--
--   The `files` index table is deliberately NOT touched — it is a system table
--   that _core writes to, and the two are separate key spaces.

CREATE TABLE IF NOT EXISTS "uploads" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "key" text NOT NULL,
        "owner_id" uuid,
        "name" text NOT NULL,
        "content_type" text NOT NULL DEFAULT 'application/octet-stream',
        "size" integer DEFAULT 0 NOT NULL,
        "data" bytea NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uploads_key_unique" ON "uploads" USING btree ("key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uploads_owner_idx" ON "uploads" USING btree ("owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "uploads_created_idx" ON "uploads" USING btree ("created_at");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "uploads" ADD CONSTRAINT "uploads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
