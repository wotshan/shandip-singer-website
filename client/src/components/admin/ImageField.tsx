import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { cn } from "@/lib/utils";

/**
 * Image picker for the gallery editor.
 *
 * Uploads through the platform's three-step protocol (signed URL → browser PUT
 * → commit) and stores the resulting `/app-storage/<key>` path in the field.
 * A path can also be typed by hand, so existing `/images/...` assets stay usable.
 */
export function ImageField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  id: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadUrlM = trpc.files.uploadUrl.useMutation();
  const commitM = trpc.files.commit.useMutation();

  async function onPick(file: File) {
    setError(null);
    setBusy(true);
    try {
      const { key, uploadUrl, publicPath } = await uploadUrlM.mutateAsync({
        name: file.name,
        contentType: file.type || "application/octet-stream",
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await commitM.mutateAsync({ key, name: file.name });
      onChange(publicPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border-subtle bg-surface-1">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-faint" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/gallery/photo.webp"
            className="w-full rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-foreground placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-crimson/60 hover:bg-crimson/10",
                busy && "opacity-60",
              )}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
