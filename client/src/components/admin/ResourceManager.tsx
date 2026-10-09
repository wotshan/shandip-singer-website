import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { cn } from "@/lib/utils";
import { ImageField } from "./ImageField";
import { resourceDef, type FieldDef } from "@/admin/resources";
import type { ContentResource } from "@shared/types";

type Row = Record<string, unknown>;

/** Coerce a stored value into what a given input control expects. */
function toInputValue(field: FieldDef, raw: unknown): string | boolean | number {
  if (field.type === "checkbox") return Boolean(raw);
  if (field.type === "number") return typeof raw === "number" ? raw : Number(raw ?? 0) || 0;
  if (field.type === "list") return Array.isArray(raw) ? raw.join("\n") : String(raw ?? "");
  return raw == null ? "" : String(raw);
}

/** Coerce a form value back into the shape the API expects. */
function fromInputValue(field: FieldDef, value: string | boolean | number): unknown {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "number") return Number(value) || 0;
  if (field.type === "list") {
    return String(value)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const s = String(value);
  // Optional text fields are stored as null so the API's nullable schema accepts them.
  if (s === "" && (field.name === "href" || field.name === "linkLabel" || field.name === "duration" || field.name === "note")) {
    return null;
  }
  return s;
}

export function ResourceManager({ resource }: { resource: ContentResource }) {
  const def = resourceDef(resource);
  const utils = trpc.useUtils();

  const list = trpc.content.list.useQuery({ resource });
  const createM = trpc.content.create.useMutation();
  const updateM = trpc.content.update.useMutation();
  const removeM = trpc.content.remove.useMutation();

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean | number>>({});
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const open = creating || editing !== null;

  useEffect(() => {
    if (creating) {
      const next: Record<string, string | boolean | number> = {};
      for (const f of def.fields) next[f.name] = toInputValue(f, def.defaults[f.name]);
      setForm(next);
      setError(null);
    } else if (editing) {
      const next: Record<string, string | boolean | number> = {};
      for (const f of def.fields) next[f.name] = toInputValue(f, editing[f.name]);
      setForm(next);
      setError(null);
    }
  }, [creating, editing, def]);

  function close() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  async function save() {
    setError(null);
    const values: Record<string, unknown> = {};
    for (const f of def.fields) values[f.name] = fromInputValue(f, form[f.name]);

    try {
      if (editing) {
        await updateM.mutateAsync({ resource, id: String(editing.id), values });
      } else {
        await createM.mutateAsync({ resource, values });
      }
      await utils.content.list.invalidate({ resource });
      await utils.content.getSite.invalidate();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Check the fields and try again.");
    }
  }

  async function remove(id: string) {
    try {
      await removeM.mutateAsync({ resource, id });
      await utils.content.list.invalidate({ resource });
      await utils.content.getSite.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setConfirmId(null);
    }
  }

  const rows = (list.data ?? []) as Row[];
  const saving = createM.isPending || updateM.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-foreground">{def.label}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{def.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-crimson hover:text-white"
        >
          <Plus className="h-4 w-4" /> Add {def.singular}
        </button>
      </div>

      {list.isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
          <p className="font-display text-2xl text-foreground">No {def.label.toLowerCase()} yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Nothing has been added here. Use “Add {def.singular}” to create the first one — it will
            appear on the public site immediately.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const title = String(row[def.titleField] ?? "—");
            const subtitle = def.subtitleField ? String(row[def.subtitleField] ?? "") : "";
            const thumb = resource === "gallery" ? String(row.src ?? "") : "";
            return (
              <li
                key={String(row.id)}
                className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface-2 p-4"
              >
                {thumb ? (
                  <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{title}</p>
                  {subtitle ? <p className="truncate text-xs text-ink-faint">{subtitle}</p> : null}
                </div>

                {confirmId === String(row.id) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Delete?</span>
                    <button
                      type="button"
                      onClick={() => void remove(String(row.id))}
                      className="rounded-full bg-destructive px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Yes, delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      aria-label={`Edit ${title}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-crimson/50 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(String(row.id))}
                      aria-label={`Delete ${title}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-destructive/60 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-2xl rounded-3xl border border-border-subtle bg-surface-1 p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl text-foreground">
                {editing ? `Edit ${def.singular}` : `New ${def.singular}`}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error ? (
              <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {def.fields.map((f) => (
                <div key={f.name} className={cn("flex flex-col gap-2", (f.full || f.type === "textarea" || f.type === "list" || f.type === "image") && "sm:col-span-2")}>
                  <label htmlFor={`f-${f.name}`} className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {f.label}
                    {f.required ? <span className="ml-1 text-crimson">*</span> : null}
                  </label>

                  {f.type === "image" ? (
                    <ImageField
                      id={`f-${f.name}`}
                      value={String(form[f.name] ?? "")}
                      onChange={(v) => setForm((p) => ({ ...p, [f.name]: v }))}
                    />
                  ) : f.type === "textarea" ? (
                    <textarea
                      id={`f-${f.name}`}
                      rows={3}
                      value={String(form[f.name] ?? "")}
                      onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
                    />
                  ) : f.type === "list" ? (
                    <textarea
                      id={`f-${f.name}`}
                      rows={4}
                      value={String(form[f.name] ?? "")}
                      onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
                    />
                  ) : f.type === "select" ? (
                    <select
                      id={`f-${f.name}`}
                      value={String(form[f.name] ?? "")}
                      onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                      className="w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
                    >
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        id={`f-${f.name}`}
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.checked }))}
                        className="h-4 w-4 rounded border-border-strong bg-surface-2"
                      />
                      Enabled
                    </label>
                  ) : (
                    <input
                      id={`f-${f.name}`}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={String(form[f.name] ?? "")}
                      onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={cn(
                        "w-full rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60",
                        f.type === "date" && "[color-scheme:dark]",
                      )}
                    />
                  )}

                  {f.help ? <p className="text-xs text-ink-faint">{f.help}</p> : null}
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-border-strong px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-crimson hover:text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Save changes" : `Add ${def.singular}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
