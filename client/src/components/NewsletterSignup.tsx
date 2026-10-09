import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Reveal } from "./Reveal";
import { useSiteContent } from "@/content/SiteContentProvider";

/**
 * Fan-club / newsletter signup.
 *
 * Stores the email in the app's own database (`subscribers.create`, a public
 * procedure) — no third-party mailing service is involved. The email column is
 * UNIQUE, so a repeat signup is a no-op and the UI still confirms success.
 */
export function NewsletterSignup() {
  const { settings } = useSiteContent();
  const createM = trpc.subscribers.create.useMutation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await createM.mutateAsync({ email: email.trim(), name: name.trim() || undefined });
      setDone(true);
      setEmail("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you up. Check the email and try again.");
    }
  }

  return (
    <section id="fan-club" className="border-t border-border-subtle bg-surface-1">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-2 px-6 py-14 sm:px-12 sm:py-16">
            <div aria-hidden="true" className="ambience absolute inset-0 opacity-50" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow mb-4">Fan club</p>
                <h2 className="display text-[clamp(2rem,5vw,3.25rem)] text-foreground">
                  Be first to know
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Join {settings.artist}'s fan club for new dates, fresh sets and behind-the-scenes
                  moments — straight to your inbox.
                </p>
              </div>

              <div>
                {done ? (
                  <p
                    role="status"
                    className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300"
                  >
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    You're on the list. Welcome to the fan club.
                  </p>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                        aria-label="Your name"
                        className="w-full rounded-full border border-border-subtle bg-background/60 px-5 py-3 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:w-2/5"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        aria-label="Your email"
                        className="w-full rounded-full border border-border-subtle bg-background/60 px-5 py-3 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={createM.isPending}
                      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold hover:text-black disabled:opacity-60"
                    >
                      {createM.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      Join the fan club
                    </button>
                    {error ? (
                      <p role="alert" className="text-sm text-red-300">
                        {error}
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
