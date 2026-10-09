CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist" text DEFAULT '' NOT NULL,
	"src" text NOT NULL,
	"cover" text,
	"duration" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"embed_url" text NOT NULL,
	"poster" text,
	"caption" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "budget" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "faqs_order_idx" ON "faqs" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "tracks_order_idx" ON "tracks" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "videos_order_idx" ON "videos" USING btree ("sort_order");