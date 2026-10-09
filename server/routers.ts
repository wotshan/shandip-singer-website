// ── AGENT-OWNED: tRPC API surface ────────────────────────────────────────────
// Thin procedures: validate input with zod, call server/db.ts for data. Auth is
// provided by _core — do NOT reimplement sessions. Access levels:
// publicProcedure (anyone) / protectedProcedure (ctx.user set) / adminProcedure.
//
// Raag Sargam has exactly ONE admin and NO signup: the account is bootstrapped
// server-side (server/admin.ts) and the only way in is `admin.login`, which is
// rate-limited. Every content write goes through `adminProcedure`.
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import { authProvider, AuthError } from "./_core/auth";
import { storageCommit, storageDeleteOwned, storageListByOwner, storagePutUrl, StorageError } from "./_core/storage";
import { ADMIN_USERNAME, clearRateLimit, ensureAdminUser, rateLimit } from "./admin";
import * as q from "./db";
import { isResourceName, type ResourceName } from "./db";

// ── Auth ─────────────────────────────────────────────────────────────────────
// No signup procedure exists on purpose: the single admin is created by
// ensureAdminUser(). `me` and `logout` are provider-agnostic.
const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await authProvider().logout(ctx.c);
    return { ok: true };
  }),
});

// ── Admin login (username + password, rate-limited) ──────────────────────────
function clientKey(c: { req: { header: (n: string) => string | undefined } }): string {
  const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || c.req.header("x-real-ip") || "unknown";
}

const adminRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const key = clientKey(ctx.c);
      const limit = rateLimit(key);
      if (!limit.ok) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`,
        });
      }

      // Only the one admin username is accepted — anything else is rejected
      // before a password comparison, so no other account can ever log in here.
      if (input.username.trim().toLowerCase() !== ADMIN_USERNAME) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });
      }

      await ensureAdminUser();

      try {
        const user = await authProvider().login(ctx.c, ADMIN_USERNAME, input.password);
        if (user.role !== "admin") {
          await authProvider().logout(ctx.c);
          throw new TRPCError({ code: "FORBIDDEN", message: "This account is not an administrator." });
        }
        clearRateLimit(key);
        return user;
      } catch (e) {
        if (e instanceof AuthError) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });
        }
        throw e;
      }
    }),
});

// ── Per-resource zod schemas ─────────────────────────────────────────────────
const resourceSchemas = {
  socials: z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.string().default(""),
    href: z.string().min(1),
    handle: z.string().default(""),
    external: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
  gallery: z.object({
    src: z.string().min(1),
    width: z.number().int().positive().default(1200),
    height: z.number().int().positive().default(1600),
    caption: z.string().default(""),
    tag: z.string().default(""),
    alt: z.string().default(""),
    sortOrder: z.number().int().default(0),
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
    sortOrder: z.number().int().default(0),
  }),
  music: z.object({
    title: z.string().min(1),
    category: z.string().default(""),
    blurb: z.string().default(""),
    href: z.string().nullable().default(null),
    linkLabel: z.string().nullable().default(null),
    duration: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
  }),
  occasions: z.object({
    title: z.string().min(1),
    blurb: z.string().default(""),
    includes: z.array(z.string()).default([]),
    sortOrder: z.number().int().default(0),
  }),
  testimonials: z.object({
    quote: z.string().min(1),
    author: z.string().default(""),
    context: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  availability: z.object({
    date: z.string().min(1),
    status: z.enum(["AVAILABLE", "TENTATIVE", "BOOKED", "UNAVAILABLE"]).default("AVAILABLE"),
    note: z.string().nullable().default(null),
  }),
  awards: z.object({
    title: z.string().min(1),
    organisation: z.string().default(""),
    year: z.string().default(""),
    description: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  press: z.object({
    outlet: z.string().min(1),
    headline: z.string().default(""),
    quote: z.string().default(""),
    date: z.string().default(""),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
  }),
  collaborations: z.object({
    brand: z.string().min(1),
    role: z.string().default(""),
    description: z.string().default(""),
    year: z.string().default(""),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
  }),
  stats: z.object({
    label: z.string().min(1),
    value: z.number().int().default(0),
    suffix: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  highlights: z.object({
    src: z.string().min(1),
    caption: z.string().default(""),
    alt: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  fanMessages: z.object({
    message: z.string().min(1),
    author: z.string().default(""),
    city: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  pressMentions: z.object({
    label: z.string().min(1),
    href: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
  }),
  tracks: z.object({
    title: z.string().min(1),
    artist: z.string().default(""),
    src: z.string().min(1),
    cover: z.string().nullable().default(null),
    duration: z.string().nullable().default(null),
    sortOrder: z.number().int().default(0),
  }),
  videos: z.object({
    title: z.string().min(1),
    embedUrl: z.string().min(1),
    poster: z.string().nullable().default(null),
    caption: z.string().default(""),
    sortOrder: z.number().int().default(0),
  }),
  faqs: z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    sortOrder: z.number().int().default(0),
  }),
} satisfies Record<ResourceName, z.ZodTypeAny>;

const resourceName = z.string().refine(isResourceName, { message: "Unknown resource" });

// ── Content (public read, admin write) ───────────────────────────────────────
const contentRouter = router({
  getSite: publicProcedure.query(() => q.getSiteContent()),

  list: adminProcedure
    .input(z.object({ resource: resourceName }))
    .query(({ input }) => q.listResource(input.resource as ResourceName)),

  create: adminProcedure
    .input(z.object({ resource: resourceName, values: z.record(z.string(), z.unknown()) }))
    .mutation(({ input }) => {
      const name = input.resource as ResourceName;
      const parsed = resourceSchemas[name].parse(input.values);
      return q.createResource(name, parsed as Record<string, unknown>);
    }),

  update: adminProcedure
    .input(z.object({ resource: resourceName, id: z.string().min(1), values: z.record(z.string(), z.unknown()) }))
    .mutation(async ({ input }) => {
      const name = input.resource as ResourceName;
      const parsed = resourceSchemas[name].partial().parse(input.values);
      const row = await q.updateResource(name, input.id, parsed as Record<string, unknown>);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "That item no longer exists." });
      return row;
    }),

  remove: adminProcedure
    .input(z.object({ resource: resourceName, id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const ok = await q.deleteResource(input.resource as ResourceName, input.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "That item no longer exists." });
      return { ok: true };
    }),
});

// ── Site settings (single row) ───────────────────────────────────────────────
const settingsRouter = router({
  get: adminProcedure.query(() => q.getSettings()),

  update: adminProcedure
    .input(
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
        travelNote: z.string().default(""),
      }),
    )
    .mutation(({ input }) => q.upsertSettings(input)),
});

// ── Enquiries (public create, admin manage) ──────────────────────────────────
const enquiriesRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        contact: z.string().min(1),
        email: z.string().optional(),
        eventType: z.string().default(""),
        eventDate: z.string().optional(),
        city: z.string().default(""),
        venue: z.string().default(""),
        budget: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .mutation(({ input }) =>
      q.createEnquiry({
        name: input.name,
        contact: input.contact,
        email: input.email || null,
        eventType: input.eventType,
        eventDate: input.eventDate || null,
        city: input.city,
        venue: input.venue,
        budget: input.budget || "",
        message: input.message || null,
      }),
    ),

  list: adminProcedure.query(() => q.listEnquiries()),

  setRead: adminProcedure
    .input(z.object({ id: z.string().min(1), read: z.boolean() }))
    .mutation(async ({ input }) => {
      const row = await q.setEnquiryRead(input.id, input.read);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "That enquiry no longer exists." });
      return row;
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const ok = await q.deleteEnquiry(input.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "That enquiry no longer exists." });
      return { ok: true };
    }),
});

// ── File uploads (admin only) ────────────────────────────────────────────────
// Three-step protocol: uploadUrl → browser PUT → commit. Admin-only, because the
// only uploader on this site is the admin adding gallery photos.
export function sanitizeBasename(name: string): string {
  const last = name.split(/[/\\]/).pop() ?? "";
  const dot = last.lastIndexOf(".");
  const rawStem = dot > 0 ? last.slice(0, dot) : last;
  const rawExt = dot > 0 ? last.slice(dot + 1) : "";
  const stem = rawStem.replace(/[^A-Za-z0-9._-]/g, "").replace(/^\.+/, "") || "upload";
  const ext = rawExt.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  return ext ? `${stem}.${ext}` : stem;
}

const filesRouter = router({
  uploadUrl: adminProcedure
    .input(z.object({ name: z.string().min(1), contentType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const key = `${crypto.randomUUID()}-${sanitizeBasename(input.name)}`;
      try {
        const { uploadUrl, publicPath } = await storagePutUrl(key, input.contentType, {
          ownerId: ctx.user.id,
        });
        return { key, uploadUrl, publicPath };
      } catch (e) {
        if (e instanceof StorageError && e.code === "failed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "upload rejected by storage — allowed types: png/jpeg/gif/webp/avif, pdf, text/plain, csv, json, mpeg/wav audio, mp4/webm video",
          });
        }
        throw e;
      }
    }),

  commit: adminProcedure
    .input(z.object({ key: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await storageCommit(input.key, { ownerId: ctx.user.id, name: input.name });
      } catch (e) {
        if (e instanceof StorageError && e.code === "not_found") {
          throw new TRPCError({ code: "NOT_FOUND", message: "upload not found — did the PUT succeed?" });
        }
        if (e instanceof StorageError && e.code === "forbidden") {
          throw new TRPCError({ code: "FORBIDDEN", message: "that key belongs to another user" });
        }
        throw e;
      }
    }),

  list: adminProcedure.query(({ ctx }) => storageListByOwner(ctx.user.id)),

  remove: adminProcedure
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await storageDeleteOwned(ctx.user.id, input.key);
      } catch (e) {
        if (e instanceof StorageError && e.code === "forbidden") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "malformed key" });
        }
        throw e;
      }
    }),
});

// ── Newsletter subscribers (public create, admin manage) ─────────────────────
const subscribersRouter = router({
  create: publicProcedure
    .input(z.object({ email: z.string().email(), name: z.string().optional() }))
    .mutation(({ input }) => q.createSubscriber({ email: input.email, name: input.name })),

  list: adminProcedure.query(() => q.listSubscribers()),

  remove: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const ok = await q.deleteSubscriber(input.id);
      if (!ok) throw new TRPCError({ code: "NOT_FOUND", message: "That subscriber no longer exists." });
      return { ok: true };
    }),
});

export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  content: contentRouter,
  settings: settingsRouter,
  enquiries: enquiriesRouter,
  subscribers: subscribersRouter,
  files: filesRouter,
});

export type AppRouter = typeof appRouter;
