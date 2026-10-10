// Temporary read-only check used during the admin-entry-point verification.
import { config } from "dotenv";
config();
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string);
const rows = await sql`select short_intro from site_settings limit 1`;
console.log("DB_SHORT_INTRO=" + JSON.stringify(rows[0]?.short_intro ?? null));
await sql.end();
