import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { cn } from "@/lib/utils";

function formatWhen(iso: string | Date) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function EnquiriesInbox() {
  const utils = trpc.useUtils();
  const list = trpc.enquiries.list.useQuery();
  const setReadM = trpc.enquiries.setRead.useMutation();
  const removeM = trpc.enquiries.remove.useMutation();

  async function toggle(id: string, read: boolean) {
    await setReadM.mutateAsync({ id, read });
    await utils.enquiries.list.invalidate();
  }

  async function remove(id: string) {
    await removeM.mutateAsync({ id });
    await utils.enquiries.list.invalidate();
  }

  const rows = list.data ?? [];
  const unread = rows.filter((r) => !r.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Enquiries</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every booking enquiry submitted from the contact form. {unread > 0 ? `${unread} unread.` : "All read."}
        </p>
      </div>

      {list.isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-2 p-10 text-center">
          <p className="font-display text-2xl text-foreground">No enquiries yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When someone submits the contact form, their enquiry lands here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => (
            <li
              key={e.id}
              className={cn(
                "rounded-2xl border bg-surface-2 p-5",
                e.read ? "border-border-subtle" : "border-crimson/40",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {e.name}
                    {!e.read ? <span className="ml-2 rounded-full bg-crimson/20 px-2 py-0.5 text-[0.625rem] uppercase tracking-wider text-red-200">New</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">{formatWhen(e.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggle(e.id, !e.read)}
                    aria-label={e.read ? "Mark unread" : "Mark read"}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {e.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(e.id)}
                    aria-label="Delete enquiry"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-destructive/60 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {(
                  [
                    ["Contact", e.contact],
                    ["Email", e.email || "—"],
                    ["Event type", e.eventType || "—"],
                    ["Date", e.eventDate || "—"],
                    ["City", e.city || "—"],
                    ["Venue", e.venue || "—"],
                    ["Budget", e.budget || "—"],
                  ] as const
                ).map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="w-24 shrink-0 text-ink-faint">{label}</dt>
                    <dd className="min-w-0 break-words text-muted-foreground">{val}</dd>
                  </div>
                ))}
              </dl>

              {e.message ? (
                <p className="mt-4 border-t border-border-subtle pt-3 text-sm leading-relaxed text-muted-foreground">
                  {e.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
