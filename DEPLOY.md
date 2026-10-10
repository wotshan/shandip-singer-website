# Deploying Raag Sargam to Vercel — step by step

This is a **React + Vite (frontend) + tRPC/Hono (backend) + Postgres** app — **not**
Next.js. It deploys to Vercel as a **static SPA build** plus **one Serverless
Function** that serves the whole backend. Nothing was migrated: `server/_core/app.ts`
exposes the same Hono app the Docker image runs, and `api/index.ts` is the Vercel
entry that points at it.

> **Two paths.** The **CLI** (Steps 1–7 below) deploys the local folder and needs
> no GitHub access at all. The **one-click import** (Step 2b) imports the GitHub
> repo `wotshan/shandip-singer-website` (private — the earlier `codeswithshan`
> account is suspended, which is why the repo now lives under `wotshan`).

Everything below is copy-paste ready. Commands are run from the **project root** —
the folder that contains `package.json` (in this workspace that is `app/`).

---

## Step 0 — Prerequisites

| Need | Version / note | Check |
|---|---|---|
| Node.js | **>= 20.19.0** (see `engines` in `package.json`) | `node -v` |
| pnpm | **11.15.1** (pinned via `packageManager`) | `pnpm -v` |
| Vercel account | Free tier is fine | https://vercel.com/signup |
| A Postgres database | Neon or Supabase (both have a free tier) | — |

```bash
node -v            # expect v20.19.0 or newer
corepack enable    # makes pnpm available at the pinned version
pnpm -v            # expect 11.15.1
```

If `pnpm` is missing: `npm i -g pnpm@11.15.1`.

---

## Step 1 — Install the Vercel CLI and log in

```bash
npm i -g vercel      # or: pnpm add -g vercel
vercel login
```

**What to expect:** `vercel login` prints a URL and asks you to confirm your email.
It opens a browser (or you paste the URL), you approve, and the terminal prints
`Success!`. Verify with `vercel whoami` — it should print your username.

> In a headless/remote shell the browser cannot open; copy the printed URL into a
> browser on your own machine and approve there. The CLI waits and then continues.

---

## Step 2 — Link the project (first `vercel` run)

```bash
cd /path/to/project-root     # the folder with package.json
vercel
```

**What to expect — the wizard:**

| Prompt | Answer |
|---|---|
| `Set up and deploy "…"?` | **Y** |
| `Which scope…?` | your personal account |
| `Link to existing project?` | **N** (first time) |
| `What's your project's name?` | `raag-sargam` (or anything) |
| `In which directory is your code located?` | **`./`** (press Enter) |
| `Want to modify these settings?` | **N** |

You do **not** need to configure the build command, output directory or rewrites —
`vercel.json` already sets them and overrides anything the wizard detects:

```jsonc
// vercel.json (already in the repo)
{
  "framework": "vite",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build:web",          // -> vite build
  "outputDirectory": "dist/public",          // the SPA
  "functions": { "api/index.ts": { "maxDuration": 30, "memory": 1024,
                                   "includeFiles": "dist/public/**" } },
  "rewrites": [
    { "source": "/trpc",            "destination": "/api" },
    { "source": "/trpc/(.*)",       "destination": "/api" },
    { "source": "/app-storage",     "destination": "/api" },
    { "source": "/app-storage/(.*)","destination": "/api" },
    { "source": "/((?!api/).*)",    "destination": "/api" }   // SPA fallback
  ]
}
```

This first run produces a **preview** URL. It will fail to boot the API until the
env vars exist (Step 5) — that is expected; continue.

---

## Step 2b — One-click import from GitHub (alternative to Steps 1–2)

Repo: `wotshan/shandip-singer-website` — **private**. The exact click path:

