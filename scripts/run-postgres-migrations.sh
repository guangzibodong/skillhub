#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.1panel.yml"
DB_NAME="${SKILLHUB_DB_NAME:-skillhub}"
DB_USER="${SKILLHUB_DB_USER:-skillhub}"
MIGRATIONS_DIR="supabase/migrations"
SERVICE="postgres"
START_FROM="auto"
START_POSTGRES=1

require_value() {
  if [ "$#" -lt 2 ] || [ -z "$2" ]; then
    echo "Option $1 requires a value." >&2
    usage >&2
    exit 2
  fi
}

usage() {
  cat <<'USAGE'
Usage: scripts/run-postgres-migrations.sh [options]

Runs SkillHub SQL migrations against the Docker Compose Postgres service and
records applied files in public.schema_migrations.

Options:
  --compose-file PATH   Compose file to use. Default: docker-compose.1panel.yml
  --db-name NAME        Database name. Default: skillhub
  --db-user USER        Database user. Default: skillhub
  --from PREFIX         Start from a migration prefix, for example 001 or 018.
                        Default: auto.
  --migrations-dir DIR  Migration directory. Default: supabase/migrations
  --no-start            Do not start the Postgres service before running.
  --service NAME        Compose service name. Default: postgres
  -h, --help            Show this help.

Auto mode:
  - Fresh database with no existing SkillHub tables: starts at 001.
  - Existing pre-runner 1Panel database: starts at 018 by default.
  - Database already tracked by schema_migrations: starts after the highest
    recorded migration number.

Set SKILLHUB_EXISTING_MIGRATION_START to change the pre-runner baseline.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --compose-file)
      require_value "$@"
      COMPOSE_FILE="${2:-}"
      shift 2
      ;;
    --db-name)
      require_value "$@"
      DB_NAME="${2:-}"
      shift 2
      ;;
    --db-user)
      require_value "$@"
      DB_USER="${2:-}"
      shift 2
      ;;
    --from)
      require_value "$@"
      START_FROM="${2:-}"
      shift 2
      ;;
    --migrations-dir)
      require_value "$@"
      MIGRATIONS_DIR="${2:-}"
      shift 2
      ;;
    --no-start)
      START_POSTGRES=0
      shift
      ;;
    --service)
      require_value "$@"
      SERVICE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migration directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

psql_exec() {
  compose exec -T "$SERVICE" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 "$@"
}

wait_for_postgres() {
  local attempts=30
  local attempt

  for attempt in $(seq 1 "$attempts"); do
    if psql_exec -At -c "select 1;" >/dev/null 2>&1; then
      return 0
    fi

    echo "Waiting for Postgres to accept connections ($attempt/$attempts)..."
    sleep 2
  done

  echo "Postgres did not become ready in time." >&2
  compose ps "$SERVICE" >&2 || true
  exit 1
}

extract_prefix() {
  local value="$1"
  local prefix
  prefix="$(printf '%s' "$value" | sed -E 's/^([0-9]+).*/\1/')"

  if ! printf '%s' "$prefix" | grep -Eq '^[0-9]+$'; then
    echo "Invalid migration prefix: $value" >&2
    exit 2
  fi

  printf '%s' "$prefix"
}

checksum_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    echo "sha256sum or shasum is required to record migration checksums." >&2
    exit 1
  fi
}

if [ "$START_POSTGRES" -eq 1 ]; then
  compose up -d "$SERVICE"
fi

wait_for_postgres

psql_exec -c "
  create table if not exists public.schema_migrations (
    filename text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  );
"

history_count="$(psql_exec -At -c "select count(*) from public.schema_migrations;")"
max_recorded="$(psql_exec -At -c "select coalesce(max((substring(filename from '^[0-9]+'))::int), 0) from public.schema_migrations;")"
core_tables_exist="$(psql_exec -At -c "select to_regclass('public.organizations') is not null;")"
pre_runner_tables_exist="$(
  psql_exec -At -c "
    select
      to_regclass('public.project_skill_installs') is not null
      and to_regclass('public.skill_feedback') is not null
      and to_regclass('public.organization_webhook_endpoints') is not null;
  "
)"

if [ "$START_FROM" = "auto" ]; then
  if [ "$history_count" -gt 0 ]; then
    start_number=$((max_recorded + 1))
  elif [ "$core_tables_exist" = "t" ] && [ "$pre_runner_tables_exist" = "t" ]; then
    existing_start="$(extract_prefix "${SKILLHUB_EXISTING_MIGRATION_START:-018}")"
    start_number=$((10#$existing_start))
    echo "Detected existing pre-runner database; starting at migration $(printf '%03d' "$start_number")."
  elif [ "$core_tables_exist" = "t" ]; then
    echo "Detected SkillHub tables without migration history, but the pre-runner baseline is incomplete." >&2
    echo "Re-run with --from <next-known-migration-prefix> after checking the database state." >&2
    exit 1
  else
    start_number=1
  fi
else
  start_prefix="$(extract_prefix "$START_FROM")"
  start_number=$((10#$start_prefix))
fi

applied_count=0
skipped_count=0

while IFS= read -r migration_file; do
  filename="$(basename "$migration_file")"
  prefix="$(extract_prefix "$filename")"
  migration_number=$((10#$prefix))

  if [ "$migration_number" -lt "$start_number" ]; then
    continue
  fi

  checksum="$(checksum_file "$migration_file")"
  recorded_checksum="$(
    psql_exec -At \
      -v "migration_filename=$filename" \
      -c "select checksum from public.schema_migrations where filename = :'migration_filename';"
  )"

  if [ -n "$recorded_checksum" ]; then
    if [ "$recorded_checksum" != "$checksum" ]; then
      echo "Checksum mismatch for already applied migration: $filename" >&2
      echo "Recorded: $recorded_checksum" >&2
      echo "Current:  $checksum" >&2
      exit 1
    fi

    echo "Skipping already applied migration: $filename"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  echo "Applying migration: $filename"
  psql_exec < "$migration_file"
  psql_exec \
    -v "migration_filename=$filename" \
    -v "migration_checksum=$checksum" \
    -c "
      insert into public.schema_migrations (filename, checksum)
      values (:'migration_filename', :'migration_checksum')
      on conflict (filename) do nothing;
    "
  applied_count=$((applied_count + 1))
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | sort)

echo "Migration run complete. Applied: $applied_count. Skipped: $skipped_count."
