import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { occasions } from "@/data/occasions";

type Values = {
  name: string;
  contact: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  venue: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  name: "",
  contact: "",
  email: "",
  eventType: "",
  eventDate: "",
  city: "",
  venue: "",
  message: "",
};

/** Validation lives here so it is exercised by the submit handler, not the markup. */
export function validate(v: Values): Errors {
  const e: Errors = {};

  if (!v.name.trim()) e.name = "Please enter your name.";
  else if (v.name.trim().length < 2) e.name = "That name looks too short.";

  if (!v.contact.trim()) e.contact = "A phone or WhatsApp number is required.";
  else if (v.contact.replace(/[^\d]/g, "").length < 7)
    e.contact = "Please enter a reachable phone or WhatsApp number.";

  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "That email address does not look right.";

  if (!v.eventType) e.eventType = "Please choose an event type.";
  if (!v.city.trim()) e.city = "Please enter the city.";
  if (!v.venue.trim()) e.venue = "Please enter the venue or a rough location.";

  if (v.message.trim() && v.message.trim().length < 10)
    e.message = "A little more detail helps — 10 characters or more.";

  return e;
}

export function EnquiryForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus("error");
      // Move focus to the first invalid control for keyboard + screen-reader users.
      const firstKey = Object.keys(found)[0];
      document.getElementById(`enquiry-${firstKey}`)?.focus();
      return;
    }

    setStatus("submitting");

    // No backend is connected yet. This simulates the round-trip so the
    // success state is real and testable — it does NOT send anything anywhere,
    // and the confirmation copy says so explicitly.
    await new Promise((r) => window.setTimeout(r, 700));
    setStatus("success");
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  const fieldBase =
    "w-full rounded-xl border bg-surface-1 px-4 py-3 text-sm text-foreground placeholder:text-ink-faint transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const okBorder = "border-border-subtle hover:border-border-strong";
  const badBorder = "border-destructive/70";

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] p-8 text-center sm:p-12"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
        <h3 className="mt-5 font-display text-3xl text-foreground">Enquiry received</h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks, {values.name.split(" ")[0] || "there"} — your enquiry has been captured and shown
          back to you below.
        </p>
        <p className="mx-auto mt-4 max-w-md rounded-xl border border-border-subtle bg-surface-1 px-4 py-3 text-xs leading-relaxed text-ink-faint">
          <strong className="text-muted-foreground">Demo note:</strong> this form is not yet
          connected to a booking inbox, so nothing has been sent to SHANDIP. Once an enquiry
          channel is wired up, submissions will reach the artist directly.
        </p>
        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border-subtle bg-surface-1 p-5 text-left">
          <p className="eyebrow mb-3">Your submission</p>
          <dl className="space-y-1.5 text-xs">
            {(
              [
                ["Name", values.name],
                ["Contact", values.contact],
                ["Email", values.email || "—"],
                ["Event type", values.eventType],
                ["Date", values.eventDate || "—"],
                ["City", values.city],
                ["Venue", values.venue],
                ["Message", values.message || "—"],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-faint">{label}</dt>
                <dd className="text-muted-foreground">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-border-subtle bg-surface-2 p-6 sm:p-8">
      {status === "error" ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Please check the highlighted fields and try again.</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required error={errors.name} htmlFor="enquiry-name">
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-required="true"
            placeholder="Your full name"
            className={cn(fieldBase, errors.name ? badBorder : okBorder)}
          />
        </Field>

        <Field
          label="Phone / WhatsApp"
          required
          error={errors.contact}
          htmlFor="enquiry-contact"
        >
          <input
            id="enquiry-contact"
            name="contact"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.contact}
            onChange={(e) => set("contact", e.target.value)}
            aria-invalid={Boolean(errors.contact)}
            aria-required="true"
            placeholder="+91 62915 67770"
            className={cn(fieldBase, errors.contact ? badBorder : okBorder)}
          />
        </Field>

        <Field label="Email" hint="optional" error={errors.email} htmlFor="enquiry-email">
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@example.com"
            className={cn(fieldBase, errors.email ? badBorder : okBorder)}
          />
        </Field>

        <Field label="Event type" required error={errors.eventType} htmlFor="enquiry-eventType">
          <select
            id="enquiry-eventType"
            name="eventType"
            value={values.eventType}
            onChange={(e) => set("eventType", e.target.value)}
            aria-invalid={Boolean(errors.eventType)}
            aria-required="true"
            className={cn(fieldBase, "appearance-none", errors.eventType ? badBorder : okBorder)}
          >
            <option value="">Select an occasion…</option>
            {occasions.map((o) => (
              <option key={o.id} value={o.title}>
                {o.title}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field label="Event date" hint="optional" htmlFor="enquiry-eventDate">
          <input
            id="enquiry-eventDate"
            name="eventDate"
            type="date"
            value={values.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
            className={cn(fieldBase, okBorder, "[color-scheme:dark]")}
          />
        </Field>

        <Field label="City" required error={errors.city} htmlFor="enquiry-city">
          <input
            id="enquiry-city"
            name="city"
            type="text"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            aria-invalid={Boolean(errors.city)}
            aria-required="true"
            placeholder="e.g. Mumbai"
            className={cn(fieldBase, errors.city ? badBorder : okBorder)}
          />
        </Field>

        <Field label="Venue" required error={errors.venue} htmlFor="enquiry-venue" className="sm:col-span-2">
          <input
            id="enquiry-venue"
            name="venue"
            type="text"
            value={values.venue}
            onChange={(e) => set("venue", e.target.value)}
            aria-invalid={Boolean(errors.venue)}
            aria-required="true"
            placeholder="Venue name, or a rough location if not decided yet"
            className={cn(fieldBase, errors.venue ? badBorder : okBorder)}
          />
        </Field>

        <Field label="Message" hint="optional" error={errors.message} htmlFor="enquiry-message" className="sm:col-span-2">
          <textarea
            id="enquiry-message"
            name="message"
            rows={5}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
            placeholder="Tell me about the occasion — guest count, timings, the mood you want."
            className={cn(fieldBase, "resize-y", errors.message ? badBorder : okBorder)}
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-faint sm:max-w-xs">
          Fields marked <span className="text-crimson">*</span> are required. The form validates in
          your browser and is not yet connected to a booking inbox.
        </p>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-8 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
      </div>
    </form>
  );
}

/* ── Field wrapper: label + control + inline error, wired with aria-describedby ── */

function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        {required ? (
          <span className="text-crimson" aria-hidden="true">
            *
          </span>
        ) : null}
        {hint ? <span className="text-[0.625rem] normal-case tracking-normal text-ink-faint">({hint})</span> : null}
      </label>

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
