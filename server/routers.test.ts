import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { makeCaller } from "./_core/test-caller";

// Full rationale for what gets mocked below (and why ./_core/trpc doesn't
// need to be) lives on server/_core/test-caller.ts, next to makeCaller —
// mock every _core module routers.ts touches.
vi.mock("./_core/auth", () => {
  class AuthError extends Error {}
  // A STABLE singleton: routers.ts calls authProvider() on every request, so a
  // factory that returned a fresh object each time would hand the test a
  // different vi.fn() than the one the router actually invokes.
  const provider = { login: vi.fn(), logout: vi.fn(), getSession: vi.fn() };
  return {
    authProvider: () => provider,
    registerLocalUser: vi.fn(),
    AuthError,
    EmailTakenError: class EmailTakenError extends AuthError {},
  };
});

vi.mock("./_core/storage", () => ({
  storageCommit: vi.fn(),
  storageDeleteOwned: vi.fn(),
  storageListByOwner: vi.fn(),
  storagePutUrl: vi.fn(),
  StorageError: class StorageError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
}));

// The business data layer. Mocked so no real DB driver is opened; the router
// logic (validation, auth gating, error mapping) is what these tests exercise.
vi.mock("./db", () => ({
  isResourceName: (n: string) =>
    ["socials", "gallery", "events", "music", "occasions", "testimonials", "availability"].includes(n),
  RESOURCE_NAMES: ["socials", "gallery", "events", "music", "occasions", "testimonials", "availability"],
  resourceTables: {},
  listResource: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  getSettings: vi.fn(),
  upsertSettings: vi.fn(),
  createEnquiry: vi.fn(),
  listEnquiries: vi.fn(),
  setEnquiryRead: vi.fn(),
  deleteEnquiry: vi.fn(),
  getSiteContent: vi.fn(),
}));

// The admin bootstrap + rate limiter. `rateLimit` is mocked per-test so the
// throttle can be driven deterministically without waiting out a real window.
vi.mock("./admin", () => ({
  ADMIN_USERNAME: "shanislive",
  ensureAdminUser: vi.fn(),
  rateLimit: vi.fn(() => ({ ok: true })),
  clearRateLimit: vi.fn(),
  resetRateLimits: vi.fn(),
}));

const { sanitizeBasename } = await import("./routers");
const { storageDeleteOwned, StorageError } = await import("./_core/storage");
const { authProvider, AuthError } = await import("./_core/auth");
const { rateLimit, ensureAdminUser } = await import("./admin");
const db = await import("./db");

// C1c: uploadUrl's key is `${uuid}-${sanitizeBasename(name)}`. The uuid prefix
// only makes the key unguessable if the REST of the key isn't
// attacker-controlled — sanitizeBasename is what stops a caller-supplied
// `name` like "/../report.pdf" from steering path segments into someone
// else's key (which canonicalKey in storage.ts would then reject outright,
// but the point of sanitizing here is to never construct that key at all).
describe("sanitizeBasename", () => {
  it("passes a normal filename through unchanged", () => {
    expect(sanitizeBasename("report.pdf")).toBe("report.pdf");
  });

  it("takes only the last path segment, dropping any directory traversal", () => {
    expect(sanitizeBasename("/../report.pdf")).toBe("report.pdf");
    expect(sanitizeBasename("a/b/../evil.png")).toBe("evil.png");
    expect(sanitizeBasename("../../etc/passwd")).toBe("passwd");
  });

  it("strips characters outside [A-Za-z0-9._-]", () => {
    expect(sanitizeBasename("my file (final)!.png")).toBe("myfilefinal.png");
    expect(sanitizeBasename("héllo.png")).toBe("hllo.png");
  });

  it("collapses leading dots so a bare '.' or '..' basename can't survive", () => {
    expect(sanitizeBasename("..")).toBe("upload");
    expect(sanitizeBasename(".")).toBe("upload");
    expect(sanitizeBasename("...hidden")).toBe("upload.hidden");
  });

  it("keeps the extension when the stem is entirely non-ASCII", () => {
    expect(sanitizeBasename("风景.png")).toBe("upload.png");
    expect(sanitizeBasename("日本語.jpeg")).toBe("upload.jpeg");
    expect(sanitizeBasename("相册/风景.png")).toBe("upload.png");
  });

  it("never emits a path separator, and caps the extension", () => {
    expect(sanitizeBasename("C:\\photos\\风景.png")).toBe("upload.png");
    expect(sanitizeBasename("x." + "a".repeat(40))).toBe("x." + "a".repeat(10));
  });

  it("falls back to a constant when nothing survives sanitization", () => {
    expect(sanitizeBasename("???")).toBe("upload");
    expect(sanitizeBasename("")).toBe("upload");
  });
});

