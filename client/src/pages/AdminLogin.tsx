import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/_core/useAuth";
import { StatusDot } from "@/components/StatusDot";

/**
 * The single admin sign-in — a Nothing-OS access dialog.
 *
 * There is no signup anywhere in the app: the one admin account is created
 * server-side and this form posts the username + password to `admin.login`,
 * which is rate-limited on the server. The credentials never leave this app.
 *
 * The treatment is a fixed, centred glass panel over a dot matrix, with the
 * monospaced "ADMIN ACCESS" lockup and a breathing LED — the same system status
 * language used on the public site — rather than a generic card with two inputs.
 */
export default function AdminLogin() {
  const { login, user } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-border-subtle bg-surface-2/70 px-4 py-3 text-sm text-foreground transition-colors placeholder:text-ink-faint focus:outline-none focus-visible:border-crimson/60 focus-visible:ring-2 focus-visible:ring-crimson/40";

  return (
    <section className="relative flex min-h-[82svh] items-center justify-center overflow-hidden px-5 py-20">
      {/*
        No accent LEDs on this page: the access panel is frosted glass, and a
        bright LED sitting behind it bleeds through as a stray dot floating in
        the card. The metallic sheen alone carries the texture.
      */}
      <div aria-hidden="true" className="hero-sheen absolute inset-0 opacity-70" />

      <div className="relative w-full max-w-md">
        <div
          className={cnPanel(error)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="led-bloom grid h-11 w-11 shrink-0 place-items-center rounded-full border border-crimson/40 bg-crimson/10 text-crimson">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="mono flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.22em] text-crimson">
                  <StatusDot tone="accent" breathe />
                  Admin access
                </p>
                <h1 className="display mt-1 text-2xl text-foreground">Restricted area</h1>
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="rule my-6" />

          <p className="text-sm leading-relaxed text-muted-foreground">
            One account, no signup. Sign in to manage the profile, gallery, events and everything
            else on the public site.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="admin-username"
                className="mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint"
              >
                Username
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="shanislive"
                className={field}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="admin-password"
                className="mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint"
              >
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${field} mono tracking-[0.3em]`}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mono inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-background transition-all duration-300 hover:bg-crimson hover:text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {busy ? "Verifying\u2026" : "Sign in"}
            </button>
          </form>

          <p className="mono mt-5 text-center text-[0.5625rem] uppercase tracking-[0.2em] text-ink-faint">
            Rate limited · auth server-side
          </p>
        </div>
      </div>
    </section>
  );
}

/** Panel shell, plus a shake on a rejected attempt so the failure is felt. */
function cnPanel(error: string | null) {
  const base =
    "relative overflow-hidden rounded-3xl border border-glass-border bg-surface-1/80 p-8 shadow-2xl backdrop-blur-2xl sm:p-10";
  return error ? `${base} pin-shake` : base;
}
