// ── Admin account + login throttling ─────────────────────────────────────────
//
// The site has exactly ONE admin. There is no signup path anywhere in the app:
// the account is bootstrapped here, server-side, and its password is stored only
// as a bcrypt hash — the plaintext is never written to the repo, the database,
// or any log.
//
// The hash below is a one-way bcrypt digest of the permanent admin password.
// `authProvider().login()` (server/_core/auth.ts) does the bcrypt comparison, so
// this module never handles the plaintext at all.
import { eq } from "drizzle-orm";
import { db } from "./_core/db";
import { users } from "../drizzle/schema";

/** The single admin's login name. Stored in `users.email` (the column is a
 *  unique text field; the admin logs in with this name, not an email address). */
export const ADMIN_USERNAME = "shanislive";

/** bcrypt hash (cost 10) of the permanent admin password. One-way; the
 *  plaintext is deliberately absent from this repository. */
const ADMIN_PASSWORD_HASH = "$2b$10$8LjdTxB8h7x1DyQ8PEjmmezfbMoZFI10PyjxF9U0sSaFM0XluZ3P.";

/**
 * Idempotently ensure the single admin row exists with role 'admin' and the
 * authoritative password hash. Safe to call on every login: it inserts once and
 * afterwards only repairs the row if its role or hash drifted.
 */
export async function ensureAdminUser(): Promise<void> {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_USERNAME))
    .limit(1);

  if (existing) {
    if (existing.role !== "admin" || existing.passwordHash !== ADMIN_PASSWORD_HASH) {
      await db
        .update(users)
        .set({ role: "admin", passwordHash: ADMIN_PASSWORD_HASH })
        .where(eq(users.id, existing.id));
    }
    return;
  }

  await db.insert(users).values({
    email: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD_HASH,
    name: "SHANDIP",
    role: "admin",
  });
}

// ── Login rate limiting ──────────────────────────────────────────────────────
//
// A fixed-window counter per client key (IP). The app runs as a single process,
// so an in-memory map is sufficient and needs no extra infrastructure. It exists
// to blunt brute-force attempts against the one admin account.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

/** Record an attempt for `key` and report whether it is allowed. */
export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    const oldest = recent[0] ?? now;
    attempts.set(key, recent);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)) };
  }

  recent.push(now);
  attempts.set(key, recent);
  return { ok: true };
}

/** Clear the counter for `key` after a successful login. */
export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

/** Test-only: drop all counters so suites do not leak state into each other. */
export function resetRateLimits(): void {
  attempts.clear();
}
