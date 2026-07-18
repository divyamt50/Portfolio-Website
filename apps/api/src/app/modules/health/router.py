from fastapi import APIRouter
from sqlalchemy import text

from app.core.db import DB

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict:
    """Liveness. No dependencies — also the keep-warm ping target on Render."""
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(db: DB) -> dict:
    """Readiness: proves the database round-trip (wakes Neon if suspended)."""
    await db.execute(text("SELECT 1"))
    return {"status": "ready", "database": "ok"}
