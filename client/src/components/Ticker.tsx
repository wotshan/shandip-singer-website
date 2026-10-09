import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A seamless metadata ticker.
 *
 * The row is rendered twice and the track slides exactly -50%, so at the end of
 * the cycle the second copy sits precisely where the first started and the loop
 * restarts with no visible jump. The duplicate copy is `aria-hidden`, so a
 * screen reader reads the facts once, not twice.
 *
 * Pauses on hover/focus, and stops entirely under `prefers-reduced-motion`
 * (`.animate-marquee-left` is disabled by the media query in index.css).
 */
export function Ticker({
  items,
  duration = "52s",
  className,
}: {
  items: ReactNode[];
  /** One full loop, e.g. "52s". */
  duration?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  const row = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "marquee-track edge-fade relative overflow-hidden border-y border-border-subtle bg-surface-1 py-3.5",
        className,
      )}
    >
      <div
        className="animate-marquee-left flex w-max items-center gap-8"
        style={{ "--marquee-duration": duration } as CSSProperties}
      >
        {row.map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length ? "true" : undefined}
            className="flex shrink-0 items-center gap-8"
          >
            <span className="mono whitespace-nowrap text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {item}
            </span>
            <span
              aria-hidden="true"
              className={cn("led", i % 3 === 1 ? "text-crimson" : "text-led-dim")}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
