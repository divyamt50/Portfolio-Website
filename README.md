# divyamtyagi.dev — portfolio platform

A production-grade personal platform, not a static portfolio: a fully static public site
served from a CDN, fed by a FastAPI control plane. The architecture and every decision
behind it live in [`docs/portfolio-architecture.md`](docs/portfolio-architecture.md) —
read that first; this README is the operator's manual.

```
apps/web    Next.js 16 public site (App Router, Tailwind v4, all pages static)
apps/api    FastAPI control plane (async SQLAlchemy, Alembic, problem+json, audit-ready schema)
apps/admin  Admin SPA — lands in the auth sprint (see apps/admin/README.md)
packages    Generated API client — lands with the admin
docs        Architecture document + (soon) ADRs
infra       docker-compose for local Postgres 16 + Redis 7
```

## Status — Sprint 1 (verified, not aspirational)

Built and proven in a real environment against PostgreSQL 16:

- Full v1 database schema (14 tables incl. auth sessions, audit log, redirects) applied
  via a reviewed Alembic migration; downgrade drops enum types correctly.
- Public read API: projects, posts, experience, skills, settings + `/healthz` `/readyz`,
  RFC 9457 problem+json errors, request-ID structured logging, exact-origin CORS.
- 6 integration tests passing against real Postgres (schema reset + migrations per run);
  ruff clean.
- Live smoke test: server booted, endpoints curl-verified, OpenAPI docs at `/docs`.
- Web app: `next build` green — 9 routes, all prerendered static (○/●), hero + trace +
  JSON-LD present in the HTML before any JS runs. Sitemap, robots, 404, colophon included.
- One sandbox-only caveat: fonts were shimmed during the verification build because the
  build sandbox cannot reach fonts.googleapis.com. CI and Vercel load the real fonts
  (`src/lib/fonts.ts`); the shim (`fonts.sandbox.ts`) stays for offline builds.

Content honesty rule enforced throughout: **no invented metrics, dates, or employers.**
`TODO(divyam)` marks everything only you can fill (see "Your content TODOs" below).

## Local development

API (needs Postgres — `docker compose -f infra/docker-compose.yml up -d` or a local PG16):

    cd apps/api
    cp .env.example .env
    pip install -e ".[dev]"
    alembic upgrade head
    python -m app.seed
    uvicorn app.main:app --app-dir src --reload      # http://localhost:8000/docs

    pytest            # integration tests against portfolio_test
    ruff check src tests

Web:

    cd apps/web
    cp .env.example .env
    npm install
    npm run dev                                       # http://localhost:3000

## Deploy at $0 — the runbook

Order matters. Step 1 alone puts the site live today; steps 2–5 bring the control plane up.

**1. Vercel — public site (≈10 min, live today)**
Push this repo to GitHub → vercel.com → Add New Project → import the repo →
Root Directory: `apps/web`. Environment variables:

    CONTENT_SOURCE=local
    NEXT_PUBLIC_SITE_URL=https://<your-project>.vercel.app
    NEXT_PUBLIC_REPO_URL=https://github.com/divyamt50/<repo>     (optional)
    NEXT_PUBLIC_CONTACT_EMAIL=<your email>                       (optional)

Deploy. The site is fully static — nothing else is required for visitors.

**2. Neon — Postgres (free plan)**
neon.tech → new project (pick the region you'll use for Render — Singapore is closest to
you; visitors are unaffected either way). Copy both connection strings: **pooled** (for
the app) and **direct** (for migrations, later CI use).

**3. Render — FastAPI (free web service)**
render.com → New → Web Service → this repo → Root Directory: `apps/api` →
Runtime: **Docker**. Environment variables:

    ENV=prod
    DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<pooled-host>/<db>?ssl=require
    ALLOWED_ORIGINS=https://<your-project>.vercel.app
    RUN_SEED=1        ← first deploy only

