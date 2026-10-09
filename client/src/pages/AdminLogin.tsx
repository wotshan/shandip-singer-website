import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/_core/useAuth";

/**
 * The single admin sign-in.
 *
 * There is no signup anywhere in the app — the one admin account is created
 * server-side. This form posts the username + password to `admin.login`, which
 * is rate-limited on the server.
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

  return (
    <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden px-5 py-20">
      <div aria-hidden="true" className="ambience absolute inset-0 opacity-60" />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border-subtle bg-surface-1 p-8 shadow-2xl sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-crimson/40 bg-crimson/10 text-crimson">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Admin</p>
              <h1 className="font-display text-2xl text-foreground">Sign in</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            This area is for the site owner. Sign in to manage the profile, gallery, events and
            everything else on the public site.
          </p>

          {error ? (
            <p role="alert" className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-username" className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
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
                className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
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
                className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-3 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
