import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Which axis the element arrives on. All are transform/opacity only. */
export type RevealVariant = "up" | "scale" | "left" | "right" | "fade";

type Props = {
  children: ReactNode;
  /** Stagger index 1–5 → 80ms increments via the `.reveal[data-delay]` rules. */
  delay?: 1 | 2 | 3 | 4 | 5;
  /** Entrance direction. Defaults to a rise. */
  variant?: RevealVariant;
  as?: ElementType;
  className?: string;
};

/**
 * Scroll-reveal wrapper.
 *
 * The hidden state lives behind a `.js` class on <html> (set in main.tsx), so
 * without JavaScript every element is visible by default — content can never be
 * permanently invisible. A hard timeout also forces visibility, so a missed
 * IntersectionObserver entry (fast scroll, restored scroll position, an
 * embedded/iframe context) still ends with the content on screen.
 *
 * `prefers-reduced-motion` neutralises the transform entirely (see index.css),
 * so the element simply appears.
 */
export function Reveal({ children, delay, variant = "up", as: Tag = "div", className }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer support → show immediately rather than hide forever.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);

    // Failsafe: reveal regardless after 1.6s so nothing stays hidden.
    const failsafe = window.setTimeout(() => setVisible(true), 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-delay={delay}
      data-variant={variant}
      className={cn("reveal", visible && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}
