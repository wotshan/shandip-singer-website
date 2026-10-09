import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useSiteContent } from "@/content/SiteContentProvider";
import type { SiteSettings } from "@shared/types";

const FIELDS: { name: keyof SiteSettings; label: string; type: "text" | "textarea"; help?: string; full?: boolean }[] = [
  { name: "artist", label: "Artist name", type: "text" },
  { name: "role", label: "Role / subtitle", type: "text" },
  { name: "tagline", label: "Tagline", type: "text", full: true },
  { name: "shortIntro", label: "Short intro", type: "textarea", full: true, help: "Used in the footer and page headers." },
  { name: "longIntro", label: "Long intro", type: "textarea", full: true, help: "The main About paragraph." },
  { name: "email", label: "Email", type: "text" },
  { name: "phoneDisplay", label: "Phone (display)", type: "text" },
  { name: "phoneHref", label: "Phone (link)", type: "text", help: "e.g. tel:+919365395136" },
  { name: "whatsappDisplay", label: "WhatsApp (display)", type: "text" },
  { name: "whatsapp", label: "WhatsApp (link)", type: "text", help: "e.g. https://wa.me/916291567770" },
  { name: "cities", label: "Cities", type: "text", full: true },
  { name: "travelNote", label: "Travel note", type: "text", full: true },
];

export function SettingsEditor() {
  const { settings } = useSiteContent();
  const utils = trpc.useUtils();
  const saveM = trpc.settings.update.useMutation();

  const [form, setForm] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form from the live content once it arrives.
  useEffect(() => setForm(settings), [settings]);

  async function save() {
    setError(null);
    setSaved(false);
    try {
      await saveM.mutateAsync(form);
      await utils.content.getSite.invalidate();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save settings.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Artist profile</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Your name, bio and contact details. These appear across the whole site — hero, about,
          footer and contact page.
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Saved — the public site is updated.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.full || f.type === "textarea" ? "flex flex-col gap-2 sm:col-span-2" : "flex flex-col gap-2"}>
            <label htmlFor={`s-${f.name}`} className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {f.label}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={`s-${f.name}`}
                rows={3}
                value={form[f.name]}
                onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
              />
            ) : (
              <input
                id={`s-${f.name}`}
                type="text"
                value={form[f.name]}
                onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
              />
            )}
            {f.help ? <p className="text-xs text-ink-faint">{f.help}</p> : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saveM.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-crimson hover:text-white disabled:opacity-60"
        >
          {saveM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save profile
        </button>
      </div>
    </div>
  );
}
