// ── Is the database you are pointed at actually complete? ────────────────────
//
// WHY THIS EXISTS
//   Production served a public site that looked perfect, while every screen
//   behind the admin dashboard answered 500. The reason it looked fine: the
//   client keeps a static fallback of the site content (see the note at the top
//   of shared/types.ts), so a broken API is invisible on the public pages. The
//   dashboard had no such fallback, so it was the only place the fault showed —
//   which is why it read as "admin login is broken" when the login itself worked
//   and the schema behind it did not.
//
//   This prints exactly which tables and columns of drizzle/schema.ts the target
//   database is missing, so that question is answered in one command instead of
//   an afternoon of guessing.
//
// USAGE
//   pnpm db:check                     # uses DATABASE_URL from .env
//   DATABASE_URL="<url>" pnpm db:check   # check any database (e.g. production)
//
// Exits non-zero when something is missing, so it can gate a deploy script.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

// The columns that are added by ALTER rather than by the CREATE TABLE, so they
// cannot be discovered from the table list alone.
const ALTERED_COLUMNS: Array<[table: string, column: string]> = [
  ["events", "ticket_href"],
  ["events", "ticket_label"],
  ["enquiries", "budget"],
];

const schemaSource = fs.readFileSync(path.resolve("drizzle/schema.ts"), "utf8");
const schemaTables = [...schemaSource.matchAll(/pgTable\(\s*"([a-z_]+)"/g)]
  .map((m) => m[1])
  .sort();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ DATABASE_URL is not set (drizzle.config.ts reads it too).");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });

try {
  const { rows } = await pool.query<{ tablename: string }>(
    "select tablename from pg_tables where schemaname = 'public'",
  );
  const present = new Set(rows.map((r) => r.tablename));

  const missingTables = schemaTables.filter((t) => !present.has(t));

  const missingColumns: string[] = [];
  for (const [table, column] of ALTERED_COLUMNS) {
    if (!present.has(table)) {
      missingColumns.push(`${table}.${column} (whole table missing)`);
      continue;
    }
    const col = await pool.query(
      `select 1 from information_schema.columns
        where table_schema = 'public' and table_name = $1 and column_name = $2`,
      [table, column],
    );
    if (col.rowCount === 0) missingColumns.push(`${table}.${column}`);
  }

  const extra = [...present].filter((t) => !schemaTables.includes(t)).sort();

  const host = url.replace(/^(postgres(?:ql)?:\/\/)[^@]*@/, "$1***@");
  console.log(`target: ${host}`);
  console.log(`tables: ${present.size} present, ${schemaTables.length} declared by drizzle/schema.ts`);
  if (extra.length) console.log(`  (ignored, not in schema.ts: ${extra.join(", ")})`);

  if (!missingTables.length && !missingColumns.length) {
    console.log("\n✓ schema is complete — every table and column the app needs exists.");
    process.exit(0);
  }

  console.log("");
  if (missingTables.length) console.log(`✗ missing tables (${missingTables.length}): ${missingTables.join(", ")}`);
  if (missingColumns.length) console.log(`✗ missing columns (${missingColumns.length}): ${missingColumns.join(", ")}`);
  console.log("\n  Fix: apply the pending migrations to this database —");
  console.log(
    "    DATABASE_URL=\"<the same url>\" pnpm db:apply\n" +
      "  (`pnpm db:apply` runs every migration listed in meta/_journal.json and\n" +
      "   records each one only after its SQL actually ran.)",
  );
  process.exit(1);
} finally {
  await pool.end();
}
