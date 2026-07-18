import type { CSSProperties } from "react";

// The thesis of the page: this is what Divyam builds all day.
// Numbers are illustrative (captioned as such) — the shape is the point.
const TOTAL = 412;

type Span = { label: string; start: number; ms: number; note?: string; hot?: boolean };

const SPANS: Span[] = [
  { label: "gateway", start: 0, ms: 2 },
  { label: "semantic-cache", start: 2, ms: 3, note: "miss" },
  { label: "embed", start: 5, ms: 38 },
  { label: "vector-search", start: 43, ms: 54, note: "pgvector" },
  { label: "rerank", start: 97, ms: 61 },
  { label: "llm · routed", start: 158, ms: 248, note: "streamed", hot: true },
  { label: "first-token", start: 164, ms: 6, hot: true },
];

export function Trace() {
  return (
    <figure className="w-full">
      <div className="rounded-xl border border-line bg-ink-900 p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-3 font-mono text-xs">
          <span className="text-fg">
            <span className="text-cyan">POST</span> /v1/query
          </span>
          <span className="text-fg-muted">
            <span className="text-fg">200</span> · {TOTAL} ms
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {SPANS.map((s, i) => (
            <div
              key={s.label}
              className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[8.5rem_1fr_5.5rem]"
            >
              <span className="truncate font-mono text-xs text-fg-muted">{s.label}</span>
              <span className="relative h-2.5 overflow-hidden rounded-sm bg-ink-800">
                <span
                  className={`trace-bar absolute inset-y-0 min-w-[3px] rounded-sm ${
                    s.hot ? "bg-amber" : "bg-cyan/70"
                  }`}
                  style={
                    {
                      left: `${(s.start / TOTAL) * 100}%`,
                      width: `${(s.ms / TOTAL) * 100}%`,
                      "--d": `${150 + i * 90}ms`,
                    } as CSSProperties
                  }
                />
              </span>
              <span className="hidden font-mono text-xs text-fg-faint sm:block">
                {s.ms} ms{s.note ? ` · ${s.note}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-xs text-fg-faint">
        The anatomy of a RAG request — illustrative trace of the layer I work in.
      </figcaption>
    </figure>
  );
}
