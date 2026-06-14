#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and fill in secrets first." >&2
  exit 1
fi

docker compose -f docker-compose.1panel.yml up -d postgres redis
./scripts/run-postgres-migrations.sh --no-start
docker compose -f docker-compose.1panel.yml build --no-cache api web
docker compose -f docker-compose.1panel.yml up -d --force-recreate api web

echo "Waiting for local services..."
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:18787/health >/dev/null \
    && curl -fsSI http://127.0.0.1:3100/login?lang=zh >/dev/null; then
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "SkillHub stack started, but local health checks failed." >&2
    echo "Container status:" >&2
    docker compose -f docker-compose.1panel.yml ps >&2 || true
    echo "Recent web logs:" >&2
    docker logs --tail=120 skillhub-web >&2 || true
    echo "Recent API logs:" >&2
    docker logs --tail=120 skillhub-api >&2 || true
    exit 1
  fi

  sleep 2
done

echo "SkillHub stack started."
echo "Web: http://127.0.0.1:3100"
echo "API: http://127.0.0.1:18787"
