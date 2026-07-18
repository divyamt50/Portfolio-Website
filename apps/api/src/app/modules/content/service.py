from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.content.models import (
    ContentStatus,
    Experience,
    Post,
    Project,
    SiteSettings,
    Skill,
)


async def list_projects(db: AsyncSession) -> list[Project]:
    rows = await db.scalars(
        select(Project)
        .where(Project.status == ContentStatus.published)
        .order_by(Project.featured.desc(), Project.sort_order, Project.published_at.desc())
    )
    return list(rows)


async def get_project(db: AsyncSession, slug: str) -> Project:
    row = await db.scalar(
        select(Project).where(Project.slug == slug, Project.status == ContentStatus.published)
    )
    if row is None:
        raise HTTPException(404, "Project not found")
    return row


async def list_posts(db: AsyncSession) -> list[Post]:
    rows = await db.scalars(
        select(Post)
        .where(Post.status == ContentStatus.published)
        .order_by(Post.published_at.desc())
    )
    return list(rows)


async def get_post(db: AsyncSession, slug: str) -> Post:
    row = await db.scalar(
        select(Post).where(Post.slug == slug, Post.status == ContentStatus.published)
    )
    if row is None:
        raise HTTPException(404, "Post not found")
    return row


async def list_experience(db: AsyncSession) -> list[Experience]:
    rows = await db.scalars(
        select(Experience).order_by(Experience.sort_order, Experience.start_date.desc())
    )
    return list(rows)


async def list_skills(db: AsyncSession) -> list[Skill]:
    rows = await db.scalars(select(Skill).order_by(Skill.category, Skill.sort_order, Skill.name))
    return list(rows)


async def get_settings_row(db: AsyncSession) -> dict:
    row = await db.scalar(select(SiteSettings).where(SiteSettings.id == 1))
    return row.data if row else {}
