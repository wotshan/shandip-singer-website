import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentProvider";
import { SOCIAL_GLYPHS } from "./icons";
import type { SocialKey } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

/**
 * Social feed grid.
 *
 * A cinematic grid of the artist's real channels, each linking out to the actual
 * profile. It is a "find me everywhere" grid rather than a scraped feed — no
 * third-party API is called and no post is invented.
 */
export function SocialFeedGrid() {
  const { socials, settings } = useSiteContent();
  const external = socials.filter((s) => s.external);

  if (external.length === 0) return null;

  return (
    <section aria-labelledby="social-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Follow"
          title={<span id="social-heading">Find me everywhere</span>}
          intro={`New sets, behind-the-scenes clips and open dates — posted across these channels.`}
        />
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {external.map((s, i) => {
          const Icon = SOCIAL_GLYPHS[s.key as SocialKey] ?? SOCIAL_GLYPHS.email;
          return (
            <Reveal key={s.id} variant="scale" delay={((i % 3) + 1) as 1 | 2 | 3}>
              <TiltCard className="h-full">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.handle}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 p-6 transition-colors hover:border-crimson/40"
                >
                  <div aria-hidden="true" className="ambience absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-40" />
                  <div className="relative flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-border-subtle bg-surface-3 text-crimson transition-colors group-hover:border-crimson/50">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crimson" aria-hidden="true" />
                  </div>
                  <div className="relative mt-8">
                    <p className="font-display text-2xl text-foreground">{s.label}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{s.value}</p>
                  </div>
                </a>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-8">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-faint">
          {settings.artist} · {settings.cities}
        </p>
      </Reveal>
    </section>
  );
}
