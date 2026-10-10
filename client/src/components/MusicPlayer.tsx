import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Waveform } from "./Waveform";
import { StatusDot } from "./StatusDot";
import { TiltCard } from "./TiltCard";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Custom premium audio player.
 *
 * No third-party widget: one <audio> element driven by React state, with a
 * waveform scrubber (keyboard accessible — arrows, Home/End), a track list and
 * album art. The waveform figure is deterministic, so it never reshuffles on a
 * re-render. When no tracks exist it renders an honest empty state rather than a
 * fake player.
 */
export function MusicPlayer() {
  const { tracks } = useSiteContent();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const track = tracks[index];

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [index]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function seekRatio(ratio: number) {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  }

  function step(delta: number) {
    if (tracks.length === 0) return;
    setIndex((i) => (i + delta + tracks.length) % tracks.length);
  }

  const heading = (
    <Reveal>
      <SectionHeading
        eyebrow="Listen"
        title={<span id="player-heading">The player</span>}
        intro={
          tracks.length === 0
            ? "A custom player for the artist's own recordings."
            : "Press play and let the room fill up."
        }
        meta={tracks.length > 0 ? `${tracks.length} tracks` : undefined}
      />
    </Reveal>
  );

  if (tracks.length === 0) {
    return (
      <section aria-labelledby="player-heading" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        {heading}
        <Reveal delay={1} className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface-1/60 p-10 text-center backdrop-blur-sm">
            <div aria-hidden="true" className="spot absolute inset-0 opacity-60" />
            <div className="relative">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-crimson/35 text-crimson led-bloom">
                <Music2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mono mt-5 text-[0.625rem] uppercase tracking-[0.22em] text-ink-faint">
                Status · standby
              </p>
              <p className="display mt-2 text-2xl text-foreground">No tracks published yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Recordings will appear here as soon as they are uploaded from the dashboard. Until
                then, the repertoire below shows what a booking can draw from.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  const pct = duration > 0 ? current / duration : 0;

  return (
    <section aria-labelledby="player-heading" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      {heading}

      <Reveal variant="scale" delay={1} className="mt-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Now playing */}
          <TiltCard intensity={3} className="relative overflow-hidden rounded-3xl border border-glass-border bg-surface-1/70 p-6 backdrop-blur-xl sm:p-8">
            <div aria-hidden="true" className="ambience absolute inset-0 opacity-50" />
            <div aria-hidden="true" className="spot absolute inset-0 opacity-50" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-glass-border bg-surface-3">
                {track.cover ? (
                  <img src={track.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <Music2 className="h-10 w-10 text-crimson/50" aria-hidden="true" />
                  </div>
                )}
                {playing ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 flex h-8 items-end justify-center gap-1 bg-black/45 pb-1.5 backdrop-blur-sm"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="eq-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-2 flex items-center gap-2.5 text-crimson">
                  <StatusDot tone="accent" breathe={playing} />
                  {playing ? "Now playing" : "Paused"}
                </p>
                <h3 className="truncate font-display text-2xl font-semibold text-foreground">
                  {track.title}
                </h3>
                <p className="mono mt-1.5 truncate text-[0.6875rem] uppercase tracking-[0.16em] text-ink-faint">
                  {track.artist}
                </p>

                {/* Waveform scrubber */}
                <div className="mt-6">
                  <Waveform
                    progress={pct}
                    bars={56}
                    height="h-12"
                    active={playing}
                    onSeekRatio={seekRatio}
                    label="Seek within track"
                  />
                </div>

                <div className="mono mt-2 flex justify-between text-[0.6875rem] tracking-[0.1em] text-ink-faint">
                  <span>{fmt(current)}</span>
                  <span>{duration ? fmt(duration) : track.duration ?? "--:--"}</span>
                </div>

                {/* Controls */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous track"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
                  >
                    <SkipBack className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={playing ? "Pause" : "Play"}
                    className="grid h-14 w-14 place-items-center rounded-full bg-foreground text-background transition-all duration-300 hover:scale-105 hover:bg-crimson hover:text-white"
                  >
                    {playing ? (
                      <Pause className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next track"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
                  >
                    <SkipForward className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Volume2 className="ml-2 h-4 w-4 text-ink-faint" aria-hidden="true" />
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={track.src}
              preload="metadata"
              onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => step(1)}
            />
          </TiltCard>

          {/* Track list */}
          <ol className="space-y-2">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                    i === index
                      ? "border-crimson/45 bg-crimson/[0.08]"
                      : "border-border-subtle bg-surface-1/60 hover:border-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mono grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[0.625rem]",
                      i === index
                        ? "border-crimson/50 text-crimson"
                        : "border-border-subtle text-ink-faint",
                    )}
                  >
                    {i === index && playing ? (
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Play className="h-3.5 w-3.5 translate-x-px" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {t.title}
                    </span>
                    <span className="mono block truncate text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">
                      {t.artist}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[0.6875rem] text-ink-faint">
                    {t.duration ?? ""}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
