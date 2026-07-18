"""RFC 9457 problem+json everywhere: one error shape, always carrying request_id."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import log, request_id_var

MEDIA = "application/problem+json"


def _problem(status: int, title: str, detail: str | None = None, **extra) -> JSONResponse:
    body = {
        "type": "about:blank",
        "title": title,
        "status": status,
        "request_id": request_id_var.get(),
    }
    if detail:
        body["detail"] = detail
    body.update(extra)
    return JSONResponse(body, status_code=status, media_type=MEDIA)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exc(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return _problem(exc.status_code, exc.detail if isinstance(exc.detail, str) else "Error")

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError) -> JSONResponse:
        return _problem(422, "Validation failed", errors=exc.errors())

    @app.exception_handler(Exception)
    async def unhandled_exc(_: Request, exc: Exception) -> JSONResponse:
        log.error("unhandled_exception", exc_info=exc)
        return _problem(500, "Internal server error")
