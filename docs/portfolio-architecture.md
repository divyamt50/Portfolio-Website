# Portfolio Platform — Architecture & Decision Document

**Owner:** Divyam Tyagi · **Author:** Lead Software Architect review · **Date:** July 2026 · **Status:** Proposed, v1.0

This document reviews every requirement in the brief, challenges the ones that deserve challenging, and specifies the architecture for a portfolio platform that is genuinely production-grade without being a monument to over-engineering. It contains no code by design — it is the contract you build against.

**How it maps to your 15 asks:** requirement review (§1–§2), removals (§2), additions (§3), stack verdict (§4), architecture (§5), CMS strategy (§6), authentication (§7), database schema (§8), API design (§9), folder structure (§10), deployment (§11), animation (§12), SEO (§13), security (§14), testing & observability (§15–§16), roadmap (§17).

---

## 0. The three decisions that matter

If you read nothing else, internalize these. Everything downstream follows from them.

**Decision 1 — Decouple publishing from serving.** The public site is fully static (SSG + on-demand ISR), built from your API's content and served from Vercel's edge CDN. The FastAPI backend is a *control plane*: it exists for authoring, and it pushes a revalidation webhook to Vercel when you publish. Visitors never wait on your backend. This is non-negotiable on free tiers: Render free services sleep after 15 minutes of inactivity and take 30–60 seconds to cold-start, and Neon's free compute autosuspends after ~5 minutes idle. A public site that queries the backend per-request would be intolerably slow exactly when it matters — when a recruiter clicks your link for the first time. Static-first makes the free-tier constraints irrelevant to visitors, makes SEO trivially good, and is also, honestly, how mature content platforms work. It's not a compromise; it's the correct design at any scale.

**Decision 2 — Three deployables, hard separation.** `web` (public site), `admin` (dashboard), `api` (FastAPI). The admin is a separate application on a separate subdomain, not a route group inside the public app. Your brief says "the public website should never expose any admin functionality" — the only way to make that structurally true, rather than true-by-discipline, is for the public bundle to contain zero auth code, zero admin components, and zero cookies. Separation also keeps the public site perfectly cacheable and lets the admin evolve without ever touching public-site performance.

**Decision 3 — The backend is an exhibit, so treat it like one.** Brutal honesty: nobody hiring you will ever *see* your backend by visiting the site. A recruiter sees pixels. Your FastAPI/Redis/JWT stack only demonstrates skill if you make it visible: open-source the repository, write an "architecture of this site" page, publish the OpenAPI spec, show live health/latency stats on the site, and write case studies that reference real decisions in the code. If the repo stays private and undocumented, the entire backend is invisible effort and you should have used MDX files in Git instead. Commit to visibility, or simplify.

---

## 1. Requirement review — the honest verdicts

| Requirement | Verdict | Notes |
|---|---|---|
| Next.js (latest stable) + React + TypeScript | ✅ Keep | Next 16.x as of mid-2026. App Router, static-first. |
| Tailwind + shadcn/ui | ✅ Keep | Tailwind v4. shadcn as a base, restyled hard (see §12) — default shadcn screams "template." |
| Framer Motion | ✅ Keep | Note: the library is now published as "Motion" (`motion` package). Use it; knowing the rename is itself a currency signal. |
| Lenis | ⚠️ Conditional | Only if a specific design element demands smooth-scroll. It hijacks native scrolling, complicates accessibility, and fights CSS scroll-driven animations. Default: skip. |
| GSAP | ❌ Remove | You listed it as "only if required." It won't be. Two animation runtimes = bundle bloat and inconsistent motion language. |
| FastAPI + PostgreSQL | ✅ Keep | Correct, and it's your specialty — this is the exhibit. |
| Redis | ✅ Keep, narrowed | Legitimate jobs here: rate limiting, refresh-token/session state, login throttling, later semantic-cache for the RAG demo. Do **not** invent caching work for it — the public site is static; there is nothing to cache. |
| JWT + refresh tokens | ⚠️ Keep, redesigned | JWTs are the wrong *default* for a single-admin monolith (server sessions are simpler and more secure), but they're a fair showcase choice — **if** implemented properly: rotation, reuse detection, correct cookie storage. Full spec in §7. |
| Argon2 | ✅ Keep | Argon2id specifically, OWASP parameters. |
| Rate limiting, audit logs | ✅ Keep | Both are cheap, genuinely production-grade, and great interview material. |
| Role-based authorization | ⚠️ Descope | You have exactly one user. Keep a `role` column and a clean authorization dependency in FastAPI (the *pattern* is the showcase). Do not build permission matrices, role-management UI, or invite flows. That's weeks of work for zero users. |
| Docker | ✅ Keep, scoped | Dockerfile for the API (Render deploys it natively) + docker-compose for local Postgres/Redis parity. The Next apps are **not** dockerized in production — Vercel doesn't work that way, and pretending otherwise is cargo cult. |
| Cloudinary | ✅ Keep | Also use it as the `next/image` loader to sidestep Vercel's image-optimization quotas. |
| Admin: "everything editable" | ❌ Reframe | The single biggest scope trap in the brief. See §2. |
| Vercel / Railway-or-Render / Neon / Upstash / Cloudinary | ⚠️ Amend | **Railway is out** — it no longer has a permanent free tier (one-time $5 trial, then $5/mo Hobby). **Render** is the free choice: 750 instance-hours/month (enough to run one service 24/7), sleeps after 15 min idle, ~30–60s cold start, 512 MB RAM, ephemeral filesystem, Docker + custom domains + TLS on free. Full deployment design in §11. |
| "Deployable entirely on free-tier services" | ⚠️ One exception | Buy a domain (~$10–15/year). It is effectively **required**, not optional: your cross-origin auth design depends on `admin.` and `api.` being subdomains of the same registrable domain (see §7), and `*.vercel.app` + `*.onrender.com` are cross-site — browsers' third-party-cookie blocking will break your refresh-token cookie. Also, nobody senior takes `divyam.vercel.app` as seriously as `divyamtyagi.dev`. This is the only money the project needs. |

