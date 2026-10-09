import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { StatusDot } from "./StatusDot";

type Row = { words: string[]; direction: "left" | "right"; duration: string };

/**
 * Kinetic marquee.
 *
 * Seamlessness comes from duplicating the row's words exactly once and sliding
 * the track by -50%: at the end of the cycle the second copy sits precisely
 * where the first started, so the loop restarts with no visible jump. The copy
 * is aria-hidden and the whole section is presentational, so a screen reader is
 * not read a doubled list.
 *
 * Nothing-OS: each row is a monospaced line on a hairline rule, with a dim LED
 * between entries, rather than a wall of huge display type — it reads as a
 * readout, not a slogan.
 */
const ROWS: Row[] = [
  { words: ["Weddings", "Receptions", "Birthdays", "Private Events"], direction: "left", duration: "36s" },
  { words: ["Bollywood", "Acoustic", "Romantic", "Live Sessions"], direction: "right", duration: "42s" },
  { words: ["Live Music", "Special Occasions", "Your Event", "Your Sound"], direction: "left", duration: "48s" },
];

function Track({ words, direction, duration }: Row) {
  const items = [...words, ...words];
  return (
    <div className="marquee-track edge-fade relative overflow-hidden">
      <div
        className={cn(
          "flex w-max items-center gap-7 sm:gap-10",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
        )}
        style={{ "--marquee-duration": duration } as CSSProperties}
      >
        {items.map((word, i) => (
          <span
            key={`${word}-${i}`}
            aria-hidden={i >= words.length ? "true" : undefined}
            className="flex shrink-0 items-center gap-7 sm:gap-10"
          >
            <span className="mono whitespace-nowrap py-4 text-[0.75rem] font-medium uppercase tracking-[0.28em] text-muted-foreground sm:text-[0.8125rem]">
              {word}
            </span>
            <span
              aria-hidden="true"
              className={cn("h-1 w-1 shrink-0 rounded-full", i % 2 === 0 ? "bg-crimson" : "bg-border-strong")}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  const { settings } = useSiteContent();
  return (
    <section
      aria-hidden="true"
      className="relative border-y border-border-subtle bg-surface-1"
    >
      <div className="grid divide-y divide-border-subtle">
        {ROWS.map((row, i) => (
          <Track key={i} {...row} />
        ))}
      </div>

      {/* Fixed readout chip, so the strip also states what it is. */}
      <div className="pointer-events-none absolute left-0 top-0 hidden h-full items-center pl-5 sm:flex">
        <span className="mono flex items-center gap-2.5 rounded-full border border-glass-border bg-background/80 px-4 py-2 text-[0.5625rem] uppercase tracking-[0.22em] text-ink-faint backdrop-blur-md">
          <StatusDot tone="accent" breathe />
          {settings.role}
        </span>
      </div>
    </section>
  );
}
