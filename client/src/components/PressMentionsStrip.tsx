import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * The "As seen on" strip.
 *
 * Deliberately NOT fake press logos: it lists the artist's real public
 * platforms, and the admin can edit the labels/links from the dashboard. It
 * hides entirely when empty, so the hero never shows an empty band.
 */
export function PressMentionsStrip() {
  const { pressMentions } = useSiteContent();
  if (pressMentions.length === 0) return null;

  return (
    <div className="mt-12 border-t border-white/10 pt-6">
      <p className="eyebrow mb-4 text-ink-faint">Find me on</p>
      <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
        {pressMentions.map((m) => {
          const inner = (
            <span className="font-display text-lg tracking-[0.14em] text-foreground/70 transition-colors group-hover:text-foreground">
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
