import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { OccasionCard } from "@/components/OccasionCard";
import { ContactLinks } from "@/components/ContactLinks";
import { useSiteContent } from "@/content/SiteContentProvider";

/** Shared page header for the inner routes — keeps every page's opening identical. */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border-subtle">
      <div aria-hidden="true" className="ambience absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        </Reveal>
      </div>
    </header>
  );
}

export default function About() {
  const { settings } = useSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The performer behind the voice"
        intro={settings.shortIntro}
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground sm:text-xl">{settings.longIntro}</p>
            <p className="text-base leading-relaxed text-muted-foreground">
              The repertoire moves comfortably between Bollywood, retro, romantic ballads,
              acoustic covers and original material — read from the room rather than run off a
              fixed list. Some nights call for a full-band set that fills a hall; others want one
              voice and a guitar in a corner.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Performances span weddings and receptions, engagement ceremonies, birthdays, private
              celebrations, club nights, corporate events, college festivals and acoustic sessions.
              {settings.travelNote}
            </p>
          </Reveal>

          <Reveal delay={1}>
            <div className="overflow-hidden rounded-3xl border border-border-subtle">
              <img
                src="/images/performance_crowd.webp"
                alt="Silhouetted audience with hands raised at a dark, atmospheric live music venue"
                className="h-72 w-full object-cover sm:h-96"
                loading="lazy"
                decoding="async"
              />
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4">
              {[
                ["Weddings", "Receptions & ceremonies"],
                ["Clubs", "Late-night live sets"],
                ["Corporate", "Annual nights & launches"],
                ["Acoustic", "Intimate unplugged"],
              ].map(([term, desc]) => (
                <div
                  key={term}
                  className="rounded-2xl border border-border-subtle bg-surface-2 p-4"
                >
                  <dt className="font-display text-lg text-foreground">{term}</dt>
                  <dd className="mt-1 text-xs text-ink-faint">{desc}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border-subtle bg-surface-1">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow mb-4">Next step</p>
                <h2 className="display text-[clamp(1.75rem,4vw,2.75rem)] text-foreground">
                  Planning something worth remembering?
                </h2>
              </div>
              <Link
                href="/contact"
                className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white lg:self-auto"
              >
                Book for your event
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function OccasionsPage() {
  const { occasions } = useSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Occasions"
        title="Every occasion has its own set"
        intro="From a wedding entrance to a college festival headline — each performance is shaped to the room it plays to."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((occasion, i) => (
            <Reveal key={occasion.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
              <OccasionCard occasion={occasion} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="Talk it through"
                title="Not sure which one fits?"
                intro="Describe the occasion and the rest follows — the format, the setlist and the setup are chosen together."
              />
            </Reveal>
            <Reveal delay={1}>
              <ContactLinks />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
