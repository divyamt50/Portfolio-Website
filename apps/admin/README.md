# Admin dashboard — lands in the auth sprint

Per the architecture doc (docs/portfolio-architecture.md §7, §17 Phase 3):
a Vite + React SPA consuming the FastAPI contract via a generated client.

At $0 (no custom domain), auth cookies work by proxying `/api/*` to Render
through a Vercel rewrite so the refresh cookie is first-party. When a custom
domain is added later, this collapses to plain subdomains with zero rework.
