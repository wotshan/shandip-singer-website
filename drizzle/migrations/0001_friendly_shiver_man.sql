CREATE TABLE "availability_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"note" text,
	CONSTRAINT "availability_days_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"email" text,
	"event_type" text DEFAULT '' NOT NULL,
	"event_date" text,
	"city" text DEFAULT '' NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"message" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'Confirmed' NOT NULL,
	"note" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"src" text NOT NULL,
	"width" integer DEFAULT 1200 NOT NULL,
	"height" integer DEFAULT 1600 NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"tag" text DEFAULT '' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"href" text,
	"link_label" text,
	"duration" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"blurb" text DEFAULT '' NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"artist" text DEFAULT 'SHANDIP' NOT NULL,
	"role" text DEFAULT 'Professional Singer & Live Performer' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"short_intro" text DEFAULT '' NOT NULL,
	"long_intro" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone_display" text DEFAULT '' NOT NULL,
	"phone_href" text DEFAULT '' NOT NULL,
	"whatsapp_display" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"cities" text DEFAULT '' NOT NULL,
	"travel_note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"href" text NOT NULL,
	"handle" text NOT NULL,
	"external" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote" text NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" DROP CONSTRAINT "items_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "items_owner_idx";--> statement-breakpoint
CREATE INDEX "availability_days_date_idx" ON "availability_days" USING btree ("date");--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_order_idx" ON "events" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "gallery_items_order_idx" ON "gallery_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "music_items_order_idx" ON "music_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "occasions_order_idx" ON "occasions" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "social_links_order_idx" ON "social_links" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "testimonials_order_idx" ON "testimonials" USING btree ("sort_order");