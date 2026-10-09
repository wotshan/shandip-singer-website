import {
  useCallback,
  useEffect,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";

type Props = {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

const SWIPE_THRESHOLD = 45;

/**
 * Full-screen photo viewer.
 *
 * Portal-ed to <body> deliberately: several ancestors on this site apply a
 * transform (the scroll-reveal wrapper, the card hover lift), and a transformed
 * ancestor becomes the containing block for `position: fixed` — inside one, this
 * overlay would be clipped to that ancestor instead of covering the viewport.
 *
 * Accessibility contract: role=dialog + aria-modal, Escape closes, both arrow
 * keys navigate, Tab is trapped among the viewer's controls, focus returns to
 * the thumbnail that opened it, and every change is announced through a polite
 * live region.
 */
export function Lightbox({ items, index, onClose, onIndexChange }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const total = items.length;
  const item = items[index];

  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + total) % total),
    [index, total, onIndexChange],
  );

  // Keep the freshest handlers reachable from the mount-only effect below, so
  // navigating between photos never re-runs the focus/scroll setup.
  const handlersRef = useRef({ go, onClose });
  handlersRef.current = { go, onClose };

  useEffect(() => {
    const node = dialogRef.current;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const focusables = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    // Land on the close button: the most predictable escape for keyboard users.
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      const { go: step, onClose: close } = handlersRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key !== "Tab") return;

      const list = focusables();
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === node)) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Freeze the page behind the overlay, and restore whatever it was before.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, []);

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || total < 2) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Horizontal intent only — a vertical drag must never change the photo.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  const controlClass =
    "grid h-11 w-11 place-items-center rounded-full border border-border-strong bg-surface-2/80 text-foreground backdrop-blur-sm transition-colors hover:border-crimson/50 hover:bg-crimson/15 focus-visible:border-crimson/60";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-caption"
      tabIndex={-1}
      className="lightbox-backdrop fixed inset-0 z-[100] flex flex-col overscroll-contain bg-background/95 backdrop-blur-xl outline-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar — position counter + close */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="grid h-11 w-11 place-items-center rounded-full border border-border-strong bg-surface-2/80 text-foreground transition-colors hover:border-crimson/50 hover:bg-crimson/15"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16">
        {total > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className={`absolute left-1 z-10 sm:left-4 ${controlClass}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}

        <img
          key={item.id}
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className="lightbox-media max-h-full max-w-full rounded-xl border border-border-subtle object-contain shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)]"
        />

        {total > 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className={`absolute right-1 z-10 sm:right-4 ${controlClass}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Caption */}
      <div className="shrink-0 px-6 pb-8 pt-4 text-center sm:pb-10">
        <p
          id="lightbox-caption"
          className="font-display text-xl leading-tight text-foreground sm:text-2xl"
        >
          {item.caption}
        </p>
        <p className="mt-2 text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
          Swipe · Arrow keys · Esc
        </p>
        <p aria-live="polite" className="sr-only">
          Photo {index + 1} of {total}: {item.caption}
        </p>
      </div>
    </div>,
    document.body,
  );
}