One more honest reframe of the brief itself: you asked for "the best AI Backend Engineer portfolio on the internet" and listed only visual/infra qualities. The actual ceiling on "best" is **content** — case studies with real numbers and a technical blog. A stunning site with two project cards loses to a plain site with a great essay on semantic caching. The architecture below supports that content; it cannot substitute for it. Budget your calendar accordingly (see §17, Phase 0).

---

## 2. What to remove or descope

1. **GSAP.** Redundant with Motion. Removed.
2. **Lenis by default.** Add later only if a concrete design calls for it; wrap behind a feature flag and disable under `prefers-reduced-motion`.
3. **"Everything editable" → "all content editable."** An admin that can edit layout, sections, and design is a page builder — a multi-month product in its own right, and the result is always worse than design living in code. The correct split: **content** (projects, posts, experience, skills, site copy, SEO fields, media) lives in the database and is fully editable; **presentation** (layout, components, motion, typography) lives in the repo and changes via commits. You are the only editor and you are a developer — this costs you nothing and saves you a month.
4. **Multi-role RBAC machinery.** Keep the `role` enum and an authorization dependency; skip role management UI, granular permissions, invites. Document in the README how an `editor` role would slot in — that shows the thinking without the cost.
5. **Task queues (Celery/RQ/arq) and workers.** Nothing in scope needs one, and a worker doubles your free-tier footprint. FastAPI `BackgroundTasks` covers the rare async need (sending yourself a contact-notification email). Revisit only if the Phase-3 RAG demo needs ingestion jobs.
6. **Custom analytics.** Don't build page-view tracking, session logic, or dashboards. Use Vercel Web Analytics (free tier) or self-serve Umami Cloud free tier. If you want a "views" badge on posts, a single Redis counter flushed to Postgres is the ceiling — and even that is Phase 3.
7. **Microservices, GraphQL, Kubernetes, event buses.** Nobody proposed them yet, but this is the project type where they creep in. One API, REST, one database. A well-factored monolith is the senior answer here, and saying so in your architecture writeup is worth more than doing the opposite.
8. **Comments, likes, newsletters (self-hosted).** All are spam magnets and moderation burdens. If you want a newsletter later, embed a hosted provider.

---

## 3. What to add (missing from the brief)

1. **A blog / writing section.** The highest-leverage addition, full stop. It's the only realistic source of organic search traffic (your homepage will rank for your name and nothing else), and it's how you *prove* the expertise the headline claims. Target long-tail technical queries you actually have authority on: production RAG evaluation, semantic caching with Redis, model routing, FastAPI patterns. MDX-based bodies, rendered statically. One good post a month outperforms any feature on this list.
2. **Case-study format for projects.** Not screenshots-and-a-blurb. Structure: context → problem → constraints → architecture (with a diagram) → key decisions and trade-offs → measurable outcomes (latency, cost, accuracy, scale) → what you'd do differently. For DocuMind and TweetGenerator, real numbers are the difference between a portfolio and a brochure.
3. **"How this site works" page.** A live architecture page for the site itself, linking the public repo, the OpenAPI docs, and displaying live signals (API health, p95 latency, cache stats) fetched client-side with graceful degradation. This is the move that makes the backend *visible* (Decision 3). Cheap to build, memorable, and exactly on-brand for an infrastructure engineer.
4. **Full SEO plumbing:** per-page metadata, canonical URLs, dynamically generated OG images, JSON-LD (`Person`, `BlogPosting`, `BreadcrumbList`), `sitemap.xml`, `robots.txt`, RSS/Atom feed. Details in §13.
5. **Contact form with real spam defense:** Cloudflare Turnstile (free, better UX than reCAPTCHA) + honeypot field + per-IP rate limit + payload size cap. Messages stored in Postgres, surfaced in admin, optional email notification to you.
6. **Résumé as a first-class object:** a downloadable PDF (stored in Cloudinary, versioned via admin) and an HTML version for crawlers and humans who won't download files.
7. **Observability from day one:** Sentry (free tier) on all three apps, structured JSON logs with request IDs on the API, UptimeRobot free monitors on the public site and the API health endpoint (which doubles as the keep-warm ping — §11).
8. **Automated database backups:** a nightly GitHub Actions workflow running `pg_dump` against Neon, uploading an encrypted artifact. Neon free keeps only a ~6-hour restore window; that is not a backup strategy. A tested restore procedure is a production requirement and a great line in the architecture writeup.
9. **Accessibility as a requirement, not vibes:** keyboard navigability, visible focus states, contrast-checked palette, `prefers-reduced-motion` honored everywhere, alt text mandatory on media (enforced by the admin form). Senior reviewers notice broken keyboard nav on "premium" sites immediately.
10. **Phase-3 flagship — "Ask my portfolio":** a small, hard-capped RAG chat over your résumé, case studies, and posts, powered by your own stack: pgvector on Neon (supported on free tier), hybrid retrieval, Redis semantic cache, streamed responses, per-IP daily budget, tiny model. It turns your skill list (RAG, vector search, semantic caching, model routing, evaluation) into something a visitor can *touch*. Strictly Phase 3 — it must not delay launch — and it ships with cost controls designed before the first token is generated.

