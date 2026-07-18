import datetime as dt
import enum
import uuid

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base, TimestampMixin, uuid7_pk


class ContentStatus(enum.StrEnum):
    draft = "draft"
    published = "published"
    archived = "archived"


class SkillCategory(enum.StrEnum):
    languages = "languages"
    frameworks = "frameworks"
    infra = "infra"
    ai = "ai"


class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"

    id: Mapped[uuid.UUID] = uuid7_pk()
    cloudinary_public_id: Mapped[str] = mapped_column(String(255), unique=True)
    url: Mapped[str] = mapped_column(String(1024))
    width: Mapped[int | None]
    height: Mapped[int | None]
    format: Mapped[str | None] = mapped_column(String(16))
    bytes: Mapped[int | None]
    # Alt text is NOT nullable: accessibility is enforced at the schema, not by discipline.
    alt: Mapped[str] = mapped_column(String(512))
    blur_data: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )


class Project(Base, TimestampMixin):
    __tablename__ = "projects"
    __table_args__ = (
        Index(
            "ix_projects_published",
            "status",
            "sort_order",
            postgresql_where=text("status = 'published'"),
        ),
    )

    id: Mapped[uuid.UUID] = uuid7_pk()
    slug: Mapped[str] = mapped_column(String(120), unique=True)  # immutable after publish
    title: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(String(500))
    body_mdx: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus, name="content_status"), default=ContentStatus.draft
    )
    featured: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[int] = mapped_column(default=0)
    tech_stack: Mapped[list[str]] = mapped_column(ARRAY(String(64)), default=list)
    links: Mapped[dict] = mapped_column(JSONB, default=dict)  # {github, live, docs}
    metrics: Mapped[list] = mapped_column(JSONB, default=list)  # [{label, value}]
    cover_media_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL")
    )
    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(320))
    published_at: Mapped[dt.datetime | None]

    cover: Mapped[MediaAsset | None] = relationship(lazy="joined")


class Tag(Base, TimestampMixin):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = uuid7_pk()
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str | None] = mapped_column(String(320))


class Post(Base, TimestampMixin):
    __tablename__ = "posts"
    __table_args__ = (
        Index(
            "ix_posts_published",
            "published_at",
            postgresql_where=text("status = 'published'"),
        ),
    )

    id: Mapped[uuid.UUID] = uuid7_pk()
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    excerpt: Mapped[str] = mapped_column(String(500))
    body_mdx: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus, name="content_status", create_type=False),
        default=ContentStatus.draft,
    )
    reading_time_minutes: Mapped[int] = mapped_column(default=1)
    cover_media_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL")
    )
    canonical_url: Mapped[str | None] = mapped_column(String(512))
    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(320))
    published_at: Mapped[dt.datetime | None]

    tags: Mapped[list[Tag]] = relationship(secondary="post_tags", lazy="selectin")


class PostTag(Base):
    __tablename__ = "post_tags"
    __table_args__ = (UniqueConstraint("post_id", "tag_id"),)

    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )


class Experience(Base, TimestampMixin):
    __tablename__ = "experience"

    id: Mapped[uuid.UUID] = uuid7_pk()
    company: Mapped[str] = mapped_column(String(160))
    title: Mapped[str] = mapped_column(String(160))
    location: Mapped[str | None] = mapped_column(String(160))
    start_date: Mapped[dt.date]
    end_date: Mapped[dt.date | None]  # NULL = present
    summary_mdx: Mapped[str] = mapped_column(Text, default="")
    highlights: Mapped[list] = mapped_column(JSONB, default=list)
    sort_order: Mapped[int] = mapped_column(default=0)


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("category", "name"),)

    id: Mapped[uuid.UUID] = uuid7_pk()
    name: Mapped[str] = mapped_column(String(80))
    category: Mapped[SkillCategory] = mapped_column(Enum(SkillCategory, name="skill_category"))
    sort_order: Mapped[int] = mapped_column(default=0)
    # Deliberately no proficiency column. Skill bars are noise (architecture doc §8).


class SiteSettings(Base, TimestampMixin):
    __tablename__ = "site_settings"
    __table_args__ = (CheckConstraint("id = 1", name="singleton"),)

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, default=1)
    data: Mapped[dict] = mapped_column(JSONB, default=dict)
    # data keys: headline, about_mdx, availability, socials{}, resume_media_id,
    # seo_defaults{}, feature_flags{}


class Redirect(Base, TimestampMixin):
    __tablename__ = "redirects"

    id: Mapped[uuid.UUID] = uuid7_pk()
    from_path: Mapped[str] = mapped_column(String(512), unique=True)
    to_path: Mapped[str] = mapped_column(String(512))
    status_code: Mapped[int] = mapped_column(SmallInteger, default=301)
