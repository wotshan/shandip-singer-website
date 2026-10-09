// MUSIC CATALOGUE — placeholder links only.
// No track here is a real release. Each `href` is a placeholder anchor so the
// card interactions work; swap in real Spotify / YouTube / Apple Music URLs
// when they exist. Do not present these as released music.

export type MusicCategory =
  | "Acoustic Covers"
  | "Bollywood"
  | "Romantic"
  | "Original Music"
  | "Live Sessions";

export type MusicItem = {
  id: string;
  title: string;
  category: MusicCategory;
  /** Short descriptive line — mood, format, instrumentation. */
  blurb: string;
  /** Placeholder link. Replace with the real URL. */
  href: string;
  /** Display label for the link target. */
  linkLabel: string;
  duration: string;
};

export const musicLinksArePlaceholders = true;

export const musicItems: MusicItem[] = [
  {
    id: "mus-01",
    title: "Acoustic Covers — Set One",
    category: "Acoustic Covers",
    blurb: "Stripped-back guitar and vocals — the quiet half of an evening.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "24 min",
  },
  {
    id: "mus-02",
    title: "Bollywood Live Medley",
    category: "Bollywood",
    blurb: "A continuous run through the songs every crowd sings back.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "18 min",
  },
  {
    id: "mus-03",
    title: "Romantic Evenings",
    category: "Romantic",
    blurb: "Slow, warm arrangements for receptions and anniversaries.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "22 min",
  },
  {
    id: "mus-04",
    title: "Original — Untitled Sessions",
    category: "Original Music",
    blurb: "Original compositions written and recorded in progress.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "15 min",
  },
  {
    id: "mus-05",
    title: "Live Session — Club Night",
    category: "Live Sessions",
    blurb: "Full-band energy captured from a live club performance.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "31 min",
  },
  {
    id: "mus-06",
    title: "Live Session — Wedding Set",
    category: "Live Sessions",
    blurb: "Excerpts from a reception set, from entrance to last dance.",
    href: "#placeholder-music",
    linkLabel: "Link coming soon",
    duration: "27 min",
  },
];

/** Ordered category list for the filter row. */
export const musicCategories: MusicCategory[] = [
  "Acoustic Covers",
  "Bollywood",
  "Romantic",
  "Original Music",
  "Live Sessions",
];
