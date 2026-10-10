<p align="center">
  <img src="docs/banner.svg" alt="Raag Sargam animated banner" width="100%" />
</p>

<h1 align="center">RAAG SARGAM</h1>
<p align="center"><strong>Premium cinematic singer website for a live performer brand.</strong></p>

<p align="center">
  <a href="https://github.com/codeswithshan/shandip-singer-website/actions/workflows/ci.yml">
    <img src="https://github.com/codeswithshan/shandip-singer-website/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" />
  </a>
  <img src="https://img.shields.io/badge/React-19-111111?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-7-111111?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript 7" />
  <img src="https://img.shields.io/badge/Vite-8-111111?style=for-the-badge&logo=vite&logoColor=BD34FE" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-111111?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS v4" />
</p>

<p align="center">
  <img src="docs/typing.svg" alt="Animated typing tagline" width="75%" />
</p>

<p align="center">
  Your occasion. My voice. One unforgettable night.
</p>

<p align="center">
  <img src="docs/divider-wave.svg" alt="Animated divider" width="100%" />
</p>

## Overview

This repository contains the real codebase for **Raag Sargam**, a dark editorial artist website built as a polished full-stack React application rather than a static mockup. It focuses on a premium stage aesthetic: almost-black surfaces, restrained deep-red gradients, large serif-led typography, cinematic spacing, subtle motion, and accessible interaction patterns.

The current build includes:

- a multi-route public website
- a cinematic entry animation that plays on every visit
- a custom brand logo used in the header, the intro and the favicon
- a homepage with hero, marquee, music, gallery, occasions, availability, enquiry, testimonials and contact sections
- a dedicated `/gallery` route with real performance photography
- a single-admin dashboard (`/admin`) that edits every piece of site content
- real public contact links
- accessible motion with reduced-motion support
- GitHub Actions CI for `pnpm typecheck` and `pnpm test`

> Honest note: GitHub README files cannot run JavaScript, so a truly interactive or 60fps script-driven README is **not possible** on GitHub. This README uses **GitHub-safe animated SVG assets** plus a **real captured demo GIF** from the live site preview.

<p align="center">
  <img src="docs/demo.gif" alt="Real captured demo GIF of the Raag Sargam website" width="100%" />
</p>

<p align="center">
  <img src="docs/divider-wave.svg" alt="Animated divider" width="100%" />
</p>

## Features

- **Premium cinematic visual system** with dark editorial styling
- **Cinematic intro animation** — a dark, faded curtain that reveals the brand mark and dissolves into the site on every visit
- **Custom brand logo** — a minimalist soundwave-and-note emblem, used in the header, the intro overlay and the favicon
- **Responsive multi-page experience** across home, about, events, music, gallery, occasions, availability and contact
- **Single-admin dashboard** with full create / edit / delete over profile, gallery, social links, events, music, occasions, testimonials, availability and the enquiries inbox
- **Server-rendered content** — every admin edit appears on the public site immediately
- **Real gallery media** using the artist's uploaded performance photos, optimized and served locally
- **Accessible lightbox** with keyboard navigation, focus trapping and mobile-friendly interaction
- **Real contact links** for WhatsApp, phone, email and social platforms
- **Subtle motion language** based on transform/opacity only
- **Reduced-motion path** for users who prefer less animation
- **Minimal GitHub Actions CI** that validates type safety and tests on every push and pull request

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Build Tool | Vite |
| Routing | wouter |
| API | tRPC + Hono |
| Database | Postgres (Drizzle ORM) |
| Auth | Local, single admin (bcrypt + signed session cookie) |
| Testing | Vitest |
| Icons | lucide-react + inline SVG brand glyphs |
| CI | GitHub Actions |

## Screenshots / Gallery

All screenshots below are **real captures from the actual running site**, taken from the sandbox preview during this update.

### Home hero

![Raag Sargam home hero](docs/home-hero.png)

### Gallery route

![Raag Sargam gallery route](docs/gallery-page.png)

### Contact route

![Raag Sargam contact route](docs/contact-page.png)

<p align="center">
  <img src="docs/divider-wave.svg" alt="Animated divider" width="100%" />
</p>

## Getting Started

### Install

```bash
pnpm install --frozen-lockfile
```

### Run locally

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Typecheck

```bash
pnpm typecheck
```

### Test

```bash
pnpm test
```

## Project Structure

