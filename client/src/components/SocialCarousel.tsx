import type { CSSProperties } from "react";
import { SOCIAL_GLYPHS } from "./icons";
import { useSiteContent } from "@/content/SiteContentProvider";
import type { SocialKey } from "@/data/site";
import type { SocialLink } from "@shared/types";

/**
 * Seamless, dark-faded loop of the artist's social channels.
 *
 * Seamlessness uses the same trick as the text marquee: the row is rendered
 * twice and the track slides exactly -50%, so at the end of the cycle the
 * second copy sits precisely where the first began and the loop restarts with
 * no visible jump.
 *
 * The duplicate copy is `aria-hidden` AND `tabIndex={-1}` — hiding a focusable
 * link from assistive tech without removing it from the tab order is an
 * accessibility bug, so both go together. The whole row pauses on hover and on
 * keyboard focus, and `prefers-reduced-motion` drops the duplicate and lets the
 * real row wrap into a static, centred list (see index.css).
 */

const DURATION = "38s";

function Channel({ social, duplicate = false }: { social: SocialLink; duplicate?: boolean }) {
  const Icon = SOCIAL_GLYPHS[social.key as SocialKey] ?? SOCIAL_GLYPHS.email;
  return (
    <li className={duplicate ? "social-dup shrink-0" : "shrink-0"}>
      <a
        href={social.href}
        {...(social.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={social.handle}
        aria-hidden={duplicate ? "true" : undefined}
        tabIndex={duplicate ? -1 : undefined}
        className="group grid h-16 w-16 place-items-center rounded-full border border-border-subtle bg-surface-2 text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-crimson/50 hover:bg-crimson/10 hover:text-foreground focus-visible:-translate-y-1 focus-visible:border-crimson/50 focus-visible:text-foreground sm:h-20 sm:w-20"
      >
        <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7" />
      </a>
    </li>
  );
}

export function SocialCarousel() {
  const { socials } = useSiteContent();

  return (
    <div className="social-marquee edge-fade relative overflow-hidden py-2">
      <ul
        className="social-marquee-track flex w-max items-center gap-4 sm:gap-6"
        style={{ "--marquee-duration": DURATION } as CSSProperties}
      >
        {socials.map((s) => (
          <Channel key={s.id} social={s} />
        ))}
        {socials.map((s) => (
          <Channel key={`dup-${s.id}`} social={s} duplicate />
        ))}
      </ul>
    </div>
  );
}
