"""Seed the database with launch content. Idempotent: safe to run repeatedly.

Sources: Divyam's brief + Divyam_s_Resume.pdf (July 2026). Metrics are his own
stated numbers from the résumé — nothing is invented here. This file mirrors
apps/web/src/content/* (parity is checked by eye until the generated client
lands; keep them in sync when editing either side).

Run:  python -m app.seed
"""

import asyncio
import datetime as dt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models_registry  # noqa: F401  (full ORM metadata — FKs span modules)
from app.core.db import SessionLocal
from app.modules.content.models import (
    ContentStatus,
    Experience,
    Project,
    SiteSettings,
    Skill,
    SkillCategory,
)

SETTINGS = {
    "name": "Divyam Tyagi",
    "headline": (
        "AI Backend Engineer specialising in Python, FastAPI, and production RAG systems — "
        "building the infrastructure that makes LLMs reliable, fast, and cost-efficient at scale."
    ),
    "about_mdx": (
        "I'm a backend engineer with 4+ years of experience designing and scaling "
        "high-throughput, AI-powered systems in Python. I'm currently a Backend Lead (SDE II) "
        "at Irish Taylor, where I lead a team of 7 engineers building a large-scale RAG "
        "platform — owning the architecture, API design, engineering standards, and delivery."
        "\n\n"
        "My focus is production AI infrastructure: retrieval pipelines, semantic caching, "
        "model routing, and the unglamorous work of making LLM systems fast, observable, "
        "and affordable."
    ),
    "location": "Noida, India",
    "availability": "Open to remote roles — US · Europe · Australia · Gulf",
    "email": "divyamt100@gmail.com",
    "phone": "+91 70373 64942",
    "resume_url": "/resume/Divyam-Tyagi-Resume.pdf",
    "socials": {
        "github": "https://github.com/divyamt50",
        "linkedin": "https://www.linkedin.com/in/divyam-tyagi/",
        "email": "divyamt100@gmail.com",
    },
}

PROJECTS = [
    {
        "slug": "documind",
        "title": "DocuMind",
        "summary": "Production-grade RAG platform.",
        "featured": True,
        "sort_order": 0,
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Redis", "Vector search"],
        "links": {},  # TODO(divyam): no public repo yet — add repo/demo links
        "metrics": [],
        "body_mdx": (
            "DocuMind is a production-grade retrieval-augmented generation platform.\n\n"
            "**Full case study in progress.** It will cover the ingestion pipeline, "
            "retrieval design, caching strategy, and the trade-offs behind them — with "
            "real production numbers rather than adjectives."
        ),
        "status": ContentStatus.published,
    },
    {
        "slug": "synapse",
        "title": "Synapse",
        "summary": (
            "AI document intelligence — extraction, summarization, classification, and "
            "embedding-based search over enterprise documents."
        ),
        "featured": True,
        "sort_order": 1,
        "tech_stack": ["Python", "FastAPI", "OpenAI", "pgvector"],
        "links": {},  # TODO(divyam): résumé says [Repo] but has no URL
        "metrics": [],
        "body_mdx": (
            "Synapse is an AI-powered document intelligence platform: it extracts, "
            "summarizes, classifies, and searches enterprise documents using "
            "embedding-based retrieval.\n\n"
            "The RAG pipeline covers vector embeddings, reranking, structured outputs, "
            "token-usage monitoring, rate-limit handling, and asynchronous processing.\n\n"
            "**Full case study in progress** — retrieval quality evaluation and cost "
            "profile to follow."
        ),
        "status": ContentStatus.published,
    },
    {
        "slug": "omnidata",
        "title": "OmniData",
        "summary": "High-throughput asynchronous FastAPI microservice.",
        "featured": False,
        "sort_order": 2,
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Redis"],
        "links": {},  # TODO(divyam): résumé says [Repo] but has no URL
        "metrics": [{"label": "Avg response time", "value": "−48%"}],
        "body_mdx": (
            "OmniData is an asynchronous FastAPI microservice built around dependency "
            "injection, optimized PostgreSQL indexing, and a SQLAlchemy ORM architecture.\n\n"
            "Average API response time dropped 48% through Redis caching, efficient query "
            "planning, and asynchronous request processing. The service ships with JWT "
            "authentication, structured logging, pagination, filtering, and "
            "production-ready API documentation."
        ),
        "status": ContentStatus.published,
    },
    {
        "slug": "tweetgenerator",
        "title": "TweetGenerator",
        "summary": "LLM content generation platform.",
        "featured": False,
        "sort_order": 3,
        "tech_stack": ["Python", "LLM APIs"],
        "links": {"github": "https://github.com/divyamt50/TweetGenerator"},
        "metrics": [],
        "body_mdx": (
            "TweetGenerator is an LLM-powered content generation platform.\n\n"
            "**Full case study in progress.** It will cover prompt design, model "
            "selection, and cost control in generation workloads."
        ),
        "status": ContentStatus.published,
    },
]

