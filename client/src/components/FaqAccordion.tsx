import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/SiteContentProvider";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * FAQ accordion.
 *
 * One panel open at a time. The open/close is a grid-template-rows transition
 * (0fr -> 1fr), which animates to the content's natural height without measuring
 * it in JS, and the chevron rotates in step. Buttons carry aria-expanded and
 * aria-controls so the state is announced.
 */
export function FaqAccordion() {
  const { faqs } = useSiteContent();
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <Reveal>
        <SectionHeading
          eyebrow="Good to know"
          title={<span id="faq-heading">Questions, answered</span>}
          intro="The things people ask before they book."
        />
      </Reveal>

      <Reveal delay={1} className="mx-auto mt-10 max-w-3xl">
        <ul className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-subtle bg-surface-2">
          {faqs.map((f) => {
            const isOpen = open === f.id;
            return (
              <li key={f.id}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${f.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-surface-3 sm:px-6"
                  >
                    <span className="font-display text-lg text-foreground sm:text-xl">{f.question}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-subtle text-crimson transition-transform duration-400",
                        isOpen && "rotate-45 border-crimson/50 bg-crimson/10",
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${f.id}`}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-[420ms] ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-6">
                      {f.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
