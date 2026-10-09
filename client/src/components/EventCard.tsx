import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveEvent } from "@/data/events";

/** Format an ISO date as e.g. "14 Nov 2026". */
function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Day + short month, split for the date block. */
function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "---" };
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

export function EventCard({ event }: { event: LiveEvent }) {
  const { day, month } = dateParts(event.date);
  const confirmed = event.status === "Confirmed";

  return (
    <article className="group relative flex gap-5 rounded-2xl border border-border-subtle bg-surface-2 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-border-strong hover:bg-surface-3 sm:p-6">
      {/* Date block */}
      <div
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-1 sm:h-20 sm:w-20"
        aria-hidden="true"
      >
        <span className="display text-2xl text-foreground sm:text-3xl">{day}</span>
        <span className="text-[0.625rem] font-semibold tracking-[0.18em] text-crimson">{month}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-snug text-foreground sm:text-2xl">
            {event.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em]",
              confirmed
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300",
            )}
          >
            {event.status}
          </span>
        </div>

        {/*
          `min-w-0` on each row AND on the truncating cell is load-bearing: the
          venue uses `truncate`, which sets `white-space: nowrap`, so without it
          the row's min-content width is the full unwrapped string — that min-content
          then propagates up through the grid's default `min-width: auto`, blowing the
          single-column track (and every card in it) wider than the viewport on phones.
        */}
        <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5 min-w-0">
            <dt className="sr-only">Date and time</dt>
            <Clock className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <dd className="min-w-0">
              {formatDate(event.date)} · {event.time}
            </dd>
          </div>
          <div className="flex items-center gap-2.5 min-w-0">
            <dt className="sr-only">Venue and city</dt>
            <MapPin className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <dd className="min-w-0 truncate">
              {event.venue} · {event.city}
            </dd>
          </div>
        </dl>

        {event.note ? (
          <p className="mt-4 border-t border-border-subtle pt-3 text-xs text-ink-faint">
            {event.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}
