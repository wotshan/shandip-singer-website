import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/** Designed 404 — reached by any URL that matches no route. */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden">
      <div aria-hidden="true" className="ambience absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <Reveal>
          <p className="eyebrow mb-5">Error 404</p>
          <h1 className="display text-[clamp(2.5rem,9vw,6rem)] text-foreground">
            This page isn't on the setlist
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            The link you followed doesn't lead anywhere. Head back to the homepage, or jump straight
            to booking.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border-strong px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
            >
              Book an event
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
