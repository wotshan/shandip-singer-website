import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { MusicCard } from "@/components/MusicCard";
import { GalleryGrid } from "@/components/GalleryGrid";
import { OccasionCard } from "@/components/OccasionCard";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Testimonials } from "@/components/Testimonials";
import { ContactLinks } from "@/components/ContactLinks";
import { SocialCarousel } from "@/components/SocialCarousel";
import { StatsCounter } from "@/components/StatsCounter";
import { TourSection } from "@/components/TourSection";
import { HighlightsGrid } from "@/components/HighlightsGrid";
import { AwardsSection } from "@/components/AwardsSection";
import { PressSection } from "@/components/PressSection";
import { CollaborationsSection } from "@/components/CollaborationsSection";
import { FanZone } from "@/components/FanZone";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { MusicPlayer } from "@/components/MusicPlayer";
import { VideoReel } from "@/components/VideoReel";
import { FaqAccordion } from "@/components/FaqAccordion";
import { SocialFeedGrid } from "@/components/SocialFeedGrid";
import { useSiteContent } from "@/content/SiteContentProvider";

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
  const { settings, music, gallery, occasions } = useSiteContent();

  return (
    <>
      <Hero />
      <Marquee />
      <StatsCounter />

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <Section id="about">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal variant="left">
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

          <Reveal variant="right" delay={1} className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {settings.longIntro}
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

      {/* ── Tour / upcoming shows ─────────────────────────────────────────── */}
      <TourSection />

      {/* ── Featured highlights ───────────────────────────────────────────── */}
      <HighlightsGrid />

      {/* ── Music ─────────────────────────────────────────────────────────── */}
      <Section id="music" className="border-t border-border-subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Music"
            title="Sets, sessions & originals"
            intro="Acoustic covers, Bollywood, romantic arrangements and live sessions — the range a booking can draw from."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {music.slice(0, 3).map((item, i) => (
            <Reveal key={item.id} variant="scale" delay={((i % 3) + 1) as 1 | 2 | 3}>
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

      {/* ── Custom audio player ── */}
      <MusicPlayer />

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      <Section id="gallery" className="border-t border-border-subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Gallery"
            title="Moments from the stage"
            intro="Photographs from live performances — the room, the lights and the songs in between."
          />
        </Reveal>

        <Reveal variant="scale" delay={1} className="mt-10">
          <GalleryGrid items={gallery} />
        </Reveal>

        <Reveal className="mt-8">
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
          >
            View the full gallery
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </Section>

      {/* ── Cinematic video reel ── */}
      <VideoReel />

      {/* ── Awards, press & collaborations ────────────────────────────────── */}
      <AwardsSection />
      <PressSection />
      <CollaborationsSection />

      {/* ── Occasions ─────────────────────────────────────────────────────── */}
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
            <Reveal key={occasion.id} variant="scale" delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <OccasionCard occasion={occasion} index={i} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Availability ──────────────────────────────────────────────────── */}
      <Section id="availability" className="border-t border-border-subtle">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal variant="left">
            <SectionHeading
              eyebrow="Availability"
              title="Is your date open?"
              intro="A live view of the booking calendar. Green dates are open; red ones are taken."
            />
          </Reveal>

          <Reveal variant="right" delay={1}>
            <AvailabilityCalendar />
          </Reveal>
        </div>
      </Section>

      {/* ── Fan zone ──────────────────────────────────────────────────────── */}
      <FanZone />

      {/* ── FAQ accordion ── */}
      <FaqAccordion />

      {/* ── Enquiry ───────────────────────────────────────────────────────── */}
      <Section id="enquiry" className="border-t border-border-subtle">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal variant="left">
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

          <Reveal variant="right" delay={1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </Section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <div className="border-t border-border-subtle">
        <Testimonials />
      </div>

      {/* ── Fan club / newsletter ─────────────────────────────────────────── */}
      <NewsletterSignup />

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <Section id="contact" className="border-t border-border-subtle">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-2 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div aria-hidden="true" className="ambience absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="eyebrow mb-5">Let's make it a night to remember</p>
              <h2 className="display mx-auto max-w-3xl text-[clamp(2rem,6vw,4rem)] text-foreground">
                {settings.tagline}
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
              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-ink-faint">{settings.travelNote}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ── Social carousel ───────────────────────────────────────────────── */}
      <SocialFeedGrid />

      <section
        aria-label={`Follow ${settings.artist}`}
        className="border-t border-border-subtle bg-surface-1 py-14 sm:py-20"
      >
        <Reveal>
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Follow"
              title="Everywhere I perform"
              intro="New sets, behind-the-scenes clips and open dates — posted across these channels."
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="mt-10">
          <SocialCarousel />
        </Reveal>
      </section>
    </>
  );
}
