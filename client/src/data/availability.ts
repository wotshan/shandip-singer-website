// SAMPLE AVAILABILITY DATA — demo only, resets on reload.
// This is a preview of how the calendar reads. It is NOT connected to any
// booking system, so treat every status as illustrative.

export type AvailabilityStatus = "AVAILABLE" | "TENTATIVE" | "BOOKED" | "UNAVAILABLE";

export type AvailabilityDay = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  status: AvailabilityStatus;
  note?: string;
};

export const availabilityIsSample = true;

/** Month the preview renders — a fixed reference month so the grid is stable. */
export const availabilityMonth = { year: 2026, month: 11 }; // December 2026 (0-indexed)

/** Build a stable demo pattern: weekends busy, a few midweek open slots. */
function buildMonth(year: number, month: number): AvailabilityDay[] {
  const days: AvailabilityDay[] = [];
  const total = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= total; d += 1) {
    const date = new Date(year, month, d);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = date.getDay(); // 0 = Sunday

    let status: AvailabilityStatus;
    let note: string | undefined;

    if (dow === 6) {
      status = "BOOKED";
      note = "Evening performance";
    } else if (dow === 0) {
      status = "TENTATIVE";
      note = "Holding for a wedding";
    } else if (d % 7 === 3) {
      status = "UNAVAILABLE";
      note = "Travelling";
    } else if (d % 5 === 0) {
      status = "TENTATIVE";
    } else {
      status = "AVAILABLE";
    }

    days.push({ date: iso, status, note });
  }

  return days;
}

export const availabilityDays: AvailabilityDay[] = buildMonth(
  availabilityMonth.year,
  availabilityMonth.month,
);

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
    description: "An enquiry is being discussed — get in touch early.",
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