---

## 4. Stack verdict

**Should you switch stacks?** The honest all-else-equal answer for a solo portfolio is "one language": Next.js + server actions or Hono + Drizzle, one deployable, far less ops. I'm rejecting that here for one reason only: the backend *is the portfolio piece*, and it must be in the technology you're selling — Python/FastAPI. That's a legitimate reason, and it's the last time we let "showcase value" beat simplicity without a fight. Every subsequent decision defaults to the simplest production-credible option.

Final stack:

- **Public site & admin:** Next.js 16.x (App Router), React 19, TypeScript strict, Tailwind v4, shadcn/ui (restyled), Motion for animation. Admin recommendation: a **Vite + React SPA** (TanStack Router + TanStack Query) rather than a second Next app — the admin needs no SSR/SEO, and a pure SPA consuming the API proves the API stands alone and keeps the separation honest. Acceptable alternative if you insist on one framework: a minimal second Next app. Either deploys free on Vercel.
- **API:** FastAPI on Python 3.13+, Pydantic v2, SQLAlchemy 2.0 (async, `asyncpg`), Alembic migrations, `pydantic-settings` for config, `structlog` for logging, `argon2-cffi`, `PyJWT` (not `python-jose` — maintenance and CVE history favor PyJWT), `uv` for dependency management, `ruff` + `mypy` for lint/typecheck. Layering: router → service → SQLAlchemy. **No repository-pattern ceremony** — at this size an extra abstraction layer is résumé-driven development; a thin service layer is the production-lean answer.
- **Contract:** the OpenAPI schema is the single source of truth. A generated TypeScript client (openapi-typescript or Hey API/orval) is consumed by web and admin; CI fails on drift. This eliminates an entire class of frontend/backend mismatch bugs and is a strong production practice to show off.
- **Data:** Neon Postgres (free: ~0.5 GB storage, ~100 compute-unit-hours/month, autosuspend at 5 min idle, pgvector available). Use the **pooled** connection string for the app and the direct one for migrations; keep the API's own pool small (Neon free autoscales to modest compute). Upstash Redis free tier for rate limits and auth state. Cloudinary free tier for media.
- **Hosting:** Vercel (web + admin), Render free web service via Dockerfile (API). CI/CD on GitHub Actions.

---

## 5. System architecture

**Runtime model.** Two planes:

- *Serving plane (visitors):* Vercel edge CDN serves pre-rendered pages. Every public page — home, projects, case studies, posts, tags, résumé — is generated at build time or via on-demand ISR. Zero runtime dependency on the API for page rendering.
- *Control plane (you):* Admin SPA → FastAPI → Postgres/Redis/Cloudinary. The API is the **single writer** to the database. Nothing else touches Postgres — not the Next app, not server actions. One writer means one place for validation, audit logging, and invariants.

**Publish flow.** You edit and hit publish in the admin → API validates, writes, audit-logs → API calls a secured Next revalidation route (shared-secret header) with the affected tags/paths → Next re-fetches that content from the API's public read endpoints and regenerates the pages → CDN serves the new version globally within seconds. Draft preview uses Next's draft mode: the admin requests a short-lived signed preview token from the API; the public app, only in draft mode, fetches draft content server-side with that token. Drafts are never in the public bundle or cache.

**Runtime exceptions (the only public → API calls):** the contact form submission, the live status widget on the "how this site works" page, and (Phase 3) the RAG chat. All three are designed to degrade gracefully — optimistic UI, visible "waking the backend" state, client-side timeout with a mailto fallback for contact — because even with keep-warm pings (§11) you must assume occasional cold starts.

**Failure modes, thought through:** API down → public site fully unaffected; contact form falls back to mailto; status widget shows "unreachable" (which is honest). Neon down/asleep → same, since only the API talks to it. Vercel build fails → last good deployment keeps serving. Redis down → API fails *open* on rate limiting for public read endpoints but fails *closed* on auth-sensitive endpoints (login, refresh), and logs loudly.

**Explicitly rejected alternatives:** SSR-per-request from FastAPI (cold starts kill it); Next server actions writing to Neon directly (two writers, splits validation/audit); a message queue between admin and web (a signed webhook is the whole job).

