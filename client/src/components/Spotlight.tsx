import { useRef, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-follow spotlight.
 *
 * Writes `--spot-x` / `--spot-y` on pointer move; index.css paints the radial
 * gradient from them (`.hero-cursor-spot`). Because only two custom properties
 * change, the browser composites a single layer — no React re-render, no
 * layout. Touch pointers are ignored (there is no cursor to follow), and under
 * `prefers-reduced-motion` the layer is hidden entirely by CSS.
 */
export function Spotlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  function move(e: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    if (e.pointerType === "touch") {
      node.removeAttribute("data-active");
      return;
    }
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    node.setAttribute("data-active", "true");
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerMove={move}
      onPointerLeave={() => ref.current?.removeAttribute("data-active")}
      className={cn("hero-cursor-spot pointer-events-none absolute inset-0", className)}
    />
  );
}
