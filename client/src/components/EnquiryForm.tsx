import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/_core/trpc";
import { useSiteContent } from "@/content/SiteContentProvider";

type Values = {
  name: string;
  contact: string;
  email: string;
  eventType: string;
  eventDate: string;
  city: string;
  venue: string;
  budget: string;
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
  budget: "",
  message: "",
};

const BUDGETS = ["Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+", "Not sure yet"];

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

/** Which fields each step owns, so a step can be validated on its own. */
const STEP_FIELDS: (keyof Values)[][] = [
  ["eventType", "eventDate", "city", "venue"],
  ["name", "contact", "email", "budget"],
  ["message"],
];

const STEP_LABELS = ["The event", "Your details", "The brief"];

export function EnquiryForm() {
  const { occasions } = useSiteContent();
  const createM = trpc.enquiries.create.useMutation();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  /** Validate only the fields the given step owns. */
  function validateStep(index: number): Errors {
    const all = validate(values);
    const owned: Errors = {};
    for (const key of STEP_FIELDS[index]) {
      if (all[key]) owned[key] = all[key];
    }
    return owned;
  }

  function next() {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`enquiry-${firstKey}`)?.focus();
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus("error");
      // Jump to the earliest step that owns an invalid field.
      const firstKey = Object.keys(found)[0] as keyof Values;
      const ownerStep = STEP_FIELDS.findIndex((fields) => fields.includes(firstKey));
      if (ownerStep >= 0) setStep(ownerStep);
      document.getElementById(`enquiry-${firstKey}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await createM.mutateAsync({
        name: values.name.trim(),
        contact: values.contact.trim(),
        email: values.email.trim() || undefined,
        eventType: values.eventType,
        eventDate: values.eventDate || undefined,
        city: values.city.trim(),
        venue: values.venue.trim(),
        budget: values.budget || undefined,
        message: values.message.trim() || undefined,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStep(0);
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
        className="enquiry-success rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] p-8 text-center sm:p-12"
      >
        <span className="relative mx-auto grid h-16 w-16 place-items-center">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <CheckCircle2 className="relative h-12 w-12 text-emerald-400" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-3xl text-foreground">Enquiry received</h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks, {values.name.split(" ")[0] || "there"} — your enquiry has been sent and will be
          read personally before a date is confirmed.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-300">
          <PartyPopper className="h-3.5 w-3.5" aria-hidden="true" />
          Expect a reply within a day or two
        </p>
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

  const isLast = step === STEP_FIELDS.length - 1;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-border-subtle bg-surface-2 p-6 sm:p-8"
    >
      {/* Step progress */}
      <ol className="mb-7 flex items-center gap-2" aria-label="Booking form progress">
        {STEP_LABELS.map((label, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  active
                    ? "border-crimson/60 bg-crimson/15 text-foreground"
                    : done
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                      : "border-border-subtle text-ink-faint",
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium uppercase tracking-[0.12em] sm:block",
                  active ? "text-foreground" : "text-ink-faint",
                )}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 ? (
                <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {status === "error" ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3.5 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Please check the highlighted fields and try again.</p>
        </div>
      ) : null}

      {/* ── Step 1: the event ── */}
      {step === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
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

          <Field label="Venue" required error={errors.venue} htmlFor="enquiry-venue">
            <input
              id="enquiry-venue"
              name="venue"
              type="text"
              value={values.venue}
              onChange={(e) => set("venue", e.target.value)}
              aria-invalid={Boolean(errors.venue)}
              aria-required="true"
              placeholder="Venue name, or a rough location"
              className={cn(fieldBase, errors.venue ? badBorder : okBorder)}
            />
          </Field>
        </div>
      ) : null}

      {/* ── Step 2: your details ── */}
      {step === 1 ? (
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

          <Field label="Phone / WhatsApp" required error={errors.contact} htmlFor="enquiry-contact">
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

          <Field label="Budget" hint="optional" htmlFor="enquiry-budget">
            <select
              id="enquiry-budget"
              name="budget"
              value={values.budget}
              onChange={(e) => set("budget", e.target.value)}
              className={cn(fieldBase, "appearance-none", okBorder)}
            >
              <option value="">Select a range…</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      {/* ── Step 3: the brief ── */}
      {step === 2 ? (
        <div className="grid gap-5">
          <Field label="Message" hint="optional" error={errors.message} htmlFor="enquiry-message">
            <textarea
              id="enquiry-message"
              name="message"
              rows={6}
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              aria-invalid={Boolean(errors.message)}
              placeholder="Tell me about the occasion — guest count, timings, the mood you want."
              className={cn(fieldBase, "resize-y", errors.message ? badBorder : okBorder)}
            />
          </Field>

          {/* Review summary */}
          <dl className="grid gap-x-6 gap-y-2 rounded-2xl border border-border-subtle bg-surface-1 p-5 text-sm sm:grid-cols-2">
            {(
              [
                ["Event", values.eventType || "—"],
                ["Date", values.eventDate || "—"],
                ["City", values.city || "—"],
                ["Venue", values.venue || "—"],
                ["Name", values.name || "—"],
                ["Contact", values.contact || "—"],
                ["Budget", values.budget || "—"],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-20 shrink-0 text-ink-faint">{label}</dt>
                <dd className="min-w-0 break-words text-muted-foreground">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {/* ── Controls ── */}
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-faint sm:max-w-xs">
          Fields marked <span className="text-crimson">*</span> are required. Your enquiry goes
          straight to the booking inbox.
        </p>

        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-surface-3"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          ) : null}

          {isLast ? (
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
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground px-8 py-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-crimson hover:text-white"
            >
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
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
