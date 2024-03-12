# syntax=docker/dockerfile:1

FROM ubuntu:latest

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    POETRY_HOME="/opt/poetry"


ENV PATH="$POETRY_HOME/bin:/app/ka-ching/server/.venv/bin:$PATH"
RUN alias python=python3

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

COPY . /app/ka-ching
WORKDIR /app/ka-ching/client
RUN cp .env.example .env
RUN pnpm install
RUN pnpm build
WORKDIR /app/ka-ching/server
RUN poetry install
WORKDIR /app/ka-ching

ENTRYPOINT ["pm2-runtime", "start", "prod-env/ecosystem.config.js"]

EXPOSE 4100
EXPOSE 4200





