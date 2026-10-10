import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);
const rows = await sql.unsafe("select short_intro from site_settings limit 1");
console.log("DB_SHORT_INTRO=" + JSON.stringify(rows[0]?.short_intro ?? null));
await sql.end();
