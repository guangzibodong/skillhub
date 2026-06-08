# 1Panel Deployment

Target server:

- Host: `srv10437`
- OS: Debian GNU/Linux 12
- Arch: x86_64
- Public IP: `185.231.220.165`

## DNS

Point these records to `185.231.220.165`:

- `useskillhub.com`
- `www.useskillhub.com`
- `app.useskillhub.com`
- `api.useskillhub.com`

## 1Panel Compose

Create a Compose project in 1Panel:

- Project name: `skillhub`
- Working directory: `/opt/skillhub`
- Compose file: `docker-compose.1panel.yml`

Before starting the stack, create `.env` from `.env.example` and replace all placeholder secrets.

```bash
cp .env.example .env
```

Generate the deployment secrets:

```bash
POSTGRES_PASSWORD=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 48)
OAUTH_STATE_SECRET=$(openssl rand -hex 48)
EMAIL_AUTH_SECRET=$(openssl rand -hex 48)
API_KEY_SALT=$(openssl rand -hex 48)
ADMIN_TOKEN=$(openssl rand -hex 32)

sed -i "s|replace-with-a-long-random-password|$POSTGRES_PASSWORD|g" .env
sed -i "s|replace-with-a-long-random-session-secret|$SESSION_SECRET|g" .env
sed -i "s|replace-with-a-long-random-oauth-state-secret|$OAUTH_STATE_SECRET|g" .env
sed -i "s|replace-with-a-long-random-email-auth-secret|$EMAIL_AUTH_SECRET|g" .env
sed -i "s|replace-with-a-long-random-api-key-salt|$API_KEY_SALT|g" .env
sed -i "s|replace-with-a-long-random-admin-token|$ADMIN_TOKEN|g" .env
sed -i "s|SKILLHUB_ENV=development|SKILLHUB_ENV=production|g" .env
sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=https://useskillhub.com|g" .env
sed -i "s|NEXT_PUBLIC_API_URL=http://localhost:8787|NEXT_PUBLIC_API_URL=https://api.useskillhub.com|g" .env
sed -i "s|SKILLHUB_AUTH_CALLBACK_BASE_URL=http://localhost:8787|SKILLHUB_AUTH_CALLBACK_BASE_URL=https://api.useskillhub.com|g" .env
sed -i "s|SKILLHUB_AUTH_COOKIE_DOMAIN=|SKILLHUB_AUTH_COOKIE_DOMAIN=.useskillhub.com|g" .env
sed -i "s|SKILLHUB_EMAIL_AUTH_DEBUG_CODES=true|SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false|g" .env
```

Start the stack:

```bash
./scripts/deploy-1panel.sh
```

The deploy script starts Postgres/Redis, runs migrations, then rebuilds the
`api` and `web` compose services with `--no-cache` and recreates the
`skillhub-api` and `skillhub-web` containers. If you update the repository
later, do not rely on `docker restart`; restart alone keeps the old image.

The manual equivalent for the application rebuild is:

```bash
docker compose -f docker-compose.1panel.yml build --no-cache api web
docker compose -f docker-compose.1panel.yml up -d --force-recreate api web
```

## Ports

The stack only binds application ports to localhost:

- Web app: `127.0.0.1:3100`
- API gateway: `127.0.0.1:18787`
- Postgres: internal Docker network only
- Redis: internal Docker network only

## 1Panel Websites

Create these reverse proxy websites in 1Panel:

- `useskillhub.com` -> `http://127.0.0.1:3100`
- `www.useskillhub.com` -> `http://127.0.0.1:3100`
- `app.useskillhub.com` -> `http://127.0.0.1:3100`
- `api.useskillhub.com` -> `http://127.0.0.1:18787`

Enable HTTPS for all four sites in 1Panel. `useskillhub.com` is the primary
public web entry; `www.useskillhub.com` and `app.useskillhub.com` should remain
valid aliases to the same web container.

If 1Panel asks for custom OpenResty config, use:

- `deploy/1panel/openresty-app.conf`
- `deploy/1panel/openresty-api.conf`

## Health Checks

After deployment:

```bash
curl http://127.0.0.1:18787/health
curl https://api.useskillhub.com/health
pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
```

The API should return:

```json
{
  "ok": true,
  "service": "skillhub-gateway",
  "env": "production"
}
```

`pnpm smoke:p0 -- --prod --skip-admin` is the routine post-deploy public gate:
it checks production public APIs, app pages, marketplace/detail contracts,
account entry, workspaces, docs, terms, and bilingual copy without writing data
or requiring an operator token. It includes the `production API health gate` for
`https://api.useskillhub.com/health` and requires `env=production`. Because production mode targets
`https://useskillhub.com`, the same run also performs the `production web alias gate`
for `https://www.useskillhub.com` and `https://app.useskillhub.com`.

For customer walkthroughs or release signoff, run the protected Journey C gate
only from a shell where an admin/super-admin user token is already configured:

```bash
pnpm smoke:p0 -- --prod --timeout-ms 30000
```

Mutating P0 smokes (`--include-mutating` or `--include-demo`) create real
marketplace, project, runtime, ledger, payout, notification, and audit rows.
Use them against production only for a planned rehearsal with the scripts'
explicit production-write approval flags.

## Updates

For updating the existing server after a new GitHub commit, see `docs/server-update.md`.
