import { Link } from "wouter";
import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { StatusDot, type LedTone } from "./StatusDot";
import { useSiteContent } from "@/content/SiteContentProvider";

function parseDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
  };
}

/**
 * Booking status maps to an LED tone. The label from the data is always printed
 * beside the dot, so the colour reinforces the status rather than carrying it.
 */
function toneFor(status: string): LedTone {
  const s = status.toLowerCase();
  if (s.includes("sold") || s.includes("book") || s.includes("confirm")) return "red";
  if (s.includes("limit") || s.includes("few") || s.includes("hurry")) return "amber";
  if (s.includes("open") || s.includes("avail")) return "green";
  if (s.includes("cancel") || s.includes("postpon")) return "dim";
  return "accent";
}

/**
 * Tour / upcoming shows — presented as a departure board.
 *
 * Nothing-OS: a tabular ledger of monospaced date blocks, hairline row rules,
 * and a status LED per row. The ticket CTA only renders when the admin supplied
 * a real link, so there is never a dead "Get tickets" button. Empty state is
 * honest rather than an invented tour.
 */
export function TourSection() {
  const { events } = useSiteContent();

  return (
    <section id="tour" className="relative overflow-hidden border-t border-border-subtle bg-surface-1">
      <div aria-hidden="true" className="spot absolute inset-0 opacity-60 mask-fade-edges" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="On the road"
            title="Upcoming shows"
            intro="Confirmed dates on the calendar. Reach out early for the ones that are still open."
            meta={events.length > 0 ? `${events.length} dates` : undefined}
          />
        </Reveal>

        <div className="mt-12">
          {events.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface-1/60 p-10 text-center">
              <div aria-hidden="true" className="spot absolute inset-0 opacity-60" />
              <div className="relative">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-crimson/35 text-crimson led-bloom">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mono mt-5 text-[0.625rem] uppercase tracking-[0.22em] text-ink-faint">
                  Schedule · clear
                </p>
                <p className="display mt-2 text-2xl text-foreground">No dates announced yet</p>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Confirmed performances appear here as soon as they are locked in. Until then, send
                  an enquiry for your own date.
                </p>
                <Link
                  href="/contact"
                  className="mono mt-7 inline-flex items-center gap-2.5 rounded-full border border-crimson/45 bg-crimson/10 px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-white"
                >
                  Request a date
                </Link>
              </div>
            </div>
          ) : (
            <ol className="overflow-hidden rounded-3xl border border-glass-border bg-surface-1/70 backdrop-blur-xl">
              {/* Column header — the tabular device. */}
              <li
                aria-hidden="true"
                className="mono hidden grid-cols-[7rem_1fr_11rem_10rem] gap-6 border-b border-border-subtle px-6 py-3 text-[0.5625rem] uppercase tracking-[0.22em] text-ink-faint lg:grid"
              >
                <span>Date</span>
                <span>Performance</span>
                <span>Status</span>
                <span className="text-right">Tickets</span>
              </li>

              {events.map((e, i) => {
                const d = parseDate(e.date);
                const tone = toneFor(e.status);
                return (
                  <Reveal key={e.id} variant="fade" delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                    <li className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-3 border-b border-border-subtle px-5 py-5 transition-colors last:border-b-0 hover:bg-white/[0.03] sm:px-6 lg:grid-cols-[7rem_1fr_11rem_10rem] lg:gap-6">
                      {/* Date block */}
                      <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-2/70 py-2.5">
                        <span className="mono text-2xl font-medium leading-none tracking-tight text-foreground">
                          {d?.day ?? "--"}
                        </span>
                        <span className="mono mt-1 text-[0.5625rem] uppercase tracking-[0.18em] text-ink-faint">
                          {d ? `${d.month} ${d.year}` : e.date}
                        </span>
                      </div>

                      {/* Performance */}
                      <div className="min-w-0">
                        <p className="truncate font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
                          {e.title}
                        </p>
                        <p className="mono mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                          {e.venue ? (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3 text-crimson" aria-hidden="true" />
                              {e.venue}
                            </span>
                          ) : null}
                          {e.city ? (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-crimson" aria-hidden="true" />
                              {e.city}
                            </span>
                          ) : null}
                          {e.time ? <span>{e.time}</span> : null}
                        </p>
                      </div>

                      {/* Status LED + label */}
                      <div className="mono flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                        <StatusDot tone={tone} breathe={tone === "accent"} />
                        {e.status}
                      </div>

                      {/* Ticket CTA */}
                      <div className="flex lg:justify-end">
                        {e.ticketHref ? (
                          <a
                            href={e.ticketHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono inline-flex items-center gap-2 rounded-full border border-glass-border-strong bg-white/[0.04] px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-foreground transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-white"
                          >
                            <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                            {e.ticketLabel || "Tickets"}
                          </a>
                        ) : (
                          <span className="mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-faint">
                            Enquire
                          </span>
                        )}
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          )}
        </div>

        <Reveal className="mt-8">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
          >
            Book a date of your own
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
