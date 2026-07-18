import datetime as dt
import uuid

from sqlalchemy import ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base, TimestampMixin, uuid7_pk


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid7_pk()
    # Stored lowercased at write time; unique index enforces it. (String over citext
    # to avoid extension coupling on managed Postgres.)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="admin")
    totp_secret_enc: Mapped[str | None] = mapped_column(String(255))
    totp_enabled: Mapped[bool] = mapped_column(default=False)
    recovery_codes_hash: Mapped[list[str]] = mapped_column(ARRAY(String(255)), default=list)
    is_active: Mapped[bool] = mapped_column(default=True)
    last_login_at: Mapped[dt.datetime | None]


class AuthSession(Base, TimestampMixin):
    """One row per refresh token. family_id groups a device login; rotation chains via
    replaced_by_id; presenting an already-rotated token revokes the whole family."""

    __tablename__ = "auth_sessions"
    __table_args__ = (
        Index(
            "ix_auth_sessions_active",
            "family_id",
            postgresql_where=text("revoked_at IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = uuid7_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    family_id: Mapped[uuid.UUID]
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)  # sha256 hex
    issued_at: Mapped[dt.datetime]
    expires_at: Mapped[dt.datetime]
    rotated_at: Mapped[dt.datetime | None]
    revoked_at: Mapped[dt.datetime | None]
    replaced_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("auth_sessions.id", ondelete="SET NULL")
    )
    ip: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(String(512))
