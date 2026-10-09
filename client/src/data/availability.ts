// Fallback availability \u2014 deliberately EMPTY.
//
// The booking calendar is the admin's own data (seeded as the next 90 days
// AVAILABLE, then edited from the dashboard). With no data the calendar renders
// an honest "no dates published" state rather than a fabricated pattern.
import type { AvailabilityDay, AvailabilityStatus } from "@shared/types";

export type { AvailabilityStatus };

export const fallbackAvailability: AvailabilityDay[] = [];

export const statusMeta: Record<
  AvailabilityStatus,
  { label: string; description: string; dotClass: string; chipClass: string }
> = {
  AVAILABLE: {
    label: "Available",
    description: "Open for a booking request.",
    dotClass: "bg-emerald-400",
    chipClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  TENTATIVE: {
    label: "Tentative",
    description: "An enquiry is being discussed \u2014 get in touch early.",
    dotClass: "bg-amber-400",
    chipClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  BOOKED: {
    label: "Booked",
    description: "Already committed for this date.",
    dotClass: "bg-crimson",
    chipClass: "border-crimson/40 bg-crimson/15 text-red-300",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    description: "Not taking bookings on this date.",
    dotClass: "bg-zinc-500",
    chipClass: "border-zinc-600/40 bg-zinc-600/15 text-zinc-400",
  },
};

export const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
