// Fallback data for the celebrity-brand collections.
//
// HONESTY RULE: nothing here is invented. Awards, press features, brand
// collaborations and fan messages start EMPTY — the artist has not supplied any,
// and fabricating them would be a false claim about a real person. The admin
// adds genuine entries from the dashboard; until then those sections render an
// honest empty state (or hide entirely).
//
// Two collections DO carry real, defensible content:
//   * `highlights` reuses the artist's own performance photographs.
//   * `pressMentions` lists the artist's real public platforms (not fake press
//     logos) so the hero strip is tasteful and truthful.
//   * `stats` carries only the two facts already stated on the site (the
//     languages performed in and the cities on the map) — no invented show
//     counts, fan numbers or stream totals.
import type {
  AwardItem,
  CollaborationItem,
  FanMessageItem,
  HighlightItem,
  PressItem,
  PressMentionItem,
  StatItem,
} from "@shared/types";

export const fallbackAwards: AwardItem[] = [];
export const fallbackPress: PressItem[] = [];
export const fallbackCollaborations: CollaborationItem[] = [];
export const fallbackFanMessages: FanMessageItem[] = [];

export const fallbackStats: StatItem[] = [
  { id: "st-languages", label: "Languages performed in", value: 4, suffix: "", sortOrder: 0 },
  { id: "st-cities", label: "Cities on the map", value: 5, suffix: "+", sortOrder: 1 },
];

export const fallbackHighlights: HighlightItem[] = [
  {
    id: "h-live",
    src: "/images/gallery/gallery_live_01.webp",
    caption: "Live performance",
    alt: "Performer silhouetted against stage fog, holding a microphone on a stand",
    sortOrder: 0,
  },
  {
    id: "h-stage",
    src: "/images/gallery/gallery_stage_02.webp",
    caption: "Stage performance",
    alt: "Musician playing an electric guitar on a spotlit stage, amplifier and drum kit behind",
    sortOrder: 1,
  },
  {
    id: "h-portrait",
    src: "/images/gallery/gallery_acoustic_03.webp",
    caption: "Artist portrait",
    alt: "Portrait of the artist in glasses against a plain backdrop",
    sortOrder: 2,
  },
];

// Real public platforms — a truthful "find me on" strip, not invented press.
export const fallbackPressMentions: PressMentionItem[] = [
  { id: "pm-instagram", label: "Instagram", href: "https://instagram.com/shaan.islive/", sortOrder: 0 },
  { id: "pm-linktree", label: "Linktree", href: "https://linktr.ee/winewithshan", sortOrder: 1 },
  { id: "pm-discord", label: "Discord", href: "https://discord.gg/kMANJukS7", sortOrder: 2 },
  { id: "pm-linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/shandip-das-834410417", sortOrder: 3 },
  { id: "pm-facebook", label: "Facebook", href: "https://www.facebook.com/share/14qmhb5r3UX/", sortOrder: 4 },
];