```text
client/
  public/
    images/
      gallery/              optimized local WebP gallery images
    favicon.png             brand mark used as the site favicon
  src/
    components/             reusable UI building blocks (incl. Intro.tsx)
    components/admin/       dashboard editors (settings, resources, uploads)
    content/                site-content provider (server-backed + fallback)
    data/                   static fallback content and structured page data
    lib/                    utilities
    pages/                  route-level page components
    index.css               design tokens, layout rules and motion system
server/
  admin.ts                  single-admin bootstrap + login rate limiting
  db.ts                     Drizzle data access for the content store
  routers.ts                tRPC API surface (public read, admin write)
  _core/                    scaffold: auth, sessions, storage, tRPC plumbing
drizzle/                    schema + generated migrations
shared/                     shared types and constants
docs/                       README assets (screenshots, animated SVGs, demo GIF)
.github/workflows/          CI workflow
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Homepage with hero, marquee, music, gallery, occasions, availability, enquiry, testimonials and contact |
| `/about` | Artist introduction |
| `/events` | Events page |
| `/music` | Music section and listening links |
| `/gallery` | Dedicated gallery route with lightbox |
| `/occasions` | Occasion and performance offerings |
| `/availability` | Availability calendar |
| `/contact` | Contact details and enquiry form |
| `/admin/login` | Single-admin sign-in |
| `/admin` | Admin dashboard (protected) |

## Admin Dashboard

The site has **exactly one admin** and **no signup** — the account is bootstrapped server-side and the only way in is the rate-limited login. From `/admin` the owner can create, edit and delete:

- **Artist profile** — name, role, tagline, intros and contact details
- **Gallery** — performance photos (with upload)
- **Social links** — every channel shown across the site
- **Events** — confirmed performances
- **Music** — set types and repertoire
- **Occasions** — the kinds of events performed at
- **Testimonials** — genuine, permitted client quotes
- **Availability** — the booking calendar
- **Enquiries** — the inbox of messages from the public contact form

Security: the password is stored only as a **bcrypt hash** server-side (never in the repo or the database as plaintext), every write goes through a server-side `adminProcedure` role check, and the login endpoint is **rate-limited** to blunt brute-force attempts.

## Design System

The visual language is intentionally restrained and premium:

- **Base:** almost-black backgrounds
- **Accent:** subtle dark-red gradients rather than bright saturated red
- **Typography:** editorial serif display paired with clean sans-serif body text
- **Spacing:** generous vertical rhythm and breathing room
- **Glass:** used lightly, only where it improves depth
- **Motion:** transform/opacity-only transitions with a full `prefers-reduced-motion` path
- **Accessibility:** descriptive labels, keyboard support, focus visibility and honest content treatment

## CI

The repository includes a minimal GitHub Actions workflow at:

```text
.github/workflows/ci.yml
```

It runs on:

- every `push`
- every `pull_request`

Checks performed:

- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm test`

## Deploy to Vercel

> **Full copy-paste walkthrough:** see **[DEPLOY.md](./DEPLOY.md)** — prerequisites,
> the exact CLI commands, the database + env-var setup, migrations, post-deploy
> verification and a troubleshooting table. A helper script, `./deploy.sh`,
> automates everything except the interactive `vercel login` and the database signup.

This is a **React + Vite (frontend) + tRPC/Hono (backend) + Postgres** app — **not**
Next.js. It deploys to Vercel as a **static SPA build** plus **one Serverless
Function** that serves the whole backend. No migration to another framework was
needed: `server/_core/app.ts` exposes the same Hono app the Docker image runs, and
`api/index.ts` is the Vercel entry that points at it. The existing **Cloud
Run/Docker** path still works and is unchanged (`node dist/index.js`).

Repository: `https://github.com/codeswithshan/shandip-singer-website`

### Option A — Vercel CLI (recommended; no GitHub needed)

> The GitHub account `codeswithshan` is currently **suspended**, so the
> GitHub-integration path (Option B) cannot connect. The CLI deploys the **local
> folder** and needs no GitHub access at all — use this while the account is down.

```bash
# 1. One-time setup
npm i -g vercel          # or: pnpm add -g vercel
vercel login

# 2. From the PROJECT ROOT (the folder with package.json)
cd shandip-singer-website

# 3. Preview deploy (creates/links the project on first run)
vercel                   # answer the prompts; accept the detected "Vite" settings

# 4. Add environment variables (see the table below) — interactive, one per key
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add JWT_SECRET production
vercel env add JWT_SECRET preview
# …repeat for every key in the table…

# 5. Production deploy
vercel --prod
```

