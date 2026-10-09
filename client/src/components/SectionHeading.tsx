import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  /**
   * A real, factual right-hand note — an item count, a date range, a status.
   * Deliberately not a decorative "01 / 02 / 03": a marker only earns its place
   * here if it tells the reader something true about the section.
   */
  meta?: ReactNode;
  className?: string;
};

/**
 * Shared section header.
 *
 * The lockup is always the same — monospaced eyebrow on a hairline, a tight
 * grotesque title, a muted intro, and a monospaced meta note hard-right on the
 * rule — which is what keeps the rhythm identical section to section instead of
 * drifting page by page.
 */
export function SectionHeading({ eyebrow, title, intro, align = "left", meta, className }: Props) {
  const centered = align === "center";

  return (
    <header className={cn(centered && "mx-auto text-center", className)}>
      <div
        className={cn(
          "flex gap-6 pb-5",
          centered ? "flex-col items-center" : "flex-wrap items-end justify-between",
        )}
      >
        <div className={cn("max-w-3xl", centered && "flex flex-col items-center")}>
          {eyebrow ? (
            <p className={cn("eyebrow mb-4 flex items-center gap-3", centered && "justify-center")}>
              <span aria-hidden="true" className="led text-crimson" />
              {eyebrow}
            </p>
          ) : null}

          <h2 className="display text-[clamp(2rem,5.5vw,3.5rem)] text-foreground">{title}</h2>

          {intro ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {intro}
            </p>
          ) : null}
        </div>

        {meta ? (
          <p
            className={cn(
              "mono shrink-0 pb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink-faint",
              !centered && "ml-auto",
            )}
          >
            {meta}
          </p>
        ) : null}
      </div>

      <div aria-hidden="true" className="rule" />
    </header>
  );
}
