import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { Trace } from "@/components/trace";
import { getExperience, getPosts, getProjects, getSite, getSkills } from "@/lib/content";

const CATEGORY_LABELS: Record<string, string> = {
  ai: "AI systems",
  infra: "Infrastructure",
  frameworks: "Frameworks",
  languages: "Languages",
};

export default async function Home() {
  const [site, projects, skills, posts, experience] = await Promise.all([
    getSite(),
    getProjects(),
    getSkills(),
    getPosts(),
    getExperience(),
  ]);

  const grouped = Object.entries(
    skills.reduce<Record<string, string[]>>((acc, s) => {
      (acc[s.category] ??= []).push(s.name);
      return acc;
    }, {}),
  ).sort(([a], [b]) => Object.keys(CATEGORY_LABELS).indexOf(a) - Object.keys(CATEGORY_LABELS).indexOf(b));

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || site.socials.email;
  const contactHref = email ? `mailto:${email}` : site.socials.linkedin ?? "#";
  const contactLabel = email ? "Email me" : "Message me on LinkedIn";

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "AI Backend Engineer",
    description: site.headline,
    address: { "@type": "PostalAddress", addressLocality: "Noida", addressCountry: "IN" },
    email: site.email ? `mailto:${site.email}` : undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: [site.socials.github, site.socials.linkedin].filter(Boolean),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Hero — the LCP element renders visible; only decoration animates. */}
      <section className="mx-auto grid w-full max-w-5xl gap-12 px-5 pt-10 pb-16 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
        <div>
          {/* <p className="relative flex items-center gap-2.5 font-mono text-xs text-fg-muted">
            <span className="pulse-dot relative inline-block size-1.5 rounded-full bg-amber" aria-hidden />
            {site.availability}
          </p> */}
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-fg sm:text-6xl">
            {site.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {site.headline}
          </p>
          <p className="mt-6 font-mono text-xs text-fg-faint">
            {site.location}
            {site.email && <> · {site.email}</>}
          </p>
          <p className="mt-8 flex flex-wrap gap-3">
            {site.socials.github && (
              <a
                href={site.socials.github}
                className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
              >
                GitHub
              </a>
            )}
            {site.socials.linkedin && (
              <a
                href={site.socials.linkedin}
                className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
              >
                LinkedIn
              </a>
            )}
            {site.resume_url && (
              <a
                href={site.resume_url}
                download
                className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
              >
                Download résumé
              </a>
            )}
            <a
              href="#contact"
              className="rounded-md bg-amber px-4 py-2 font-mono text-xs text-ink-950 transition-opacity hover:opacity-90"
            >
              Get in touch
            </a>
          </p>
        </div>
        <div className="reveal" style={{ ["--d" as string]: "120ms" }}>
          <Trace />
        </div>
      </section>

      <Section id="about" eyebrow="about" title="Production AI, not demos">
        <div className="max-w-2xl space-y-4 text-base leading-relaxed text-fg-muted">
          {site.about_mdx.split("\n\n").map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Section>

      <Section id="work" eyebrow="selected work" title="Systems I've built">
        <div className="grid gap-5 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>

      {experience.length > 0 && (
        <Section id="experience" eyebrow="experience" title="Where I've done it">
          <ol className="space-y-12">
            {experience.map((role) => (
              <li
                key={`${role.period}`}
                className="grid gap-3 lg:grid-cols-[16rem_1fr] lg:gap-8"
              >
                <div>
                  <p className="mt-1 text-sm text-fg-muted">{role.title}</p>
                  <p className="mt-2 font-mono text-xs text-fg-faint">
                    {role.period}
                    {role.location && <> · {role.location}</>}
                  </p>
                </div>
                <ul className="max-w-2xl space-y-2.5 text-sm leading-relaxed text-fg-muted">
                  {role.highlights.map((h) => (
                    <li key={h.slice(0, 32)} className="flex gap-3">
                      <span
                        className="mt-2 inline-block size-1 shrink-0 rounded-full bg-cyan/70"
                        aria-hidden
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section id="capabilities" eyebrow="capabilities" title="What I work with">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {grouped.map(([category, names]) => (
            <div key={category}>
              <h3 className="font-mono text-xs tracking-wider text-fg-faint uppercase">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-fg-muted">
                {names.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {posts.length > 0 && (
        <Section id="writing" eyebrow="writing" title="Notes from production">
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.slug} className="text-fg-muted">
                {post.title}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="contact" eyebrow="contact" title="Let's talk infrastructure">
        <p className="max-w-xl text-base leading-relaxed text-fg-muted">
          Hiring for a backend or AI infrastructure role — or want a second pair of eyes on a
          RAG system that isn't behaving in production? I'm open to remote roles across the
          US, Europe, Australia, and the Gulf, and hybrid in NCR.
        </p>
        <p className="mt-8">
          <a
            href={contactHref}
            className="inline-block rounded-md bg-amber px-5 py-2.5 font-mono text-sm text-ink-950 transition-opacity hover:opacity-90"
          >
            {contactLabel}
          </a>
        </p>
        {(site.email || site.phone) && (
          <p className="mt-6 font-mono text-xs text-fg-faint">
            {site.email}
            {site.email && site.phone && " · "}
            {site.phone}
          </p>
        )}
      </Section>
    </main>
  );
}
