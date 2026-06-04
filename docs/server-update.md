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

docker compose -f docker-compose.1panel.yml up -d --build

curl https://api.useskillhub.com/health
curl https://api.useskillhub.com/v1/stats
```

The expected health response is:

```json
{"ok":true,"service":"skillhub-gateway","env":"production"}
```
