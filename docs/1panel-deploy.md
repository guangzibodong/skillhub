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

Before starting the stack, create `.env.production` from `.env.production.example` and replace all placeholder secrets.

```bash
cp .env.production.example .env.production
```

Start the stack:

```bash
docker compose -f docker-compose.1panel.yml up -d --build
```

## Ports

The stack only binds application ports to localhost:

- Web app: `127.0.0.1:3100`
- API gateway: `127.0.0.1:8787`
- Postgres: internal Docker network only
- Redis: internal Docker network only

## 1Panel Websites

Create two reverse proxy websites in 1Panel:

- `app.useskillhub.com` -> `http://127.0.0.1:3100`
- `api.useskillhub.com` -> `http://127.0.0.1:8787`

Enable HTTPS for both sites in 1Panel.

If 1Panel asks for custom OpenResty config, use:

- `deploy/1panel/openresty-app.conf`
- `deploy/1panel/openresty-api.conf`

## Health Checks

After deployment:

```bash
curl http://127.0.0.1:8787/health
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
