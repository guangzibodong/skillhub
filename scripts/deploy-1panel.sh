#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.production.example to .env and fill in secrets first." >&2
  exit 1
fi

docker compose -f docker-compose.1panel.yml up -d --build

echo "SkillHub stack started."
echo "Web: http://127.0.0.1:3100"
echo "API: http://127.0.0.1:18787"
