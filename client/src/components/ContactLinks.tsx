import { Mail, MessageCircle } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "./icons";
import { site } from "@/data/site";

const CHANNELS = [
  { key: "whatsapp", label: "WhatsApp", value: "Message directly", href: site.whatsapp, Icon: MessageCircle },
  { key: "instagram", label: "Instagram", value: "Follow the profile", href: site.instagram, Icon: InstagramIcon },
  { key: "youtube", label: "YouTube", value: "Watch performances", href: site.youtube, Icon: YoutubeIcon },
  { key: "email", label: "Email", value: site.email, href: `mailto:${site.email}`, Icon: Mail },
] as const;

export function ContactLinks() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {CHANNELS.map(({ key, label, value, href, Icon }) => {
        const external = href.startsWith("http");
        return (
          <li key={key}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-2 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson/40 hover:bg-surface-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-subtle bg-surface-1 text-crimson transition-colors group-hover:border-crimson/40 group-hover:bg-crimson/10">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="block truncate text-xs text-ink-faint">{value}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
