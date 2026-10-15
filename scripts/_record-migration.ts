// ── DEPRECATED — DO NOT RUN. Kept only so the mistake stays visible. ──────────
//
// This script was written to make `drizzle-kit migrate` accept
// 0004_funny_roulette.sql, which was stranded: TWO migrations shared the `0004_`
// prefix, so only one of them could be listed in
// drizzle/migrations/meta/_journal.json.
//
// It "fixed" that by pushing the tag into the journal and inserting the SQL hash
// straight into drizzle.__drizzle_migrations WITHOUT RUNNING THE SQL. On the
// incremental dev database that was invisible. On a fresh one it meant the 8
// tables and 3 columns that file creates never existed — and because
// content.getSite() reads every table in one Promise.all, the whole site API
// answered 500 while the public pages kept rendering from the client's static
// fallback (see shared/types.ts). That is what made a missing schema look like a
// broken admin login.
//
// The real fixes are:
//   · drizzle/migrations/0005_login_fix_schema_gap.sql — the repair, idempotent
//   · scripts/apply-sql-migration.ts                   — records a hash ONLY
//                                                        after its SQL ran
//   · server/schema-migrations.test.ts                 — fails CI when a .sql
//                                                        file is not in the journal
//
// It now refuses to do anything at all.
console.error(
  "✗ scripts/_record-migration.ts is deprecated and disabled.\n" +
    "  It recorded a migration as applied without running it, which is how the\n" +
    "  production schema ended up missing 8 tables.\n\n" +
    "  Use instead:\n" +
    "    pnpm db:apply   # run every journal-listed migration, record it AFTER it runs\n" +
    "    pnpm db:check   # report the tables/columns the target database is missing\n",
);
process.exit(1);
