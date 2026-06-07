# SkillHub QA smoke checks

This smoke path covers the minimum launch surface for local builds and production:

- `GET /v1/stats`
- `GET /v1/auth/providers`
- `GET /v1/admin/launch-readiness`
- Built app pages: `/`, `/?lang=zh`, `/marketplace`, `/skills/browser-research-pro`, `/publishers`, `/agents`, `/docs`, `/publish`, `/publisher`, `/developer`, `/dashboard`, `/account`, `/login`, `/admin`, `/terms`

The admin launch-readiness endpoint requires a user token with `support`, `admin`, or `super_admin`. If no token is configured, the smoke script verifies that the endpoint is protected and skips the readiness body shape check.

## P0 publish handoff

The Journey B -> Journey C smoke is separate because it mutates data. It proves that a publisher draft can become an exact-version review handoff and that the same handoff appears in publisher operations, admin review, audit, and notification state:

- `GET /publish`
- `POST /v1/skills`
- `POST /v1/publisher/skills/:skillSlug/versions/:version/submit`
- `GET /v1/publisher/skills`
- `GET /v1/notifications`
- `GET /v1/admin/reviews`
- `GET /v1/admin/audit-logs`
- `GET /v1/admin/notifications`

Run it against local or staging services with an organization-scoped publisher token and a reviewer/admin token:

```bash
export SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN="<publisher-or-owner-user-token>"
export SKILLHUB_P0_PUBLISH_ADMIN_TOKEN="<reviewer-or-admin-user-token>"
pnpm smoke:p0:publish
```

Windows PowerShell:

```powershell
$env:SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN = "<publisher-or-owner-user-token>"
$env:SKILLHUB_P0_PUBLISH_ADMIN_TOKEN = "<reviewer-or-admin-user-token>"
pnpm smoke:p0:publish
```

The script creates a generated `p0-publish-smoke-*` skill slug by default. Use `--slug` and `--version` only when you intentionally want a stable smoke fixture:

```bash
pnpm smoke:p0:publish -- --slug p0-publish-smoke-staging --version 0.1.0
```

Production writes are blocked by default. To run this against `https://api.useskillhub.com`, operators must explicitly pass `--allow-production` or set `SKILLHUB_P0_PUBLISH_ALLOW_PRODUCTION=true`. Do this only for a planned production smoke because it creates marketplace state.

If the publisher token also has reviewer/admin access, the admin token can be omitted. `--skip-admin` is available for a partial publisher-only check, but the full P0 handoff proof should include admin review and audit checks before a customer demo.

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
