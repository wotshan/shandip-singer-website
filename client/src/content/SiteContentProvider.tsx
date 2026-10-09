import { createContext, useContext, useMemo, type ReactNode } from "react";
import { trpc } from "@/_core/trpc";
import type { SiteContent } from "@shared/types";
import { fallbackSettings, fallbackSocials } from "@/data/site";
import { fallbackGallery } from "@/data/gallery";
import { fallbackEvents } from "@/data/events";
import { fallbackMusic } from "@/data/music";
import { fallbackOccasions } from "@/data/occasions";
import { fallbackTestimonials } from "@/data/testimonials";
import { fallbackAvailability } from "@/data/availability";
import {
  fallbackAwards,
  fallbackCollaborations,
  fallbackFanMessages,
  fallbackHighlights,
  fallbackPress,
  fallbackPressMentions,
  fallbackStats,
} from "@/data/celebrity";

/**
 * Site content seam.
 *
 * The public site renders from the server (admin-editable rows in Postgres).
 * This provider fetches the whole bundle once and hands every page the same
 * shape, so a page never talks to tRPC directly and the static fallback keeps
 * the site rendering if the API is unreachable.
 */
const FALLBACK: SiteContent = {
  settings: fallbackSettings,
  socials: fallbackSocials,
  gallery: fallbackGallery,
  events: fallbackEvents,
  music: fallbackMusic,
  occasions: fallbackOccasions,
  testimonials: fallbackTestimonials,
  availability: fallbackAvailability,
  awards: fallbackAwards,
  press: fallbackPress,
  collaborations: fallbackCollaborations,
  stats: fallbackStats,
  highlights: fallbackHighlights,
  fanMessages: fallbackFanMessages,
  pressMentions: fallbackPressMentions,
};

type SiteContentValue = SiteContent & {
  isLoading: boolean;
  /** True when the API could not be reached and the static fallback is in use. */
  isFallback: boolean;
  refetch: () => void;
};

const SiteContentContext = createContext<SiteContentValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const query = trpc.content.getSite.useQuery(undefined, {
    staleTime: 30_000,
    retry: 1,
  });

  const value = useMemo<SiteContentValue>(() => {
    const data = query.data;
    return {
      settings: data?.settings ?? FALLBACK.settings,
      socials: data?.socials?.length ? data.socials : FALLBACK.socials,
      gallery: data?.gallery?.length ? data.gallery : FALLBACK.gallery,
      events: data?.events ?? FALLBACK.events,
      music: data?.music?.length ? data.music : FALLBACK.music,
      occasions: data?.occasions?.length ? data.occasions : FALLBACK.occasions,
      testimonials: data?.testimonials ?? FALLBACK.testimonials,
      availability: data?.availability ?? FALLBACK.availability,
      awards: data?.awards ?? FALLBACK.awards,
      press: data?.press ?? FALLBACK.press,
      collaborations: data?.collaborations ?? FALLBACK.collaborations,
      stats: data?.stats?.length ? data.stats : FALLBACK.stats,
      highlights: data?.highlights?.length ? data.highlights : FALLBACK.highlights,
      fanMessages: data?.fanMessages ?? FALLBACK.fanMessages,
      pressMentions: data?.pressMentions?.length ? data.pressMentions : FALLBACK.pressMentions,
      isLoading: query.isLoading,
      isFallback: query.isError,
      refetch: () => void query.refetch(),
    };
  }, [query.data, query.isLoading, query.isError, query]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within <SiteContentProvider>");
  return ctx;
}