// C1d (regression): storageDeleteOwned runs the key through canonicalKey,
// which throws StorageError("forbidden") for a malformed key BEFORE any
// db/network access. files.remove must map that to BAD_REQUEST, not let it
// escape as an opaque 500.
describe("files.remove", () => {
  it("maps a malformed key (StorageError forbidden) to TRPCError BAD_REQUEST, not a raw throw", async () => {
    vi.mocked(storageDeleteOwned).mockRejectedValueOnce(
      new StorageError("unsafe storage key: ../evil.pdf", "forbidden"),
    );
    const caller = makeCaller({
      c: {} as never,
      db: {} as never,
      user: { id: "user-1", role: "admin" } as never,
    });

    const err = await caller.files.remove({ key: "../evil.pdf" }).catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("BAD_REQUEST");
  });
});

// ── Admin login ──────────────────────────────────────────────────────────────
// The site has exactly ONE admin and NO signup. These tests pin the three
// properties that make that true: only the one username is accepted, the
// password is checked by the auth provider (never here), and repeated attempts
// are throttled.
describe("admin.login", () => {
  const anonymous = { c: { req: { header: () => undefined } } as never, db: {} as never, user: null };

  beforeEach(() => {
    vi.mocked(rateLimit).mockReturnValue({ ok: true });
    vi.mocked(ensureAdminUser).mockResolvedValue(undefined);
    // The auth provider is a module-level singleton, so its spies persist across
    // tests in this file — reset them or a later "not called" assertion sees an
    // earlier test's call.
    vi.mocked(authProvider().login).mockReset();
    vi.mocked(authProvider().logout).mockReset();
  });

  it("rejects any username other than the single admin, before checking a password", async () => {
    const caller = makeCaller(anonymous);
    const err = await caller.admin
      .login({ username: "someone-else", password: "whatever" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("UNAUTHORIZED");
    // The provider's login must never even be reached for a non-admin username.
    expect(authProvider().login).not.toHaveBeenCalled();
  });

  it("maps a bad password (AuthError) to UNAUTHORIZED with a generic message", async () => {
    vi.mocked(authProvider().login).mockRejectedValueOnce(new AuthError("bad password"));
    const caller = makeCaller(anonymous);

    const err = await caller.admin
      .login({ username: "shanislive", password: "wrong" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("UNAUTHORIZED");
    expect((err as TRPCError).message).toMatch(/invalid username or password/i);
  });

  it("returns the admin user on correct credentials", async () => {
    vi.mocked(authProvider().login).mockResolvedValueOnce({
      id: "u_admin",
      email: "shanislive",
      name: "SHANDIP",
      role: "admin",
    });
    const caller = makeCaller(anonymous);

    const user = await caller.admin.login({ username: "shanislive", password: "correct" });

    expect(user.role).toBe("admin");
    expect(user.email).toBe("shanislive");
  });

  it("throttles with TOO_MANY_REQUESTS once the rate limiter trips", async () => {
    vi.mocked(rateLimit).mockReturnValueOnce({ ok: false, retryAfterSec: 600 });
    const caller = makeCaller(anonymous);

    const err = await caller.admin
      .login({ username: "shanislive", password: "correct" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("TOO_MANY_REQUESTS");
    expect(authProvider().login).not.toHaveBeenCalled();
  });
});

// ── Content CRUD is admin-only ───────────────────────────────────────────────
describe("content write procedures", () => {
  it("refuses an anonymous caller", async () => {
    const caller = makeCaller({ c: {} as never, db: {} as never, user: null });
    const err = await caller.content
      .create({ resource: "gallery", values: { src: "/x.png", caption: "x" } })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("UNAUTHORIZED");
  });

  it("refuses a logged-in non-admin caller", async () => {
    const caller = makeCaller({
      c: {} as never,
      db: {} as never,
      user: { id: "u1", role: "user" } as never,
    });
    const err = await caller.content
      .create({ resource: "gallery", values: { src: "/x.png", caption: "x" } })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("FORBIDDEN");
  });

  it("validates the payload for the resource and creates the row for an admin", async () => {
    vi.mocked(db.createResource).mockResolvedValueOnce({ id: "g1" } as never);
    const caller = makeCaller({
      c: {} as never,
      db: {} as never,
      user: { id: "u_admin", role: "admin" } as never,
    });

    const row = await caller.content.create({
      resource: "gallery",
      values: { src: "/images/gallery/a.webp", caption: "Live", tag: "Live", alt: "", width: 800, height: 1200, sortOrder: 0 },
    });

    expect(row).toEqual({ id: "g1" });
    expect(db.createResource).toHaveBeenCalledWith(
      "gallery",
      expect.objectContaining({ src: "/images/gallery/a.webp", caption: "Live" }),
    );
  });

  it("rejects an unknown resource name", async () => {
    const caller = makeCaller({
      c: {} as never,
      db: {} as never,
      user: { id: "u_admin", role: "admin" } as never,
    });
    const err = await caller.content
      .list({ resource: "not-a-resource" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
  });

  it("maps a missing row on update to NOT_FOUND", async () => {
    vi.mocked(db.updateResource).mockResolvedValueOnce(null as never);
    const caller = makeCaller({
      c: {} as never,
      db: {} as never,
      user: { id: "u_admin", role: "admin" } as never,
    });

    const err = await caller.content
      .update({ resource: "events", id: "gone", values: { title: "x" } })
      .catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("NOT_FOUND");
  });
});

// ── Public reads and enquiry intake ──────────────────────────────────────────
describe("public procedures", () => {
  it("serves the site content bundle to anyone", async () => {
    vi.mocked(db.getSiteContent).mockResolvedValueOnce({
      settings: { artist: "SHANDIP" },
      socials: [],
      gallery: [],
      events: [],
      music: [],
      occasions: [],
      testimonials: [],
      availability: [],
    } as never);

    const caller = makeCaller({ c: {} as never, db: {} as never, user: null });
    const content = await caller.content.getSite();

    expect(content.settings.artist).toBe("SHANDIP");
  });

  it("accepts an enquiry from an anonymous visitor", async () => {
    vi.mocked(db.createEnquiry).mockResolvedValueOnce({ id: "e1" } as never);
    const caller = makeCaller({ c: {} as never, db: {} as never, user: null });

    const row = await caller.enquiries.create({
      name: "Asha",
      contact: "+91 90000 00000",
      eventType: "Weddings & Receptions",
      city: "Mumbai",
      venue: "The Grand",
    });

    expect(row).toEqual({ id: "e1" });
    expect(db.createEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Asha", city: "Mumbai" }),
    );
  });

  it("keeps the enquiry inbox admin-only", async () => {
    const caller = makeCaller({ c: {} as never, db: {} as never, user: null });
    const err = await caller.enquiries.list().catch((e) => e);

    expect(err).toBeInstanceOf(TRPCError);
    expect((err as TRPCError).code).toBe("UNAUTHORIZED");
  });
});
