// Fallback occasions \u2014 the kinds of events Raag Sargam performs at.
import type { OccasionItem } from "@shared/types";

export const fallbackOccasions: OccasionItem[] = [
  { id: "o-weddings", title: "Weddings & Receptions", blurb: "From the entrance set to the last dance \u2014 a soundtrack built around the couple and the room.", includes: ["Entrance & first-dance set", "Family favourites", "Full-band or acoustic"], sortOrder: 0 },
  { id: "o-engagement", title: "Engagement Ceremonies", blurb: "Warm, intimate vocals for the moment two families come together.", includes: ["Romantic sets", "Close-mic acoustic", "Custom song requests"], sortOrder: 1 },
  { id: "o-birthday", title: "Birthday Parties", blurb: "High-energy sets that keep the floor moving, from milestone birthdays to intimate dinners.", includes: ["Party anthems", "Retro & current mix", "Crowd requests"], sortOrder: 2 },
  { id: "o-private", title: "Private Celebrations", blurb: "Anniversaries, get-togethers and house parties with a live voice at the centre.", includes: ["Tailored setlist", "Acoustic format", "Flexible timing"], sortOrder: 3 },
  { id: "o-club", title: "Club Performances", blurb: "Late-night live vocals over a club sound system, built to hold a packed room.", includes: ["High-energy sets", "DJ collaboration", "Extended sessions"], sortOrder: 4 },
  { id: "o-corporate", title: "Corporate Events", blurb: "Annual nights, product launches and team celebrations with a polished, professional show.", includes: ["Stage-ready setup", "Brand-appropriate set", "MC & hosting on request"], sortOrder: 5 },
  { id: "o-college", title: "College Festivals", blurb: "Headline sets for fests and cultural nights, tuned to a young, loud crowd.", includes: ["Festival-scale energy", "Bollywood & indie", "Opening or closing act"], sortOrder: 6 },
  { id: "o-acoustic", title: "Acoustic Sessions", blurb: "Unplugged, close and personal \u2014 vocals and guitar for intimate spaces.", includes: ["Unplugged format", "Small-venue ready", "Original + covers"], sortOrder: 7 },
];
