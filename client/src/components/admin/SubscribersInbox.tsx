import { Loader2, Mail, Trash2 } from "lucide-react";
import { trpc } from "@/_core/trpc";

function formatWhen(iso: string | Date) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The fan-club / newsletter list.
 *
 * Signups arrive from the public newsletter form (`subscribers.create`, a public
 * procedure). Reading and removing them is admin-only. The email column is
 * UNIQUE, so a repeat signup is a no-op rather than a duplicate row.
 */
export function SubscribersInbox() {
  const utils = trpc.useUtils();
  const list = trpc.subscribers.list.useQuery();
  const removeM = trpc.subscribers.remove.useMutation();

  async function remove(id: string) {
    await removeM.mutateAsync({ id });
    await utils.subscribers.list.invalidate();
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Fan club</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Everyone who joined the newsletter from the public site. {rows.length} subscriber
          {rows.length === 1 ? "" : "s"}.
        </p>
      </div>

      {list.isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
          <p className="font-display text-2xl text-foreground">No subscribers yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When someone joins the fan club from the home page, their email lands here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-2 p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-crimson/40 bg-crimson/10 text-crimson">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{s.email}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {s.name ? `${s.name} · ` : ""}
                    {formatWhen(s.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void remove(s.id)}
                aria-label={`Remove ${s.email}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-destructive/60 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
