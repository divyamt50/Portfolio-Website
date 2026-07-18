import type { Experience } from "@/lib/types";

// Source of truth: Divyam_s_Resume.pdf (July 2026). Numbers are his stated claims.
export const experience: Experience[] = [
  {
    company: "Irish Taylor",
    title: "Software Development Engineer II · Backend Lead",
    location: "Remote / India",
    period: "Sept 2023 — Present",
    highlights: [
      "Lead a team of 7 backend engineers building a large-scale RAG platform — architecture, API design, code review, and delivery.",
      "Cut p95 API latency 42% across async FastAPI services handling 10,000+ requests/day through profiling, async optimization, and database tuning.",
      "Built multi-level Redis caching, Celery workers, and intelligent rate limiting that absorbed 4× traffic growth on the same infrastructure.",
      "Reduced slow-query execution time 61% via indexing strategy, query optimization, and connection pooling.",
    ],
  },
  {
    company: "Independent Backend Consultant",
    title: "Backend Engineer",
    location: "Remote",
    period: "May 2021 — Sept 2023",
    highlights: [
      "Delivered backend systems and REST APIs for 6+ clients in Python and FastAPI, cutting manual operational effort by roughly 70%.",
      "Integrated payment gateways, CRM platforms, and third-party business APIs; shipped containerized deployments with Docker.",
    ],
  },
];
