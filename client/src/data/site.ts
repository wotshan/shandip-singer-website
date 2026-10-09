// Single source of truth for brand copy and contact details.
// These values are the ONLY place contact info lives — edit here and the whole
// site updates (nav, footer, contact section, hero, social carousel).

export const site = {
  artist: "SHANDIP",
  role: "Professional Singer & Live Performer",
  tagline: "YOUR OCCASION. MY VOICE. ONE UNFORGETTABLE NIGHT.",

  shortIntro:
    "A professional live singer performing at weddings, receptions, private parties, clubs, corporate events, college festivals and special occasions.",

  longIntro:
    "SHANDIP is a professional singer and live performer who has spent years on stage turning rooms into moments people remember. From the first note of a wedding entrance to the last chorus of a late-night club set, every performance is shaped around the occasion — the people in the room, the mood they came for, and the songs they will not stop talking about afterwards.",

  // ── Live contact details ──────────────────────────────────────────────────
  email: "shandip8638@gmail.com",
  phoneDisplay: "+91 93653 95136",
  phoneHref: "tel:+919365395136",
  whatsappDisplay: "+91 62915 67770",
  whatsapp: "https://wa.me/916291567770",
  instagram: "https://instagram.com/shaan.islive/",
  instagramHandle: "@shaan.islive",
  linktree: "https://linktr.ee/winewithshan",
  discord: "https://discord.gg/kMANJukS7",
  linkedin: "https://www.linkedin.com/in/shandip-das-834410417",
  facebook: "https://www.facebook.com/share/14qmhb5r3UX/",

  cities: "Mumbai · Delhi · Bengaluru · Goa · Pune",
  travelNote: "Available across India and for destination events worldwide.",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Music", href: "/music" },
  { label: "Gallery", href: "/gallery" },
  { label: "Occasions", href: "/occasions" },
  { label: "Availability", href: "/availability" },
  { label: "Contact", href: "/contact" },
];

/**
 * Social registry — the single list that drives the contact rows, the footer
 * icon row and the looping social carousel. `handle` is what a screen reader
 * hears, so the icon-only carousel stays accessible without visible text.
 */
export type SocialKey =
  | "whatsapp"
  | "instagram"
  | "linktree"
  | "discord"
  | "linkedin"
  | "facebook"
  | "email"
  | "phone";

export type Social = {
  key: SocialKey;
  /** Visible name, used where a text label is appropriate. */
  label: string;
  /** Short line shown under the label in the contact rows. */
  value: string;
  href: string;
  /** Spoken label for icon-only contexts. */
  handle: string;
  /** Opens in a new tab (external http(s) links only). */
  external: boolean;
};

export const socials: Social[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: site.whatsappDisplay,
    href: site.whatsapp,
    handle: "Message SHANDIP on WhatsApp",
    external: true,
  },
  {
    key: "instagram",
    label: "Instagram",
    value: site.instagramHandle,
    href: site.instagram,
    handle: "Follow SHANDIP on Instagram",
    external: true,
  },
  {
    key: "linktree",
    label: "Linktree",
    value: "All links in one place",
    href: site.linktree,
    handle: "Open SHANDIP's Linktree",
    external: true,
  },
  {
    key: "discord",
    label: "Discord",
    value: "Join the community",
    href: site.discord,
    handle: "Join SHANDIP's Discord server",
    external: true,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    value: "Professional profile",
    href: site.linkedin,
    handle: "Connect with SHANDIP on LinkedIn",
    external: true,
  },
  {
    key: "facebook",
    label: "Facebook",
    value: "Follow the page",
    href: site.facebook,
    handle: "Follow SHANDIP on Facebook",
    external: true,
  },
  {
    key: "email",
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    handle: `Email SHANDIP at ${site.email}`,
    external: false,
  },
  {
    key: "phone",
    label: "Phone",
    value: site.phoneDisplay,
    href: site.phoneHref,
    handle: `Call SHANDIP on ${site.phoneDisplay}`,
    external: false,
  },
];
