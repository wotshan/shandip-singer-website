import { Link } from "wouter";
import { ArrowRight, Play, Ticket } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentProvider";
import { PressMentionsStrip } from "./PressMentionsStrip";

/**
 * Cinematic hero.
 *
 * The headline is the artist name set large in the display face; the visual is a
 * real photograph behind a heavy dark overlay so the type always sits on a
 * readable surface. A slow spotlight sweep and a gentle push-in give it a
 * star-level, stage-lit feel — both are transform/opacity only, so they
 * composite on the GPU and cost nothing on a phone.
 */
export function Hero() {
  const { settings } = useSiteContent();

  return (
    <section
      aria-label="Introduction"
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden grain"
    >
      {/* Performance photograph */}
      <img
        src="/images/hero_stage.webp"
        alt="A singer silhouetted on a darkened concert stage under deep red stage lighting"
        className="hero-zoom absolute inset-0 -z-20 h-full w-full object-cover object-center"
        fetchPriority="high"
        decoding="async"
      />

      {/* Layered dark overlays — bottom fade into the page + red ambience */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/45"
      />
      <div aria-hidden="true" className="ambience absolute inset-0 -z-10 opacity-80" />
      {/* Slow spotlight sweep — a soft cone of light drifting across the stage */}
      <div aria-hidden="true" className="hero-spotlight absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24">
        <p
          className="eyebrow mb-6 flex items-center gap-3 opacity-0"
          style={{ animation: "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s forwards" }}
        >
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          {settings.role}
        </p>

        <h1
          className="display text-[clamp(2.75rem,12vw,9rem)] text-foreground opacity-0"
          style={{ animation: "fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.25s forwards" }}
        >
          {settings.artist}
        </h1>

        <p
          className="mt-7 max-w-2xl text-[clamp(1rem,2.4vw,1.375rem)] font-medium uppercase leading-relaxed tracking-[0.12em] text-muted-foreground opacity-0"
          style={{ animation: "fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.42s forwards" }}
        >
          {settings.tagline}
        </p>

        <div
          className="mt-10 flex flex-col gap-3 opacity-0 sm:flex-row sm:items-center sm:gap-4"
          style={{ animation: "fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.58s forwards" }}
        >
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-all duration-300 hover:bg-gold hover:text-black"
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Book for your event
          </Link>
          <Link
            href="/music"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-border-strong bg-white/[0.03] px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold/60 hover:bg-gold/10"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Explore my music
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-ink-faint">
          {settings.cities}
        </p>

        <div
          className="opacity-0"
          style={{ animation: "fade-up 1s cubic-bezier(0.22,1,0.36,1) 0.75s forwards" }}
        >
          <PressMentionsStrip />
        </div>
      </div>
    </section>
  );
}
