import asyncio
import os

os.environ["ENV"] = "test"
os.environ["DATABASE_URL"] = (
    "postgresql+asyncpg://portfolio:portfolio@localhost:5432/portfolio_test"
)

import pytest
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session", autouse=True)
def migrated_db():
    """Real Postgres, real migrations — the schema under test is the schema in prod.

    Schema reset (rather than downgrade) so enum types and any drift are wiped too.
    """

    async def reset() -> None:
        import asyncpg

        conn = await asyncpg.connect(
            "postgresql://portfolio:portfolio@localhost:5432/portfolio_test"
        )
        await conn.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
        await conn.close()

    asyncio.run(reset())
    cfg = Config("alembic.ini")
    command.upgrade(cfg, "head")
    yield


@pytest.fixture()
async def client():
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture()
async def seeded(migrated_db):
    from app.core.db import SessionLocal
    from app.seed import upsert

    async with SessionLocal() as db:
        await upsert(db)
    yield
