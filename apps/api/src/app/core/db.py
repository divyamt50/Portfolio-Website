from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

# Small pool on purpose: Neon free tier autoscales modest compute and the app has
# exactly one writer (the admin). Use Neon POOLED connection string in production.
_settings = get_settings()
# NullPool under test: pytest-asyncio runs each test in its own event loop, and pooled
# asyncpg connections must not cross loops. Prod keeps a small pool (single-writer app).
if _settings.env == "test":
    engine = create_async_engine(_settings.database_url, poolclass=NullPool)
else:
    engine = create_async_engine(
        _settings.database_url, pool_size=5, max_overflow=5, pool_pre_ping=True
    )
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


# FastAPI dependency alias: `db: DB` in any handler.
DB = Annotated[AsyncSession, Depends(get_db)]
