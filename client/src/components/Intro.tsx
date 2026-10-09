import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cinematic entry animation.
 *
 * Plays on EVERY visit (no session flag) — a dark, faded, minimalistic curtain
 * that reveals the brand mark, then dissolves into the site. It is purely
 * presentational: it renders above everything, locks scroll while it runs, and
 * unmounts itself when finished so it never traps focus or blocks the page.
 *
 * Motion is CSS-only (see the `intro-*` keyframes in index.css) and the whole
 * sequence collapses to a near-instant fade under `prefers-reduced-motion`, so
 * nobody is forced to sit through it.
 */

/** Total time the overlay is on screen, in ms. Keep in sync with the CSS. */
const DURATION = 2600;

export function Intro() {
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Lock scroll for the duration so the reveal is not scrolled past.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const total = reduce ? 500 : DURATION;
    const leaveAt = Math.max(0, total - 700);

    const leaveTimer = window.setTimeout(() => setLeaving(true), leaveAt);
    const doneTimer = window.setTimeout(() => {
      setDone(true);
      document.body.style.overflow = prev;
    }, total);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = prev;
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "intro-overlay fixed inset-0 z-[100] grid place-items-center bg-background",
        leaving && "intro-overlay--leaving",
      )}
    >
      {/* Ambient crimson glow behind the mark */}
      <div className="ambience absolute inset-0 opacity-70" />

      <div className="relative flex flex-col items-center px-6">
        <div className="intro-mark relative">
          <span className="intro-halo absolute inset-0 rounded-full" />
          <img
            src="/images/raag_sargam_logo.png"
            alt=""
            width={128}
            height={128}
            className="relative h-24 w-24 rounded-full object-cover sm:h-32 sm:w-32"
          />
        </div>

        <p className="intro-wordmark mt-8 font-display text-[clamp(1.75rem,7vw,3.25rem)] uppercase tracking-[0.34em] text-foreground">
          Raag Sargam
        </p>

        <span className="intro-rule mt-6 block h-px w-40 bg-gradient-to-r from-transparent via-crimson to-transparent sm:w-64" />

        <p className="intro-sub mt-5 text-[0.625rem] font-medium uppercase tracking-[0.4em] text-ink-faint">
          Singer · Live Performer
        </p>
      </div>
    </div>
  );
}
