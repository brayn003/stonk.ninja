FROM python:3-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

FROM base AS deps
ENV POETRY_HOME="/opt/poetry"
ENV PATH="$POETRY_HOME/bin:$PATH"
RUN python3 -m venv $POETRY_HOME
RUN pip install poetry
COPY . .
RUN poetry install --without dev

FROM base AS runner
ENV PATH="/app/.venv/bin:$PATH"
COPY --from=deps /app/app app
COPY --from=deps /app/.venv .venv
COPY .env.example .env
RUN playwright install chromium

ENV UVICORN_PORT=8000 \
    UVICORN_HOST=0.0.0.0
EXPOSE 8000
CMD ["uvicorn", "app.main:app"]
