// Single source of truth for brand copy and contact details.
// These values are the ONLY place contact info lives — edit here and the whole
// site updates (nav, footer, contact section, hero).

export const site = {
  artist: "SHANDIP",
  role: "Professional Singer & Live Performer",
  tagline: "YOUR OCCASION. MY VOICE. ONE UNFORGETTABLE NIGHT.",

  shortIntro:
    "A professional live singer performing at weddings, receptions, private parties, clubs, corporate events, college festivals and special occasions.",

  longIntro:
    "SHANDIP is a professional singer and live performer who has spent years on stage turning rooms into moments people remember. From the first note of a wedding entrance to the last chorus of a late-night club set, every performance is shaped around the occasion — the people in the room, the mood they came for, and the songs they will not stop talking about afterwards.",

  // ── Placeholder contact details ─────────────────────────────────────────
  // Replace these with the real accounts before launch.
  email: "booking@example.com",
  phoneDisplay: "+91 00000 00000",
  whatsapp: "https://wa.me/910000000000",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",

  cities: "Mumbai · Delhi · Bengaluru · Goa · Pune",
  travelNote: "Available across India and for destination events worldwide.",

  // Shown discreetly wherever placeholder links appear, so nothing on the page
  // reads as a live contact channel when it is not.
  placeholderNote: "Placeholder contact links — replace with live accounts before launch.",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Music", href: "/music" },
  { label: "Occasions", href: "/occasions" },
  { label: "Availability", href: "/availability" },
  { label: "Contact", href: "/contact" },
];
