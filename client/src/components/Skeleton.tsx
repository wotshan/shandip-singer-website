import { cn } from "@/lib/utils";

/** Shimmering placeholder used while a section's data is still loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} />;
}
