#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

usage() {
  cat <<'EOF'
Usage: ./scripts/configure-oauth.sh [--provider all|google|github] [--no-deploy]

Safely writes OAuth client IDs/secrets to .env, then optionally rebuilds and
recreates the 1Panel containers. Secrets are entered without terminal echo.

Examples:
  ./scripts/configure-oauth.sh
  ./scripts/configure-oauth.sh --provider google
  ./scripts/configure-oauth.sh --provider github --no-deploy
EOF
}

provider="all"
deploy="true"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --provider)
      provider="${2:-}"
      shift 2
      ;;
    --provider=*)
      provider="${1#*=}"
      shift
      ;;
    --no-deploy)
      deploy="false"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

case "$provider" in
  all|google|github) ;;
  *)
    echo "--provider must be all, google, or github." >&2
    exit 1
    ;;
esac

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and fill in required secrets first." >&2
  exit 1
fi

backup=".env.bak.$(date +%Y%m%d%H%M%S)"
cp .env "$backup"
echo "Backed up .env to $backup"

set_env_value() {
  local key="$1"
  local value="$2"
  local tmp

  value="$(printf '%s' "$value" | tr -d '\r\n')"

  if [ -z "$value" ]; then
    echo "$key cannot be empty." >&2
    exit 1
  fi

  tmp="$(mktemp)"
  grep -v "^${key}=" .env > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" .env
}

current_value() {
  local key="$1"
  grep -E "^${key}=" .env | tail -n1 | cut -d= -f2-
}

ensure_value() {
  local key="$1"
  local value="$2"

  if [ -z "$(current_value "$key")" ]; then
    set_env_value "$key" "$value"
  fi
}

prompt_visible() {
  local label="$1"
  local existing="$2"
  local value

  if [ -n "$existing" ]; then
    read -r -p "$label [press Enter to keep existing]: " value
    printf '%s' "${value:-$existing}"
  else
    while true; do
      read -r -p "$label: " value
      if [ -n "$value" ]; then
        printf '%s' "$value"
        break
      fi
      echo "$label is required." >&2
    done
  fi
}

prompt_secret() {
  local label="$1"
  local existing="$2"
  local value

  if [ -n "$existing" ]; then
    read -r -s -p "$label [press Enter to keep existing]: " value
    echo >&2
    printf '%s' "${value:-$existing}"
  else
    while true; do
      read -r -s -p "$label: " value
      echo >&2
      if [ -n "$value" ]; then
        printf '%s' "$value"
        break
      fi
      echo "$label is required." >&2
    done
  fi
}

configure_google() {
  local client_id
  local client_secret

  client_id="$(prompt_visible "Google Client ID" "$(current_value SKILLHUB_GOOGLE_CLIENT_ID)")"
  client_secret="$(prompt_secret "Google Client Secret" "$(current_value SKILLHUB_GOOGLE_CLIENT_SECRET)")"
  set_env_value SKILLHUB_GOOGLE_CLIENT_ID "$client_id"
  set_env_value SKILLHUB_GOOGLE_CLIENT_SECRET "$client_secret"
}

configure_github() {
  local client_id
  local client_secret

  client_id="$(prompt_visible "GitHub Client ID" "$(current_value SKILLHUB_GITHUB_CLIENT_ID)")"
  client_secret="$(prompt_secret "GitHub Client Secret" "$(current_value SKILLHUB_GITHUB_CLIENT_SECRET)")"
  set_env_value SKILLHUB_GITHUB_CLIENT_ID "$client_id"
  set_env_value SKILLHUB_GITHUB_CLIENT_SECRET "$client_secret"
}

ensure_value SKILLHUB_AUTH_CALLBACK_BASE_URL "https://api.useskillhub.com"
ensure_value SKILLHUB_OAUTH_STATE_SECRET "$(openssl rand -hex 48)"

if [ "$provider" = "all" ] || [ "$provider" = "google" ]; then
  configure_google
fi

if [ "$provider" = "all" ] || [ "$provider" = "github" ]; then
  configure_github
fi

echo "OAuth configuration saved to .env."

if [ "$deploy" = "true" ]; then
  ./scripts/deploy-1panel.sh
  curl -sS https://api.useskillhub.com/v1/auth/providers
else
  echo "Skipped deploy. Run ./scripts/deploy-1panel.sh when ready."
fi
