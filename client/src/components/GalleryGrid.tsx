import { useEffect, useState } from "react";
import { Maximize2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";
import type { GalleryItem } from "@shared/types";

/**
 * Photo wall.
 *
 * A CSS-columns masonry: every tile keeps its natural aspect ratio, so a shared
 * crop never decapitates a subject and the wall reads as an editorial contact
 * sheet rather than a uniform grid.
 *
 * Each tile is a real <button>, not a styled div, so the whole card is keyboard
 * reachable and announces itself as "Open photo N of M: <caption>".
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
      <ul className={cn("masonry list-none", className)}>
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-haspopup="dialog"
              aria-label={`Open photo ${i + 1} of ${items.length}: ${item.caption}`}
              className="group relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-crimson/45 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)] focus-visible:-translate-y-1 focus-visible:border-crimson/60"
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
                className="pointer-events-none absolute inset-0 bg-crimson/0 transition-colors duration-500 group-hover:bg-crimson/10"
              />

              {item.tag ? (
                <span className="mono absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                  {item.tag}
                </span>
              ) : null}

              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/45 text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </span>

              <span className="absolute inset-x-0 bottom-0 p-3 pr-14 sm:p-4 sm:pr-16">
                <span className="block font-display text-base font-medium leading-tight text-white sm:text-lg">
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

/**
 * Video wall.
 *
 * Same masonry rhythm as the photo wall, but each tile opens the video in a
 * lightbox. Poster art is shown when the admin supplied it; otherwise the tile
 * falls back to a labelled placeholder rather than pretending to be a thumbnail.
 */
export function VideoGrid(
  { items }: { items: Array<{ id: string; title: string; embedUrl: string; poster: string | null; caption: string }> },
) {
  const [open, setOpen] = useState<number | null>(null);
  const current = open !== null ? items[open] : null;

  useEffect(() => {
    if (!current) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [current]);

  return (
    <>
      <ul className="masonry list-none">
        {items.map((v, i) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-haspopup="dialog"
              aria-label={`Play video: ${v.title}`}
              className="group relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-crimson/45 hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]"
            >
              {v.poster ? (
                <img
                  src={v.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
              ) : (
                <span className="flex aspect-[4/5] w-full items-center justify-center bg-surface-3">
                  <span className="spot absolute inset-0 opacity-70" aria-hidden="true" />
                </span>
              )}

              <span aria-hidden="true" className="gallery-scrim pointer-events-none absolute inset-0" />

              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-transform duration-500 group-hover:scale-110"
              >
                <Play className="h-5 w-5 translate-x-0.5" />
              </span>

              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block font-display text-base font-medium leading-tight text-white sm:text-lg">
                  {v.title}
                </span>
                {v.caption ? (
                  <span className="mono mt-1 block text-[0.625rem] uppercase tracking-[0.16em] text-white/60">
                    {v.caption}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="lightbox-backdrop fixed inset-0 z-[100] flex flex-col bg-background/95 backdrop-blur-xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <p className="mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-faint">
              {current.title}
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close video"
              autoFocus
              className="grid h-11 w-11 place-items-center rounded-full border border-border-strong bg-surface-2/80 text-foreground transition-colors hover:border-crimson/50"
            >
              ✕
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-8 sm:px-10">
            <iframe
              src={current.embedUrl}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full max-w-5xl rounded-xl border border-border-subtle"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
