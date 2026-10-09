import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { MusicCard } from "@/components/MusicCard";
import { PageHeader } from "./About";
import { useSiteContent } from "@/content/SiteContentProvider";

export default function Music() {
  const { music } = useSiteContent();
  const [filter, setFilter] = useState<string>("All");

  const categories = Array.from(new Set(music.map((m) => m.category).filter(Boolean)));
  const shown = filter === "All" ? music : music.filter((m) => m.category === filter);

  return (
    <>
      <PageHeader
        eyebrow="Music"
        title="Sets, sessions & originals"
        intro="The range a booking can draw from — acoustic covers, Bollywood, romantic arrangements, original writing and full live sessions."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        {/* Category filter */}
        {categories.length > 1 ? (
          <Reveal className="mt-2">
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {(["All", ...categories] as const).map((c) => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors",
                      active
                        ? "border-crimson/60 bg-crimson/15 text-foreground"
                        : "border-border-subtle text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Reveal>
        ) : null}

        {/* Grid — with a designed empty state if a filter matches nothing */}
        <div className="mt-10">
          {shown.length === 0 ? (
            <div className="rounded-3xl border border-border-subtle bg-surface-2 p-12 text-center">
              <p className="font-display text-2xl text-foreground">Nothing in this category yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                No items have been added under “{filter}”. Choose another category, or view
                everything.
              </p>
              <button
                type="button"
                onClick={() => setFilter("All")}
                className="mt-6 rounded-full border border-border-strong px-6 py-2.5 text-sm text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
              >
                Show all categories
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((item, i) => (
                <Reveal key={item.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
                  <MusicCard item={item} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal className="mt-14">
          <div className="flex flex-col gap-6 rounded-3xl border border-border-subtle bg-surface-2 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="eyebrow mb-3">Want a particular song?</p>
              <h2 className="display text-[clamp(1.5rem,3.5vw,2.25rem)] text-foreground">
                Requests are always welcome.
              </h2>
            </div>
            <Link
              href="/contact"
              className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full bg-foreground px-6 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-crimson hover:text-white"
            >
              Send a request
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
