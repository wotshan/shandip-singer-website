import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Row = { words: string[]; direction: "left" | "right"; duration: string };

/**
 * Three seamlessly looping rows.
 *
 * Seamlessness comes from duplicating the row's words exactly once and sliding
 * the track by -50%: at the end of the cycle the second copy sits precisely
 * where the first started, so the loop restarts with no visible jump. The copy
 * is aria-hidden and the whole marquee is presentational (aria-hidden on the
 * section), so a screen reader is not read a doubled word list.
 */
const ROWS: Row[] = [
  { words: ["Weddings", "Receptions", "Birthdays", "Private Events"], direction: "left", duration: "34s" },
  { words: ["Bollywood", "Acoustic", "Romantic", "Live Sessions"], direction: "right", duration: "40s" },
  { words: ["Live Music", "Special Occasions", "Your Event", "Your Sound"], direction: "left", duration: "46s" },
];

function Track({ words, direction, duration }: Row) {
  const items = [...words, ...words];
  return (
    <div className="marquee-track edge-fade relative overflow-hidden py-1.5">
      <div
        className={cn(
          "flex w-max items-center gap-8 sm:gap-12",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
        )}
        style={{ "--marquee-duration": duration } as CSSProperties}
      >
        {items.map((word, i) => (
          <span
            key={`${word}-${i}`}
            aria-hidden={i >= words.length ? "true" : undefined}
            className="flex shrink-0 items-center gap-8 sm:gap-12"
          >
            <span
              className={cn(
                "display whitespace-nowrap text-[clamp(1.5rem,5vw,3.25rem)] uppercase transition-colors",
                i % 2 === 0 ? "text-foreground/85" : "text-foreground/45",
              )}
            >
              {word}
            </span>
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-crimson/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section
      aria-hidden="true"
      className="relative border-y border-border-subtle bg-surface-1 py-10 sm:py-14"
    >
      <div className="space-y-1.5">
        {ROWS.map((row, i) => (
          <Track key={i} {...row} />
        ))}
      </div>
    </section>
  );
}
