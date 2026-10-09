import { Award } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Awards & achievements.
 *
 * Renders nothing when the collection is empty — the artist has not supplied
 * any awards, and inventing them would be a false claim. The admin adds genuine
 * entries from the dashboard and the section appears.
 */
export function AwardsSection() {
  const { awards } = useSiteContent();
  if (awards.length === 0) return null;

  return (
    <section id="awards" className="border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Recognition"
            title="Awards & achievements"
            intro="Milestones and recognitions earned along the way."
          />
        </Reveal>

        <ol className="mt-12 space-y-4">
          {awards.map((a, i) => (
            <Reveal key={a.id} variant="left" delay={((i % 3) + 1) as 1 | 2 | 3}>
              <li className="group flex items-start gap-5 rounded-2xl border border-border-subtle bg-surface-2 p-6 transition-colors hover:border-crimson/40">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-crimson/40 bg-crimson/10 text-crimson">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-2xl text-foreground">{a.title}</h3>
                    {a.year ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-crimson">
                        {a.year}
                      </span>
                    ) : null}
                  </div>
                  {a.organisation ? (
                    <p className="mt-1 text-sm text-muted-foreground">{a.organisation}</p>
                  ) : null}
                  {a.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
                  ) : null}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
