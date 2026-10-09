// One-time rebrand of the LIVE content rows: SHANDIP -> Raag Sargam.
//
// The public site renders from Postgres, so renaming the brand in code alone is
// not enough — the seeded rows still carry the old name. This script rewrites
// the artist name and every spoken social handle, and swaps the old name inside
// the long intro. Idempotent: safe to run more than once.
//
// Run: pnpm tsx scripts/rebrand-content.ts
import "dotenv/config";
import pg from "pg";

const OLD = "SHANDIP";
const NEW = "Raag Sargam";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on("error", (e) => console.error("[rebrand] pool error", e));

async function main() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const settings = await client.query(
      "update site_settings set artist = $1, long_intro = replace(long_intro, $2, $3), updated_at = now() where id = 'main' returning artist",
      [NEW, OLD, NEW],
    );
    console.log("[rebrand] site_settings:", settings.rows[0] ?? "no row");

    const socials = await client.query(
      "update social_links set handle = replace(handle, $1, $2) where handle like '%' || $1 || '%' returning label, handle",
      [OLD, NEW],
    );
    console.log("[rebrand] social handles updated:", socials.rowCount);

    await client.query("commit");
    console.log("[rebrand] done.");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("[rebrand] failed", e);
  process.exit(1);
});
