import { cn } from "@/lib/utils";

/**
 * Nothing-OS LED status indicator.
 *
 * A small glowing dot. Colour alone never carries the meaning — every call site
 * pairs a dot with its own text label — so the indicator is decorative to a
 * screen reader and `aria-hidden`.
 */
export type LedTone = "green" | "amber" | "red" | "dim" | "accent";

const TONE: Record<LedTone, string> = {
  green: "text-led-green",
  amber: "text-led-amber",
  red: "text-led-red",
  dim: "text-led-dim",
  accent: "text-crimson",
};

export function StatusDot({
  tone = "accent",
  breathe = false,
  bloom = false,
  className,
}: {
  tone?: LedTone;
  /** Slow pulse — reserve for a genuinely live value. */
  breathe?: boolean;
  /** Soft glow halo behind the dot. */
  bloom?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("led", TONE[tone], breathe && "led-breathe", bloom && "led-bloom", className)}
    />
  );
}

/**
 * A dot plus its monospaced label — the recurring "system status" lockup used
 * on the availability matrix, the player and the dashboard.
 */
export function StatusLabel({
  tone = "accent",
  breathe = true,
  children,
  className,
}: {
  tone?: LedTone;
  breathe?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em]",
        TONE[tone],
        className,
      )}
    >
      <StatusDot tone={tone} breathe={breathe} />
      {children}
    </span>
  );
}
