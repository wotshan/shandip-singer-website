import { cn } from "@/lib/utils";

/**
 * Deterministic pseudo-waveform.
 *
 * The bar heights come from layered sines of the bar index — never
 * `Math.random` — so the same track always draws the same figure, and a
 * re-render (a seek, a resize, a screenshot) never reshuffles it.
 */
function heightAt(i: number, total: number): number {
  const t = i / Math.max(1, total - 1);
  const a = Math.sin(t * Math.PI * 9.3) * 0.5 + 0.5;
  const b = Math.sin(t * Math.PI * 23.7 + 1.2) * 0.5 + 0.5;
  // A broad envelope over the whole figure reads as a song, not a noise floor.
  const envelope = 0.4 + 0.6 * Math.sin(Math.PI * t);
  return Math.max(0.12, envelope * (0.45 + 0.55 * (a * 0.62 + b * 0.38)));
}

type Props = {
  /** Playhead position, 0–1. Bars left of it are lit. */
  progress?: number;
  bars?: number;
  /** Height of the figure, as a Tailwind class (e.g. "h-16"). */
  height?: string;
  /** Animate bars just behind the playhead — only when audio is actually playing. */
  active?: boolean;
  /** Supply to make the figure an interactive, keyboard-accessible scrubber. */
  onSeekRatio?: (ratio: number) => void;
  /** Accessible name when interactive. */
  label?: string;
  className?: string;
};

export function Waveform({
  progress = 0,
  bars = 64,
  height = "h-14",
  active = false,
  onSeekRatio,
  label = "Seek",
  className,
}: Props) {
  const pct = Math.min(1, Math.max(0, progress));
  const interactive = Boolean(onSeekRatio);

  function ratioFromEvent(clientX: number, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  const figure = (
    <div className={cn("flex items-center gap-[2px] sm:gap-[3px]", height, className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = heightAt(i, bars);
        const lit = i / bars < pct;
        // Only a narrow band around the playhead animates, so a paused figure is
        // completely static and a playing one reads as motion at the head.
        const near = active && Math.abs(i - pct * bars) < 5;
        return (
          <span
            key={i}
            data-active={near ? "true" : "false"}
            className={cn("wave-bar flex-1", lit ? "bg-crimson" : "bg-border-strong/70")}
            style={{ height: `${Math.round(h * 100)}%` }}
          />
        );
      })}
    </div>
  );

  if (!interactive) {
    return (
      <div aria-hidden="true">
        {figure}
      </div>
    );
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      onPointerDown={(e) => onSeekRatio!(ratioFromEvent(e.clientX, e.currentTarget))}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeekRatio!(Math.min(1, pct + 0.05));
        else if (e.key === "ArrowLeft") onSeekRatio!(Math.max(0, pct - 0.05));
        else if (e.key === "Home") onSeekRatio!(0);
        else if (e.key === "End") onSeekRatio!(1);
        else return;
        e.preventDefault();
      }}
      className="cursor-pointer rounded-sm"
    >
      {figure}
    </div>
  );
}
