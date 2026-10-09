// Fallback brand copy and contact details.
//
// The live site renders from the server (admin-editable rows in Postgres, see
// `content/SiteContentProvider.tsx`). These values are the static fallback used
// only if the API is unreachable, so the site still renders. They mirror the
// seeded content exactly.
import type { SiteSettings, SocialLink } from "@shared/types";

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

/** The channel keys the icon registry knows how to draw. */
export type SocialKey =
  | "whatsapp"
  | "instagram"
  | "linktree"
  | "discord"
  | "linkedin"
  | "facebook"
  | "email"
  | "phone";

export const fallbackSettings: SiteSettings = {
  artist: "SHANDIP",
  role: "Professional Singer & Live Performer",
  tagline: "YOUR OCCASION. MY VOICE. ONE UNFORGETTABLE NIGHT.",
  shortIntro:
    "A professional live singer performing at weddings, receptions, private parties, clubs, corporate events, college festivals and special occasions.",
  longIntro:
    "SHANDIP is a professional singer and live performer who has spent years on stage turning rooms into moments people remember. From the first note of a wedding entrance to the last chorus of a late-night club set, every performance is shaped around the occasion \u2014 the people in the room, the mood they came for, and the songs they will not stop talking about afterwards.",
  email: "shandip8638@gmail.com",
  phoneDisplay: "+91 93653 95136",
  phoneHref: "tel:+919365395136",
  whatsappDisplay: "+91 62915 67770",
  whatsapp: "https://wa.me/916291567770",
  cities: "Mumbai \u00b7 Delhi \u00b7 Bengaluru \u00b7 Goa \u00b7 Pune",
  travelNote: "Available across India and for destination events worldwide.",
};

export const fallbackSocials: SocialLink[] = [
  { id: "s-whatsapp", key: "whatsapp", label: "WhatsApp", value: "+91 62915 67770", href: "https://wa.me/916291567770", handle: "Message SHANDIP on WhatsApp", external: true, sortOrder: 0 },
  { id: "s-instagram", key: "instagram", label: "Instagram", value: "@shaan.islive", href: "https://instagram.com/shaan.islive/", handle: "Follow SHANDIP on Instagram", external: true, sortOrder: 1 },
  { id: "s-linktree", key: "linktree", label: "Linktree", value: "All links in one place", href: "https://linktr.ee/winewithshan", handle: "Open SHANDIP's Linktree", external: true, sortOrder: 2 },
  { id: "s-discord", key: "discord", label: "Discord", value: "Join the community", href: "https://discord.gg/kMANJukS7", handle: "Join SHANDIP's Discord server", external: true, sortOrder: 3 },
  { id: "s-linkedin", key: "linkedin", label: "LinkedIn", value: "Professional profile", href: "https://www.linkedin.com/in/shandip-das-834410417", handle: "Connect with SHANDIP on LinkedIn", external: true, sortOrder: 4 },
  { id: "s-facebook", key: "facebook", label: "Facebook", value: "Follow the page", href: "https://www.facebook.com/share/14qmhb5r3UX/", handle: "Follow SHANDIP on Facebook", external: true, sortOrder: 5 },
  { id: "s-email", key: "email", label: "Email", value: "shandip8638@gmail.com", href: "mailto:shandip8638@gmail.com", handle: "Email SHANDIP at shandip8638@gmail.com", external: false, sortOrder: 6 },
  { id: "s-phone", key: "phone", label: "Phone", value: "+91 93653 95136", href: "tel:+919365395136", handle: "Call SHANDIP on +91 93653 95136", external: false, sortOrder: 7 },
];
