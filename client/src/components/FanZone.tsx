import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Fan zone — messages from the audience.
 *
 * Hidden when empty: only genuine, permitted messages belong here, and the
 * artist has not supplied any yet. The admin adds them from the dashboard.
 */
export function FanZone() {
  const { fanMessages } = useSiteContent();
  if (fanMessages.length === 0) return null;

  return (
    <section id="fan-zone" className="border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Fan zone"
            title="From the audience"
            intro="Notes from the people in the room."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fanMessages.map((f, i) => (
            <Reveal key={f.id} variant="scale" delay={((i % 3) + 1) as 1 | 2 | 3}>
              <figure className="flex h-full flex-col rounded-3xl border border-border-subtle bg-surface-2 p-7 transition-colors hover:border-crimson/40">
                <Quote className="h-5 w-5 text-crimson" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/90">
                  {f.message}
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">
                  {f.author ? <span className="text-foreground">{f.author}</span> : null}
                  {f.author && f.city ? " · " : null}
                  {f.city}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
