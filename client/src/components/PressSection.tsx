import { ArrowUpRight, Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Press & media coverage.
 *
 * Hidden when empty — only real, published features belong here, and the artist
 * has not supplied any yet. The admin adds them from the dashboard.
 */
export function PressSection() {
  const { press } = useSiteContent();
  if (press.length === 0) return null;

  return (
    <section id="press" className="border-t border-border-subtle bg-surface-1">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="In the press"
            title="Press & media"
            intro="Features, interviews and coverage."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {press.map((p, i) => (
            <Reveal key={p.id} variant="scale" delay={((i % 2) + 1) as 1 | 2}>
              <article className="group flex h-full flex-col rounded-3xl border border-border-subtle bg-surface-2 p-7 transition-colors hover:border-crimson/40">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-display text-xl tracking-[0.08em] text-foreground">{p.outlet}</p>
                  {p.date ? (
                    <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-ink-faint">{p.date}</span>
                  ) : null}
                </div>

                {p.headline ? (
                  <h3 className="mt-4 font-display text-2xl leading-snug text-foreground">{p.headline}</h3>
                ) : null}

                {p.quote ? (
                  <blockquote className="mt-4 flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
                    <span className="italic">{p.quote}</span>
                  </blockquote>
                ) : null}

                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-foreground transition-colors hover:text-crimson"
                  >
                    Read the feature
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
