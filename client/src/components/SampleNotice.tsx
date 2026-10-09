import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honesty banner. Every demo/sample surface on the site carries one of these so
 * a visitor never mistakes placeholder content for something real.
 */
export function SampleNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-crimson/25 bg-crimson/[0.07] px-4 py-3.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-crimson" aria-hidden="true" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
