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
      { name: "sortOrder", label: "Order", type: "number" },
    ],
    defaults: { title: "", date: "", time: "", venue: "", city: "", status: "Confirmed", note: "", sortOrder: 0 },
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
];

export function resourceDef(key: ContentResource): ResourceDef {
  const found = RESOURCES.find((r) => r.key === key);
  if (!found) throw new Error(`Unknown resource: ${key}`);
  return found;
}
