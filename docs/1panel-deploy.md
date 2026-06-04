# 1Panel Deployment

Target server:

- Host: `srv10437`
- OS: Debian GNU/Linux 12
- Arch: x86_64
- Public IP: `185.231.220.165`

## DNS

Point these records to `185.231.220.165`:

- `app.useskillhub.com`
- `api.useskillhub.com`

## 1Panel Compose

Create a Compose project in 1Panel:

- Project name: `skillhub`
- Working directory: `/opt/skillhub`
- Compose file: `docker-compose.1panel.yml`

Before starting the stack, create `.env` from `.env.production.example` and replace all placeholder secrets.

```bash
cp .env.production.example .env
```

Generate the deployment secrets:

```bash
POSTGRES_PASSWORD=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 48)
API_KEY_SALT=$(openssl rand -hex 48)
ADMIN_TOKEN=$(openssl rand -hex 32)

sed -i "s|replace-with-a-long-random-password|$POSTGRES_PASSWORD|g" .env
sed -i "s|replace-with-a-long-random-secret|$SESSION_SECRET|1" .env
sed -i "s|replace-with-a-long-random-secret|$API_KEY_SALT|1" .env
sed -i "s|replace-with-a-long-random-admin-token|$ADMIN_TOKEN|g" .env
```

Start the stack:

```bash
docker compose -f docker-compose.1panel.yml up -d --build
```

## Ports

The stack only binds application ports to localhost:

- Web app: `127.0.0.1:3100`
- API gateway: `127.0.0.1:18787`
- Postgres: internal Docker network only
- Redis: internal Docker network only

## 1Panel Websites

Create two reverse proxy websites in 1Panel:

- `app.useskillhub.com` -> `http://127.0.0.1:3100`
- `api.useskillhub.com` -> `http://127.0.0.1:18787`

Enable HTTPS for both sites in 1Panel.

If 1Panel asks for custom OpenResty config, use:

- `deploy/1panel/openresty-app.conf`
- `deploy/1panel/openresty-api.conf`

## Health Checks

After deployment:

```bash
curl http://127.0.0.1:18787/health
curl https://api.useskillhub.com/health
```

The API should return:

```json
{
  "ok": true,
  "service": "skillhub-gateway",
  "env": "production"
}
```

## Updates

For updating the existing server after a new GitHub commit, see `docs/server-update.md`.
