import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Mail, MessageCircle } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "./icons";
import { cn } from "@/lib/utils";
import { navItems, site } from "@/data/site";

/* ── Brand mark ─────────────────────────────────────────────────────────── */

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.artist} — home`}
      className="group flex items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-full border border-crimson/40 bg-crimson/10 font-display text-base text-crimson transition-colors group-hover:border-crimson/70 group-hover:bg-crimson/20"
      >
        S
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg tracking-[0.16em] text-foreground">
          {site.artist}
        </span>
        {!compact ? (
          <span className="mt-1 text-[0.5625rem] font-medium uppercase tracking-[0.26em] text-ink-faint">
            Singer · Live Performer
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/* ── Navigation ─────────────────────────────────────────────────────────── */

export function Nav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on route change.
  useEffect(() => setOpen(false), [location]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-border-subtle bg-background/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Wordmark />

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.href === location;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-4 -bottom-0.5 h-px origin-left bg-crimson transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full border border-crimson/50 bg-crimson/10 px-5 py-2 text-[0.8125rem] font-medium text-foreground transition-colors hover:bg-crimson/20 sm:inline-flex"
          >
            Book an event
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-foreground transition-colors hover:border-border-strong lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border-subtle bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-400 lg:hidden",
          open ? "max-h-[44rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
          {navItems.map((item) => {
            const active = item.href === location;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b border-border-subtle py-3.5 font-display text-xl transition-colors last:border-b-0",
                  active ? "text-crimson" : "text-foreground hover:text-crimson",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="mt-4 rounded-full border border-crimson/50 bg-crimson/15 px-5 py-3 text-center text-sm font-medium text-foreground"
          >
            Book an event
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="relative border-t border-border-subtle bg-surface-1">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark compact />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {site.shortIntro}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4">Explore</h2>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">Get in touch</h2>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4 text-crimson" aria-hidden="true" />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4 text-crimson" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <InstagramIcon className="h-4 w-4 text-crimson" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={site.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <YoutubeIcon className="h-4 w-4 text-crimson" />
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="rule my-10" />

        <div className="flex flex-col gap-4 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.artist}. All rights reserved.</p>
          <p>{site.placeholderNote}</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Shell ──────────────────────────────────────────────────────────────── */

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Nav />
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
