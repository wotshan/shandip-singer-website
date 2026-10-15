// ── Apply journal-listed SQL migrations, directly and safely ──────────────────
//
// WHY THIS EXISTS
//   `drizzle-kit migrate` remains the normal local command, but it trusts
//   meta/_journal.json completely: a .sql file it does not list is silently
//   ignored, and there is no way to re-run one whose bookkeeping row is missing.
//   A previous helper (scripts/_record-migration.ts) abused that gap: it pushed
//   a tag into the journal and inserted the SQL hash into
//   drizzle.__drizzle_migrations WITHOUT RUNNING THE SQL. On a database that had
//   grown incrementally this was invisible; on a fresh one the tables simply did
//   not exist — which is how production ended up missing 8 tables and every read
//   behind the admin dashboard answered 500. See
//   drizzle/migrations/0005_login_fix_schema_gap.sql.
//
// WHAT THIS DOES INSTEAD
//   It runs the SQL. Walking meta/_journal.json in order, for every entry whose
//   hash is NOT already in drizzle.__drizzle_migrations it runs that file's
//   statements inside ONE transaction and records the hash INSIDE that same
//   transaction. "Recorded" therefore always means "actually ran", and running
//   this any number of times converges: already-applied entries are skipped.
//
// WHAT IT REFUSES TO DO (the part that prevents a repeat)
//   · a tag listed in the journal with no .sql file  → hard error
//   · a .sql file that the journal does NOT list     → hard error
//   · it NEVER writes to _journal.json.
//   server/migrations.test.ts asserts the same invariants, so the failure shows
//   up in CI instead of at deploy time.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";

const DIR = "drizzle/migrations";
const JOURNAL = path.join(DIR, "meta", "_journal.json");

type Entry = { idx: number; tag: string };

const journal = JSON.parse(fs.readFileSync(JOURNAL, "utf8")) as { entries: Entry[] };
const entries = [...journal.entries].sort((a, b) => a.idx - b.idx);

const onDisk = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.replace(/\.sql$/, ""));
const journalTags = new Set(entries.map((e) => e.tag));
const stranded = onDisk.filter((t) => !journalTags.has(t));
const missingFiles = entries.map((e) => e.tag).filter((t) => !onDisk.includes(t));

if (missingFiles.length) {
  console.error(`✗ journal lists migrations with no .sql file: ${missingFiles.join(", ")}`);
  console.error("  Add the file, or remove the entry — never let the journal lie.");
  process.exit(1);
}
if (stranded.length) {
  console.error(`✗ .sql files exist that the journal does NOT list: ${stranded.join(", ")}`);
  console.error("  An unlisted file never runs on a fresh database. Re-emit it with");
  console.error("  `pnpm db:generate`, or add a journal entry that lists it.");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set (use the DIRECT, non-pooled URL for migrations).");
  process.exit(1);
}

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

const pool = new pg.Pool({ connectionString: url, max: 1 });
const client = await pool.connect();

try {
  // Drizzle's own bookkeeping table, in the exact shape drizzle-kit creates, so
  // this script is safe to run first against a completely empty database.
  await client.query(`create schema if not exists "drizzle"`);
  await client.query(`create table if not exists "drizzle"."__drizzle_migrations" (
      id serial primary key,
      hash text not null,
      created_at bigint
    )`);

  let applied = 0;
  let skipped = 0;

  for (const entry of entries) {
    const sql = fs.readFileSync(path.join(DIR, `${entry.tag}.sql`), "utf8");
    const hash = sha256(sql);

    const { rows } = await client.query(
      "select 1 from drizzle.__drizzle_migrations where hash = $1 limit 1",
      [hash],
    );
    if (rows.length) {
      skipped++;
      continue;
    }

    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    process.stdout.write(`▸ ${entry.tag} (${statements.length} statement(s)) … `);
    await client.query("begin");
    try {
      for (const statement of statements) await client.query(statement);
      // Recorded INSIDE the transaction: a hash can never be recorded for a
      // migration that did not run.
      await client.query(
        "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)",
        [hash, Date.now()],
      );
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      console.error("failed");
      throw err;
    }
    console.log("applied");
    applied++;
  }

  console.log(`\n✓ ${applied} applied, ${skipped} already up to date.`);
} finally {
  client.release();
  await pool.end();
}
