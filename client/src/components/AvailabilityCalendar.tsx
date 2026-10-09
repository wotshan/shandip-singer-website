import { cn } from "@/lib/utils";
import {
  availabilityDays,
  availabilityMonth,
  statusMeta,
  weekdayLabels,
  type AvailabilityStatus,
} from "@/data/availability";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Calendar-style availability preview.
 *
 * Uses a Monday-first grid offset computed from the month's first weekday, so
 * the dates line up under the correct column at any month. Each day carries a
 * text label as well as a colour, so status never depends on colour alone.
 */
export function AvailabilityCalendar() {
  const { year, month } = availabilityMonth;
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Shift so the week starts on Monday (0=Mon … 6=Sun).
  const leadingBlanks = (firstWeekday + 6) % 7;

  const byDate = new Map(availabilityDays.map((d) => [d.date, d]));
  const total = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number; status?: AvailabilityStatus; note?: string } | null> = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const entry = byDate.get(iso);
    cells.push({ day: d, status: entry?.status, note: entry?.note });
  }

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface-2 p-5 sm:p-7">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl text-foreground sm:text-3xl">
          {MONTH_NAMES[month]} {year}
        </h3>
        <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">Preview</span>
      </div>

      {/* Weekday header */}
      <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div
            key={d}
            className="pb-2 text-center text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-faint"
          >
            <span className="sm:hidden">{weekdayLabels[(i + 1) % 7]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} aria-hidden="true" />;

          const meta = cell.status ? statusMeta[cell.status] : undefined;

          return (
            <div
              key={cell.day}
              title={meta ? `${cell.day}: ${meta.label}${cell.note ? ` — ${cell.note}` : ""}` : undefined}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-colors",
                meta
                  ? meta.chipClass
                  : "border-border-subtle bg-surface-1 text-muted-foreground",
              )}
            >
              <span className="font-medium tabular-nums">{cell.day}</span>
              {meta ? (
                <span className={cn("mt-0.5 h-1 w-1 rounded-full", meta.dotClass)} aria-hidden="true" />
              ) : null}
              <span className="sr-only">
                {meta ? `: ${meta.label}${cell.note ? ` — ${cell.note}` : ""}` : ": no data"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <ul className="mt-7 grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-2">
        {(Object.keys(statusMeta) as AvailabilityStatus[]).map((key) => (
          <li key={key} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", statusMeta[key].dotClass)}
            />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                {statusMeta[key].label}
              </span>
              <span className="block text-xs text-ink-faint">{statusMeta[key].description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
