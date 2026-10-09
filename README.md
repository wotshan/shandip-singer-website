# SHANDIP — Professional Singer & Live Performer

A premium, cinematic website for the artist brand **SHANDIP**. Built as a real,
responsive React application — not a mockup — with a dark editorial aesthetic,
large typography and restrained motion.

> **Your occasion. My voice. One unforgettable night.**

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` tokens) |
| Build | Vite |
| Routing | wouter |
| Icons | lucide-react + a few inline brand glyphs |

No backend, database, paid API or payment gateway is wired up at this stage —
the public site is frontend-only and runs entirely in the browser.

## Getting started

```bash
pnpm install
pnpm dev        # Vite dev server on http://localhost:3000
```

Other scripts:

```bash
pnpm build      # production build
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit
```

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, marquee, about, events, music, gallery, occasions, availability, enquiry, testimonials, contact |
| `/about` | About SHANDIP |
| `/events` | Upcoming events |
| `/music` | Music |
| `/gallery` | Photo gallery with lightbox |
| `/occasions` | Occasions & services |
| `/availability` | Availability calendar |
| `/contact` | Contact & enquiry form |

## Project structure

```
client/
  public/images/        hero + gallery photographs (WebP, served locally)
  src/
    components/         reusable UI (Hero, Marquee, GalleryGrid, Lightbox, …)
    data/               site content (events, music, occasions, gallery, …)
    pages/              one component per route
    index.css           design tokens + motion
server/                 scaffold API (unused by the public site)
shared/                 shared types/constants
```

## Design system

Almost-black base (`hsl(0 0% 4%)`) with subtle dark-red gradients, white type on
muted grey, and a single coherent token set (background / surfaces / borders /
text hierarchy / accent) defined in `client/src/index.css`. Display type is
Cormorant Garamond; body is Inter. Motion is transform/opacity only and fully
respects `prefers-reduced-motion`.

## Content & honesty notes

This is a real site with **placeholder content in specific places**, and the UI
says so rather than implying otherwise:

- **Events, availability, music links and testimonials** are clearly labelled
  sample/demo data.
- The **enquiry form** validates and confirms on screen, but is **not connected
  to a booking inbox** — nothing is sent to the artist yet.
- **Contact links** (WhatsApp, Instagram, YouTube, email) are editable
  placeholders until the real accounts are supplied.
- The **gallery** uses the artist's real performance photographs; captions
  describe the setting only and name no specific event, venue or date.

## Deployment

The app builds to static assets (`pnpm build`) and can be served from any static
host. No environment variables are required for the public site.
