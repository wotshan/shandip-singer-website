import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

export function Testimonials() {
  const { testimonials } = useSiteContent();

  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="In their words"
          title={<span id="testimonials-heading">What people say</span>}
          intro="Words from clients, shared with their permission."
        />
      </Reveal>

      {testimonials.length === 0 ? (
        <Reveal delay={1} className="mt-10">
          <div className="rounded-3xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
            <Quote className="mx-auto h-7 w-7 text-crimson/50" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl text-foreground">No testimonials yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Genuine client quotes will appear here once each person has given permission to be
              quoted.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <figure className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-2 p-6 sm:p-7">
                <Quote className="h-6 w-6 text-crimson/60" aria-hidden="true" />
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border-subtle pt-4">
                  <p className="font-display text-lg text-foreground">{t.author}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-faint">{t.context}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
