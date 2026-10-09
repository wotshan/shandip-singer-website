import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentProvider";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

/**
 * Cinematic video reel.
 *
 * A grid of poster tiles that open a full-screen lightbox with the embedded
 * player. The lightbox closes on Escape, on backdrop click and via its own
 * button, and locks body scroll while open. Renders an honest empty state when
 * no videos have been published.
 */
export function VideoReel() {
  const { videos } = useSiteContent();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (videos.length === 0) {
    return (
      <section aria-labelledby="reel-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Watch"
            title={<span id="reel-heading">The reel</span>}
            intro="Cinematic clips from live performances."
          />
        </Reveal>
        <Reveal delay={1} className="mt-10">
          <div className="rounded-3xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
            <Play className="mx-auto h-8 w-8 text-crimson/50" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl text-foreground">No videos published yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Performance clips will appear here once they are added from the dashboard.
            </p>
          </div>
        </Reveal>
      </section>
    );
  }

  const active = open !== null ? videos[open] : null;

  return (
    <section aria-labelledby="reel-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Watch"
          title={<span id="reel-heading">The reel</span>}
          intro="Cinematic clips from live performances."
        />
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <Reveal key={v.id} variant="scale" delay={((i % 3) + 1) as 1 | 2 | 3}>
            <TiltCard className="h-full">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Play ${v.title}`}
                className="group relative block h-full w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-2 text-left"
              >
                <div className="relative aspect-video overflow-hidden">
                  {v.poster ? (
                    <img
                      src={v.poster}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-surface-3">
                      <Play className="h-8 w-8 text-crimson/50" aria-hidden="true" />
                    </div>
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-foreground">{v.title}</h3>
                  {v.caption ? <p className="mt-1 text-sm text-muted-foreground">{v.caption}</p> : null}
                </div>
              </button>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="lightbox-backdrop fixed inset-0 z-[80] grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close video"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="lightbox-media w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe
                src={active.embedUrl}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <p className="mt-4 text-center font-display text-xl text-white">{active.title}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
