# Render deploys this directly. Single small image; migrations run on boot —
# safe here because the free tier runs exactly one instance (documented in README).
# RUN_SEED=1 (first deploy only) seeds content — Render free tier has no shell.
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY pyproject.toml ./
COPY src ./src
COPY alembic.ini ./
COPY alembic ./alembic
RUN pip install --no-cache-dir .
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && if [ \"$RUN_SEED\" = \"1\" ]; then python -m app.seed; fi && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
