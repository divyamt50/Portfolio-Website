from fastapi import APIRouter

from app.core.db import DB
from app.modules.content import schemas, service

router = APIRouter(prefix="/api/v1", tags=["content"])


@router.get("/projects", response_model=list[schemas.ProjectListItem])
async def projects(db: DB):
    return await service.list_projects(db)


@router.get("/projects/{slug}", response_model=schemas.ProjectDetail)
async def project_detail(slug: str, db: DB):
    return await service.get_project(db, slug)


@router.get("/posts", response_model=list[schemas.PostListItem])
async def posts(db: DB):
    return await service.list_posts(db)


@router.get("/posts/{slug}", response_model=schemas.PostDetail)
async def post_detail(slug: str, db: DB):
    return await service.get_post(db, slug)


@router.get("/experience", response_model=list[schemas.ExperienceOut])
async def experience(db: DB):
    return await service.list_experience(db)


@router.get("/skills", response_model=list[schemas.SkillOut])
async def skills(db: DB):
    return await service.list_skills(db)


@router.get("/settings", response_model=schemas.SettingsOut)
async def settings(db: DB):
    return {"data": await service.get_settings_row(db)}
