// Fallback gallery — the artist's own performance photographs.
// Live content comes from the server; this mirrors the seeded rows.
import type { GalleryItem } from "@shared/types";

export const fallbackGallery: GalleryItem[] = [
  {
    id: "g-live",
    src: "/images/gallery/gallery_live_01.webp",
    width: 449,
    height: 636,
    caption: "Live performance",
    tag: "Live",
    alt: "Performer silhouetted against stage fog, holding a microphone on a stand",
    sortOrder: 0,
  },
  {
    id: "g-stage",
    src: "/images/gallery/gallery_stage_02.webp",
    width: 735,
    height: 1106,
    caption: "Stage performance",
    tag: "Stage",
    alt: "Musician playing an electric guitar on a spotlit stage, amplifier and drum kit behind",
    sortOrder: 1,
  },
  {
    id: "g-portrait",
    src: "/images/gallery/gallery_acoustic_03.webp",
    width: 788,
    height: 1400,
    caption: "Artist portrait",
    tag: "Portrait",
    alt: "Portrait of the artist in glasses against a plain backdrop",
    sortOrder: 2,
  },
];
