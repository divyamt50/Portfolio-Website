"""Read models only. Sensitive/internal fields cannot leak: they are not defined here."""

import datetime as dt
import uuid

from pydantic import BaseModel, ConfigDict


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class MediaOut(ORM):
    url: str
    alt: str
    width: int | None
    height: int | None
    blur_data: str | None


class Metric(BaseModel):
    label: str
    value: str


class ProjectListItem(ORM):
    slug: str
    title: str
    summary: str
    featured: bool
    tech_stack: list[str]
    links: dict
    metrics: list[Metric]
    cover: MediaOut | None
    published_at: dt.datetime | None


class ProjectDetail(ProjectListItem):
    body_mdx: str
    seo_title: str | None
    seo_description: str | None


class TagOut(ORM):
    slug: str
    name: str


class PostListItem(ORM):
    slug: str
    title: str
    excerpt: str
    reading_time_minutes: int
    tags: list[TagOut]
    published_at: dt.datetime | None


class PostDetail(PostListItem):
    body_mdx: str
    canonical_url: str | None
    seo_title: str | None
    seo_description: str | None


class ExperienceOut(ORM):
    id: uuid.UUID
    company: str
    title: str
    location: str | None
    start_date: dt.date
    end_date: dt.date | None
    summary_mdx: str
    highlights: list


class SkillOut(ORM):
    name: str
    category: str


class SettingsOut(BaseModel):
    data: dict
