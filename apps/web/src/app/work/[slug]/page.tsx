import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { getProject, getProjects } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-mono text-xs text-fg-faint">
        <Link href="/#work" className="transition-colors hover:text-fg">
          ← Selected work
        </Link>
      </p>
      <h1 className="mt-6 font-display text-4xl tracking-tight text-fg sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-fg-muted">{project.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
        {project.tech_stack.map((t) => (
          <li
            key={t}
            className="rounded-md border border-line-soft bg-ink-800 px-2 py-1 font-mono text-[11px] text-fg-muted"
          >
            {t}
          </li>
        ))}
      </ul>

      {project.metrics.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {project.metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-line bg-ink-900 p-4">
              <dt className="font-mono text-[11px] tracking-wider text-fg-faint uppercase">
                {m.label}
              </dt>
              <dd className="mt-1 font-display text-2xl text-fg">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(project.links.github || project.links.live || project.links.docs) && (
        <p className="mt-8 flex flex-wrap gap-3">
          {project.links.github && (
            <a
              href={project.links.github}
              className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
            >
              Repository
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              className="rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
            >
              Live
            </a>
          )}
        </p>
      )}

      <hr className="mt-10 border-line-soft" />
      <div className="mt-10">
        <Markdown>{project.body_mdx}</Markdown>
      </div>
    </main>
  );
}
