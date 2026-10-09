// Fallback availability — deliberately EMPTY.
//
// The booking calendar is the admin's own data (seeded as the next 90 days
// AVAILABLE, then edited from the dashboard). With no data the calendar renders
// an honest "no dates published" state rather than a fabricated pattern.
import type { AvailabilityDay, AvailabilityStatus } from "@shared/types";

export type { AvailabilityStatus };

export const fallbackAvailability: AvailabilityDay[] = [];

/**
 * The one place availability status maps to colour.
 *
 * Nothing-OS rule: the dot colour is an LED, never the only signal — every
 * surface that shows a status also prints its label, and each entry carries a
 * real `description` used in the tooltip and the legend.
 */
export const statusMeta: Record<
  AvailabilityStatus,
  {
    label: string;
    description: string;
    /** Solid LED fill. */
    dotClass: string;
    /** Cell treatment in the matrix. */
    chipClass: string;
    /** Text tone beside the label. */
    textClass: string;
    /** Short code for the compact tooltip row. */
    code: string;
  }
> = {
  AVAILABLE: {
    label: "Available",
    description: "Open for a booking request.",
    dotClass: "bg-led-green",
    chipClass: "border-led-green/25 bg-led-green/[0.07] text-foreground hover:border-led-green/60",
    textClass: "text-led-green",
    code: "AVL",
  },
  TENTATIVE: {
    label: "Tentative",
    description: "An enquiry is being discussed — get in touch early.",
    dotClass: "bg-led-amber",
    chipClass: "border-led-amber/25 bg-led-amber/[0.07] text-foreground hover:border-led-amber/60",
    textClass: "text-led-amber",
    code: "TNT",
  },
  BOOKED: {
    label: "Booked",
    description: "Already committed for this date.",
    dotClass: "bg-crimson",
    chipClass: "border-crimson/30 bg-crimson/[0.09] text-foreground hover:border-crimson/70",
    textClass: "text-crimson",
    code: "BKD",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    description: "Not taking bookings on this date.",
    dotClass: "bg-led-dim",
    chipClass: "border-border-subtle bg-surface-1 text-ink-faint hover:border-border-strong",
    textClass: "text-ink-faint",
    code: "N/A",
  },
};

export const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
