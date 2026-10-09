import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";
import type { GalleryItem } from "@/data/gallery";

/**
 * Photo wall.
 *
 * Each tile is a real <button>, not a styled div, so the whole card is keyboard
 * reachable and announces itself as "Open photo N of M: <caption>".
 *
 * The images keep their natural aspect ratio instead of being forced into one
 * uniform box: all three photographs are portrait with different proportions
 * (0.71 / 0.66 / 0.56), so a shared aspect ratio would either crop the narrower
 * frames hard or letterbox them. `h-auto` never crops a subject.
 */
export function GalleryGrid({
  items,
  className,
}: {
  items: GalleryItem[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Warm the browser cache once the wall is on screen so opening a photo is
  // instant rather than a blank frame followed by a pop-in.
  useEffect(() => {
    items.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, [items]);

  return (
    <>
      <ul className={cn("grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-3", className)}>
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-haspopup="dialog"
              aria-label={`Open photo ${i + 1} of ${items.length}: ${item.caption}`}
              className="group relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-crimson/40 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] focus-visible:-translate-y-1 focus-visible:border-crimson/60"
            >
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />

              <span aria-hidden="true" className="gallery-scrim pointer-events-none absolute inset-0" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-crimson/0 transition-colors duration-500 group-hover:bg-crimson/15"
              />

              <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                {item.tag}
              </span>

              <span
                aria-hidden="true"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/45 text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </span>

              <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <span className="block font-display text-base leading-tight text-white sm:text-lg">
                  {item.caption}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null ? (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      ) : null}
    </>
  );
}
