// Fallback repertoire \u2014 the set types SHANDIP performs.
// No streaming links or track durations are claimed, because none exist yet.
import type { MusicItem } from "@shared/types";

export const fallbackMusic: MusicItem[] = [
  { id: "m-acoustic", title: "Acoustic Covers", category: "Acoustic Covers", blurb: "Stripped-back guitar and vocals \u2014 the quiet half of an evening.", href: null, linkLabel: null, duration: null, sortOrder: 0 },
  { id: "m-bollywood", title: "Bollywood Live", category: "Bollywood", blurb: "A continuous run through the songs every crowd sings back.", href: null, linkLabel: null, duration: null, sortOrder: 1 },
  { id: "m-romantic", title: "Romantic Evenings", category: "Romantic", blurb: "Slow, warm arrangements for receptions and anniversaries.", href: null, linkLabel: null, duration: null, sortOrder: 2 },
  { id: "m-live", title: "Live Sessions", category: "Live Sessions", blurb: "Full-band energy captured from a live performance.", href: null, linkLabel: null, duration: null, sortOrder: 3 },
];
