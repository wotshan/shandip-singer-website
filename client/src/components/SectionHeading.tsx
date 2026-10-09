import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/**
 * Shared editorial section header. Keeping it in one place is what makes the
 * heading rhythm (eyebrow → display title → muted intro) identical across every
 * page instead of drifting section by section.
 */
export function SectionHeading({ eyebrow, title, intro, align = "left", className }: Props) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="eyebrow mb-4 flex items-center gap-3">
          {align === "left" ? <span className="h-px w-8 bg-crimson/70" aria-hidden="true" /> : null}
          {eyebrow}
        </p>
      ) : null}

      <h2 className="display text-[clamp(2rem,5.5vw,3.75rem)] text-foreground">{title}</h2>

      {intro ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
