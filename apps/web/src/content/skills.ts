import type { Skill } from "@/lib/types";

// Curated from the résumé — strongest signals for the AI-infrastructure story.
// The full list lives in the downloadable résumé.
export const skills: Skill[] = [
  { name: "Python", category: "languages" },
  { name: "SQL", category: "languages" },
  { name: "JavaScript", category: "languages" },
  { name: "Bash", category: "languages" },
  { name: "FastAPI", category: "frameworks" },
  { name: "SQLAlchemy 2.0", category: "frameworks" },
  { name: "Pydantic v2", category: "frameworks" },
  { name: "AsyncIO", category: "frameworks" },
  { name: "RAG", category: "ai" },
  { name: "Vector search & embeddings", category: "ai" },
  { name: "Semantic caching", category: "ai" },
  { name: "Model routing", category: "ai" },
  { name: "LLM evaluation", category: "ai" },
  { name: "LangChain & LangGraph", category: "ai" },
  { name: "Prompt engineering", category: "ai" },
  { name: "OpenAI & Gemini APIs", category: "ai" },
  { name: "PostgreSQL", category: "infra" },
  { name: "Redis", category: "infra" },
  { name: "pgvector", category: "infra" },
  { name: "Celery", category: "infra" },
  { name: "Docker", category: "infra" },
  { name: "GitHub Actions", category: "infra" },
  { name: "AWS (EC2 · S3 · ECS)", category: "infra" },
  { name: "WebSockets & SSE", category: "infra" },
  { name: "Distributed systems", category: "infra" },
  { name: "Linux", category: "infra" },
];
