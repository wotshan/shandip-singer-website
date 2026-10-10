import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Lock, Menu, X } from "lucide-react";
import { MailGlyph, PhoneGlyph, SOCIAL_GLYPHS, WhatsAppGlyph } from "./icons";
import { cn } from "@/lib/utils";
import { navItems, type SocialKey } from "@/data/site";
import { useSiteContent } from "@/content/SiteContentProvider";
import { ScrollProgress } from "./ScrollProgress";
import { BookingDrawer } from "./BookingDrawer";
import { StatusDot } from "./StatusDot";
import { GridBackdrop } from "./GridBackdrop";

/* ── Brand mark ─────────────────────────────────────────────────────────────── */

function Wordmark({ compact = false }: { compact?: boolean }) {
  const { settings } = useSiteContent();
  return (
    <Link
      href="/"
      aria-label={`${settings.artist} — home`}
      className="group flex items-center gap-3"
    >
      <span
        aria-hidden="true"
        className="led-bloom grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-crimson/35 text-crimson transition-colors group-hover:border-crimson/70"
      >
        <img
          src="/images/raag_sargam_logo.png"
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-foreground">
          {settings.artist}
        </span>
        {!compact ? (
          <span className="mono mt-1 text-[0.5625rem] uppercase tracking-[0.24em] text-ink-faint">
            Singer · Live Performer
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/* ── Navigation ─────────────────────────────────────────────────────────────── */

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
        scrolled
          ? "border-b border-glass-border bg-background/70 backdrop-blur-2xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Wordmark />

        {/* Desktop nav — Nothing-style pill tabs with a 1px active border. */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = item.href === location;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-all duration-300",
                  active
                    ? "border-glass-border-strong bg-white/[0.06] text-foreground"
                    : "border-transparent text-muted-foreground hover:border-glass-border hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {/*
            The way into the password-protected dashboard. An icon-only ghost
            button, deliberately low-contrast so it reads as site chrome rather
            than a call to action — discoverable, never shouting.
          */}
          <Link
            href="/admin"
            aria-label="Admin sign-in"
            title="Admin"
            className="grid h-10 w-10 place-items-center rounded-full border border-transparent text-ink-faint transition-all duration-300 hover:border-glass-border hover:text-foreground"
          >
            <Lock className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          </Link>

          <Link
            href="/contact"
            className="hidden items-center gap-2 rounded-full border border-crimson/45 bg-crimson/10 px-5 py-2 text-[0.8125rem] font-semibold text-foreground transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-white sm:inline-flex"
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
          "overflow-hidden border-t border-glass-border bg-background/95 backdrop-blur-2xl transition-[max-height,opacity] duration-400 lg:hidden",
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
                  "flex items-center justify-between border-b border-border-subtle py-3.5 font-display text-lg font-medium tracking-[-0.01em] transition-colors last:border-b-0",
                  active ? "text-crimson" : "text-foreground hover:text-crimson",
                )}
              >
                {item.label}
                {active ? <StatusDot tone="accent" /> : null}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="mt-4 rounded-full border border-crimson/45 bg-crimson/15 px-5 py-3 text-center text-sm font-semibold text-foreground"
          >
            Book an event
          </Link>
          <Link
            href="/admin"
            className="mono mt-3 inline-flex items-center justify-center gap-2 text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */

export function Footer() {
  const { settings, socials } = useSiteContent();

  return (
    <footer className="relative overflow-hidden border-t border-border-subtle bg-surface-0">
      <GridBackdrop variant="wires" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark compact />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {settings.shortIntro}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-5">Explore</h2>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-5">Get in touch</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  aria-label={`Email ${settings.artist} at ${settings.email}`}
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MailGlyph className="h-4 w-4 text-crimson" />
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={settings.phoneHref}
                  aria-label={`Call ${settings.artist} on ${settings.phoneDisplay}`}
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PhoneGlyph className="h-4 w-4 text-crimson" />
                  {settings.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={settings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Message on WhatsApp"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <WhatsAppGlyph className="h-4 w-4 text-crimson" />
                  WhatsApp
                </a>
              </li>
            </ul>

            {/* Icon-only social row — the accessible name lives on the link. */}
            <ul className="mt-7 flex flex-wrap items-center gap-2.5" aria-label="Social profiles">
              {socials
                .filter((s) => s.external)
                .map((s) => {
                  const Icon = SOCIAL_GLYPHS[s.key as SocialKey] ?? SOCIAL_GLYPHS.email;
                  return (
                    <li key={s.id}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.handle}
                        className="grid h-10 w-10 place-items-center rounded-full border border-glass-border bg-white/[0.03] text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson/50 hover:text-foreground"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        <div className="rule my-12" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-faint">
            © {new Date().getFullYear()} {settings.artist}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="mono flex items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-faint">
              <StatusDot tone="accent" breathe />
              {settings.role}
            </p>
            {/*
              Quiet, always-present way into the password-protected dashboard.
              Faint by default so it never competes with the content above.
            */}
            <Link
              href="/admin"
              aria-label="Admin sign-in"
              className="mono group inline-flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-foreground"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Admin
              <ArrowUpRight
                aria-hidden="true"
                className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:opacity-100"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Shell ──────────────────────────────────────────────────────────────────── */

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <ScrollProgress />
      <Nav />
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>
      <Footer />
      <BookingDrawer />
    </div>
  );
}
