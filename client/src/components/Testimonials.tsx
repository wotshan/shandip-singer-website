import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SampleNotice } from "./SampleNotice";
import { testimonials, testimonialsAreSamples } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="In their words"
          title={<span id="testimonials-heading">What people say</span>}
          intro="A space for the words of clients, once each has given permission to be quoted."
        />
      </Reveal>

      {testimonialsAreSamples ? (
        <Reveal delay={1} className="mt-8">
          <SampleNotice>
            These are <strong className="text-foreground">sample placeholders</strong> showing the
            layout — they are not real client reviews. Genuine, permitted testimonials will replace
            them before launch.
          </SampleNotice>
        </Reveal>
      ) : null}

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
    </section>
  );
}
