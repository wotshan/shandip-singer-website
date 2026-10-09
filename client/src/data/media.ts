// Fallback data for the advanced media & FAQ collections.
//
// HONESTY RULE: `tracks` and `videos` start EMPTY. No audio recordings or video
// reels have been supplied, and inventing them would be a fabricated claim about
// a real artist. The admin adds real media from the dashboard; until then the
// player and the reel render an honest empty state.
//
// `faqs` carries only answers that are TRUE of the real booking process — how a
// date is confirmed, what the venue needs, how to get a quote. Nothing here is a
// claim about awards, sales or credentials.
import type { FaqItem, TrackItem, VideoItem } from "@shared/types";

export const fallbackTracks: TrackItem[] = [];
export const fallbackVideos: VideoItem[] = [];

export const fallbackFaqs: FaqItem[] = [
  {
    id: "faq-events",
    question: "What kinds of events do you perform at?",
    answer:
      "Weddings and receptions, engagement ceremonies, birthday parties, private celebrations, club nights, corporate events, college festivals and acoustic sessions. Each set is shaped around the occasion and the room.",
    sortOrder: 0,
  },
  {
    id: "faq-book",
    question: "How far in advance should I book?",
    answer:
      "Dates are confirmed on a first-come basis, so the earlier the better — especially for wedding season and weekends. Send an enquiry with your date and the availability calendar will show whether it is still open.",
    sortOrder: 1,
  },
  {
    id: "faq-travel",
    question: "Do you travel outside your base city?",
    answer:
      "Yes. Performances are taken across India and for destination events worldwide. Travel and stay are discussed as part of the booking.",
    sortOrder: 2,
  },
  {
    id: "faq-songs",
    question: "Can I request specific songs?",
    answer:
      "Absolutely. Share a list of songs that matter to you and they are worked into the setlist. Requests are also taken live from the crowd during the performance.",
    sortOrder: 3,
  },
  {
    id: "faq-venue",
    question: "What do you need at the venue?",
    answer:
      "A power point near the performance area and a covered, dry spot for the setup. If the venue has its own sound system, that can be used; otherwise the requirements are confirmed in advance.",
    sortOrder: 4,
  },
  {
    id: "faq-quote",
    question: "How do I get a quote?",
    answer:
      "Send the booking form with your event type, date, city and a rough budget. Every enquiry is read personally and answered with availability and a quote.",
    sortOrder: 5,
  },
];
