/**
 * Performance gallery.
 *
 * These are the artist's own performance photographs, so — unlike Events,
 * Availability, Music and Testimonials — this surface carries no "sample
 * content" notice. It is real media.
 *
 * Captions deliberately describe only what is in the frame. None of them names
 * an event, venue or date: no such detail has been supplied, and inventing one
 * would be a fabricated claim about a real performance.
 */

export type GalleryItem = {
  id: string;
  /** Served locally from `client/public` — never a hotlinked remote URL. */
  src: string;
  /** Intrinsic pixel size, so the grid reserves space and nothing shifts on load. */
  width: number;
  height: number;
  /** Short neutral label for the frame. */
  caption: string;
  /** Small chip in the corner of the card. */
  tag: string;
  /** Describes the frame for screen readers. */
  alt: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: "live-performance",
    src: "/images/gallery/gallery_live_01.webp",
    width: 449,
    height: 636,
    caption: "Live performance",
    tag: "Live",
    alt: "Performer silhouetted against stage fog, holding a microphone on a stand",
  },
  {
    id: "stage-performance",
    src: "/images/gallery/gallery_stage_02.webp",
    width: 735,
    height: 1106,
    caption: "Stage performance",
    tag: "Stage",
    alt: "Musician playing an electric guitar on a spotlit stage, amplifier and drum kit behind",
  },
  {
    id: "artist-portrait",
    src: "/images/gallery/gallery_acoustic_03.webp",
    width: 788,
    height: 1400,
    caption: "Artist portrait",
    tag: "Portrait",
    alt: "Portrait of the artist in glasses against a plain backdrop",
  },
];

/**
 * Shown as a quiet line under the grid. Not a "sample content" warning — the
 * photos are real — just a statement of what the captions do and do not claim.
 */
export const galleryNote =
  "Photographs from live performances. Captions describe the setting only — no specific event, venue or date is claimed.";
