import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Award,
  CalendarDays,
  ExternalLink,
  Handshake,
  Image as ImageIcon,
  Inbox,
  Link2,
  ListMusic,
  LogOut,
  Mail,
  Megaphone,
  Newspaper,
  PartyPopper,
  Quote,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Video,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/useAuth";
import { StatusDot } from "@/components/StatusDot";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { EnquiriesInbox } from "@/components/admin/EnquiriesInbox";
import { SubscribersInbox } from "@/components/admin/SubscribersInbox";
import type { ContentResource } from "@shared/types";

type SectionKey = "profile" | ContentResource | "enquiries" | "subscribers";

const SECTIONS: { key: SectionKey; label: string; icon: typeof Settings }[] = [
  { key: "profile", label: "Artist profile", icon: Settings },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "highlights", label: "Featured highlights", icon: Star },
  { key: "socials", label: "Social links", icon: Link2 },
  { key: "events", label: "Events & tour", icon: CalendarDays },
  { key: "music", label: "Music", icon: ListMusic },
  { key: "tracks", label: "Discography", icon: ListMusic },
  { key: "videos", label: "Video reel", icon: Video },
  { key: "faqs", label: "FAQ", icon: HelpCircle },
  { key: "occasions", label: "Occasions", icon: PartyPopper },
  { key: "awards", label: "Awards & achievements", icon: Award },
  { key: "press", label: "Press & media", icon: Newspaper },
  { key: "collaborations", label: "Brand collaborations", icon: Handshake },
  { key: "stats", label: "Stats & highlights", icon: TrendingUp },
  { key: "pressMentions", label: "As seen on", icon: Megaphone },
  { key: "testimonials", label: "Testimonials", icon: Quote },
  { key: "fanMessages", label: "Fan zone", icon: Users },
  { key: "availability", label: "Availability", icon: Sparkles },
  { key: "enquiries", label: "Enquiries", icon: Inbox },
  { key: "subscribers", label: "Fan club", icon: Mail },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<SectionKey>("profile");

  // Guard: only the admin may see this page.
  if (!user || user.role !== "admin") {
    navigate("/admin/login");
    return null;
  }

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="relative isolate mx-auto max-w-7xl overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
      <div aria-hidden="true" className="grid-dots pointer-events-none absolute inset-0 -z-10 opacity-50 mask-fade-edges" />

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-8">
        <div>
          <p className="mono mb-3 flex items-center gap-2.5 text-[0.625rem] uppercase tracking-[0.22em] text-crimson">
            <StatusDot tone="accent" breathe />
            Control room
          </p>
          <h1 className="display text-[clamp(2rem,5vw,3.25rem)] text-foreground">
            Admin dashboard
          </h1>
          <p className="mono mt-3 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-faint">
            Signed in as <span className="text-foreground">{user.name ?? user.email}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Every change here appears on the public site immediately.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
          >
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        {/* Section nav */}
        <nav
          aria-label="Dashboard sections"
          className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto"
        >
          <ul className="flex gap-1.5 overflow-x-auto rounded-2xl border border-glass-border bg-white/[0.03] p-1.5 backdrop-blur-md lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.key;
              return (
                <li key={s.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setSection(s.key)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "mono inline-flex w-full items-center gap-3 whitespace-nowrap rounded-xl border px-4 py-2.5 text-[0.6875rem] uppercase tracking-[0.14em] transition-all duration-300",
                      active
                        ? "border-crimson/50 bg-crimson/10 text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 text-left">{s.label}</span>
                    {active ? <StatusDot tone="accent" className="h-1.5 w-1.5" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Active section */}
        <div className="min-w-0 rounded-3xl border border-glass-border bg-surface-1/50 p-5 backdrop-blur-xl sm:p-7">
          {section === "profile" ? <SettingsEditor /> : null}
          {section === "enquiries" ? <EnquiriesInbox /> : null}
          {section === "subscribers" ? <SubscribersInbox /> : null}
          {section !== "profile" && section !== "enquiries" && section !== "subscribers" ? (
            <ResourceManager resource={section} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
