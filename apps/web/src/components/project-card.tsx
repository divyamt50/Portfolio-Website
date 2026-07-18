import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-line bg-ink-900 p-6 transition-colors hover:border-fg-faint">
      <h3 className="font-display text-xl text-fg">
        <Link href={`/work/${project.slug}`} className="focus-visible:outline-none">
          {/* Stretched link: whole card is the target */}
          <span className="absolute inset-0" aria-hidden />
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{project.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
        {project.tech_stack.map((t) => (
          <li
            key={t}
            className="rounded-md border border-line-soft bg-ink-800 px-2 py-1 font-mono text-[11px] text-fg-muted"
          >
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-xs text-amber">
        Read case study <span aria-hidden>→</span>
      </p>
    </article>
  );
}
