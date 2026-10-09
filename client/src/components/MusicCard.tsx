import { Play } from "lucide-react";
import type { MusicItem } from "@shared/types";

export function MusicCard({ item }: { item: MusicItem }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-2 p-5 transition-all duration-400 hover:-translate-y-1 hover:border-border-strong hover:bg-surface-3 sm:p-6">
      {item.category ? <span className="eyebrow mb-3 text-crimson">{item.category}</span> : null}

      <h3 className="font-display text-xl leading-snug text-foreground sm:text-2xl">
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>

      {item.href || item.duration ? (
        <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
          <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            {item.duration ?? ""}
          </span>

          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.linkLabel ?? "Listen"} — ${item.title}`}
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              {item.linkLabel ?? "Listen"}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
