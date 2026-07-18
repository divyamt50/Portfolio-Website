import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  const repo = process.env.NEXT_PUBLIC_REPO_URL;
  return (
    <footer className="border-t border-line-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-10 font-mono text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {site.name} · Noida, India{site.email && <> · {site.email}</>}
        </p>
        <p className="flex gap-5">
          <Link href="/colophon" className="transition-colors hover:text-fg">
            How this site works
          </Link>
          {repo && (
            <a href={repo} className="transition-colors hover:text-fg">
              View source
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}
