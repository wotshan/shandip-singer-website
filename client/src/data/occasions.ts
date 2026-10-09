// SERVICE / OCCASION CARDS — the kinds of events SHANDIP performs at.

export type Occasion = {
  id: string;
  title: string;
  blurb: string;
  /** Short list of what the performance typically includes. */
  includes: string[];
};

export const occasions: Occasion[] = [
  {
    id: "occ-weddings",
    title: "Weddings & Receptions",
    blurb:
      "From the entrance set to the last dance — a soundtrack built around the couple and the room.",
    includes: ["Entrance & first-dance set", "Family favourites", "Full-band or acoustic"],
  },
  {
    id: "occ-engagement",
    title: "Engagement Ceremonies",
    blurb:
      "Warm, intimate vocals for the moment two families come together.",
    includes: ["Romantic sets", "Close-mic acoustic", "Custom song requests"],
  },
  {
    id: "occ-birthday",
    title: "Birthday Parties",
    blurb:
      "High-energy sets that keep the floor moving, from milestone birthdays to intimate dinners.",
    includes: ["Party anthems", "Retro & current mix", "Crowd requests"],
  },
  {
    id: "occ-private",
    title: "Private Celebrations",
    blurb:
      "Anniversaries, get-togethers and house parties with a live voice at the centre.",
    includes: ["Tailored setlist", "Acoustic format", "Flexible timing"],
  },
  {
    id: "occ-club",
    title: "Club Performances",
    blurb:
      "Late-night live vocals over a club sound system, built to hold a packed room.",
    includes: ["High-energy sets", "DJ collaboration", "Extended sessions"],
  },
  {
    id: "occ-corporate",
    title: "Corporate Events",
    blurb:
      "Annual nights, product launches and team celebrations with a polished, professional show.",
    includes: ["Stage-ready setup", "Brand-appropriate set", "MC & hosting on request"],
  },
  {
    id: "occ-college",
    title: "College Festivals",
    blurb:
      "Headline sets for fests and cultural nights, tuned to a young, loud crowd.",
    includes: ["Festival-scale energy", "Bollywood & indie", "Opening or closing act"],
  },
  {
    id: "occ-acoustic",
    title: "Acoustic Sessions",
    blurb:
      "Unplugged, close and personal — vocals and guitar for intimate spaces.",
    includes: ["Unplugged format", "Small-venue ready", "Original + covers"],
  },
];
