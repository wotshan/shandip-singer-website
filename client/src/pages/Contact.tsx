import { Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ContactLinks } from "@/components/ContactLinks";
import { PageHeader } from "./About";
import { site } from "@/data/site";

export default function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Book a performance"
        intro="Send the essentials and the occasion. Every enquiry is read personally before a date is confirmed."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* Details column */}
          <Reveal className="space-y-8">
            <div>
              <SectionHeading eyebrow="Reach out" title="Direct channels" />
              <div className="mt-6">
                <ContactLinks />
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-6">
              <p className="eyebrow mb-4">Direct details</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 text-crimson" aria-hidden="true" />
                    {site.email}
                  </a>
                </li>
                <li>
                  <span className="inline-flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4 text-crimson" aria-hidden="true" />
                    {site.phoneDisplay}
                  </span>
                </li>
              </ul>
              <p className="mt-5 border-t border-border-subtle pt-4 text-xs leading-relaxed text-ink-faint">
                {site.placeholderNote}
              </p>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-1 p-6">
              <p className="eyebrow mb-3">Based in</p>
              <p className="text-sm text-muted-foreground">{site.cities}</p>
              <p className="mt-2 text-xs text-ink-faint">{site.travelNote}</p>
            </div>
          </Reveal>

          {/* Form column */}
          <Reveal delay={1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
