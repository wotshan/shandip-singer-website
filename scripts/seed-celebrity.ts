// Seed the celebrity-brand collections with REAL, defensible content only.
//
// Idempotent: each collection is only seeded when it is empty, so re-running
// never clobbers anything the admin has since edited.
//
// HONESTY RULE: awards, press features, brand collaborations and fan messages
// are deliberately NOT seeded — the artist has not supplied any, and inventing
// them would be a false claim about a real person. Those sections render an
// honest empty state (or hide) until the admin adds genuine entries.
//
// What IS seeded is real and already stated on the site:
//   * stats        — the languages performed in and the cities on the map.
//   * highlights   — the artist's own performance photographs.
//   * pressMentions— the artist's real public platforms (not fake press logos).
//
// Run: pnpm tsx scripts/seed-celebrity.ts
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on("error", (e) => console.error("[seed-celebrity] pool error", e));
const db = drizzle(pool, { schema });

/* eslint-disable @typescript-eslint/no-explicit-any */
async function seedIfEmpty(name: string, table: any, rows: unknown[]) {
  const existing = await db.select().from(table).limit(1);
  if (existing.length > 0) {
    console.log(`[seed-celebrity] ${name} already populated — skipping.`);
    return;
  }
  await db.insert(table).values(rows as never);
  console.log(`[seed-celebrity] seeded ${name} (${rows.length} rows).`);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function main() {
  await seedIfEmpty("stats", schema.stats, [
    { label: "Languages performed in", value: 4, suffix: "", sortOrder: 0 },
    { label: "Cities on the map", value: 5, suffix: "+", sortOrder: 1 },
  ]);

  await seedIfEmpty("highlights", schema.highlights, [
    { src: "/images/gallery/gallery_live_01.webp", caption: "Live performance", alt: "Performer silhouetted against stage fog, holding a microphone on a stand", sortOrder: 0 },
    { src: "/images/gallery/gallery_stage_02.webp", caption: "Stage performance", alt: "Musician playing an electric guitar on a spotlit stage, amplifier and drum kit behind", sortOrder: 1 },
    { src: "/images/gallery/gallery_acoustic_03.webp", caption: "Artist portrait", alt: "Portrait of the artist in glasses against a plain backdrop", sortOrder: 2 },
  ]);

  await seedIfEmpty("pressMentions", schema.pressMentions, [
    { label: "Instagram", href: "https://instagram.com/shaan.islive/", sortOrder: 0 },
    { label: "Linktree", href: "https://linktr.ee/winewithshan", sortOrder: 1 },
    { label: "Discord", href: "https://discord.gg/kMANJukS7", sortOrder: 2 },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shandip-das-834410417", sortOrder: 3 },
    { label: "Facebook", href: "https://www.facebook.com/share/14qmhb5r3UX/", sortOrder: 4 },
  ]);

  console.log("[seed-celebrity] done.");
  await pool.end();
}

main().catch(async (e) => {
  console.error("[seed-celebrity] failed", e);
  await pool.end();
  process.exit(1);
});
