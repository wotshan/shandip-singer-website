// SAMPLE EVENT DATA — clearly marked demo content.
// These are placeholders illustrating the card layout. None of them are real
// confirmed bookings, and nothing here should be presented as an actual gig.

export type EventStatus = "Confirmed" | "On Hold";

export type LiveEvent = {
  id: string;
  title: string;
  /** ISO date — formatted at render time so the card never hardcodes a locale. */
  date: string;
  time: string;
  venue: string;
  city: string;
  status: EventStatus;
  note?: string;
};

/** Set this to false once real, confirmed events are supplied. */
export const eventsAreSample = true;

export const upcomingEvents: LiveEvent[] = [
  {
    id: "evt-01",
    title: "Sample — Wedding Reception Set",
    date: "2026-11-14",
    time: "8:30 PM",
    venue: "The Grand Ballroom",
    city: "Mumbai",
    status: "Confirmed",
    note: "Live band + acoustic segment",
  },
  {
    id: "evt-02",
    title: "Sample — Corporate Annual Night",
    date: "2026-11-28",
    time: "7:00 PM",
    venue: "Skyline Convention Centre",
    city: "Bengaluru",
    status: "Confirmed",
    note: "Bollywood and retro set",
  },
  {
    id: "evt-03",
    title: "Sample — College Festival Headline",
    date: "2026-12-06",
    time: "6:30 PM",
    venue: "Open Air Amphitheatre",
    city: "Pune",
    status: "Confirmed",
    note: "High-energy closing act",
  },
  {
    id: "evt-04",
    title: "Sample — Private Anniversary Evening",
    date: "2026-12-20",
    time: "9:00 PM",
    venue: "Riverside Banquet",
    city: "Goa",
    status: "On Hold",
    note: "Intimate acoustic format",
  },
  {
    id: "evt-05",
    title: "Sample — New Year Club Night",
    date: "2026-12-31",
    time: "10:00 PM",
    venue: "Vertigo Lounge",
    city: "Delhi",
    status: "On Hold",
  },
  {
    id: "evt-06",
    title: "Sample — Engagement Ceremony",
    date: "2027-01-18",
    time: "7:30 PM",
    venue: "Heritage Courtyard",
    city: "Jaipur",
    status: "Confirmed",
    note: "Family favourites + acoustic covers",
  },
];
