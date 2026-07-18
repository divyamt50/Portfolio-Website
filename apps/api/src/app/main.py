import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app import models_registry  # noqa: F401  (full ORM metadata — FKs span modules)
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging, log, new_request_id, request_id_var
from app.modules.content.router import router as content_router
from app.modules.health.router import router as health_router


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="divyamtyagi.dev API",
        version="0.1.0",
        description=(
            "Control-plane API for the portfolio platform. Public read endpoints feed "
            "static generation; the admin surface (auth, CRUD, media, audit) ships in "
            "the next sprint. Errors are RFC 9457 problem+json."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins,  # exact origins only — no wildcards
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    @app.middleware("http")
    async def request_context(request: Request, call_next):
        rid = request.headers.get("x-request-id") or new_request_id()
        request_id_var.set(rid)
        start = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        log.info(
            "request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=round((time.perf_counter() - start) * 1000, 1),
        )
        return response

    register_error_handlers(app)
    app.include_router(health_router)
    app.include_router(content_router)
    return app


app = create_app()
