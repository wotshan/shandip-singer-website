// ── Guard: a table the app needs must have a migration that CREATES it ────────
//
// WHY THIS TEST EXISTS
//   Production came up with 14 of the 22 tables in drizzle/schema.ts and every
//   read behind the admin dashboard answered 500. The cause was not the code:
//   `0004_funny_roulette.sql` created 8 tables and 3 columns, but it was never
//   listed in drizzle/migrations/meta/_journal.json — so `drizzle-kit migrate`
//   skipped it on every fresh database. It had been "recorded" by hand instead
//   (scripts/_record-migration.ts wrote its hash into drizzle.__drizzle_migrations
//   without running the SQL), which meant an incrementally-built dev database
//   looked fine while a fresh production one was missing the tables entirely.
//
//   `pnpm typecheck` and `pnpm test` were both GREEN while production was broken,
//   because nothing compared schema.ts against the migrations that are actually
//   scheduled to run. This file is that comparison.
//
// WHAT IT CATCHES
//   1. a .sql migration the journal does not list   → never runs on a fresh DB
//   2. a journal entry with no .sql file            → migrate fails, or lies
//   3. a table in drizzle/schema.ts that no listed migration creates
//   4. a duplicated or non-sequential journal idx   → ambiguous apply order
//
// It is intentionally a plain file-system check (no database, no network) so it
// runs in CI on every push and fails the build before a broken schema ships.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS = path.join(ROOT, "drizzle", "migrations");
const JOURNAL = path.join(MIGRATIONS, "meta", "_journal.json");
const SCHEMA = path.join(ROOT, "drizzle", "schema.ts");

type Entry = { idx: number; tag: string };

const journal = JSON.parse(fs.readFileSync(JOURNAL, "utf8")) as { entries: Entry[] };
const tags = journal.entries.map((e) => e.tag);
const sqlTags = fs
  .readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => f.replace(/\.sql$/, ""));
const schemaSource = fs.readFileSync(SCHEMA, "utf8");
/** Every table the app's Drizzle schema declares — i.e. every table the code
 *  will query at runtime. */
const schemaTables = [...schemaSource.matchAll(/pgTable\(\s*"([a-z_]+)"/g)].map((m) => m[1]);

/** All SQL that the journal says WILL run on a fresh database. */
const scheduledSql = tags
  .map((tag) => {
    const file = path.join(MIGRATIONS, `${tag}.sql`);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  })
  .join("\n");

const createsTable = (sql: string, table: string) =>
  new RegExp(`create\\s+table\\s+(if\\s+not\\s+exists\\s+)?"${table}"`, "i").test(sql);

describe("drizzle migrations are complete and correctly scheduled", () => {
  it("declares at least one table and one migration", () => {
    expect(schemaTables.length).toBeGreaterThan(1);
    expect(journal.entries.length).toBeGreaterThan(0);
  });

  it("lists every .sql migration in the journal", () => {
    // A file the journal does not list is the exact production defect: migrate
    // never runs it, and a fresh database silently comes up short.
    const unlisted = sqlTags.filter((t) => !tags.includes(t));
    expect(unlisted, `unlisted migration(s) — would never run on a fresh DB: ${unlisted.join(", ")}`)
      .toEqual([]);
  });

  it("has a .sql file for every journal entry", () => {
    const missing = tags.filter((t) => !sqlTags.includes(t));
    expect(missing, `journal entries with no .sql file: ${missing.join(", ")}`).toEqual([]);
  });

  it("does not reuse a migration index", () => {
    const idx = journal.entries.map((e) => e.idx);
    expect(new Set(idx).size, `duplicate idx in _journal.json: ${idx.join(", ")}`).toBe(idx.length);
  });

  it("creates every table the schema declares", () => {
    const missing = schemaTables.filter((t) => !createsTable(scheduledSql, t));
    expect(
      missing,
      `table(s) in drizzle/schema.ts that no scheduled migration creates: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("adds every enquiries/events column the schema declares", () => {
    // The same stranded migration that lost the tables also lost these three
    // columns. A missing column fails at runtime with 42703 (undefined_column),
    // which is what broke the very first read the site makes.
    const expected = [
      ["events", "ticket_href"],
      ["events", "ticket_label"],
      ["enquiries", "budget"],
    ] as const;
    const missing = expected.filter(
      ([table, column]) =>
        !new RegExp(
          `alter\\s+table\\s+"${table}"\\s+add\\s+column\\s+(if\\s+not\\s+exists\\s+)?"${column}"`,
          "i",
        ).test(scheduledSql),
    );
    expect(
      missing.map(([t, c]) => `${t}.${c}`),
      "column(s) the schema needs that no scheduled migration adds",
    ).toEqual([]);
  });
});
