// ── AGENT-OWNED: business data-access ────────────────────────────────────────
// All Drizzle queries for the SHANDIP content store live here so the tRPC
// procedures in routers.ts stay thin. The site is single-tenant: content rows
// are the site's content (not owner-scoped), writes are gated by adminProcedure.
import { asc, desc, eq } from "drizzle-orm";
import { db } from "./_core/db";
import * as schema from "../drizzle/schema";
import type { SiteContent } from "../shared/types";

// ── Resource registry ────────────────────────────────────────────────────────
// One entry per editable collection. The admin dashboard drives every collection
// through the same generic CRUD procedures, so adding a collection means adding
// a table + a line here + a zod schema in routers.ts.
export const resourceTables = {
  socials: schema.socialLinks,
  gallery: schema.galleryItems,
  events: schema.events,
  music: schema.musicItems,
  occasions: schema.occasions,
  testimonials: schema.testimonials,
  availability: schema.availabilityDays,
} as const;

export type ResourceName = keyof typeof resourceTables;

export const RESOURCE_NAMES = Object.keys(resourceTables) as ResourceName[];

export function isResourceName(name: string): name is ResourceName {
  return Object.prototype.hasOwnProperty.call(resourceTables, name);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function tableFor(name: ResourceName): any {
  return resourceTables[name] as any;
}

/** Display order: availability sorts by date, everything else by sortOrder. */
function orderColumn(name: ResourceName): any {
  const table = tableFor(name);
  return name === "availability" ? table.date : table.sortOrder;
}

export async function listResource(name: ResourceName): Promise<any[]> {
  return db.select().from(tableFor(name)).orderBy(asc(orderColumn(name)));
}

export async function createResource(name: ResourceName, values: Record<string, unknown>): Promise<any> {
  const rows = (await db.insert(tableFor(name)).values(values as any).returning()) as any[];
  return rows[0];
}

export async function updateResource(
  name: ResourceName,
  id: string,
  values: Record<string, unknown>,
): Promise<any | null> {
  const table = tableFor(name);
  const rows = (await db.update(table).set(values as any).where(eq(table.id, id)).returning()) as any[];
  return rows[0] ?? null;
}

export async function deleteResource(name: ResourceName, id: string): Promise<boolean> {
  const table = tableFor(name);
  const removed = (await db.delete(table).where(eq(table.id, id)).returning()) as any[];
  return removed.length > 0;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Site settings (single row, id = 'main') ──────────────────────────────────
export async function getSettings() {
  const [row] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.id, "main"))
    .limit(1);
  return row ?? null;
}

export async function upsertSettings(values: Record<string, unknown>) {
  const rows = (await db
    .insert(schema.siteSettings)
    .values({ id: "main", ...values } as typeof schema.siteSettings.$inferInsert)
    .onConflictDoUpdate({
      target: schema.siteSettings.id,
      set: { ...values, updatedAt: new Date() } as Partial<typeof schema.siteSettings.$inferInsert>,
    })
    .returning()) as any[];
  return rows[0];
}

// ── Enquiries ────────────────────────────────────────────────────────────────
export async function createEnquiry(values: {
  name: string;
  contact: string;
  email?: string | null;
  eventType: string;
  eventDate?: string | null;
  city: string;
  venue: string;
  message?: string | null;
}) {
  const rows = (await db
    .insert(schema.enquiries)
    .values({
      name: values.name,
      contact: values.contact,
      email: values.email ?? null,
      eventType: values.eventType,
      eventDate: values.eventDate ?? null,
      city: values.city,
      venue: values.venue,
      message: values.message ?? null,
    })
    .returning()) as any[];
  return rows[0];
}

export async function listEnquiries() {
  return db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt));
}

export async function setEnquiryRead(id: string, read: boolean) {
  const rows = (await db
    .update(schema.enquiries)
    .set({ read })
    .where(eq(schema.enquiries.id, id))
    .returning()) as any[];
  return rows[0] ?? null;
}

export async function deleteEnquiry(id: string) {
  const removed = (await db.delete(schema.enquiries).where(eq(schema.enquiries.id, id)).returning()) as any[];
  return removed.length > 0;
}

// ── Public content bundle ────────────────────────────────────────────────────
/** Everything the public site renders, in one round-trip. */
export async function getSiteContent(): Promise<SiteContent> {
  const [settings, socials, gallery, events, music, occasions, testimonials, availability] =
    await Promise.all([
      getSettings(),
      listResource("socials"),
      listResource("gallery"),
      listResource("events"),
      listResource("music"),
      listResource("occasions"),
      listResource("testimonials"),
      listResource("availability"),
    ]);

  return {
    settings: {
      artist: settings?.artist ?? "SHANDIP",
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
      travelNote: settings?.travelNote ?? "",
    },
    socials,
    gallery,
    events,
    music,
    occasions,
    testimonials,
    availability,
  };
}
