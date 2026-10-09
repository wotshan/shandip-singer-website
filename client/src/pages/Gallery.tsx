import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "./About";
import { Reveal } from "@/components/Reveal";
import { GalleryGrid } from "@/components/GalleryGrid";
import { galleryItems, galleryNote } from "@/data/gallery";

export default function Gallery() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments from the stage"
        intro="Photographs from live performances — the room, the lights and the songs in between."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <GalleryGrid items={galleryItems} />
        </Reveal>

        <Reveal className="mt-6">
          <p className="text-xs leading-relaxed text-ink-faint">{galleryNote}</p>
        </Reveal>

        <Reveal className="mt-14">
          <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle bg-surface-2 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="eyebrow mb-3">Want this at your event?</p>
              <h2 className="display text-[clamp(1.5rem,3.5vw,2.25rem)] text-foreground">
                Let&rsquo;s put your occasion on stage.
              </h2>
            </div>
            <Link
              href="/contact"
              className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full bg-foreground px-6 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-crimson hover:text-white"
            >
              Book for your event
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
