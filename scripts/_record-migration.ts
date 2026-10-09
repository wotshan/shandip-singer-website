import "dotenv/config";
import fs from "node:fs";
import crypto from "node:crypto";
import pg from "pg";

const jp = "drizzle/migrations/meta/_journal.json";
const j = JSON.parse(fs.readFileSync(jp, "utf8"));
const has = j.entries.some((e: { tag: string }) => e.tag === "0004_funny_roulette");
if (!has) {
  j.entries.push({ idx: 4, version: "7", when: Date.now(), tag: "0004_funny_roulette", breakpoints: true });
  fs.writeFileSync(jp, JSON.stringify(j, null, 2));
  console.log("journal updated");
} else {
  console.log("journal already has 0004");
}

const sql = fs.readFileSync("drizzle/migrations/0004_funny_roulette.sql", "utf8");
const hash = crypto.createHash("sha256").update(sql).digest("hex");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(
  "insert into drizzle.__drizzle_migrations (hash, created_at) values ($1,$2) on conflict do nothing",
  [hash, Date.now()],
);
console.log("migration row recorded", hash.slice(0, 12));
await pool.end();
