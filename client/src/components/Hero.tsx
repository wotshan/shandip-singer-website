import { Link } from "wouter";
import { ArrowRight, Music2, Ticket } from "lucide-react";
import { useSiteContent } from "@/content/SiteContentProvider";
import { PressMentionsStrip } from "./PressMentionsStrip";
import { Spotlight } from "./Spotlight";
import { Waveform } from "./Waveform";
import { StatusDot } from "./StatusDot";
import { GridBackdrop } from "./GridBackdrop";

/**
 * Hero.
 *
 * The thesis: this is a working stage act, so the first thing on screen is the
 * stage — a real performance photograph under a slow spotlight sweep, the name
 * set enormous in a tight grotesque, and a waveform preview of the player one
 * scroll below. A cursor-follow spotlight layers on top for pointer users.
 *
 * Nothing-OS on top: a dot matrix behind the type, a breathing LED "live" tag,
 * and monospaced metadata for the role and the tour footprint.
 *
 * Every motion is opacity/transform/filter only — nothing here touches layout —
 * so the whole hero composites on the GPU and stays smooth on a phone.
 */
export function Hero() {
  const { settings, stats } = useSiteContent();

  return (
    <section
      aria-label="Introduction"
      className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-surface-0 grain"
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
        className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/88 to-background/40"
      />
      <div aria-hidden="true" className="ambience absolute inset-0 -z-10 opacity-75" />

      {/* Nothing-OS dot matrix, masked out at the edges */}
      <GridBackdrop variant="dots" accent className="-z-10 opacity-70" />

      {/* Slow stage spotlight + cursor-follow glow */}
      <div aria-hidden="true" className="hero-spotlight absolute inset-0 -z-10" />
      <Spotlight className="-z-10" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <p className="eyebrow blur-rise mb-6 flex items-center gap-3 text-crimson">
          <StatusDot tone="accent" breathe />
          {settings.role}
        </p>

        <h1
          className="display text-[clamp(2.25rem,9vw,6.75rem)] text-foreground"
          style={{ animation: "blur-rise 1.1s cubic-bezier(0.16,1,0.3,1) 0.12s both" }}
        >
          {settings.artist}
        </h1>

        <div className="mt-10 flex max-w-4xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="max-w-2xl text-[clamp(1rem,2.2vw,1.25rem)] font-medium uppercase leading-relaxed tracking-[0.1em] text-muted-foreground"
            style={{ animation: "blur-rise 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
          >
            {settings.tagline}
          </p>

          {/* Waveform preview of the player below. Decorative here — the player
              itself is the interactive control. */}
          <div
            className="glass-panel shrink-0 rounded-2xl px-5 py-4 lg:w-[19rem]"
            style={{ animation: "blur-rise 1.2s cubic-bezier(0.16,1,0.3,1) 0.42s both" }}
          >
            <p className="mono mb-3 flex items-center justify-between text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
              Live sound
              <StatusDot tone="accent" breathe />
            </p>
            <Waveform progress={0.34} bars={34} height="h-9" />
          </div>
        </div>

        <div
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          style={{ animation: "blur-rise 1.1s cubic-bezier(0.16,1,0.3,1) 0.56s both" }}
        >
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-all duration-300 hover:bg-crimson hover:text-white"
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Book for your event
          </Link>
          <Link
            href="/music"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-glass-border-strong bg-white/[0.03] px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition-all duration-300 hover:border-crimson/55 hover:bg-crimson/10"
          >
            <Music2 className="h-4 w-4" aria-hidden="true" />
            Explore my music
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Monospaced fact strip — the real footprint, straight from settings. */}
        <dl
          className="mono mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.6875rem] uppercase tracking-[0.2em] text-ink-faint"
          style={{ animation: "blur-rise 1.1s cubic-bezier(0.16,1,0.3,1) 0.68s both" }}
        >
          <div className="flex items-center gap-2.5">
            <dt className="sr-only">Based in</dt>
            <dd>{settings.cities}</dd>
          </div>
          {stats.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center gap-2.5">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="text-foreground">
                  {s.value}
                  {s.suffix}
                </span>{" "}
                {s.label}
              </dd>
            </div>
          ))}
        </dl>

        <div style={{ animation: "blur-rise 1.2s cubic-bezier(0.16,1,0.3,1) 0.8s both" }}>
          <PressMentionsStrip />
        </div>
      </div>
    </section>
  );
}
