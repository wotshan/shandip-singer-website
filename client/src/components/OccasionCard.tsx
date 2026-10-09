import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import type { OccasionItem } from "@shared/types";

export function OccasionCard({ occasion, index }: { occasion: OccasionItem; index: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 p-6 transition-all duration-400 hover:-translate-y-1.5 hover:border-crimson/40 sm:p-7">
      {/* index watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl text-white/[0.035] transition-colors duration-500 group-hover:text-crimson/10"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <h3 className="font-display text-2xl leading-tight text-foreground">{occasion.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{occasion.blurb}</p>

      {occasion.includes.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {occasion.includes.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-[0.8125rem] text-muted-foreground">
              <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-crimson" />
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/contact"
        className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.8125rem] font-medium text-foreground transition-colors hover:text-crimson"
      >
        Enquire about this
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="sr-only"> — {occasion.title}</span>
      </Link>
    </article>
  );
}
