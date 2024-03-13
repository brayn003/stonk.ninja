# syntax=docker/dockerfile:1

FROM ubuntu:latest

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_HOME="/opt/poetry"
ENV PATH="$POETRY_HOME/bin:/app/stonk.ninja/server/.venv/bin:$PATH"

RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y \
    nodejs \
    python3 \
    python-is-python3

RUN npm install -g \
    pnpm \
    pm2
RUN curl -sSL https://install.python-poetry.org | python3 -

RUN pm2 logrotate -u root

COPY .. /app/stonk.ninja
WORKDIR /app/stonk.ninja/client
RUN cp .env.example .env
RUN pnpm install
RUN pnpm build
WORKDIR /app/stonk.ninja/server
RUN poetry install
WORKDIR /app/stonk.ninja

ENTRYPOINT ["pm2-runtime", "start", "deploy/ecosystem.config.js"]

