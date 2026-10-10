import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleTcp } from "drizzle-orm/node-postgres";
import type { BatchItem, BatchResponse } from "drizzle-orm/batch";
import pg from "pg";
import * as schema from "../../drizzle/schema";
import { env } from "./env";

// DB driver is selectable via DB_DRIVER (DESIGN §5.1: the template stays
// DB-vendor-agnostic — it only ever sees DATABASE_URL + DB_DRIVER, never the
// platform's DBProvider). A Neon endpoint serves BOTH wire protocols.
//
//   http (hosted): @neondatabase/serverless over HTTPS. One request per query,
//                  no TCP pool — the only thing that works in a WebContainer
//                  preview (a browser has no raw socket) and the right fit for
//                  scale-to-zero Cloud Run.
//   tcp:           node-postgres pool. Local / self-hosted Postgres.
//
// INTERACTIVE TRANSACTIONS DO NOT EXIST ON `http`, which is why `db` below is
// typed WITHOUT `transaction`: one HTTP request per query means there is no
// session to hold a BEGIN open in, so drizzle's neon-http session throws
// "No transactions support in neon-http driver". A published app once 500'd on
// every "create" for exactly that reason while dev on tcp passed — including
// `pnpm test` AND `pnpm typecheck`, because both drivers' types have
// `.transaction()`. Taking it off the type is what turns that 500 into a compile
// error in dev. Use `atomic()` below.
//
// Migrations always go through drizzle-kit + DATABASE_URL over TCP, regardless
// of DB_DRIVER (drizzle.config.ts) — prefer Neon's direct (non-pooler) URL there.
//
// `batch` is banned from the app-facing type for the mirror-image reason:
// it exists only on the http driver (Neon's `NeonHttpDatabase` subclass adds
// it; the tcp driver's base `PgDatabase` has no such method), so `db.batch(...)`
// would compile — `db` is typed from `NeonHttpDatabase` — and then throw
// `TypeError: db.batch is not a function` at runtime on tcp. `AppDB` is meant to
// be the surface BOTH drivers actually implement; `atomic()` is the sanctioned
// way to reach either `.batch` (http) or `.transaction` (tcp).
export type AppDB = Omit<NeonHttpDatabase<typeof schema>, "transaction" | "batch">;

// Typed from the HTTP database on purpose: http is what serves users, and the two
// drivers' `execute()` result shapes differ (node-postgres adds `oid`). Typing
// against the driver that is NOT in production would promise the app author a
// field that vanishes on deploy.
function makeTcp() {
  // `max` is bounded deliberately (see env.dbPoolMax): on the platform this pool
  // is one of many against a single shared Postgres cluster. node-postgres closes
  // idle clients on its own, so the cap only binds under concurrent load — which
  // is exactly when an unbounded pool would take slots away from other apps.
  //
  // SERVERLESS-SAFE TIMEOUTS. The pool object is a module-level singleton, so a
  // frozen-then-resumed serverless instance reuses its connections instead of
  // dialing a fresh one per request. The three timeouts below exist because a
  // serverless host gives each instance a fixed, short lifetime: without them an
  // instance can sit on connections a scale-to-zero database has already closed,
  // and every request pays for the dead socket before reconnecting.
  //   connectionTimeoutMillis — fail fast when the DB is unreachable or the
  //                             connection limit is hit, instead of hanging until
  //                             the platform kills the request.
  //   idleTimeoutMillis       — close an idle client well before the DB (or a
  //                             proxy in front of it) would time it out itself.
  //   query_timeout/statement_timeout — put a ceiling on a single statement so one
  //                             runaway query cannot hold the (small) pool open.
  const pool = new pg.Pool({
    connectionString: env.databaseUrl,
    max: env.dbPoolMax,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 20_000,
    statement_timeout: 20_000,
  });
  // A pool with no error handler is a process that exits. Postgres (and Neon)
  // closes idle connections, and on a scale-to-zero runtime the container is
  // frozen between requests, so this is the normal case, not the exotic one:
  // node treats an idle client's 'error' as unhandled and kills the process,
  // while the pool itself would just discard the client and carry on.
  pool.on("error", (err) => console.error("[db] idle client error", err));
  return drizzleTcp(pool, { schema });
}

const driver = env.dbDriver === "http" ? drizzleHttp(neon(env.databaseUrl), { schema }) : makeTcp();

export const db: AppDB = driver as unknown as AppDB;

/** Run several writes as ONE atomic unit — the replacement for `db.transaction`.
 *
 *     const [created, logged] = await atomic((d) => [
 *       d.insert(items).values({ id, ...input }).returning(),
 *       d.insert(auditLog).values({ itemId: id, action: "create" }).returning(),
 *     ]);
 *
 * `http`: one `db.batch` — a single HTTP request that Neon wraps in a real
 * server-side BEGIN/COMMIT, so a failure anywhere rolls the whole thing back.
 * `tcp`: a real transaction with the builders bound to `tx`.
 *
 * WHAT YOU CANNOT DO: read a result and then decide what to write next — the
 * statements all leave together. Read and compute BEFORE the call, then make
 * every statement carry a SQL guard that re-checks what you read
 * (`where status = 'draft'`, `where version = $expected`), and treat a zero-row
 * RETURNING as "somebody got there first" rather than asserting it cannot
 * happen. `select … for update` DOES work in here (this is a real transaction)
 * and is how you serialise concurrent callers; a `for update` OUTSIDE `atomic`
 * locks nothing, because the lock dies with its statement. */
export async function atomic<T extends Readonly<[BatchItem<"pg">, ...BatchItem<"pg">[]]>>(
  build: (d: AppDB) => T,
): Promise<BatchResponse<T>> {
  if (env.dbDriver === "http") {
    return (driver as NeonHttpDatabase<typeof schema>).batch(build(db));
  }
  const out: unknown[] = [];
  await (driver as ReturnType<typeof makeTcp>).transaction(async (tx) => {
    // Bound to `tx`, not `db`: builders made from `db` would run on the pool,
    // outside the transaction — atomic in name only.
    for (const q of build(tx as unknown as AppDB)) out.push(await q);
  });
  return out as BatchResponse<T>;
}

export { schema };
export type DB = AppDB;

// Re-exported so business code has ONE db import site. Read db-errors.ts before
// catching a write failure: Drizzle hides the driver's error (and its SQLSTATE)
// behind a wrapper whose message is the query plus its bound params.
export { isUniqueViolation } from "./db-errors";
