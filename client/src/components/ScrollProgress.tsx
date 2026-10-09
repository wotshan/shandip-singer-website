import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reading-progress bar + back-to-top button.
 *
 * The bar is a single transform-scaled element updated inside a rAF, so a fast
 * scroll never queues more than one style write per frame. The button fades in
 * past the first viewport and scrolls home smoothly.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? Math.min(1, doc.scrollTop / max) : 0);
        setShowTop(doc.scrollTop > 700);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          className="h-full origin-left bg-gradient-to-r from-crimson via-ember to-gold"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 right-6 z-[60] grid h-11 w-11 place-items-center rounded-full border border-border-strong bg-surface-2/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-400 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
    </>
  );
}
