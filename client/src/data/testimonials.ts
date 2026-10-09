// SAMPLE TESTIMONIALS — placeholders, not real client reviews.
// These exist to show the layout. Replace each one with a genuine, consented
// quote (with the client's permission) before launch.

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  context: string;
};

export const testimonialsAreSamples = true;

export const testimonials: Testimonial[] = [
  {
    id: "tst-01",
    quote:
      "Sample placeholder — this is where a client's words about the performance will appear once a real, permitted review is supplied.",
    author: "Sample Client Name",
    context: "Wedding reception · Sample City",
  },
  {
    id: "tst-02",
    quote:
      "Sample placeholder — demonstrating how a second review will read. Not a genuine testimonial; replace before launch.",
    author: "Sample Client Name",
    context: "Corporate annual night · Sample City",
  },
  {
    id: "tst-03",
    quote:
      "Sample placeholder — a third slot for a real quote with the client's permission.",
    author: "Sample Client Name",
    context: "College festival · Sample City",
  },
];
