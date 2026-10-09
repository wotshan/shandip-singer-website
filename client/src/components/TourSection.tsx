import { Link } from "wouter";
import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Tour / upcoming shows.
 *
 * A tour-style list of confirmed dates with an optional ticket CTA per row. The
 * ticket link is only rendered when the admin has supplied a real one, so the
 * site never shows a dead "Get tickets" button. Empty state is honest.
 */
export function TourSection() {
  const { events } = useSiteContent();

  return (
    <section id="tour" className="border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="On tour"
            title="Upcoming shows"
            intro="Confirmed dates on the calendar. Reach out early for dates that are still open."
          />
        </Reveal>

        <div className="mt-12">
          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
              <p className="font-display text-2xl text-foreground">No dates announced yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Confirmed performances will be listed here as soon as they are locked in. In the
                meantime, send an enquiry for your own date.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-3xl border border-border-subtle bg-surface-2">
              {events.map((e, i) => (
                <Reveal key={e.id} variant="fade" delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <li className="group flex flex-wrap items-center gap-x-6 gap-y-3 p-6 transition-colors hover:bg-surface-3">
                    <div className="flex w-28 shrink-0 flex-col">
                      <span className="font-display text-xl text-foreground">{formatDate(e.date)}</span>
                      {e.time ? <span className="text-xs text-ink-faint">{e.time}</span> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display text-2xl text-foreground">{e.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {e.venue ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                            {e.venue}
                          </span>
                        ) : null}
                        {e.city ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                            {e.city}
                          </span>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-border-subtle px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                        {e.status}
                      </span>
                      {e.ticketHref ? (
                        <a
                          href={e.ticketHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-gold hover:text-black"
                        >
                          <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                          {e.ticketLabel || "Get tickets"}
                        </a>
                      ) : null}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </div>

        <Reveal className="mt-8">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-gold"
          >
            Book a date of your own
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
