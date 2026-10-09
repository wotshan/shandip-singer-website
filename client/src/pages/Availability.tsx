import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { SampleNotice } from "@/components/SampleNotice";
import { PageHeader } from "./About";
import { availabilityMonth } from "@/data/availability";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Availability() {
  return (
    <>
      <PageHeader
        eyebrow="Availability"
        title="Is your date open?"
        intro="A preview of how the booking calendar reads for the month ahead."
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal className="space-y-6">
            <SampleNotice>
              This calendar is a <strong className="text-foreground">demo preview</strong> using
              sample statuses for {MONTHS[availabilityMonth.month]} {availabilityMonth.year}. It is
              not connected to any live booking system — always confirm a date by enquiry before
              planning around it.
            </SampleNotice>

            <SectionHeading
              eyebrow="How to read it"
              title="Four states"
              intro="Each date carries one of four statuses. A green date is open for a request; a red one is already committed."
            />

            <p className="text-sm leading-relaxed text-muted-foreground">
              Dates marked tentative already have an enquiry in discussion — they can still open up,
              so it is worth asking. Unavailable dates are closed for travel or rest.
            </p>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-crimson"
            >
              Enquire about a date
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={1}>
            <AvailabilityCalendar />
          </Reveal>
        </div>
      </section>
    </>
  );
}
