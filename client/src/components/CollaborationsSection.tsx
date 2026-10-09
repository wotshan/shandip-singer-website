import { ArrowUpRight, Handshake } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Brand collaborations / endorsements.
 *
 * Hidden when empty — only real partnerships belong here. The admin adds them
 * from the dashboard and the section appears.
 */
export function CollaborationsSection() {
  const { collaborations } = useSiteContent();
  if (collaborations.length === 0) return null;

  return (
    <section id="collaborations" className="border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Partnerships"
            title="Brand collaborations"
            intro="Brands and campaigns worked with along the way."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collaborations.map((c, i) => (
            <Reveal key={c.id} variant="scale" delay={((i % 3) + 1) as 1 | 2 | 3}>
              <article className="group flex h-full flex-col rounded-3xl border border-border-subtle bg-surface-2 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                  <Handshake className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl text-foreground">{c.brand}</h3>
                {c.role ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">{c.role}</p>
                ) : null}
                {c.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-6">
                  {c.year ? <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">{c.year}</span> : <span />}
                  {c.href ? (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`More about the ${c.brand} collaboration`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                    >
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
