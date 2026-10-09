import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";
const STORAGE_KEY = "raag-sargam-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

/**
 * Dark / light theme toggle.
 *
 * The site is dark-first; the light theme is a premium off-white variant driven
 * entirely by CSS tokens, so every semantic utility re-themes at once. The
 * choice is persisted and applied to <html> before paint by the inline script in
 * index.html, so there is no flash of the wrong theme.
 *
 * Switching adds `theme-transition` to <html> for one frame — a crossfade on the
 * two properties that actually change — rather than a blanket `*` transition,
 * which would animate every hover on the page.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const timer = useRef<number | null>(null);

  useEffect(() => setTheme(readTheme()), []);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("light", next === "light");
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => root.classList.remove("theme-transition"), 460);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-all duration-300 hover:border-crimson/50 hover:text-foreground",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