`vercel` reads `vercel.json` automatically — you do **not** need to configure the
build command, output directory or rewrites in the dashboard. If prompted, accept
the detected framework; `vercel.json` overrides anything you pick here.

### Option B — Deploy Button (one click, needs a working GitHub account)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcodeswithshan%2Fshandip-singer-website&project-name=raag-sargam&repository-name=raag-sargam)

The button clones the repo into your Vercel account and prompts for the
environment variables. It requires the GitHub account to be active — see Option A
while it is suspended. (Once restored, this is genuinely one click.)

### Required environment variables

| Variable | Required | What it is / where to get it |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres connection string. Neon → *Connection Details* → **Pooled** string; Supabase → *Database* → **Connection pooling** → URI. Migrations need the **direct** (non-pooled) URL instead — see `drizzle.config.ts`. |
| `JWT_SECRET` | **Yes** | Signs the admin session cookie. Any long random string: `openssl rand -base64 48`. Changing it just logs the admin out. |
| `DB_DRIVER` | No (default `tcp`) | `tcp` = node-postgres pool. `http` = Neon serverless HTTP driver — the best fit for scale-to-zero serverless on Neon. |
| `DB_POOL_MAX` | No (default `5`) | Max pooled connections per instance. Keep **1–3** on Vercel. |
| `AUTH_PROVIDER` | No (default `local`) | Only `local` is implemented (single admin, bcrypt, no signup). |
| `APP_SLUG` | No (default `app`) | Names the session cookie (`app_session_<slug>`). Keep it stable. |
| `NODE_ENV` | No | Vercel sets `production` for you. |
| `APP_STORAGE_PRESIGN_URL` / `APP_STORAGE_TOKEN` | No | Only for the admin **image/audio uploader**. Leave blank to run without uploads (the admin can paste an external URL or a local `/images/...` path). |

Add them in the dashboard under **Project → Settings → Environment Variables**, or
with `vercel env add <NAME> <environment>`. **Never commit a real `.env`** — it is
gitignored, and `.env.example` documents every key without any values.

### What works on Vercel, and what does not

Everything the public site does works serverless: browsing, the availability
calendar, the booking form, the newsletter signup, the admin login and every CRUD
write. Two things are **inherently stateful** and behave differently on a
serverless host — both are handled, but know the trade-off:

- **Login rate limiting** (`server/admin.ts`) uses an in-process `Map`. On Vercel
  it becomes **per-instance and best-effort** rather than one global counter. It
  still blunts brute force; for a hard global limit, move the counter to the
  database (a `login_attempts` table) or a KV store.
- **Scheduled jobs** cannot live in the function (a timer dies when the response
  ends). Use the platform's signed job callback (`POST /api/_jobs/:name`), or the
  Vercel Cron feature pointed at the same endpoint.
- **Local filesystem writes** do not persist — only `/tmp` is writable, and it is
  per-instance. That is why uploads go through the storage proxy, not to disk.

### Alternative hosts (if you prefer a resident process)

Because the backend is a plain Hono app, the Docker image in this repo runs
unchanged on **Railway**, **Render**, or **Fly.io**: build with `pnpm build`, run
`node dist/index.js`, expose port `3000`, and set the same environment variables.
Those hosts keep a process alive, so the in-memory rate limiter and scheduled jobs
work there exactly as designed.

## Contact

These are the real public contact channels currently wired into the site:

- **WhatsApp:** https://wa.me/916291567770
- **Phone:** `+91 9365395136`
- **Email:** `shandip8638@gmail.com`
- **Instagram:** https://instagram.com/shaan.islive/
- **Linktree:** https://linktr.ee/winewithshan
- **Discord:** https://discord.gg/kMANJukS7
- **LinkedIn:** https://www.linkedin.com/in/shandip-das-834410417
- **Facebook:** https://www.facebook.com/share/14qmhb5r3UX/

## License

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-111111?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="MIT License" />
</p>

Released under the **MIT License** — see the [`LICENSE`](LICENSE) file for the full text.

**Copyright (c) 2026 Raag Sargam.** The source code is free to use, modify and distribute under the terms of the MIT License.

> **A note on the brand.** The MIT License covers the **code** in this repository. The **Raag Sargam name, logo, imagery, photography and brand identity** remain the property of Raag Sargam and are not granted for reuse by this license. If you would like to feature, license or collaborate with the brand, reach out through the [Contact](#contact) channels above.
