import datetime as dt
import uuid

from sqlalchemy import DateTime, MetaData, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from uuid6 import uuid7

# Deterministic constraint names -> clean, reviewable Alembic diffs forever.
NAMING = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING)
    # Every datetime column is timestamptz — naive timestamps are a production bug factory.
    type_annotation_map = {dt.datetime: DateTime(timezone=True)}


def uuid7_pk() -> Mapped[uuid.UUID]:
    """UUIDv7 primary keys: time-ordered, index-friendly, safely generatable app-side."""
    return mapped_column(primary_key=True, default=uuid7)


class TimestampMixin:
    created_at: Mapped[dt.datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )
    updated_at: Mapped[dt.datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )
