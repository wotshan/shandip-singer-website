import { cn } from "@/lib/utils";

/**
 * Nothing-OS backdrop: a dot matrix or a wire grid laid behind a section.
 *
 * The pattern itself is pure CSS (`.grid-dots` / `.grid-wires` set one
 * repeating background-image), so it costs a single composite layer rather than
 * thousands of DOM nodes. The handful of accent LEDs on top are static spans at
 * fixed positions — deterministic, never randomised — so the same section
 * renders the same way on every load and in every screenshot.
 *
 * Always `aria-hidden` and `pointer-events-none`: this is decoration, and it
 * must never intercept a click or be announced.
 */

/** Fixed accent positions, as [leftPercent, topPercent]. */
const ACCENTS: Array<[number, number]> = [
  [12, 22],
  [38, 68],
  [64, 16],
  [86, 74],
];

type Props = {
  /** `dots` = Nothing's dot matrix; `wires` = a technical wire grid. */
  variant?: "dots" | "wires";
  /** Show the small accent LEDs. */
  accent?: boolean;
  /** Fade the pattern out at the edges instead of ending on a hard line. */
  fade?: boolean;
  className?: string;
};

export function GridBackdrop({ variant = "dots", accent = false, fade = true, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        fade && "mask-fade-edges",
        className,
      )}
    >
      <div className={cn("absolute inset-0", variant === "dots" ? "grid-dots" : "grid-wires")} />

      {accent
        ? ACCENTS.map(([x, y], i) => (
            <span
              key={i}
              className={cn(
                "led absolute",
                i === 1 ? "led-breathe text-crimson" : "text-led-dim",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))
        : null}
    </div>
  );
}