Notes: Neon gives `postgres://…` — change the scheme to `postgresql+asyncpg://` and keep
`?ssl=require`. First boot runs migrations then seeds; **remove `RUN_SEED` after the first
successful deploy** (seeding is idempotent, but the flag shouldn't linger). Free instances
sleep after 15 min idle and cold-start in ~30–60 s — visitors never feel this because the
public site doesn't call the API at request time (architecture doc, Decision 1).

**4. UptimeRobot — monitoring + keep-warm (free)**
Two monitors: your Vercel URL, and `https://<render-service>.onrender.com/healthz` every
5 minutes. The second doubles as a keep-warm ping; 750 free instance-hours/month cover one
always-on service. Treat it as an optimization, not an SLA.

**5. Flip the site to the API**
In Vercel env: `CONTENT_SOURCE=api`, `API_BASE_URL=https://<render-service>.onrender.com`,
optionally `NEXT_PUBLIC_API_DOCS_URL=<same>/docs` (shows on the colophon). Redeploy.
From now on content edits happen in the database and reach the site on rebuild — and, after
the admin sprint, via on-demand revalidation with no rebuild at all.

**Accounts to create now, used next sprint:** Upstash (Redis — rate limiting + auth state)
and Cloudinary (media). Sentry free tier is worth adding to both apps immediately.

**The one non-free item, deferred by your $0 constraint:** a custom domain (~$10–15/yr).
Everything here is domain-agnostic via env vars; when you buy one, it's a 5-minute change.
Until then the admin sprint will use a Vercel rewrite proxy so auth cookies stay
first-party across `vercel.app` ↔ `onrender.com` (details: `apps/admin/README.md`).

## Environment reference

| App | Variable | Purpose |
|---|---|---|
| api | `DATABASE_URL` | asyncpg URL — pooled in app, direct for migrations |
| api | `ALLOWED_ORIGINS` | exact origins, comma-separated; no wildcards |
| api | `REDIS_URL` | unused until auth sprint |
| api | `RUN_SEED` | `1` on first deploy only |
| web | `CONTENT_SOURCE` | `local` (repo content) or `api` (control plane) |
| web | `API_BASE_URL` | Render URL when `CONTENT_SOURCE=api` |
| web | `NEXT_PUBLIC_SITE_URL` | canonical base for metadata/sitemap/robots |
| web | `NEXT_PUBLIC_CONTACT_EMAIL` | contact CTA; falls back to LinkedIn |
| web | `NEXT_PUBLIC_REPO_URL` / `NEXT_PUBLIC_API_DOCS_URL` | colophon links |

## Your content TODOs (grep `TODO(divyam)`)

Done via Divyam_s_Resume.pdf (July 2026): email, phone, résumé download, real
experience (Irish Taylor + consulting), Synapse & OmniData projects, expanded skills.

Still yours to decide or provide:

1. **Title alignment** — the site brands you "AI Backend Engineer"; the résumé says
   "Senior Backend Engineer – Scalable Systems". Pick one story and align both.
2. **Synapse vs DocuMind** — if these are the same system under two names, merge the
   cards before a recruiter sees both and wonders.
3. Repo links for Synapse, OmniData, DocuMind — the résumé says "[Repo]" with no URLs;
   cards hide their link buttons until real ones exist.
4. Replace "case study in progress" bodies with the real case studies
   (structure: context → problem → architecture → decisions → outcomes).
5. Re-pin your GitHub profile so the pinned repos tell the AI-backend story.

## Roadmap (from the architecture doc, §17)

- **Sprint 2 — wire & observe:** deploy per runbook, Sentry, revalidation webhook route,
  contact endpoint + Turnstile, nightly `pg_dump` backup workflow, Lighthouse CI budget.
- **Sprint 3 — auth & admin:** Argon2id + JWT with rotating refresh tokens and reuse
  detection, TOTP, sessions screen, admin SPA CRUD, Cloudinary direct uploads, audit-log
  viewer, generated TS client (CI drift check).
- **Sprint 4 — compounding:** blog + MDX pipeline + RSS + OG images, "Ask my portfolio"
  RAG demo with hard cost caps (pgvector on Neon, Redis semantic cache), monthly writing.
