import Link from "next/link";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/colophon", label: "Colophon" },
];

export function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
      <Link
        href="/"
        className="font-mono text-sm text-fg transition-colors hover:text-amber"
        aria-label="Divyam Tyagi — home"
      >
        <span className="text-amber">~</span>/divyam-tyagi
      </Link>
      <nav aria-label="Primary">
        <ul className="flex items-center gap-5 font-mono text-xs text-fg-muted sm:gap-7">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="rounded-md border border-amber/40 px-3 py-1.5 text-amber transition-colors hover:bg-amber/10"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
