// One-time content seed for the SHANDIP site.
//
// Idempotent: it only runs when `site_settings` is empty, so re-running it never
// clobbers content the admin has since edited. Everything here is REAL — the
// artist's own profile, contact channels and performance photographs. There are
// deliberately NO invented events, awards, show counts or testimonials: those
// collections start empty and the admin fills them in.
//
// Run: pnpm tsx scripts/seed-content.ts
import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on("error", (e) => console.error("[seed] pool error", e));
const db = drizzle(pool, { schema });

async function main() {
  const existing = await db.select().from(schema.siteSettings).limit(1);
  if (existing.length > 0) {
    console.log("[seed] site_settings already populated — skipping.");
    await pool.end();
    return;
  }

  console.log("[seed] seeding real SHANDIP content…");

  await db.insert(schema.siteSettings).values({
    id: "main",
    artist: "SHANDIP",
    role: "Professional Singer & Live Performer",
    tagline: "YOUR OCCASION. MY VOICE. ONE UNFORGETTABLE NIGHT.",
    shortIntro:
      "A professional live singer performing at weddings, receptions, private parties, clubs, corporate events, college festivals and special occasions.",
    longIntro:
      "SHANDIP is a professional singer and live performer who has spent years on stage turning rooms into moments people remember. From the first note of a wedding entrance to the last chorus of a late-night club set, every performance is shaped around the occasion — the people in the room, the mood they came for, and the songs they will not stop talking about afterwards.",
    email: "shandip8638@gmail.com",
    phoneDisplay: "+91 93653 95136",
    phoneHref: "tel:+919365395136",
    whatsappDisplay: "+91 62915 67770",
    whatsapp: "https://wa.me/916291567770",
    cities: "Mumbai · Delhi · Bengaluru · Goa · Pune",
    travelNote: "Available across India and for destination events worldwide.",
  });

  await db.insert(schema.socialLinks).values([
    { key: "whatsapp", label: "WhatsApp", value: "+91 62915 67770", href: "https://wa.me/916291567770", handle: "Message SHANDIP on WhatsApp", external: true, sortOrder: 0 },
    { key: "instagram", label: "Instagram", value: "@shaan.islive", href: "https://instagram.com/shaan.islive/", handle: "Follow SHANDIP on Instagram", external: true, sortOrder: 1 },
    { key: "linktree", label: "Linktree", value: "All links in one place", href: "https://linktr.ee/winewithshan", handle: "Open SHANDIP's Linktree", external: true, sortOrder: 2 },
    { key: "discord", label: "Discord", value: "Join the community", href: "https://discord.gg/kMANJukS7", handle: "Join SHANDIP's Discord server", external: true, sortOrder: 3 },
    { key: "linkedin", label: "LinkedIn", value: "Professional profile", href: "https://www.linkedin.com/in/shandip-das-834410417", handle: "Connect with SHANDIP on LinkedIn", external: true, sortOrder: 4 },
    { key: "facebook", label: "Facebook", value: "Follow the page", href: "https://www.facebook.com/share/14qmhb5r3UX/", handle: "Follow SHANDIP on Facebook", external: true, sortOrder: 5 },
    { key: "email", label: "Email", value: "shandip8638@gmail.com", href: "mailto:shandip8638@gmail.com", handle: "Email SHANDIP at shandip8638@gmail.com", external: false, sortOrder: 6 },
    { key: "phone", label: "Phone", value: "+91 93653 95136", href: "tel:+919365395136", handle: "Call SHANDIP on +91 93653 95136", external: false, sortOrder: 7 },
  ]);

  await db.insert(schema.galleryItems).values([
    { src: "/images/gallery/gallery_live_01.webp", width: 449, height: 636, caption: "Live performance", tag: "Live", alt: "Performer silhouetted against stage fog, holding a microphone on a stand", sortOrder: 0 },
    { src: "/images/gallery/gallery_stage_02.webp", width: 735, height: 1106, caption: "Stage performance", tag: "Stage", alt: "Musician playing an electric guitar on a spotlit stage, amplifier and drum kit behind", sortOrder: 1 },
    { src: "/images/gallery/gallery_acoustic_03.webp", width: 788, height: 1400, caption: "Artist portrait", tag: "Portrait", alt: "Portrait of the artist in glasses against a plain backdrop", sortOrder: 2 },
  ]);

  // Set types SHANDIP performs — descriptive of the service, with no invented
  // streaming links or track durations.
  await db.insert(schema.musicItems).values([
    { title: "Acoustic Covers", category: "Acoustic Covers", blurb: "Stripped-back guitar and vocals — the quiet half of an evening.", sortOrder: 0 },
    { title: "Bollywood Live", category: "Bollywood", blurb: "A continuous run through the songs every crowd sings back.", sortOrder: 1 },
    { title: "Romantic Evenings", category: "Romantic", blurb: "Slow, warm arrangements for receptions and anniversaries.", sortOrder: 2 },
    { title: "Live Sessions", category: "Live Sessions", blurb: "Full-band energy captured from a live performance.", sortOrder: 3 },
  ]);

  await db.insert(schema.occasions).values([
    { title: "Weddings & Receptions", blurb: "From the entrance set to the last dance — a soundtrack built around the couple and the room.", includes: ["Entrance & first-dance set", "Family favourites", "Full-band or acoustic"], sortOrder: 0 },
    { title: "Engagement Ceremonies", blurb: "Warm, intimate vocals for the moment two families come together.", includes: ["Romantic sets", "Close-mic acoustic", "Custom song requests"], sortOrder: 1 },
    { title: "Birthday Parties", blurb: "High-energy sets that keep the floor moving, from milestone birthdays to intimate dinners.", includes: ["Party anthems", "Retro & current mix", "Crowd requests"], sortOrder: 2 },
    { title: "Private Celebrations", blurb: "Anniversaries, get-togethers and house parties with a live voice at the centre.", includes: ["Tailored setlist", "Acoustic format", "Flexible timing"], sortOrder: 3 },
    { title: "Club Performances", blurb: "Late-night live vocals over a club sound system, built to hold a packed room.", includes: ["High-energy sets", "DJ collaboration", "Extended sessions"], sortOrder: 4 },
    { title: "Corporate Events", blurb: "Annual nights, product launches and team celebrations with a polished, professional show.", includes: ["Stage-ready setup", "Brand-appropriate set", "MC & hosting on request"], sortOrder: 5 },
    { title: "College Festivals", blurb: "Headline sets for fests and cultural nights, tuned to a young, loud crowd.", includes: ["Festival-scale energy", "Bollywood & indie", "Opening or closing act"], sortOrder: 6 },
    { title: "Acoustic Sessions", blurb: "Unplugged, close and personal — vocals and guitar for intimate spaces.", includes: ["Unplugged format", "Small-venue ready", "Original + covers"], sortOrder: 7 },
  ]);

  // Booking calendar: the next 90 days default to AVAILABLE. This is the admin's
  // own calendar and is fully editable from the dashboard.
  const today = new Date();
  const days: { date: string; status: "AVAILABLE"; note: null }[] = [];
  for (let i = 0; i < 90; i += 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({ date: iso, status: "AVAILABLE", note: null });
  }
  await db.insert(schema.availabilityDays).values(days).onConflictDoNothing();

  const counts = await db.execute(sql`
    select
      (select count(*) from social_links) as socials,
      (select count(*) from gallery_items) as gallery,
      (select count(*) from music_items) as music,
      (select count(*) from occasions) as occasions,
      (select count(*) from availability_days) as availability
  `);
  console.log("[seed] done:", counts.rows[0]);
  await pool.end();
}

main().catch(async (e) => {
  console.error("[seed] failed", e);
  await pool.end();
  process.exit(1);
});
