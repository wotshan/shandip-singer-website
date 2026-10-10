#!/usr/bin/env bash
# ── Raag Sargam — Vercel deploy helper ────────────────────────────────────────
#
# Automates the mechanical parts of DEPLOY.md (Steps 1–7). It CANNOT do the two
# things that need a human: `vercel login` (browser approval) and creating the
# database (Neon/Supabase signup). Do those first, then run this.
#
# USAGE
#   ./deploy.sh                 # link + preview deploy, then prompt for env vars
#   ./deploy.sh --prod          # same, then a production deploy
#   ./deploy.sh --env-only      # only (re)set env vars on an already-linked project
#
# ENV VARS (export before running, or the script prompts for the required ones):
#   DATABASE_URL   required  — the POOLED Postgres string
#   JWT_SECRET     required  — `openssl rand -base64 48`
#   DB_POOL_MAX    optional  — default 2 (serverless-safe)
#   DB_DRIVER      optional  — "tcp" (default) or "http" (Neon)
#
# The script never writes secrets to disk and never commits anything.
set -euo pipefail

PROD=0
ENV_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --prod)     PROD=1 ;;
    --env-only) ENV_ONLY=1 ;;
    -h|--help)  sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ── 0. Preconditions ──────────────────────────────────────────────────────────
[ -f package.json ] || die "Run this from the project root (the folder with package.json)."
[ -f vercel.json ]  || die "vercel.json not found — is this the right folder?"

command -v node >/dev/null || die "Node.js is not installed (need >= 20.19.0)."
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] || die "Node $(node -v) is too old — need >= 20.19.0."

if ! command -v vercel >/dev/null; then
  say "Installing the Vercel CLI…"
  npm i -g vercel
fi
say "Vercel CLI: $(vercel --version 2>/dev/null | head -1)"

# ── 1. Login ──────────────────────────────────────────────────────────────────
if ! vercel whoami >/dev/null 2>&1; then
  warn "Not logged in. Running 'vercel login' — approve in the browser, then come back."
  vercel login
fi
say "Logged in as: $(vercel whoami)"

# ── 2. Link + preview deploy ──────────────────────────────────────────────────
if [ "$ENV_ONLY" -eq 0 ]; then
  say "Linking the project and running a preview deploy (vercel.json drives the build)…"
  vercel
fi

# ── 3. Environment variables ──────────────────────────────────────────────────
prompt_required() { # name, description
  local name="$1" desc="$2" val="${!1:-}"
  if [ -z "$val" ]; then
    printf '\033[1m%s\033[0m (%s)\n> ' "$name" "$desc"
    read -r val
  fi
  [ -n "$val" ] || die "$name is required."
  printf '%s' "$val"
}

say "Setting environment variables (Production + Preview)…"

DATABASE_URL_VAL="$(prompt_required DATABASE_URL 'pooled Postgres string')"
JWT_SECRET_VAL="$(prompt_required JWT_SECRET 'openssl rand -base64 48')"
DB_POOL_MAX_VAL="${DB_POOL_MAX:-2}"
DB_DRIVER_VAL="${DB_DRIVER:-tcp}"

set_env() { # name, value
  local name="$1" value="$2" env
  for env in production preview; do
    # Remove any existing value first so re-runs are idempotent.
    vercel env rm "$name" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$env" >/dev/null
    printf '  ✓ %s → %s\n' "$name" "$env"
  done
}

set_env DATABASE_URL "$DATABASE_URL_VAL"
set_env JWT_SECRET   "$JWT_SECRET_VAL"
set_env DB_POOL_MAX  "$DB_POOL_MAX_VAL"
set_env DB_DRIVER    "$DB_DRIVER_VAL"

# ── 4. Migrations ─────────────────────────────────────────────────────────────
say "Database migrations"
warn "drizzle-kit needs the DIRECT (non-pooled) URL, not the pooled one."
printf 'Paste the DIRECT Postgres URL to run migrations now (or Enter to skip):\n> '
read -r DIRECT_URL
if [ -n "$DIRECT_URL" ]; then
  DATABASE_URL="$DIRECT_URL" pnpm db:migrate
  say "Migrations applied."
else
  warn "Skipped. Run later:  DATABASE_URL=\"<direct-url>\" pnpm db:migrate"
fi

# ── 5. Production deploy ──────────────────────────────────────────────────────
if [ "$PROD" -eq 1 ]; then
  say "Deploying to production…"
  vercel --prod
  say "Done. Verify with the checks in DEPLOY.md Step 8."
else
  say "Preview deploy complete. Re-run with --prod for production."
fi
