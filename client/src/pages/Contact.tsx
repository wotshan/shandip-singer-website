import { MailGlyph, PhoneGlyph, WhatsAppGlyph } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ContactLinks } from "@/components/ContactLinks";
import { SocialCarousel } from "@/components/SocialCarousel";
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
          <Reveal variant="left" className="space-y-8">
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
                    aria-label={`Email SHANDIP at ${site.email}`}
                    className="inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MailGlyph className="h-4 w-4 text-crimson" />
                    {site.email}
                  </a>
                </li>
                <li>
                  <a
                    href={site.phoneHref}
                    aria-label={`Call SHANDIP on ${site.phoneDisplay}`}
                    className="inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <PhoneGlyph className="h-4 w-4 text-crimson" />
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Message SHANDIP on WhatsApp"
                    className="inline-flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <WhatsAppGlyph className="h-4 w-4 text-crimson" />
                    {site.whatsappDisplay}
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-1 p-6">
              <p className="eyebrow mb-3">Based in</p>
              <p className="text-sm text-muted-foreground">{site.cities}</p>
              <p className="mt-2 text-xs text-ink-faint">{site.travelNote}</p>
            </div>
          </Reveal>

          {/* Form column */}
          <Reveal variant="right" delay={1}>
            <EnquiryForm />
          </Reveal>
        </div>
      </section>

      {/* ── Social carousel ─────────────────────────────────────────────────── */}
      <section
        aria-label="Follow SHANDIP"
        className="border-t border-border-subtle bg-surface-1 py-14 sm:py-20"
      >
        <Reveal>
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Follow"
              title="Everywhere I perform"
              intro="New sets, behind-the-scenes clips and open dates — posted across these channels."
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="mt-10">
          <SocialCarousel />
        </Reveal>
      </section>
    </>
  );
}