1. **Install the Vercel GitHub App once** (so no token is needed):
   **vercel.com → Add New… → Project → Import Git Repository → Configure GitHub
   App → Install → pick the `wotshan` account → Only select repositories →
   `shandip-singer-website` → Install.** (Also reachable at
   https://github.com/apps/vercel → Install.)
2. **Open the import link** (this is already your repo):
   `https://vercel.com/new/clone?repository-url=https://github.com/wotshan/shandip-singer-website`
   — or **Add New… → Project**, then pick `shandip-singer-website` from the list.
3. **Leave the framework settings alone.** `vercel.json` already sets the build
   command (`pnpm build:web`), the output directory (`dist/public`), the
   `api/index.ts` function and the rewrites. If the dashboard shows the **Vite**
   preset, that is correct — do **not** override build/output there.
4. **Add the environment variables** from **Step 5 Option B** (the import form has
   an *Environment Variables* section — same keys).
5. **Deploy**, then continue at **Step 6** (migrations) and **Step 8** (verify).

> The old account `codeswithshan` is **suspended**, which is why the repo is under
> `wotshan`. If the App is later uninstalled, this link stops working — the CLI
> path (Step 1) is the fallback that needs no GitHub access.

---

## Step 3 — Create the database and get the **pooled** connection string

### Neon (recommended for serverless)
1. https://neon.tech → **New Project** → pick a region close to your users.
2. In the project, open **Connection Details**.
3. Copy the **Pooled connection** string (host contains `-pooler`). It looks like:
   `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require`
4. Also copy the **Direct connection** string (no `-pooler`) — you need it **only**
   for migrations in Step 6.

### Supabase
1. https://supabase.com → **New project**.
2. **Project Settings → Database → Connection pooling** → copy the **URI**
   (port `6543`, host contains `pooler.supabase.com`).
3. The **direct** URI (port `5432`) is under **Connection string → URI** — for Step 6.

> **Pooled vs direct, in one line:** the running app uses the **pooled** URL (many
> short-lived serverless instances share a small pool); `drizzle-kit migrate` uses
> the **direct** URL (it needs a real session, not a transaction pooler).

---

## Step 4 — Generate the session secret

```bash
openssl rand -base64 48
```

Copy the output — that is your `JWT_SECRET`. It signs the admin session cookie
(HS256). Changing it later simply logs the admin out; nothing else breaks.

> There is **no** `ADMIN_PASSWORD` env var by design. The single admin
> (`shanislive`) is bootstrapped server-side in `server/admin.ts` and its password
> is stored **only as a bcrypt hash** — never as plaintext, never in env, never in
> git. `JWT_SECRET` is the only auth secret you set.

---

## Step 5 — Add the environment variables

### Option A — CLI (one command per key, per environment)

```bash
# Required
vercel env add DATABASE_URL production     # paste the POOLED string
vercel env add DATABASE_URL preview
vercel env add JWT_SECRET   production     # paste the openssl output
vercel env add JWT_SECRET   preview

# Recommended on Vercel (serverless-safe pool)
vercel env add DB_POOL_MAX  production     # value: 2
vercel env add DB_POOL_MAX  preview
# If you are on Neon and want the HTTP driver (no TCP pool at all):
# vercel env add DB_DRIVER  production     # value: http
```

Each `vercel env add` prompts for the value; paste it and press Enter. To also
cover the Development environment, repeat with `development` as the last argument.

### Option B — Dashboard

**Project → Settings → Environment Variables → Add New.** Add each key, tick
**Production** (and **Preview**), and Save. Same list as the table below.

### Full variable reference

| Variable | Required | Value / where it comes from |
|---|---|---|
| `DATABASE_URL` | **Yes** | Postgres string. **Pooled** URL for the app (Neon `-pooler` / Supabase `:6543`). |
| `JWT_SECRET` | **Yes** | `openssl rand -base64 48`. Signs the admin cookie. |
| `DB_DRIVER` | No (default `tcp`) | `tcp` = node-postgres pool (any Postgres). `http` = Neon serverless HTTP driver (Neon only, best for scale-to-zero). |
| `DB_POOL_MAX` | No (default `5`) | Max connections per instance. **Keep 1–3 on Vercel.** |
| `AUTH_PROVIDER` | No (default `local`) | Only `local` is implemented (single admin, bcrypt, no signup). |
| `APP_SLUG` | No (default `app`) | Names the session cookie (`app_session_<slug>`). Keep it stable after first deploy. |
| `NODE_ENV` | No | Vercel sets `production` automatically. |
| `PORT` / `API_PORT` | No | Local dev only; Vercel supplies its own port. |
| `APP_STORAGE_PRESIGN_URL` / `APP_STORAGE_TOKEN` | No | Only for the admin **image/audio uploader**. Leave blank to run without uploads (the admin can paste an external URL or a local `/images/...` path). |

**Never commit a real `.env`** — it is gitignored. `.env.example` documents every
key with no values.

---

## Step 6 — Run the database migrations

Migrations live in `drizzle/migrations/` and are the source of truth. Run them
**once** against your new database, using the **direct** (non-pooled) URL:

```bash
# Temporarily point DATABASE_URL at the DIRECT string, then:
DATABASE_URL="postgresql://…direct…" pnpm db:migrate
```

`pnpm db:migrate` runs `drizzle-kit migrate` (see `drizzle.config.ts`). Expected
output ends with the applied migration files and no errors.

**Optional — seed real content** (only if you want the starter rows):

```bash
DATABASE_URL="postgresql://…direct…" pnpm tsx scripts/seed-content.ts
```

> The site ships with **honest empty states** — no fake awards, press or brands.
> Seed only if you want the sample content; otherwise add real content from the
> admin dashboard.

---

## Step 7 — Deploy to production

```bash
vercel --prod
```

**What to expect:** it re-runs the build (`pnpm install --frozen-lockfile` →
`pnpm build:web`), uploads `dist/public` + the `api/index.ts` function, and prints
a production URL like `https://raag-sargam.vercel.app`. The build log should show
`vite build` finishing and the function bundling with no missing imports.

---

## Step 8 — Verify the deployment

Replace `$URL` with your production URL.

```bash
URL=https://raag-sargam.vercel.app

# 1. Health (both paths are advertised by the app)
curl -s $URL/health        # -> {"status":"ok",...}
curl -s $URL/api/health    # -> same JSON

# 2. tRPC is routed to the function, not the SPA (expect a JSON 404, not HTML)
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" $URL/trpc/nope
#   -> 404 application/json

# 3. SPA fallback serves the app shell for a client route
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" $URL/gallery
#   -> 200 text/html
```

Then in a browser:

| Check | Expected |
|---|---|
| `/` | Home renders, metallic background, no console errors |
| `/availability` | Calendar shows the current month; hover a date for its tooltip |
| `/admin/login` | Login screen; sign in with **`shanislive` / `Vasu6291`** |
| `/admin` | Dashboard opens; edit a field, Save, reload — the change persists |
| Public page | The edit you just saved is reflected on the public site |

---

## Step 9 — Custom domain (optional)

```bash
vercel domains add raagsargam.com        # then follow the DNS instructions
# or, in the dashboard: Project → Settings → Domains → Add
```

Add the DNS records Vercel shows (an `A`/`ALIAS` for the apex, a `CNAME` for
`www`). HTTPS is issued automatically once DNS resolves.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **`No Output Directory named "dist/public"`** | The build did not run, or `vercel.json` was ignored. | Confirm you ran `vercel` from the **project root** (the folder with `package.json` and `vercel.json`). Do not set an output dir in the dashboard — `vercel.json` owns it. |
| **`Error: JWT_SECRET is required`** at boot | Env var missing for that environment. | `vercel env add JWT_SECRET production` **and** `preview`, then redeploy (`vercel --prod`). Env changes need a new deployment. |
| **500 on `/api` or `/trpc`** | Usually a missing/invalid `DATABASE_URL`, or migrations not run. | Check `vercel logs <deployment-url>`. Verify `DATABASE_URL` is the **pooled** string and that Step 6 ran. |
| **DB connection timeout / `too many connections`** | Direct URL used, or pool too large for many instances. | Use the **pooled** URL and set `DB_POOL_MAX=2`. On Neon you can also set `DB_DRIVER=http`. |
| **`pnpm install --frozen-lockfile` fails** | `pnpm-lock.yaml` out of sync with `package.json`. | Run `pnpm install` locally and commit the updated lockfile. |
| **Admin login says "too many attempts"** | The in-process rate limiter tripped. | Wait a minute. On Vercel the limiter is per-instance/best-effort (see below). |
| **`/trpc/...` returns HTML instead of JSON** | Rewrites not applied. | Ensure `vercel.json` is committed and you deployed from the project root. |
| **Import shows "No repositories" / 404 on the import link** | The Vercel GitHub App is not installed on `wotshan`, or it was not granted access to this repo. | Install/authorize the App on `wotshan` and allow `shandip-singer-website` (Step 2b), then reopen the import link. The repo is private — the CLI path (Step 1) always works with no GitHub access. |

---

## What works on Vercel, and what does not

Everything the public site does works serverless: browsing, the availability
calendar, the booking form, the newsletter signup, the admin login and every CRUD
write. Three things are **inherently stateful** and behave differently:

- **Login rate limiting** (`server/admin.ts`) uses an in-process `Map`. On Vercel
  it is **per-instance and best-effort** rather than one global counter. It still
  blunts brute force; for a hard global limit, move the counter to a
  `login_attempts` table or a KV store.
- **Scheduled jobs** cannot live in the function (a timer dies when the response
  ends). Use the signed job callback `POST /api/_jobs/:name`, or Vercel Cron
  pointed at the same endpoint.
- **Local filesystem writes** do not persist — only `/tmp` is writable, and it is
  per-instance. Uploads go through the storage proxy, not to disk.

### Prefer a resident process?

Because the backend is a plain Hono app, the `Dockerfile` in this repo runs
unchanged on **Railway**, **Render** or **Fly.io**: build with `pnpm build`, run
`node dist/index.js`, expose port `3000`, and set the same env vars. Those hosts
keep a process alive, so the in-memory rate limiter and scheduled jobs work there
exactly as designed.

---

## One-shot helper

`./deploy.sh` automates Steps 1–7 (everything except the interactive `vercel
login` and the browser-only database signup). See the script header for usage.
