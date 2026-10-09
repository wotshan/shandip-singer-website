import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { statusMeta, type AvailabilityStatus } from "@/data/availability";
import { StatusDot } from "./StatusDot";
import { GridBackdrop } from "./GridBackdrop";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * The booking matrix.
 *
 * Nothing-OS treatment: a dot-matrix panel, a monospaced header row, and one LED
 * per day. Each day is a real <button>, so the status is reachable by keyboard
 * as well as hover — the detail (date, status, note) appears in a tooltip on
 * hover AND on focus, and is also written into an `sr-only` line inside the cell.
 * Status is therefore never signalled by colour alone.
 *
 * The month is navigable (‹ ›) without a round-trip: the whole availability
 * series is already in context, so switching months is a local re-render.
 */
export function AvailabilityCalendar() {
  const { availability } = useSiteContent();

  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const byDate = useMemo(() => new Map(availability.map((d) => [d.date, d])), [availability]);

  const firstWeekday = new Date(view.year, view.month, 1).getDay(); // 0 = Sunday
  // Shift so the week starts on Monday (0 = Mon … 6 = Sun).
  const leadingBlanks = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: Array<{ day: number; status?: AvailabilityStatus; note?: string | null } | null> = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    const entry = byDate.get(iso(view.year, view.month, d));
    cells.push({ day: d, status: entry?.status, note: entry?.note });
  }

  // Real derived counts for the month on screen — never an invented figure.
  const counts = useMemo(() => {
    const acc: Record<AvailabilityStatus, number> = {
      AVAILABLE: 0,
      TENTATIVE: 0,
      BOOKED: 0,
      UNAVAILABLE: 0,
    };
    for (let d = 1; d <= daysInMonth; d += 1) {
      const entry = byDate.get(iso(view.year, view.month, d));
      if (entry) acc[entry.status] += 1;
    }
    return acc;
  }, [byDate, view.year, view.month, daysInMonth]);

  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();

  function step(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  const documented = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-glass-border bg-surface-1/80 backdrop-blur-xl">
      <GridBackdrop variant="dots" fade={false} className="opacity-70" />

      <div className="relative p-5 sm:p-7">
        {/* Header: month nav + live tag */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous month"
              className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <h3 className="display whitespace-nowrap text-2xl text-foreground sm:text-3xl">
              {MONTH_NAMES[view.month]} {view.year}
            </h3>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next month"
              className="grid h-8 w-8 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {!isCurrentMonth ? (
              <button
                type="button"
                onClick={() => setView({ year: today.getFullYear(), month: today.getMonth() })}
                className="mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Today
              </button>
            ) : null}
            <span className="mono flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.2em] text-crimson">
              <StatusDot tone="accent" breathe />
              Live
            </span>
          </div>
        </div>

        {/* Weekday header */}
        <div className="mt-7 grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              aria-hidden="true"
              className="mono pb-2 text-center text-[0.5625rem] font-medium uppercase tracking-[0.18em] text-ink-faint"
            >
              {d.slice(0, 1)}
              <span className="hidden sm:inline">{d.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* Day matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`blank-${i}`} aria-hidden="true" />;

            const meta = cell.status ? statusMeta[cell.status] : undefined;
            const isToday =
              isCurrentMonth && cell.day === today.getDate();
            const detail = meta
              ? `${meta.label}${cell.note ? ` — ${cell.note}` : ""}`
              : "No dates published";

            return (
              <button
                key={cell.day}
                type="button"
                aria-label={`${cell.day} ${MONTH_NAMES[view.month]}: ${detail}`}
                className={cn(
                  "group relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-all duration-200",
                  isToday && "ring-1 ring-crimson/50",
                  meta
                    ? meta.chipClass
                    : "border-border-subtle bg-surface-1/60 text-ink-faint hover:border-border-strong",
                )}
              >
                <span className={cn("mono font-medium", meta ? "text-foreground" : "text-ink-faint")}>
                  {String(cell.day).padStart(2, "0")}
                </span>
                {meta ? (
                  <span
                    aria-hidden="true"
                    className={cn("mt-1 h-1.5 w-1.5 rounded-full", meta.dotClass)}
                  />
                ) : (
                  <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 rounded-full bg-border-strong/60" />
                )}

                {/* Tooltip — on hover and on keyboard focus. */}
                <span
                  role="tooltip"
                  className="tooltip-pop pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[15rem] -translate-x-1/2 scale-95 rounded-lg border border-glass-border-strong bg-background/95 px-3 py-2 text-left opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                >
                  <span className="mono block text-[0.5625rem] uppercase tracking-[0.18em] text-ink-faint">
                    {DAY_NAMES[(leadingBlanks + cell.day - 1) % 7]} {String(cell.day).padStart(2, "0")}{" "}
                    {MONTH_NAMES[view.month].slice(0, 3)}
                  </span>
                  {meta ? (
                    <span className={cn("mono mt-1 flex items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.16em]", meta.textClass)}>
                      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
                      {meta.label}
                    </span>
                  ) : (
                    <span className="mono mt-1 block text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                      No dates published
                    </span>
                  )}
                  {cell.note ? (
                    <span className="mt-1.5 block text-[0.6875rem] leading-snug text-muted-foreground">
                      {cell.note}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend + derived counts */}
        <div className="mt-7 border-t border-border-subtle pt-5">
          <p className="mono mb-4 text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
            {documented === 0
              ? "No dates published for this month"
              : `${counts.AVAILABLE} available · ${counts.BOOKED} booked · ${counts.TENTATIVE} tentative`}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(statusMeta) as AvailabilityStatus[]).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusMeta[key].dotClass)}
                />
                <span>
                  <span className="mono block text-[0.625rem] uppercase tracking-[0.16em] text-foreground">
                    {statusMeta[key].label}
                  </span>
                  <span className="block text-xs text-ink-faint">{statusMeta[key].description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
