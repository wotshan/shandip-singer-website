import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { ArrowRight, CalendarCheck, Mail, MessageCircle, Phone, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { StatusDot } from "./StatusDot";

/**
 * Floating booking drawer.
 *
 * A persistent "Book" button that opens a minimal contact sheet: a pre-filled
 * WhatsApp quick-chat, a pre-filled email, and a call link, plus the route to
 * the full multi-step enquiry form. Nothing here is fabricated — every target
 * comes from the admin's own settings, and an action with no configured value
 * is simply not rendered.
 *
 * Portal-ed to <body>: several ancestors apply a transform (scroll-reveal
 * wrappers, hover lifts), and a transformed ancestor becomes the containing
 * block for `position: fixed`, which would clip this sheet.
 */

function whatsappHref(base: string, message: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}text=${encodeURIComponent(message)}`;
}

export function BookingDrawer() {
  const { settings } = useSiteContent();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    // Land focus inside the sheet so a keyboard user is not left behind it.
    window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const node = panelRef.current;
      if (!node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      restoreRef.current?.focus();
    };
  }, [open]);

  const waMessage =
    `Hi ${settings.artist}! I'd like to book a performance. ` +
    `Event type: ___ | Date: ___ | City: ___`;

  const mailBody =
    `Hi ${settings.artist},\n\nI'd like to enquire about a booking.\n\n` +
    `Event type:\nDate:\nCity:\nVenue:\nApprox. guests:\n\nThanks!`;

  type Action = {
    key: string;
    label: string;
    hint: string;
    href: string;
    external?: boolean;
    icon: ReactNode;
  };

  const actions: Action[] = [];

  if (settings.whatsapp) {
    actions.push({
      key: "whatsapp",
      label: "WhatsApp",
      hint: settings.whatsappDisplay || "Fastest reply",
      href: whatsappHref(settings.whatsapp, waMessage),
      external: true,
      icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (settings.email) {
    actions.push({
      key: "email",
      label: "Email",
      hint: settings.email,
      href: `mailto:${settings.email}?subject=${encodeURIComponent(
        `Booking enquiry — ${settings.artist}`,
      )}&body=${encodeURIComponent(mailBody)}`,
      icon: <Mail className="h-4 w-4" aria-hidden="true" />,
    });
  }
  if (settings.phoneHref) {
    actions.push({
      key: "call",
      label: "Call",
      hint: settings.phoneDisplay,
      href: settings.phoneHref,
      icon: <Phone className="h-4 w-4" aria-hidden="true" />,
    });
  }

  return createPortal(
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group fixed bottom-6 right-6 z-[75] inline-flex items-center gap-2.5 rounded-full border border-crimson/45 bg-background/85 px-4 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground shadow-[0_18px_44px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-white"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Book</span>
        <StatusDot tone="accent" breathe className="hidden sm:inline-block" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-end sm:items-stretch">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close booking drawer"
            onClick={() => setOpen(false)}
            className="drawer-backdrop absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-drawer-title"
            className="drawer-panel relative flex max-h-[92svh] w-full flex-col overflow-y-auto rounded-t-3xl border border-glass-border bg-background/95 p-6 backdrop-blur-2xl sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-3xl sm:border-y-0 sm:border-r-0 sm:p-8"
          >
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="spot absolute inset-0 opacity-60" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Direct line</p>
                <h2 id="booking-drawer-title" className="display text-3xl text-foreground">
                  Book a performance
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Reach out on whichever channel suits you — the message is written for you, just add
              your date and city.
            </p>

            <ul className="mt-7 space-y-2.5">
              {actions.map((a) => (
                <li key={a.key}>
                  <a
                    href={a.href}
                    {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-2/60 px-4 py-3.5 transition-all duration-300 hover:border-crimson/45 hover:bg-crimson/10"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-crimson/35 bg-crimson/10 text-crimson">
                      {a.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{a.label}</span>
                      <span className="mono block truncate text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
                        {a.hint}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-crimson"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>

            {actions.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface-2 p-5 text-sm text-muted-foreground">
                No contact channels are configured yet. Add a phone, email or WhatsApp in the
                dashboard and they will appear here.
              </p>
            ) : null}

            <div className="rule my-7" />

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Full enquiry form
              <ArrowRight
                className={cn("h-4 w-4 transition-transform duration-300 group-hover:translate-x-1")}
                aria-hidden="true"
              />
            </Link>

            <p className="mono mt-4 text-center text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
              {settings.cities}
            </p>
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}
