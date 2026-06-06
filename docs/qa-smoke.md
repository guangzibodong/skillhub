# SkillHub QA smoke checks

This smoke path covers the minimum launch surface for local builds and production:

- `GET /v1/stats`
- `GET /v1/auth/providers`
- `GET /v1/admin/launch-readiness`
- Built app pages: `/`, `/?lang=zh`, `/marketplace`, `/skills/browser-research-pro`, `/publishers`, `/agents`, `/docs`, `/publish`, `/publisher`, `/developer`, `/dashboard`, `/account`, `/login`, `/admin`, `/terms`

The admin launch-readiness endpoint requires a user token with `support`, `admin`, or `super_admin`. If no token is configured, the smoke script verifies that the endpoint is protected and skips the readiness body shape check.

## Production

```bash
pnpm smoke:prod
```

To include the launch-readiness body check, set a token in the shell before running the command:

```bash
export SKILLHUB_SMOKE_TOKEN="<support-or-admin-user-token>"
pnpm smoke:prod
```

Windows PowerShell:

```powershell
$env:SKILLHUB_SMOKE_TOKEN = "<support-or-admin-user-token>"
pnpm smoke:prod
```

Do not commit tokens or paste token values into reports. The script redacts the authorization header from error output.

## Local build

Run a production-style local build, then start both services from the built artifacts:

```bash
pnpm build
pnpm --filter @useskillhub/gateway start
pnpm --filter @useskillhub/web start
pnpm smoke
```

For a server using the 1Panel API port from the launch docs:

```bash
pnpm smoke -- --api-url http://127.0.0.1:18787 --app-url http://127.0.0.1:3000
```

For a custom page subset:

```bash
pnpm smoke -- --app-paths /,/login,/admin
```

For production updates, keep the default page set unless you are debugging one route. It covers the public site, the two-sided marketplace entry points, account/login, developer workspace, publisher workspace, admin console, docs, and terms.

## Exit behavior

- Public API and app page shape failures exit non-zero.
- Authorized launch-readiness failures exit non-zero when `SKILLHUB_SMOKE_TOKEN` or `SKILLHUB_USER_TOKEN` is set.
- Missing token for launch readiness is reported as `SKIP` after verifying that the endpoint returns `401` or `403`.
