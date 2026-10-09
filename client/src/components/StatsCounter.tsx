import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Animated highlight counters.
 *
 * Each number counts up once, the first time the strip scrolls into view. The
 * animation is driven by requestAnimationFrame and only ever writes text, so it
 * costs nothing on the GPU. Under `prefers-reduced-motion` the final value is
 * shown immediately — nobody is made to watch a number tick.
 */
function useCountUp(target: number, run: boolean, durationMs = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic — fast start, gentle settle
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, durationMs]);

  return value;
}

function Stat({ label, value, suffix, run }: { label: string; value: number; suffix: string; run: boolean }) {
  const shown = useCountUp(value, run);
  return (
    <div className="text-center">
      <p className="display text-[clamp(2.5rem,7vw,4.5rem)] text-foreground">
        {shown}
        <span className="text-gold">{suffix}</span>
      </p>
      <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </p>
    </div>
  );
}

export function StatsCounter() {
  const { stats } = useSiteContent();
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRun(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setRun(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    const failsafe = window.setTimeout(() => setRun(true), 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Highlights"
      className="relative border-y border-border-subtle bg-surface-1"
    >
      <div aria-hidden="true" className="ambience absolute inset-0 opacity-40" />
      <div
        ref={ref}
        className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <Stat key={s.id} label={s.label} value={s.value} suffix={s.suffix} run={run} />
        ))}
      </div>
    </section>
  );
}
