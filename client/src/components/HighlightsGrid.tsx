import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Cinematic featured-highlights grid.
 *
 * A curated subset of the gallery, laid out as an editorial mosaic. The first
 * tile spans two columns on wide screens so the grid reads as designed rather
 * than as a uniform contact sheet. Hover is a transform/opacity only, so it
 * composites on the GPU.
 */
export function HighlightsGrid() {
  const { highlights } = useSiteContent();
  if (highlights.length === 0) return null;

  return (
    <section id="highlights" className="border-t border-border-subtle bg-surface-1">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Featured"
            title="Highlights"
            intro="A curated look at the moments that define a night on stage."
          />
        </Reveal>

        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {highlights.map((h, i) => (
            <Reveal
              key={h.id}
              variant="scale"
              delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
              className={i === 0 ? "col-span-2 row-span-2" : ""}
            >
              <figure className="group relative h-full min-h-[12rem] overflow-hidden rounded-2xl border border-border-subtle">
                <img
                  src={h.src}
                  alt={h.alt || h.caption}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
                <div aria-hidden="true" className="gallery-scrim absolute inset-0" />
                {h.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 p-4">
                    <span className="font-display text-lg text-foreground">{h.caption}</span>
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