EXPERIENCE = [
    {
        "company": "Irish Taylor",
        "title": "Software Development Engineer II · Backend Lead",
        "location": "Remote / India",
        "start_date": dt.date(2023, 9, 1),
        "end_date": None,
        "sort_order": 0,
        "highlights": [
            "Lead a team of 7 backend engineers building a large-scale RAG platform — "
            "architecture, API design, code review, and delivery.",
            "Cut p95 API latency 42% across async FastAPI services handling 10,000+ "
            "requests/day through profiling, async optimization, and database tuning.",
            "Built multi-level Redis caching, Celery workers, and intelligent rate "
            "limiting that absorbed 4× traffic growth on the same infrastructure.",
            "Reduced slow-query execution time 61% via indexing strategy, query "
            "optimization, and connection pooling.",
        ],
    },
    {
        "company": "Independent Backend Consultant",
        "title": "Backend Engineer",
        "location": "Remote",
        "start_date": dt.date(2021, 5, 1),
        "end_date": dt.date(2023, 9, 1),
        "sort_order": 1,
        "highlights": [
            "Delivered backend systems and REST APIs for 6+ clients in Python and "
            "FastAPI, cutting manual operational effort by roughly 70%.",
            "Integrated payment gateways, CRM platforms, and third-party business APIs; "
            "shipped containerized deployments with Docker.",
        ],
    },
]

SKILLS: list[tuple[SkillCategory, list[str]]] = [
    (SkillCategory.languages, ["Python", "SQL", "JavaScript", "Bash"]),
    (SkillCategory.frameworks, ["FastAPI", "SQLAlchemy 2.0", "Pydantic v2", "AsyncIO"]),
    (
        SkillCategory.ai,
        [
            "RAG",
            "Vector search & embeddings",
            "Semantic caching",
            "Model routing",
            "LLM evaluation",
            "LangChain & LangGraph",
            "Prompt engineering",
            "OpenAI & Gemini APIs",
        ],
    ),
    (
        SkillCategory.infra,
        [
            "PostgreSQL",
            "Redis",
            "pgvector",
            "Celery",
            "Docker",
            "GitHub Actions",
            "AWS (EC2 · S3 · ECS)",
            "WebSockets & SSE",
            "Distributed systems",
            "Linux",
        ],
    ),
]


async def upsert(db: AsyncSession) -> None:
    settings_row = await db.scalar(select(SiteSettings).where(SiteSettings.id == 1))
    if settings_row is None:
        db.add(SiteSettings(id=1, data=SETTINGS))
    else:
        settings_row.data = SETTINGS

    for p in PROJECTS:
        existing = await db.scalar(select(Project).where(Project.slug == p["slug"]))
        published_at = dt.datetime.now(dt.UTC) if p["status"] == ContentStatus.published else None
        if existing is None:
            db.add(Project(**p, published_at=published_at))
        else:
            for k, v in p.items():
                setattr(existing, k, v)
            if existing.published_at is None:
                existing.published_at = published_at

    for e in EXPERIENCE:
        existing = await db.scalar(
            select(Experience).where(
                Experience.company == e["company"], Experience.title == e["title"]
            )
        )
        if existing is None:
            db.add(Experience(**e))
        else:
            for k, v in e.items():
                setattr(existing, k, v)

    order = 0
    for category, names in SKILLS:
        for name in names:
            existing = await db.scalar(
                select(Skill).where(Skill.category == category, Skill.name == name)
            )
            if existing is None:
                db.add(Skill(name=name, category=category, sort_order=order))
            order += 1

    await db.commit()


async def main() -> None:
    async with SessionLocal() as db:
        await upsert(db)
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(main())
