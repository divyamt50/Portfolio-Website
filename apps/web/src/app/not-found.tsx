import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="font-mono text-xs text-fg-faint">404 · not found</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-fg">
        This route doesn&apos;t resolve.
      </h1>
      <Link
        href="/"
        className="mt-8 rounded-md border border-line px-4 py-2 font-mono text-xs text-fg transition-colors hover:border-fg-faint"
      >
        ← Back home
      </Link>
    </main>
  );
}
