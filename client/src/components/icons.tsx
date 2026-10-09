/**
 * Inline brand glyphs.
 *
 * The installed lucide-react (v1.25) no longer ships every brand mark, and
 * brand logos are trademarked anyway — drawing the two we need as tiny inline
 * SVGs keeps the icon set complete without adding a dependency. Both accept a
 * `className` passthrough and are decorative (`aria-hidden`), since each sits
 * beside a visible text label.
 */
import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10.2 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}
