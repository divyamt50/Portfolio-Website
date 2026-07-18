import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <p className="flex items-center gap-2 font-mono text-xs tracking-wider text-fg-faint uppercase">
        <span className="inline-block size-1.5 rounded-full bg-cyan/70" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl tracking-tight text-fg sm:text-4xl">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}
