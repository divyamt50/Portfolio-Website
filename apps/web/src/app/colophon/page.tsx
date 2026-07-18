import type { Metadata } from "next";
import { contentSource } from "@/lib/content";

export const metadata: Metadata = {
  title: "Colophon — how this site works",
  description:
    "The architecture behind this site: a static Next.js front served from a CDN, fed by a FastAPI control plane.",
};

export default function Colophon() {
  const apiDocs = process.env.NEXT_PUBLIC_API_DOCS_URL;
  const repo = process.env.NEXT_PUBLIC_REPO_URL;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-4xl tracking-tight text-fg sm:text-5xl">
        How this site works
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-fg-muted">
        <p>
          This site is itself a small production system, built the way I build backends. The
          page you&apos;re reading was generated ahead of time and is served entirely from a
          CDN edge — no server was woken up to render it, which is why it&apos;s fast from
          anywhere.
        </p>
        <p>
          Behind it sits a FastAPI control plane: PostgreSQL for content, Alembic-managed
          migrations, structured JSON logging with request IDs, RFC 9457 problem+json errors,
          and an append-only audit log. Publishing content triggers a signed revalidation
          webhook, and the CDN picks up the new pages within seconds. Visitors never wait on
          the backend; only I do.
        </p>
        <p>
          The front end is Next.js with the App Router, Tailwind, and three typefaces doing
          three jobs — Bricolage Grotesque for display, Geist for reading, IBM Plex Mono for
          data. Animation is CSS only, respects reduced-motion preferences, and never gates
          the largest contentful paint.
        </p>
        <p className="font-mono text-xs text-fg-faint">
          content source: {contentSource === "api" ? "FastAPI control plane" : "static build"}
        </p>
      </div>

      {(repo || apiDocs) && (
        <p className="mt-10 flex flex-wrap gap-3">
          {repo && (
            <a
              href={repo}
              className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
            >
              Read the source
            </a>
          )}
          {apiDocs && (
            <a
              href={apiDocs}
              className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
            >
              API documentation
            </a>
          )}
        </p>
      )}
    </main>
  );
}
