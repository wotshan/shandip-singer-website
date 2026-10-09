import type { UserRole } from "./constants";

// The identity contract every AuthProvider yields (DESIGN §5.1). Business code
// depends ONLY on this shape — never on HOW the user authenticated — which is
// what makes auth pluggable (local today, SSO later) with zero business-code
// churn. NOTE: no password_hash / provider-internal fields here on purpose.
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// ─────────────────────────────────────────────────────────────────────────────
// Site content contract (client ⇄ server).
//
// The public site renders from these shapes. The server is the source of truth
// (admin-editable rows in Postgres); the client keeps a static fallback of the
// same shape so the site still renders if the API is unreachable.
// ─────────────────────────────────────────────────────────────────────────────

export type SiteSettings = {
  artist: string;
  role: string;
  tagline: string;
  shortIntro: string;
  longIntro: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappDisplay: string;
  whatsapp: string;
  cities: string;
  travelNote: string;
};

export type SocialLink = {
  id: string;
  key: string;
  label: string;
  value: string;
  href: string;
  handle: string;
  external: boolean;
  sortOrder: number;
};

export type GalleryItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  caption: string;
  tag: string;
  alt: string;
  sortOrder: number;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  status: string;
  note: string | null;
  sortOrder: number;
};

export type MusicItem = {
  id: string;
  title: string;
  category: string;
  blurb: string;
  href: string | null;
  linkLabel: string | null;
  duration: string | null;
  sortOrder: number;
};

export type OccasionItem = {
  id: string;
  title: string;
  blurb: string;
  includes: string[];
  sortOrder: number;
};

export type TestimonialItem = {
  id: string;
  quote: string;
  author: string;
  context: string;
  sortOrder: number;
};

export type AvailabilityStatus = "AVAILABLE" | "TENTATIVE" | "BOOKED" | "UNAVAILABLE";

export type AvailabilityDay = {
  id: string;
  date: string;
  status: AvailabilityStatus;
  note: string | null;
};

export type Enquiry = {
  id: string;
  name: string;
  contact: string;
  email: string | null;
  eventType: string;
  eventDate: string | null;
  city: string;
  venue: string;
  message: string | null;
  read: boolean;
  createdAt: string;
};

export type SiteContent = {
  settings: SiteSettings;
  socials: SocialLink[];
  gallery: GalleryItem[];
  events: EventItem[];
  music: MusicItem[];
  occasions: OccasionItem[];
  testimonials: TestimonialItem[];
  availability: AvailabilityDay[];
};

/** The editable collections the admin dashboard manages. */
export const CONTENT_RESOURCES = [
  "socials",
  "gallery",
  "events",
  "music",
  "occasions",
  "testimonials",
  "availability",
] as const;

export type ContentResource = (typeof CONTENT_RESOURCES)[number];
