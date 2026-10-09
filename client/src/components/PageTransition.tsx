import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

/**
 * Route transition wrapper.
 *
 * Keyed on the pathname, so each navigation remounts the wrapper and replays a
 * short fade-and-rise. Opacity/transform only, and neutralised under
 * `prefers-reduced-motion`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [key, setKey] = useState(location);

  useEffect(() => setKey(location), [location]);

  return (
    <div key={key} className={cn("page-enter")}>
      {children}
    </div>
  );
}