---

## 6. CMS strategy

Three real options, judged honestly:

1. **Git-based MDX, no backend.** Best pure-pragmatism answer for a developer's portfolio: versioned, free, zero infra. Rejected only because it deletes the thing you're showcasing and fails the "editable admin" requirement.
2. **Headless CMS (Payload, Sanity, Strapi).** Fastest path to a great editing UX — Payload 3 even lives inside Next. Rejected because it outsources exactly the layer you want on your résumé. But know this is what you'd pick for a client.
3. **Custom FastAPI CMS.** Chosen. It *is* the portfolio. The discipline that makes it survivable:

- **Structured content types, not a page builder** (per §2). Entities: projects, posts, experience, skills, testimonials (optional), site settings, media.
- **Bodies are Markdown/MDX stored in Postgres**, compiled by the public app at build/revalidate time with a small allowlist of custom components (Callout, Figure, ArchDiagram, CodeBlock with Shiki highlighting). Do not build a block-based rich-text engine — that's the page-builder trap wearing a different hat. Editor UX: a CodeMirror-based Markdown editor with live preview. You write in Markdown daily; lean into it.
- **Workflow:** draft → published → archived, with `published_at` controlling visibility and feeds. Slugs are immutable after first publish (SEO); changing one requires an explicit redirect entry.
- **Media pipeline:** admin requests a signed upload signature from the API → browser uploads **directly to Cloudinary** (files never transit your 512 MB Render dyno) → admin posts the resulting asset metadata back → API validates (type/size/ownership) and stores it with mandatory alt text and a blur placeholder. Public site renders via `next/image` with a Cloudinary loader (`f_auto`, `q_auto`, responsive widths).
- **Editing safety:** optimistic-locking via an `updated_at`/version check on writes (a stale admin tab shouldn't silently clobber), and every mutation audit-logged.

---

## 7. Authentication & authorization

**The honest baseline first:** for one admin on one API, classic server-side sessions — an opaque token in an httpOnly cookie, state in Redis — are simpler and at least as secure as JWTs. JWTs earn their keep when multiple services must verify identity statelessly. You're choosing JWTs as a demonstration; fine — but then the implementation must be the textbook-correct version, because a sloppy JWT setup is *worse* than sessions and interviewers know the failure modes. The spec:

- **Password auth:** Argon2id with OWASP-recommended parameters (e.g., ~19 MiB memory, t=2, p=1 as the floor; tune upward until verification costs ~100–250 ms on the Render dyno). Constant-time comparison, no username enumeration (identical error + timing for unknown email vs. wrong password).
- **Two-factor:** TOTP (pyotp), enrolled at first login, with hashed one-time recovery codes. For a single-admin panel this is disproportionate value for ~a day of work. (Passkeys/WebAuthn: attractive Phase-3 upgrade, not v1.)
- **Access token:** short-lived JWT (~15 min), HS256 with a strong secret (single verifier — asymmetric keys buy nothing here; say so in the writeup). Claims: `sub`, `role`, `jti`, `iat`, `exp`, `iss`, `aud`. Held **in JS memory only** in the admin SPA — never localStorage, never a non-httpOnly cookie. Sent as a Bearer header.
- **Refresh token:** opaque 256-bit random value, stored **hashed** (SHA-256) in Postgres, delivered as an httpOnly, `Secure`, `SameSite=Strict` cookie **path-scoped to the refresh endpoint only**. Lifetime ~14 days, **rotated on every use**. Each token belongs to a *family* (one per login/device); if a rotated (already-used) token is ever presented again, that's theft-or-race — revoke the entire family, audit-log it, and force re-login. This rotation + reuse-detection design is the part worth building and the part worth writing about.
- **Silent session resume:** on admin load, call refresh; if the cookie is valid you get a fresh access token without a login screen.
- **CSRF:** `SameSite=Strict` plus hard Origin/Referer validation on the refresh and all state-changing endpoints. Access-token-in-header requests are not CSRF-forgeable by construction.
- **Why the custom domain is load-bearing:** `admin.divyamtyagi.dev` → `api.divyamtyagi.dev` is a *same-site* request, so the httpOnly refresh cookie flows under `SameSite=Strict`. `something.vercel.app` → `something.onrender.com` is cross-site; modern third-party-cookie blocking breaks it in ways that look like random logout bugs. Buy the domain first.
- **Abuse controls:** per-IP and per-account login rate limits with exponential backoff and temporary lockout (Redis); all auth events (login success/failure, refresh, rotation-reuse, lockout, 2FA failure) audit-logged with IP and user agent; an "active sessions" screen in admin listing token families with per-device revoke and revoke-all.
- **Authorization:** a FastAPI dependency chain — `current_user` → `require_role('admin')` — applied at the router level for the entire admin surface. Public read endpoints are anonymous. That's the whole RBAC story for v1, implemented cleanly.
- **CORS:** exact-origin allowlist (`admin` subdomain + localhost dev), `credentials` allowed, no wildcards, preflight cached.

---

## 8. Database schema

Conventions: UUIDv7 primary keys (time-ordered — index-friendly, and a nice talking point); `timestamptz` for all times; `created_at`/`updated_at` on every table; `citext` for email; soft-delete only via content `status = archived` (blanket `deleted_at` columns are a smell — auditability comes from the audit log, not tombstones everywhere); Alembic owns all DDL, autogenerate always hand-reviewed.

| Table | Purpose & key columns |
|---|---|
| `users` | id, email (citext, unique), password_hash, role (enum: admin), totp_secret (encrypted), totp_enabled, recovery_codes_hash[], is_active, last_login_at |
| `auth_sessions` | Refresh-token families. id, user_id FK, family_id, token_hash (unique), issued_at, expires_at, rotated_at, revoked_at, replaced_by_id, ip, user_agent. Partial index on active tokens. |
| `projects` | id, slug (unique, immutable post-publish), title, summary, body_mdx (case study), status (draft/published/archived), featured, sort_order, tech_stack text[], links jsonb ({github, live, docs}), metrics jsonb (headline numbers), cover_media_id FK, seo_title, seo_description, published_at. Partial index on status='published'; GIN on tech_stack. |
| `posts` | id, slug (unique), title, excerpt, body_mdx, status, cover_media_id FK, reading_time_minutes (computed on save), seo fields, published_at, canonical_url (nullable, for cross-posting). |
| `tags` + `post_tags` | Real m2m (not text[]) because tag pages are SEO surface and need their own slugs/descriptions. |
| `experience` | company, title, location, start_date, end_date (null = present), summary_mdx, highlights jsonb, sort_order. |
| `skills` | name, category (enum: languages/frameworks/infra/ai), sort_order. **No proficiency percentages** — skill bars are noise and everyone senior knows it. |
| `media_assets` | id, cloudinary_public_id (unique), url, width, height, format, bytes, alt (NOT NULL — enforced accessibility), blur_data, created_by FK. |
| `site_settings` | Singleton (enforced) row of jsonb: headline, about_mdx, availability status, socials, resume_media_id, SEO defaults, feature flags. |
| `contact_messages` | name, email, message, status (new/read/replied/spam), turnstile_score, ip_hash (salted — don't store raw IPs longer than needed), user_agent. |
| `audit_logs` | Append-only: id, actor_id (nullable FK, `ON DELETE SET NULL`), action ("project.publish"), entity_type, entity_id, changes jsonb (before/after diff of changed fields, secrets excluded), request_id, ip, user_agent, created_at. No update/delete paths exist in the API. Index (entity_type, entity_id) and (created_at). |
| `redirects` | from_path (unique) → to_path, status_code — the escape hatch for the rare slug change; consumed by the public app at build. |

Phase 3 adds: `rag_documents` / `rag_chunks` (with a pgvector `embedding` column + HNSW index) and a `view_counts` table if you want post-view badges. Not in v1 migrations.

Deliberately absent: `roles`/`permissions` tables (§2), analytics tables (§2), comments (§2).

---

## 9. API design

- Versioned base path `/api/v1`; resource-oriented REST; plural nouns; no RPC-ish verbs except explicit workflow actions (`POST /projects/{id}/publish` is clearer than overloading PATCH).
- Public read surface (consumed by the build/ISR): list + detail for published projects, posts, tags, experience, skills, settings; feed and sitemap data. Cache-friendly and anonymous. Admin surface: full CRUD + workflow + media signatures + sessions + audit-log listing.
- **Errors:** RFC 9457 problem+json envelope everywhere — `type`, `title`, `status`, `detail`, plus `request_id`. Consistent error shape is the cheapest "this team is serious" signal an API can send.
- **Pagination:** cursor-based (keyset on UUIDv7/`published_at`) — do it properly once; offset pagination is the thing you'd be embarrassed to defend in an interview.
- Separate Pydantic read/write schemas per entity; secrets and internal fields can never leak because they simply aren't in the read models.
- Request IDs in/out via header, bound to logs and audit entries. Body size limits. `/healthz` (liveness, also the keep-warm target) and `/readyz` (checks Postgres + Redis).
- OpenAPI is curated (titles, descriptions, examples) because it's public documentation of the exhibit, and it drives the generated TS client (§4). FastAPI's auto-docs stay enabled — they're part of the show.

---

## 10. Repository & folder structure

One monorepo (`pnpm` workspaces for JS; `uv` inside the API — Turborepo optional, likely unnecessary at this size). Atomic commits across contract changes, one CI, one place for a hiring manager to read.

```
portfolio/
├── apps/
│   ├── web/                     # Public site — Next.js, SSG/ISR
│   │   └── src/
│   │       ├── app/             # (site)/ routes: home, projects/[slug], writing/[slug],
│   │       │                    # tags/[slug], resume, colophon("how this site works"),
│   │       │                    # api/revalidate (secured webhook), api/draft, sitemap, robots, feed, og
│   │       ├── components/      # ui/ (restyled shadcn), sections/, mdx/ (allowlisted components)
│   │       ├── lib/             # api client wrapper, seo/jsonld helpers, cloudinary loader
│   │       └── content/         # mdx compile pipeline config
│   ├── admin/                   # Vite + React SPA
│   │   └── src/
│   │       ├── routes/          # dashboard, projects, posts, experience, skills,
│   │       │                    # media, messages, settings, sessions, audit-log, login
│   │       ├── features/        # feature folders: components + hooks + forms per entity
│   │       └── lib/             # auth (in-memory token, silent refresh), query client
│   └── api/                     # FastAPI
│       ├── src/app/
│       │   ├── core/            # config, security, db, redis, logging, rate_limit, errors
│       │   ├── modules/         # domain-oriented, not layer-oriented:
│       │   │   ├── auth/        #   router / service / schemas / models per module
│       │   │   ├── content/     #   projects, posts, tags, experience, skills, settings
│       │   │   ├── media/
│       │   │   ├── contact/
│       │   │   └── audit/
│       │   └── main.py-level wiring (app factory, middleware, router registry)
│       ├── alembic/             # migrations + reviewed autogenerations + seed data migration
│       ├── tests/               # mirrors modules/; conftest with real-Postgres fixtures
│       └── Dockerfile
├── packages/
│   └── api-client/              # generated TS types+client from OpenAPI (CI-enforced, never hand-edited)
├── infra/                       # docker-compose (local pg+redis), backup workflow docs
├── .github/workflows/           # ci, deploy hooks, nightly-backup, lighthouse-ci
└── docs/                        # THIS document, ADRs (adr/0001-static-first.md, ...), runbooks
```

Domain-oriented API modules (auth/content/media each owning router+service+schemas+models) beat `routers/`-`services/`-`models/` layer folders: features change together, and it's the structure that scales to real products — which is the story you're telling. Keep lightweight ADRs in `docs/adr/` from day one; they're 15 minutes each and the best interview artifact this project will produce.

---

## 11. Deployment, environments, operations

**Topology (all free except the domain):**

| Concern | Service | Free-tier reality (verify at signup — these shift) |
|---|---|---|
| Public site | Vercel Hobby | Generous static/ISR hosting; Hobby is for non-commercial use — a personal portfolio qualifies. Preview deploys per PR. |
| Admin SPA | Vercel Hobby (second project, same repo) | Static SPA; trivially within limits. |
| API | Render free web service (Dockerfile) | 750 instance-hrs/month — exactly enough for **one** always-on service (744 hrs in a 31-day month); sleeps after 15 min idle, 30–60 s cold start; 512 MB; ephemeral disk (fine — API is stateless); custom domain + TLS included. |
| Postgres | Neon free | ~0.5 GB storage, ~100 CU-hrs/mo compute, autosuspend ~5 min, pooled connections, pgvector, branching (use a branch as your staging DB — free and genuinely great). |
| Redis | Upstash free | ~500K commands/month — orders of magnitude above this workload. |
| Media | Cloudinary free | 25 credits/month — ample. |
| Monitoring | UptimeRobot free + Sentry free | 5-minute checks; Sentry on all three apps. |

**Domains:** `divyamtyagi.dev` (web), `admin.` (admin), `api.` (API). DNS at the registrar or free Cloudflare in DNS-only mode (don't proxy Vercel).

**Cold-start posture:** UptimeRobot pinging `/healthz` every 5 minutes keeps the single Render service warm essentially 24/7 within the 750-hour budget. Treat this as an optimization, not a guarantee — the architecture already makes cold starts invisible to visitors (Decision 1), and the two runtime widgets degrade gracefully. Document the workaround honestly in the colophon; pretending free tier is an SLA is the kind of thing that reads badly.

**CI/CD (GitHub Actions):** on PR — lint (ruff/eslint), typecheck (mypy/tsc), API tests against a real Postgres service container, client-generation drift check, builds, Lighthouse CI budget on the web preview. On merge to main — deploy API to Render (deploy hook) with Alembic migrations run as the release step (expand-and-contract for anything destructive), then Vercel deploys. Pin action versions; Dependabot/Renovate on; `pip-audit`/`npm audit` in CI.

**Environments:** local (docker-compose Postgres+Redis, mirrors prod versions) and production. A separate staging deployment is over-engineering at this scale; Neon branches + Vercel preview deploys cover the need. Config strictly via environment variables (12-factor), per-platform secret stores, distinct secrets per environment, documented rotation.

**Backups:** nightly GitHub Actions `pg_dump` → encrypted artifact (or a free R2 bucket), 30-day retention, plus a **quarterly restore drill** into a Neon branch. Untested backups don't exist.

**Free-tier risk management:** the only hard exit ramps are Render (→ $7/mo starter kills sleep entirely) and Neon (→ paid usage is now minimum-free). Nothing in this architecture couples to a provider — Postgres is Postgres, Redis is Redis, the API is a Docker image — so migration is an afternoon, and that portability is itself a design goal worth stating.

---

## 12. Animation & "premium" strategy

Brutal honesty first: **premium is restraint**, not motion volume. Sites that feel expensive get there through typography (one excellent variable font, self-hosted via `next/font`, tight scale), spacing discipline, a confident palette (a considered dark theme with one accent), and a small number of perfect interactions. Scroll-jacked, parallax-everything portfolios read as junior. Your differentiator is an *engineer's* aesthetic: precise, fast, quietly confident.

Policy:

- **Performance budget is the constraint animations live inside:** LCP < 2.0 s (4G), CLS ≈ 0, INP < 200 ms, first-load JS on public pages < ~150 KB gzipped. Lighthouse CI enforces it; an animation that breaks the budget is cut, not optimized around.
- **The LCP trap, named explicitly:** never gate the hero's headline behind JS-driven entrance animation (`opacity: 0` until hydration). It wrecks LCP and looks broken on slow connections. The LCP element renders visible; entrances use CSS animation or animate *other* elements.
- **Tooling hierarchy:** CSS transitions/keyframes and native CSS scroll-driven animations first (zero JS); **Motion** (the Framer Motion successor) for micro-interactions, layout transitions, and the one or two signature moments; View Transitions API for page-to-page polish where supported. GSAP removed; Lenis off by default (§2).
- **One signature piece** beats ten effects. Recommendation: an interactive, animated architecture diagram of this very site on the colophon page — request paths lighting up, publish-flow replay. It's a motion showpiece that also communicates engineering, which generic hero particles never will.
- **Accessibility:** every animation respects `prefers-reduced-motion` with a designed (not broken) static state; nothing conveys meaning through motion alone.
- Lazy-load anything animation-heavy below the fold; the shadcn base gets deliberately restyled (radii, shadows, type scale, density) so the site doesn't look like every 2025 template.

---

## 13. SEO strategy

**Technical (solved by architecture):** every public page pre-rendered (SSG/ISR — crawlers get full HTML, no client-side content gaps); semantic HTML with one `h1` per page; per-page Metadata API titles/descriptions; canonical URLs with one enforced host form (choose apex, 301 `www`); `sitemap.xml` and `robots.txt` generated from the same content the pages use; RSS/Atom feed; dynamic OG images per project/post via Next's ImageResponse (branded template + title — dramatically better link-share CTR); JSON-LD: `Person` (with `sameAs` → GitHub/LinkedIn) on home, `BlogPosting` on posts, `BreadcrumbList` on nested pages; Core Web Vitals green by budget (§12); `redirects` table honored so slugs never 404. The **admin subdomain is fully noindexed** (robots + `X-Robots-Tag`) and never linked from the public site. Cheap on-brand extra: an `llms.txt`. Register Google Search Console + Bing on day one.

**Content (the part that actually ranks):** your homepage will rank for "Divyam Tyagi" and little else — that's normal. Organic discovery comes from posts and case studies targeting specific long-tail technical queries where you have genuine authority ("evaluating RAG retrieval in production", "semantic caching for LLM APIs with Redis", "FastAPI + pgvector patterns"). Internal-link posts ↔ related case studies. Depth beats cadence, but cadence matters: the roadmap reserves recurring time for writing because **content is the SEO strategy; everything above is just not sabotaging it.**

---

## 14. Security practices

Layered checklist; OWASP ASVS L1→L2 is the reference bar. Auth specifics live in §7.

- **Transport & headers (both frontends + API):** HSTS with preload; strict CSP — nonce-based on the public site if feasible, at minimum default-src 'self' with an explicit allowlist (Cloudinary, analytics), and a *tight* CSP on the admin where inline-style pressure is lower; `frame-ancestors 'none'`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; minimal `Permissions-Policy`.
- **API:** exact-origin CORS with credentials (§7); Pydantic validation on every input including query params; dedicated read schemas so sensitive fields can't serialize; parameterized queries only (SQLAlchemy — never string-built SQL, including in future search); request body size caps; upload constraints enforced server-side even though files go direct to Cloudinary (signed params pin folder/type/size); Turnstile verification server-side; rate limiting as sliding windows in Redis with per-route policies (login 5/15 min/IP + per-account, contact 3/hr/IP, sane global default) returning 429 + `Retry-After`; SSRF non-exposure (the API fetches no user-supplied URLs — keep it that way).
- **Secrets & supply chain:** env-only secrets, per-environment values, rotation runbook in `docs/`; lockfiles committed; Renovate/Dependabot; `pip-audit` + `npm audit` gating CI; GitHub Actions pinned to SHAs; branch protection on main.
- **Audit & response:** append-only audit log (§8) covering every mutation and every auth event; Sentry alerting on error spikes and on the refresh-reuse event specifically (that one is a potential incident, not a bug); an "active sessions" kill switch in admin; backup + tested restore (§11) as the ransomware/oops recovery story.
- **Anti-goals, stated so they don't creep in:** no security theater (secret admin URLs, IP allowlists you'll fight from every café), and no pretending a free tier survives a real DDoS — the honest mitigation is that the public site is static on a CDN and the API rate-limits to protect Neon.
- **Privacy:** salted-hash IPs in contact/audit records with a retention window; no third-party trackers; a one-paragraph privacy note in the footer. Cheap, classy, increasingly expected.

---

## 15. Testing & quality gates

Pragmatic pyramid — coverage where bugs are expensive, not coverage for its own sake:

- **API (the bulk):** pytest + async httpx client against **real Postgres** (docker-compose locally, service container in CI — not SQLite; dialect drift is where fake confidence comes from). Exhaustive tests on the auth state machine — login, lockout, refresh rotation, **family revocation on reuse**, expiry, 2FA — because they're the highest-risk code and, frankly, the best interview material in the repo. Content workflow tests (draft invisibility on public endpoints, publish → webhook fired, slug immutability), audit-log emission on mutations, rate-limit behavior with a Redis test instance.
- **Contract:** CI regenerates the TS client and fails on uncommitted drift — the frontends can't silently disagree with the API.
- **Frontends:** typecheck as the first line; a handful of Playwright smoke tests (home renders with content, a case study renders MDX, feed/sitemap valid, admin login → edit → publish → public page updated); Lighthouse CI budgets (§12) as a hard gate.
- **Skip:** unit tests of shadcn wrappers, snapshot sprawl, 100%-coverage chasing.

## 16. Observability

Structured JSON logs (structlog) with request IDs end-to-end; Sentry on web, admin, and API (releases tagged from CI so errors map to deploys); UptimeRobot on `/healthz` and the homepage; Vercel Analytics for traffic. The colophon's live-status widget doubles as public observability. Skip Prometheus/Grafana — real answer at this scale is "Sentry + logs + uptime checks," and knowing *when* that's the right answer is the senior skill.

---

## 17. Roadmap

Phases are gated by exit criteria, not dates; the estimates assume focused part-time work. The ordering is deliberate: content → read path → public launch → auth/admin → flagship extras. You launch publicly at the end of Phase 2, *before* the admin exists, because the site's job-hunting value shouldn't wait on CRUD screens.

**Phase 0 — Foundations & content (≈1 week).** Buy the domain. Scaffold the monorepo, CI skeleton, docker-compose, design tokens (font, palette, spacing, dark theme). **Write the v1 content in Markdown**: about, experience, both case studies with real metrics, résumé. This is the phase people skip and then stall on — copy is the bottleneck, not code. *Exit:* content drafts complete; empty deploys green on all three platforms; ADR-0001 (static-first) written.

**Phase 1 — API read path + schema (≈1–2 weeks).** Alembic schema (§8), seed-data migration carrying the Phase-0 content, public read endpoints, problem+json errors, request-ID logging, health endpoints, OpenAPI polish, generated TS client, API tests + CI green, Render deploy + keep-warm + Sentry. No auth yet — there's nothing to protect. *Exit:* documented public API serving your real content in production.

**Phase 2 — Public site + launch (≈2–3 weeks).** All public pages as SSG/ISR against the API; MDX pipeline; full SEO plumbing (§13); contact form with Turnstile; performance budget enforced; accessibility pass; colophon v1 (architecture writeup + repo link + basic live status); nightly backups live. **Launch:** domain live, Search Console submitted, repo public, LinkedIn/GitHub updated. *Exit:* Lighthouse ≥ 95 across the board on real pages; a recruiter link you're proud of.

**Phase 3 — Auth + admin (≈2–3 weeks).** Full §7 auth (Argon2id, JWT + rotating refresh with reuse detection, TOTP, lockout, sessions screen), admin SPA CRUD for every content type, direct-to-Cloudinary media flow, publish → revalidation webhook, draft preview, audit-log viewer. *Exit:* you publish a new post end-to-end from the admin with zero deploys, and the rotation-reuse test suite passes.

**Phase 4 — Flagship & compounding (ongoing).** "Ask my portfolio" RAG demo with hard cost caps (pgvector, hybrid retrieval, Redis semantic cache, streaming, per-IP budget) plus an honest eval writeup — the demo *and* the post about building it. Then cadence: one substantial post/month, quarterly restore drill, dependency updates, and a standing rule that any new feature idea gets an ADR before code. Candidates for later, only if pulled by need: Postgres full-text search across posts, passkeys, view counters.

**Top risks:** (1) *Scope creep* — this document is the contract; new scope requires an ADR arguing against it first. (2) *Content stall* — mitigated by Phase 0 ordering and the monthly writing slot; a beautiful empty site is the most common portfolio failure. (3) *Free-tier drift* — providers change terms (Railway just did); the stack is deliberately portable (§11), review quarterly. (4) *RAG demo cost surprise* — caps designed before launch, kill switch in site_settings.

---

## 18. Open questions for you

1. Domain name — `divyamtyagi.dev` or an alternative? (Blocks Phase 0.)
2. Do DocuMind and TweetGenerator have shareable metrics (latency, scale, cost, accuracy) and public/demo links? Case-study quality hinges on this.
3. Design direction: 2–3 reference sites whose *restraint* you admire, so "premium" is defined before pixels.
4. Region preference for API/DB/Redis colocation — Singapore (closest to you as the only latency-sensitive user) is the default recommendation; visitors are unaffected either way.
5. Will you commit to the monthly writing cadence? If honestly no, we should trim the blog to a "notes" section now rather than shipping a graveyard.
6. Repo public from day one (recommended — it enforces hygiene) or public at Phase 2 launch?
