import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";
import { StatusDot } from "./StatusDot";

const ROTATE_MS = 7000;

/**
 * Testimonial carousel.
 *
 * Auto-rotates on a 7s beat with a rail that fills to show the time remaining,
 * pauses on hover/focus and while the tab is hidden, and is fully drivable by
 * its own prev/next buttons and dot rail for anyone who wants to control it.
 *
 * Auto-rotation is switched off entirely under `prefers-reduced-motion` (see the
 * `.rail-fill` media query), which leaves a plain, static, manual carousel rather
 * than an animation nobody asked for.
 *
 * The track is a single transform on a flex row — one composite per tick, no
 * layout, no reflow of the page.
 */
export function Testimonials() {
  const { testimonials } = useSiteContent();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);

  const total = testimonials.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % Math.max(1, total)),
    [total],
  );

  useEffect(() => {
    if (total < 2 || paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const tick = window.setInterval(() => go(1), ROTATE_MS);
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [total, paused, go]);

  // Keep the index valid if the admin deletes rows while the page is open.
  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [total, index]);

  if (total === 0) {
    return (
      <section aria-labelledby="testimonials-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="In their words"
            title={<span id="testimonials-heading">What people say</span>}
            intro="Words from clients, shared with their permission."
          />
        </Reveal>
        <Reveal delay={1} className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface-1/60 p-10 text-center">
            <div aria-hidden="true" className="grid-dots absolute inset-0 opacity-60" />
            <div className="relative">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-crimson/35 text-crimson led-bloom">
                <Quote className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="display mt-5 text-2xl text-foreground">No testimonials yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Genuine client quotes will appear here once each person has given permission to be
                quoted.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
    >
      <Reveal>
        <SectionHeading
          eyebrow="In their words"
          title={<span id="testimonials-heading">What people say</span>}
          intro="Words from clients, shared with their permission."
          meta={total > 1 ? `${index + 1} / ${total}` : undefined}
        />
      </Reveal>

      <Reveal variant="scale" delay={1} className="mt-10">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={(e) => {
            touch.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touch.current;
            touch.current = null;
            const end = e.changedTouches[0]?.clientX;
            if (start == null || end == null) return;
            if (Math.abs(end - start) > 45) go(end < start ? 1 : -1);
          }}
          className="relative overflow-hidden rounded-3xl border border-glass-border bg-surface-1/60 backdrop-blur-xl"
        >
          <div aria-hidden="true" className="grid-dots absolute inset-0 opacity-50" />

          {/* Track */}
          <div
            className="relative flex transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
          >
            {testimonials.map((t, i) => (
              <figure
                key={t.id}
                aria-hidden={i === index ? undefined : "true"}
                className="w-full shrink-0 px-7 py-12 sm:px-14 sm:py-16"
              >
                <Quote className="h-7 w-7 text-crimson/60" aria-hidden="true" />
                <blockquote className="mt-6 max-w-4xl font-display text-[clamp(1.25rem,3vw,2rem)] font-medium leading-[1.35] tracking-[-0.02em] text-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mono mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-faint">
                  <StatusDot tone="accent" />
                  <span className="text-foreground">{t.author}</span>
                  <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
                  <span>{t.context}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Controls */}
          <div className="relative flex items-center justify-between gap-4 border-t border-border-subtle px-5 py-4 sm:px-7">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Dot rail */}
            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-crimson" : "w-1.5 bg-border-strong hover:bg-muted-foreground",
                  )}
                />
              ))}
            </div>

            <p aria-live="polite" className="sr-only">
              Testimonial {index + 1} of {total}
            </p>
          </div>

          {/* Progress rail — fills across the rotation window. */}
          {total > 1 && !paused ? (
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent">
              <div
                key={index}
                className="rail-fill h-full bg-crimson/70"
                style={{ "--rail-duration": `${ROTATE_MS}ms` } as React.CSSProperties}
              />
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
