import { useRef, type ElementType, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Maximum tilt in degrees. */
  intensity?: number;
  /** Show the cursor-following glow. */
  glow?: boolean;
};

/**
 * Magnetic tilt card.
 *
 * A pointer-following 3D tilt plus a soft radial glow that tracks the cursor.
 * Both are driven by CSS custom properties written on pointer move, so the
 * browser only ever composites a transform — no layout, no re-render. Touch
 * pointers and `prefers-reduced-motion` are ignored, leaving the card flat and
 * static, which is the correct fallback.
 */
export function TiltCard({ children, className, as: Tag = "div", intensity = 6, glow = true }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  function onMove(e: PointerEvent) {
    const node = ref.current;
    if (!node || e.pointerType === "touch") return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    node.style.setProperty("--tilt-x", `${((0.5 - py) * intensity * 2).toFixed(2)}deg`);
    node.style.setProperty("--tilt-y", `${((px - 0.5) * intensity * 2).toFixed(2)}deg`);
    node.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    node.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
  }

  function onLeave() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("tilt-card", glow && "tilt-glow", className)}
    >
      {children}
    </Tag>
  );
}
