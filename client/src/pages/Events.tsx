import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { EventCard } from "@/components/EventCard";
import { PageHeader } from "./About";
import { useSiteContent } from "@/content/SiteContentProvider";

export default function Events() {
  const { events } = useSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Upcoming performances"
        intro="The dates ahead. If your occasion is near one of these, get in touch early — the calendar fills quickly."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        {events.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-border-strong bg-surface-2 p-12 text-center">
              <p className="font-display text-2xl text-foreground">No dates announced yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Confirmed performances will be listed here as soon as they are locked in. Send an
                enquiry for your own date in the meantime.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {events.map((event, i) => (
              <Reveal key={event.id} delay={((i % 2) + 1) as 1 | 2}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-14">
          <div className="flex flex-col gap-8 rounded-3xl border border-border-subtle bg-surface-2 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow mb-3">Your date not listed?</p>
              <h2 className="display text-[clamp(1.5rem,3.5vw,2.25rem)] text-foreground">
                Check availability, then send an enquiry.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/availability"
                className="inline-flex items-center justify-center rounded-full border border-border-strong px-6 py-3 text-[0.8125rem] font-medium text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
              >
                View availability
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-crimson hover:text-white"
              >
                Enquire now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
