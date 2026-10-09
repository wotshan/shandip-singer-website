import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { EventCard } from "@/components/EventCard";
import { MusicCard } from "@/components/MusicCard";
import { OccasionCard } from "@/components/OccasionCard";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Testimonials } from "@/components/Testimonials";
import { ContactLinks } from "@/components/ContactLinks";
import { SampleNotice } from "@/components/SampleNotice";
import { site } from "@/data/site";
import { upcomingEvents, eventsAreSample } from "@/data/events";
import { musicItems, musicLinksArePlaceholders } from "@/data/music";
import { occasions } from "@/data/occasions";

/** Shared section shell so vertical rhythm is identical everywhere. */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />

      {/* ── About ───────────────────────────────────────────────────────── */}
      <Section id="about">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="About"
              title={
                <>
                  A voice that reads
                  <br />
                  the room.
                </>
              }
            />
          </Reveal>

          <Reveal delay={1} className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {site.longIntro}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Every booking begins with a conversation — about the people in the room, the moments
              that matter, and the feeling the evening should leave behind. The setlist follows
              from there.
            </p>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 pt-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
            >
              More about the performances
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* ── Events ──────────────────────────────────────────────────────── */}
      <Section id="events" className="border-t border-border-subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Upcoming"
            title="Where I'm performing next"
            intro="A look at the calendar ahead. Reach out early for dates that are still open."
          />
        </Reveal>

        {eventsAreSample ? (
          <Reveal delay={1} className="mt-8">
            <SampleNotice>
              These events are <strong className="text-foreground">sample demo content</strong> that
              illustrates the card layout — they are not confirmed bookings. Real dates will replace
              them.
            </SampleNotice>
          </Reveal>
        ) : null}

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {upcomingEvents.slice(0, 4).map((event, i) => (
            <Reveal key={event.id} delay={((i % 2) + 1) as 1 | 2}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
          >
            View the full calendar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </Section>

      {/* ── Music ───────────────────────────────────────────────────────── */}
      <Section id="music" className="border-t border-border-subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Music"
            title="Sets, sessions & originals"
            intro="Acoustic covers, Bollywood, romantic arrangements and live sessions — the range a booking can draw from."
          />
        </Reveal>

        {musicLinksArePlaceholders ? (
          <Reveal delay={1} className="mt-8">
            <SampleNotice>
              Listening links are <strong className="text-foreground">placeholders</strong> for now.
              No track shown here is a released recording — real streaming links will be added when
              they are available.
            </SampleNotice>
          </Reveal>
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {musicItems.slice(0, 3).map((item, i) => (
            <Reveal key={item.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <MusicCard item={item} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <Link
            href="/music"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
          >
            Explore the full catalogue
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </Section>

      {/* ── Occasions ───────────────────────────────────────────────────── */}
      <Section id="occasions" className="border-t border-border-subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Occasions"
            title="Built around your event"
            intro="Different rooms ask for different performances. Each one is shaped to the occasion."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((occasion, i) => (
            <Reveal key={occasion.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <OccasionCard occasion={occasion} index={i} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Availability ────────────────────────────────────────────────── */}
      <Section id="availability" className="border-t border-border-subtle">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Availability"
              title="Is your date open?"
              intro="A preview of how the booking calendar reads. Green dates are open; red ones are taken."
            />
            <div className="mt-8">
              <SampleNotice>
                This calendar is a <strong className="text-foreground">demo preview</strong> with
                sample statuses. It is not connected to a live booking system — confirm any date
                before planning around it.
              </SampleNotice>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <AvailabilityCalendar />
          </Reveal>
        </div>
      </Section>

      {/* ── Enquiry ─────────────────────────────────────────────────────── */}
      <Section id="enquiry" className="border-t border-border-subtle">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Booking"
              title="Tell me about your event"
              intro="Share the essentials and the occasion. The more detail, the better the fit."
            />
            <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-2 p-6">
              <p className="eyebrow mb-4">Prefer to talk first?</p>
              <ContactLinks />
            </div>
          </Reveal>

          <Reveal delay={1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </Section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <div className="border-t border-border-subtle">
        <Testimonials />
      </div>

      {/* ── Contact CTA ─────────────────────────────────────────────────── */}
      <Section id="contact" className="border-t border-border-subtle">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-2 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div aria-hidden="true" className="ambience absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="eyebrow mb-5">Let's make it a night to remember</p>
              <h2 className="display mx-auto max-w-3xl text-[clamp(2rem,6vw,4rem)] text-foreground">
                {site.tagline}
              </h2>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white"
                >
                  Book for your event
                </Link>
                <Link
                  href="/music"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border-strong px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
                >
                  Explore my music
                </Link>
              </div>
              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-ink-faint">{site.travelNote}</p>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
