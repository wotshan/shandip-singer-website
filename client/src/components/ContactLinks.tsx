import { SOCIAL_GLYPHS } from "./icons";
import { useSiteContent } from "@/content/SiteContentProvider";
import type { SocialKey } from "@/data/site";

/**
 * The direct-channel rows. Every entry comes from the server's `socials`
 * registry (admin-editable), so the real accounts live in exactly one place and
 * this list can never drift out of sync with the footer or the carousel.
 */
export function ContactLinks() {
  const { socials } = useSiteContent();

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {socials.map((s) => {
        const Icon = SOCIAL_GLYPHS[s.key as SocialKey] ?? SOCIAL_GLYPHS.email;
        return (
          <li key={s.id}>
            <a
              href={s.href}
              {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={s.handle}
              className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-2 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson/40 hover:bg-surface-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-subtle bg-surface-1 text-crimson transition-colors group-hover:border-crimson/40 group-hover:bg-crimson/10">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{s.label}</span>
                <span className="block truncate text-xs text-ink-faint">{s.value}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
