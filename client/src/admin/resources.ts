import type { ContentResource } from "@shared/types";

/** Field kinds the generic admin form knows how to render. */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "list"
  | "image";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  /** Render across the full width of the two-column form grid. */
  full?: boolean;
};

export type ResourceDef = {
  key: ContentResource;
  label: string;
  singular: string;
  description: string;
  /** Field used as the row's headline in the list. */
  titleField: string;
  /** Field shown as the row's secondary line. */
  subtitleField?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

const SOCIAL_KEYS = [
  "whatsapp",
  "instagram",
  "linktree",
  "discord",
  "linkedin",
  "facebook",
  "email",
  "phone",
];

export const RESOURCES: ResourceDef[] = [
  {
    key: "gallery",
    label: "Gallery",
    singular: "photo",
    description: "Performance photographs shown in the gallery and on the home page.",
    titleField: "caption",
    subtitleField: "tag",
    fields: [
      { name: "src", label: "Image", type: "image", required: true, full: true, help: "Upload a photo, or paste a path such as /images/gallery/photo.webp" },
      { name: "caption", label: "Caption", type: "text", required: true, placeholder: "Live performance" },
      { name: "tag", label: "Tag", type: "text", placeholder: "Live" },
      { name: "alt", label: "Alt text", type: "text", full: true, help: "Describes the photo for screen readers." },
      { name: "width", label: "Width (px)", type: "number" },
      { name: "height", label: "Height (px)", type: "number" },
      { name: "sortOrder", label: "Order", type: "number", help: "Lower numbers appear first." },
    ],
    defaults: { src: "", caption: "", tag: "", alt: "", width: 1200, height: 1600, sortOrder: 0 },
  },
  {
    key: "socials",
    label: "Social links",
    singular: "link",
    description: "Every channel shown in the contact rows, footer and social carousel.",
    titleField: "label",
    subtitleField: "value",
    fields: [
      { name: "key", label: "Channel", type: "select", required: true, options: SOCIAL_KEYS },
      { name: "label", label: "Label", type: "text", required: true, placeholder: "Instagram" },
      { name: "value", label: "Display value", type: "text", placeholder: "@shaan.islive" },
      { name: "href", label: "Link", type: "text", required: true, full: true, placeholder: "https://instagram.com/shaan.islive/" },
      { name: "handle", label: "Spoken label", type: "text", full: true, help: "Read aloud by screen readers, e.g. “Follow Raag Sargam on Instagram”." },
      { name: "external", label: "Opens in a new tab", type: "checkbox" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { key: "instagram", label: "", value: "", href: "", handle: "", external: true, sortOrder: 0 },
  },
  {
    key: "events",
    label: "Events",
    singular: "event",
    description: "Confirmed performances shown on the events page and home page.",
    titleField: "title",
    subtitleField: "city",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true, placeholder: "Wedding Reception Set" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Time", type: "text", placeholder: "8:30 PM" },
      { name: "venue", label: "Venue", type: "text", placeholder: "The Grand Ballroom" },
      { name: "city", label: "City", type: "text", placeholder: "Mumbai" },
      { name: "status", label: "Status", type: "select", options: ["Confirmed", "On Hold"] },
      { name: "note", label: "Note", type: "textarea", full: true, placeholder: "Live band + acoustic segment" },
      { name: "ticketHref", label: "Ticket link", type: "text", full: true, help: "Optional. A real ticket URL — leave blank if tickets are not on sale." },
      { name: "ticketLabel", label: "Ticket button label", type: "text", placeholder: "Get tickets" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { title: "", date: "", time: "", venue: "", city: "", status: "Confirmed", note: "", ticketHref: "", ticketLabel: "", sortOrder: 0 },
  },
  {
    key: "music",
    label: "Music",
    singular: "set",
    description: "The set types and repertoire shown on the music page.",
    titleField: "title",
    subtitleField: "category",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true },
      { name: "category", label: "Category", type: "text", placeholder: "Bollywood" },
      { name: "blurb", label: "Description", type: "textarea", full: true },
      { name: "href", label: "Listening link", type: "text", full: true, help: "Optional. Leave blank until a real link exists." },
      { name: "linkLabel", label: "Link label", type: "text", placeholder: "Listen on Spotify" },
      { name: "duration", label: "Duration", type: "text", placeholder: "24 min" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { title: "", category: "", blurb: "", href: "", linkLabel: "", duration: "", sortOrder: 0 },
  },
  {
    key: "occasions",
    label: "Occasions",
    singular: "occasion",
    description: "The kinds of events Raag Sargam performs at.",
    titleField: "title",
    subtitleField: "blurb",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true },
      { name: "blurb", label: "Description", type: "textarea", full: true },
      { name: "includes", label: "Includes", type: "list", full: true, help: "One item per line." },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { title: "", blurb: "", includes: [], sortOrder: 0 },
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    description: "Genuine, permitted client quotes. Leave empty until you have permission to quote someone.",
    titleField: "author",
    subtitleField: "context",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true, full: true },
      { name: "author", label: "Author", type: "text", placeholder: "Client name" },
      { name: "context", label: "Context", type: "text", placeholder: "Wedding reception · Mumbai" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { quote: "", author: "", context: "", sortOrder: 0 },
  },
  {
    key: "availability",
    label: "Availability",
    singular: "date",
    description: "Your booking calendar. Dates not listed here show as “no data” on the site.",
    titleField: "date",
    subtitleField: "status",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: ["AVAILABLE", "TENTATIVE", "BOOKED", "UNAVAILABLE"] },
      { name: "note", label: "Note", type: "text", full: true, placeholder: "Evening performance" },
    ],
    defaults: { date: "", status: "AVAILABLE", note: "" },
  },
  {
    key: "awards",
    label: "Awards & Achievements",
    singular: "award",
    description: "Awards, recognitions and milestones. Add only genuine, verifiable ones.",
    titleField: "title",
    subtitleField: "organisation",
    fields: [
      { name: "title", label: "Award / milestone", type: "text", required: true, full: true, placeholder: "Best Live Act" },
      { name: "organisation", label: "Awarded by", type: "text", placeholder: "Organisation name" },
      { name: "year", label: "Year", type: "text", placeholder: "2025" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { title: "", organisation: "", year: "", description: "", sortOrder: 0 },
  },
  {
    key: "press",
    label: "Press & Media",
    singular: "feature",
    description: "Published features, interviews and quotes. Add only real coverage.",
    titleField: "outlet",
    subtitleField: "headline",
    fields: [
      { name: "outlet", label: "Outlet", type: "text", required: true, placeholder: "Publication name" },
      { name: "headline", label: "Headline", type: "text", full: true },
      { name: "quote", label: "Quote", type: "textarea", full: true },
      { name: "date", label: "Date", type: "text", placeholder: "March 2025" },
      { name: "href", label: "Article link", type: "text", full: true, help: "Optional. A real link to the article." },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { outlet: "", headline: "", quote: "", date: "", href: "", sortOrder: 0 },
  },
  {
    key: "collaborations",
    label: "Brand Collaborations",
    singular: "collaboration",
    description: "Brand partnerships and endorsements. Add only real collaborations.",
    titleField: "brand",
    subtitleField: "role",
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true, placeholder: "Brand name" },
      { name: "role", label: "Role", type: "text", placeholder: "Brand ambassador" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "year", label: "Year", type: "text", placeholder: "2025" },
      { name: "href", label: "Link", type: "text", full: true, help: "Optional. A real link to the campaign." },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { brand: "", role: "", description: "", year: "", href: "", sortOrder: 0 },
  },
  {
    key: "stats",
    label: "Stats & Highlights",
    singular: "stat",
    description: "The animated counters on the home page. Use only numbers you can stand behind.",
    titleField: "label",
    subtitleField: "value",
    fields: [
      { name: "label", label: "Label", type: "text", required: true, placeholder: "Live shows" },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", placeholder: "+ or K" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { label: "", value: 0, suffix: "", sortOrder: 0 },
  },
  {
    key: "highlights",
    label: "Featured Highlights",
    singular: "highlight",
    description: "A curated cinematic photo grid — pick the strongest frames from your gallery.",
    titleField: "caption",
    subtitleField: "alt",
    fields: [
      { name: "src", label: "Image", type: "image", required: true, full: true, help: "Upload a photo, or paste a path such as /images/gallery/photo.webp" },
      { name: "caption", label: "Caption", type: "text", placeholder: "Live on stage" },
      { name: "alt", label: "Alt text", type: "text", full: true, help: "Describes the photo for screen readers." },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { src: "", caption: "", alt: "", sortOrder: 0 },
  },
  {
    key: "fanMessages",
    label: "Fan Zone",
    singular: "message",
    description: "Messages from fans. Add only genuine, permitted messages.",
    titleField: "author",
    subtitleField: "city",
    fields: [
      { name: "message", label: "Message", type: "textarea", required: true, full: true },
      { name: "author", label: "From", type: "text", placeholder: "Fan name" },
      { name: "city", label: "City", type: "text", placeholder: "Kolkata" },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { message: "", author: "", city: "", sortOrder: 0 },
  },
  {
    key: "pressMentions",
    label: "As Seen On",
    singular: "mention",
    description: "The \u201cAs seen on\u201d strip in the hero. Add only outlets that have genuinely featured you.",
    titleField: "label",
    subtitleField: "href",
    fields: [
      { name: "label", label: "Outlet / label", type: "text", required: true, full: true, placeholder: "Publication name" },
      { name: "href", label: "Link", type: "text", full: true, help: "Optional. A real link to the feature." },
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { label: "", href: "", sortOrder: 0 },
  },
];

export function resourceDef(key: ContentResource): ResourceDef {
  const found = RESOURCES.find((r) => r.key === key);
  if (!found) throw new Error(`Unknown resource: ${key}`);
  return found;
}
