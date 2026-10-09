CREATE TABLE "awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"organisation" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"year" text DEFAULT '' NOT NULL,
	"href" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fan_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"src" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outlet" text NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"quote" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"href" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"href" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"suffix" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ticket_href" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ticket_label" text;--> statement-breakpoint
CREATE INDEX "awards_order_idx" ON "awards" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "collaborations_order_idx" ON "collaborations" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "fan_messages_order_idx" ON "fan_messages" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "highlights_order_idx" ON "highlights" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "press_items_order_idx" ON "press_items" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "press_mentions_order_idx" ON "press_mentions" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "stats_order_idx" ON "stats" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "subscribers_created_idx" ON "subscribers" USING btree ("created_at");