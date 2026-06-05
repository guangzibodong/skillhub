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

# Existing Postgres volumes do not rerun docker-entrypoint init migrations.
# Apply the new marketplace curation migration before rebuilding the API.
docker compose -f docker-compose.1panel.yml up -d postgres
docker exec -i skillhub-postgres psql -U skillhub -d skillhub < supabase/migrations/018_marketplace_curation.sql

docker compose -f docker-compose.1panel.yml up -d --build

ADMIN_TOKEN="$(grep '^SKILLHUB_ADMIN_TOKEN=' .env | cut -d= -f2-)"
curl https://api.useskillhub.com/health
curl https://api.useskillhub.com/v1/stats
curl "https://api.useskillhub.com/v1/skills/search?sort=recommended&limit=5"
curl "https://api.useskillhub.com/v1/admin/marketplace-curation?limit=3" -H "Authorization: Bearer $ADMIN_TOKEN"
```

The expected health response is:

```json
{"ok":true,"service":"skillhub-gateway","env":"production"}
```
