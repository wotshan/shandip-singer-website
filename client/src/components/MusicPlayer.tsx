import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Custom premium audio player.
 *
 * No third-party widget: a single <audio> element driven by React state, with a
 * seekable progress bar, a track list and album art. When no tracks exist it
 * renders an honest empty state rather than a fake player.
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

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setCurrent(el.currentTime);
  }

  function step(delta: number) {
    if (tracks.length === 0) return;
    setIndex((i) => (i + delta + tracks.length) % tracks.length);
  }

  if (tracks.length === 0) {
    return (
      <section aria-labelledby="player-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Listen"
            title={<span id="player-heading">The player</span>}
            intro="A custom player for the artist's own recordings."
          />
        </Reveal>
        <Reveal delay={1} className="mt-10">
          <div className="rounded-3xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
            <Music2 className="mx-auto h-8 w-8 text-gold/60" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl text-foreground">No tracks published yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Recordings will appear here as soon as they are uploaded from the dashboard. Until
              then, the repertoire below shows what a booking can draw from.
            </p>
          </div>
        </Reveal>
      </section>
    );
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <section aria-labelledby="player-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Listen"
          title={<span id="player-heading">The player</span>}
          intro="Press play and let the room fill up."
        />
      </Reveal>

      <Reveal variant="scale" delay={1} className="mt-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Now playing */}
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-2 p-6 sm:p-8">
            <div aria-hidden="true" className="ambience absolute inset-0 opacity-50" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-3">
                {track.cover ? (
                  <img src={track.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <Music2 className="h-10 w-10 text-gold/50" aria-hidden="true" />
                  </div>
                )}
                {playing ? (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-8 items-end justify-center gap-1 bg-black/40 pb-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="eq-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-2 text-gold">Now playing</p>
                <h3 className="truncate font-display text-2xl text-foreground">{track.title}</h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">{track.artist}</p>

                {/* Seek bar */}
                <div
                  role="slider"
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  aria-valuenow={Math.round(current)}
                  tabIndex={0}
                  onClick={seek}
                  className="group mt-5 h-1.5 cursor-pointer rounded-full bg-surface-3"
                >
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-crimson to-gold"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs tabular-nums text-ink-faint">
                  <span>{fmt(current)}</span>
                  <span>{duration ? fmt(duration) : track.duration ?? "--:--"}</span>
                </div>

                {/* Controls */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous track"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SkipBack className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={playing ? "Pause" : "Play"}
                    className="grid h-14 w-14 place-items-center rounded-full bg-foreground text-background transition-transform duration-300 hover:scale-105 hover:bg-gold hover:text-black"
                  >
                    {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next track"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:text-foreground"
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
          </div>

          {/* Track list */}
          <ol className="space-y-2">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                    i === index
                      ? "border-gold/50 bg-gold/10"
                      : "border-border-subtle bg-surface-2 hover:border-border-strong",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-subtle text-xs tabular-nums text-ink-faint">
                    {i === index && playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5 translate-x-px" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{t.title}</span>
                    <span className="block truncate text-xs text-ink-faint">{t.artist}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-faint">{t.duration ?? ""}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
