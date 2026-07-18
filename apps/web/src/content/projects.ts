import type { Project } from "@/lib/types";

// Sources: original brief (DocuMind, TweetGenerator) + Divyam_s_Resume.pdf
// (Synapse, OmniData). Metrics shown are Divyam's own stated numbers from the
// résumé — nothing here is invented by the build.
//
// TODO(divyam): the résumé lists "[Repo]" for Synapse and OmniData but no URLs,
// and DocuMind has no public repo — add links (cards hide the button until then).
// Also decide: is Synapse the same system as DocuMind under another name? If so
// we should merge them into one card before recruiters see both.
export const projects: Project[] = [
  {
    slug: "documind",
    title: "DocuMind",
    summary: "Production-grade RAG platform.",
    featured: true,
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Vector search"],
    links: {},
    metrics: [],
    body_mdx:
      "DocuMind is a production-grade retrieval-augmented generation platform.\n\n**Full case study in progress.** It will cover the ingestion pipeline, retrieval design, caching strategy, and the trade-offs behind them — with real production numbers rather than adjectives.",
  },
  {
    slug: "synapse",
    title: "Synapse",
    summary:
      "AI document intelligence — extraction, summarization, classification, and embedding-based search over enterprise documents.",
    featured: true,
    tech_stack: ["Python", "FastAPI", "OpenAI", "pgvector"],
    links: {},
    metrics: [],
    body_mdx:
      "Synapse is an AI-powered document intelligence platform: it extracts, summarizes, classifies, and searches enterprise documents using embedding-based retrieval.\n\nThe RAG pipeline covers vector embeddings, reranking, structured outputs, token-usage monitoring, rate-limit handling, and asynchronous processing.\n\n**Full case study in progress** — retrieval quality evaluation and cost profile to follow.",
  },
  {
    slug: "omnidata",
    title: "OmniData",
    summary: "High-throughput asynchronous FastAPI microservice.",
    featured: false,
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis"],
    links: {},
    metrics: [{ label: "Avg response time", value: "−48%" }],
    body_mdx:
      "OmniData is an asynchronous FastAPI microservice built around dependency injection, optimized PostgreSQL indexing, and a SQLAlchemy ORM architecture.\n\nAverage API response time dropped 48% through Redis caching, efficient query planning, and asynchronous request processing. The service ships with JWT authentication, structured logging, pagination, filtering, and production-ready API documentation.",
  },
  {
    slug: "tweetgenerator",
    title: "TweetGenerator",
    summary: "LLM content generation platform.",
    featured: false,
    tech_stack: ["Python", "LLM APIs"],
    links: { github: "https://github.com/divyamt50/TweetGenerator" },
    metrics: [],
    body_mdx:
      "TweetGenerator is an LLM-powered content generation platform.\n\n**Full case study in progress.** It will cover prompt design, model selection, and cost control in generation workloads.",
  },
];
