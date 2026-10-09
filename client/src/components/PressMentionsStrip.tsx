import { useSiteContent } from "@/content/SiteContentProvider";
import { StatusDot } from "./StatusDot";

/**
 * The "Find me on" strip.
 *
 * Deliberately NOT fake press logos: it lists the artist's real public
 * platforms, and the admin can edit the labels/links from the dashboard. It
 * hides entirely when empty, so the hero never shows an empty band.
 *
 * Nothing-OS treatment: a row of tabular cells separated by hairlines, each with
 * a status LED. Cell one carries the breathing accent (the primary channel); the
 * rest are dim.
 */
export function PressMentionsStrip() {
  const { pressMentions } = useSiteContent();
  if (pressMentions.length === 0) return null;

  return (
    <div className="mt-9 border-t border-glass-border pt-6">
      <p className="eyebrow mb-4">Find me on</p>
      <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {pressMentions.map((m, i) => {
          const inner = (
            <span className="mono inline-flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
              <StatusDot tone={i === 0 ? "accent" : "dim"} breathe={i === 0} />
              {m.label}
            </span>
          );
          return (
            <li key={m.id}>
              {m.href ? (
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center"
                >
                  {inner}
                </a>
              ) : (
                <span className="group inline-flex items-center">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
