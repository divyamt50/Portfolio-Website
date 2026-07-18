import enum
import uuid

from sqlalchemy import Enum, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base import Base, TimestampMixin, uuid7_pk


class MessageStatus(enum.StrEnum):
    new = "new"
    read = "read"
    replied = "replied"
    spam = "spam"


class ContactMessage(Base, TimestampMixin):
    __tablename__ = "contact_messages"

    id: Mapped[uuid.UUID] = uuid7_pk()
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(320))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[MessageStatus] = mapped_column(
        Enum(MessageStatus, name="message_status"), default=MessageStatus.new
    )
    turnstile_score: Mapped[int | None] = mapped_column(SmallInteger)
    ip_hash: Mapped[str | None] = mapped_column(String(64))  # salted hash, never raw IPs
    user_agent: Mapped[str | None] = mapped_column(String(512))
