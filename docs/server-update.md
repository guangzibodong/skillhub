# Server Update

Use this when updating the live 1Panel deployment at `/opt/skillhub`.

```bash
cd /opt/skillhub

# The first deployment edited this file locally to move the API port to 18787.
# Reset tracked deployment files before pulling the repository version.
git checkout -- docker-compose.1panel.yml deploy/1panel/openresty-api.conf docs/1panel-deploy.md scripts/deploy-1panel.sh
git pull --ff-only

# Add a write-protection token for admin publish endpoints if it is not present.
grep -q '^SKILLHUB_ADMIN_TOKEN=' .env || echo "SKILLHUB_ADMIN_TOKEN=$(openssl rand -hex 32)" >> .env
grep -q '^SKILLHUB_API_KEY_SALT=' .env || echo "SKILLHUB_API_KEY_SALT=$(openssl rand -hex 48)" >> .env
grep -q '^SKILLHUB_OAUTH_STATE_SECRET=' .env || echo "SKILLHUB_OAUTH_STATE_SECRET=$(openssl rand -hex 48)" >> .env
grep -q '^SKILLHUB_EMAIL_AUTH_SECRET=' .env || echo "SKILLHUB_EMAIL_AUTH_SECRET=$(openssl rand -hex 48)" >> .env

# Production consoles must not silently show demo operator data.
grep -q '^SKILLHUB_ENV=' .env && sed -i 's/^SKILLHUB_ENV=.*/SKILLHUB_ENV=production/' .env || echo "SKILLHUB_ENV=production" >> .env
grep -q '^NEXT_PUBLIC_APP_URL=' .env && sed -i 's|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://app.useskillhub.com|' .env || echo "NEXT_PUBLIC_APP_URL=https://app.useskillhub.com" >> .env
grep -q '^NEXT_PUBLIC_API_URL=' .env && sed -i 's|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://api.useskillhub.com|' .env || echo "NEXT_PUBLIC_API_URL=https://api.useskillhub.com" >> .env
grep -q '^SKILLHUB_AUTH_CALLBACK_BASE_URL=' .env && sed -i 's|^SKILLHUB_AUTH_CALLBACK_BASE_URL=.*|SKILLHUB_AUTH_CALLBACK_BASE_URL=https://api.useskillhub.com|' .env || echo "SKILLHUB_AUTH_CALLBACK_BASE_URL=https://api.useskillhub.com" >> .env
grep -q '^SKILLHUB_AUTH_COOKIE_DOMAIN=' .env && sed -i 's|^SKILLHUB_AUTH_COOKIE_DOMAIN=.*|SKILLHUB_AUTH_COOKIE_DOMAIN=.useskillhub.com|' .env || echo "SKILLHUB_AUTH_COOKIE_DOMAIN=.useskillhub.com" >> .env
grep -q '^SKILLHUB_EMAIL_AUTH_DEBUG_CODES=' .env && sed -i 's/^SKILLHUB_EMAIL_AUTH_DEBUG_CODES=.*/SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false/' .env || echo "SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false" >> .env
grep -q '^SKILLHUB_EMAIL_PROVIDER=debug_preview' .env && sed -i 's/^SKILLHUB_EMAIL_PROVIDER=debug_preview/SKILLHUB_EMAIL_PROVIDER=resend/' .env || true
sed -i '/^SKILLHUB_ENABLE_DEMO_FALLBACK=/d' .env

# Existing Postgres volumes do not rerun docker-entrypoint init migrations.
# Run the migration runner before rebuilding the API. It records applied files
# in schema_migrations. Existing databases with core tables but missing early
# marketplace/review tables are repaired from 002; complete pre-runner 1Panel
# databases continue from 018, and tracked databases continue after the latest
# recorded migration unless that early marketplace baseline is missing.
./scripts/run-postgres-migrations.sh

docker compose -f docker-compose.1panel.yml up -d --build

ADMIN_TOKEN="$(grep '^SKILLHUB_ADMIN_TOKEN=' .env | cut -d= -f2-)"
curl https://api.useskillhub.com/health
curl https://api.useskillhub.com/v1/stats
curl "https://api.useskillhub.com/v1/skills/search?sort=recommended&limit=5"
curl "https://api.useskillhub.com/v1/publishers?limit=5"

# Public P0 gate for the production app, marketplace, public detail APIs,
# account entry, workspaces, docs, terms, and bilingual/mojibake guards.
# This path performs no writes and does not need an operator user token.
pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000

# Optional protected Journey C gate. Use this only when the shell already has
# an admin/super-admin user token configured; do not paste token values into
# terminals, docs, tickets, or reports.
if [ -n "${SKILLHUB_P0_ADMIN_TOKEN:-}" ]; then
  pnpm smoke:p0 -- --prod --timeout-ms 30000
else
  echo "Skipping protected admin P0 gate; set SKILLHUB_P0_ADMIN_TOKEN in the shell to run it."
fi
```

The expected health response is:

```json
{"ok":true,"service":"skillhub-gateway","env":"production"}
```

Do not run mutating P0 smokes against production during a routine update.
`pnpm smoke:p0 -- --prod --include-mutating` and `pnpm smoke:p0 -- --prod --include-demo`
create real marketplace, project, runtime, ledger, payout, notification, and
audit rows, and still require the child scripts' explicit production-write
approval flags.
