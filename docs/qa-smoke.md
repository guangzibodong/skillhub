# SkillHub QA smoke checks

This smoke path covers the minimum launch surface for local builds and production:

- `GET /v1/stats`
- `GET /v1/auth/providers`
- `GET /v1/skills/search`
- `GET /v1/skills/:slug` for the first real public skill returned by search
- `GET /v1/publishers`
- `GET /v1/publishers/:slug` for the first real public publisher returned by the directory
- `GET /v1/admin/launch-readiness`
- Built app pages: `/`, `/?lang=zh`, `/marketplace`, `/marketplace?lang=zh`, `/publishers`, `/publishers?lang=zh`, `/registry`, `/registry?lang=zh`, `/agents`, `/agents?lang=zh`, `/docs`, `/docs?lang=zh`, `/publish`, `/publish?lang=zh`, `/publisher`, `/publisher?lang=zh`, `/developer`, `/developer?lang=zh`, `/dashboard`, `/dashboard?lang=zh`, `/account`, `/account?lang=zh`, `/login`, `/login?lang=zh`, `/admin`, `/admin?lang=zh`, `/terms`, and `/terms?lang=zh`, plus the first real public skill and publisher detail pages returned by public APIs in both English and Chinese when those rows exist.

The admin launch-readiness endpoint requires a user token with `support`, `admin`, or `super_admin`. If no token is configured, the smoke script verifies that the endpoint is protected and skips the readiness body shape check.

When a token is configured, the smoke now validates the launch-readiness contract, not only the summary shape. The response must keep the required sections for identity, email, webhook, marketplace operations, launch credibility, commercial readiness, and production guardrails; each section must keep its customer-demo evidence item keys, item statuses, operator actions, and summary counts. It also scans the authorized readiness body for authorization-shaped strings, user tokens, project API keys, webhook secrets, provider keys, raw API-key fields, and email-code previews. The smoke does not require blockers or warnings to be zero because real staging and production environments may legitimately report configuration gaps.

The public discovery check requires `/v1/skills/search?limit=5` to return HTTP 200 with a `skills` array. Empty arrays are valid only when public stats also report no published supply; if `/v1/stats` reports published skills but search returns none, smoke fails because that usually means registry migrations, review joins, or public listing filters are out of sync. When search returns at least one skill, the smoke now checks that the same slug returns a valid `/v1/skills/:slug` manifest with runtime, permission, schema, and identity fields before the app smoke checks the real `/skills/:slug` detail page.

The publisher directory check requires `/v1/publishers?limit=5` to return HTTP 200 with a `publishers` array. If public skill supply exists but no publisher row appears, smoke fails because the supplier-side trust chain would be invisible. When a publisher row exists, the smoke now verifies that `/v1/publishers/:slug` returns a profile with trust level, payout status, public metrics, and at least one public skill before the app smoke checks the public publisher profile page.

The app-page checks now validate more than HTTP 200. For key P0 pages, the script asserts that the rendered HTML still contains the expected operating markers:

- Home must expose the backend command-center handoff plus developer, publisher, and admin console links.
- Login must show the post-login workspace map and no-shared-password guidance.
- Dashboard must expose the workspace command center and P0 demo chain.
- Publish, publisher, developer, and admin pages must expose their operating queue or evidence-panel markers.

The same app check also fails on common Chinese mojibake markers across English and Chinese page variants, so a deployment cannot quietly pass smoke while showing corrupted bilingual UI copy to customers.

Before any API or app request, the general smoke also scans web source, QA scripts, and product docs for high-confidence encoding-corruption markers such as replacement characters, the U+951F/U+65A4/U+62F7 replacement sequence, and UTF-8-as-GBK fragments. This keeps bilingual copy and launch documentation from drifting into corrupted source text even when a terminal renders normal UTF-8 poorly.

## Static quality gates

Run these checks before committing product or QA changes:

```bash
pnpm typecheck
pnpm lint
```

The web app has an explicit Next.js ESLint configuration, so `pnpm lint` must run non-interactively in CI and local release checks instead of opening Next's first-run ESLint setup prompt.

## P0 developer handoff

The Journey A smoke is separate because it mutates project state. It proves that marketplace discovery can become durable developer workspace state without direct database checks:

- `GET /marketplace`, skill detail, `/developer`, and `/dashboard`
- `GET /v1/skills/:skillSlug`
- `POST /v1/developer/projects`
- `POST /v1/projects/:projectSlug/saved-skills`
- `POST /v1/projects/:projectSlug/installed-skills`
- `POST /v1/projects/:projectSlug/api-keys`
- `POST /v1/projects/:projectSlug/runtime/test`
- `GET /v1/developer/projects/:projectSlug`
- `GET /v1/notifications`
- `GET /v1/admin/audit-logs`

The smoke also verifies that listed project keys do not expose the raw reveal-once API key after creation, that the runtime test is `console_test` and non-billable, and that protected project detail, notification, and admin audit responses do not expose authorization-shaped strings, raw project API keys, webhook secrets, provider keys, raw API-key fields, or email-code previews.

Run it against local or staging services with an organization-scoped developer, owner, or admin token, plus an admin/support token for audit verification:

```bash
export SKILLHUB_P0_DEVELOPER_TOKEN="<developer-or-owner-user-token>"
export SKILLHUB_P0_DEVELOPER_ADMIN_TOKEN="<admin-or-support-user-token>"
pnpm smoke:p0:developer
```

Windows PowerShell:

```powershell
$env:SKILLHUB_P0_DEVELOPER_TOKEN = "<developer-or-owner-user-token>"
$env:SKILLHUB_P0_DEVELOPER_ADMIN_TOKEN = "<admin-or-support-user-token>"
pnpm smoke:p0:developer
```

The script creates a generated `p0-dev-smoke-*` project slug by default and installs `browser-research`. Use `--project-slug` and `--skill-slug` only when you intentionally want a stable smoke fixture:

```bash
pnpm smoke:p0:developer -- --project-slug p0-dev-smoke-staging --skill-slug browser-research
```

Production writes are blocked by default. To run this against `https://api.useskillhub.com`, operators must explicitly pass `--allow-production` or set `SKILLHUB_P0_DEVELOPER_ALLOW_PRODUCTION=true`. Do this only for a planned production smoke because it creates project, saved-skill, install, key, invocation, notification, and audit state. `--skip-admin` is available for a partial developer-only check, but the full P0 handoff proof should include admin audit verification before a customer demo.

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

Passing assertions mean the generated draft, exact-version review submission, publisher workspace row, publisher notification, admin review row, admin audit record, and admin notification queue are connected without direct database checks. The smoke also scans those protected publisher/admin responses for authorization-shaped strings, user/project/webhook/provider keys, raw API-key fields, and email-code previews.

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

## P0 admin operations

The Journey C smoke is non-mutating. It proves the admin console is an operating workspace for launch readiness, review, trust, finance, payout, notifications, webhooks, identity, marketplace curation, and audit rather than a decorative metrics page:

- `GET /admin`
- Protected-boundary checks for admin-only endpoints without a token.
- `GET /v1/admin/overview`
- `GET /v1/admin/launch-readiness`
- `GET /v1/admin/reviews`
- `GET /v1/admin/finance/ledger`
- `GET /v1/admin/finance/commission-rules`
- `GET /v1/admin/finance/refunds`
- `GET /v1/admin/finance/disputes`
- `GET /v1/admin/payouts`
- `GET /v1/admin/notifications`
- `GET /v1/admin/notification-deliveries`
- `POST /v1/admin/notification-deliveries/process` in `dry_run` mode, including secret-safe fanout preview counts.
- `GET /v1/admin/webhook-deliveries`
- `POST /v1/admin/webhook-deliveries/process` in `dry_run` mode.
- `GET /v1/admin/identity-directory`
- `GET /v1/admin/audit-logs`
- `GET /v1/admin/abuse-reports`
- `GET /v1/admin/incidents`
- `GET /v1/admin/skill-feedback`
- `GET /v1/admin/marketplace-curation`
- `GET /v1/admin/marketplace-curation/appeals`

Run it with an admin/super-admin token before customer demos:

```bash
export SKILLHUB_P0_ADMIN_TOKEN="<admin-or-super-admin-user-token>"
pnpm smoke:p0:admin
```

Windows PowerShell:

```powershell
$env:SKILLHUB_P0_ADMIN_TOKEN = "<admin-or-super-admin-user-token>"
pnpm smoke:p0:admin
```

If operator duties are split across accounts, use specialized tokens:

```bash
export SKILLHUB_P0_ADMIN_REVIEW_TOKEN="<reviewer-or-admin-user-token>"
export SKILLHUB_P0_ADMIN_FINANCE_TOKEN="<finance-or-admin-user-token>"
export SKILLHUB_P0_ADMIN_TRUST_TOKEN="<trust-or-admin-user-token>"
export SKILLHUB_P0_ADMIN_CURATION_TOKEN="<reviewer-or-admin-user-token>"
pnpm smoke:p0:admin
```

The script also checks common Chinese mojibake markers, authorization-shaped secret leaks in admin responses, and launch-readiness contract drift across the required readiness sections and evidence item keys. It performs no writes, so no `--allow-production` flag is needed.

## P0 demo chain

The P0 demo-chain smoke is mutating and should be used before customer walkthroughs when the team needs one proof that the three frozen journeys connect end to end:

- Publisher creates a generated public draft skill through `POST /v1/skills`.
- Publisher submits the exact semantic version through `POST /v1/publisher/skills/:skillSlug/versions/:version/submit`.
- Reviewer/admin approves the review through `POST /v1/admin/reviews/:reviewId/decision`.
- Public discovery shows the verified skill through `GET /v1/skills/search` and `GET /v1/skills/:slug`.
- Publisher commercial readiness is completed through publisher profile, terms acceptance, provider-deferred payout onboarding, and active per-call pricing. The onboarding step asserts the `manual_deferred` provider, `po_` provider-session id, safe handoff URL protocol, and absence of embedded URL credentials.
- Developer creates a project, saves the skill, installs the approved version, creates a reveal-once project key, and runs a governed console test.
- MCP `tools/list` and `tools/call` use the reveal-once project key and the same installed-skill runtime governance path; the agent runtime call is billable when the smoke's ledger proof is enabled.
- Finance processing posts the billable usage into `transactions`, `transaction_splits`, and `publisher_balances`, then admin and publisher ledger reads must expose the same posted usage transaction.
- Finance release processing moves matured publisher balances to `available`; the publisher then requests payout, finance approves it, finance marks provider-deferred payout completion with a synthetic provider reference, and publisher/admin payout reads must expose the paid state.
- Publisher/developer notification inboxes and admin audit/notification queues expose the handoff without direct database checks.

Run it against local or staging services with either one org-scoped admin/super-admin token or split role tokens:

```bash
export SKILLHUB_P0_DEMO_TOKEN="<org-scoped-admin-or-super-admin-user-token>"
pnpm smoke:p0:demo
```

Windows PowerShell:

```powershell
$env:SKILLHUB_P0_DEMO_TOKEN = "<org-scoped-admin-or-super-admin-user-token>"
pnpm smoke:p0:demo
```

For separated operator accounts:

```bash
export SKILLHUB_P0_DEMO_PUBLISHER_TOKEN="<publisher-or-owner-user-token>"
export SKILLHUB_P0_DEMO_REVIEWER_TOKEN="<reviewer-or-admin-user-token>"
export SKILLHUB_P0_DEMO_DEVELOPER_TOKEN="<developer-or-owner-user-token>"
export SKILLHUB_P0_DEMO_FINANCE_TOKEN="<finance-or-admin-user-token>"
export SKILLHUB_P0_DEMO_ADMIN_TOKEN="<admin-or-support-user-token>"
pnpm smoke:p0:demo
```

Use `--skip-ledger` only when a local developer lacks finance/admin credentials and needs to debug the non-money P0 chain. The full pre-demo run should keep ledger and payout proof enabled. For fresh local or staging rehearsals, configure the gateway with `SKILLHUB_BALANCE_DELAY_DAYS=0` or run against already matured generated balances; otherwise the smoke correctly reports that the new publisher balance is not yet eligible for payout.

The script creates generated `p0-demo-chain-*` and `p0-demo-project-*` records by default and uses a synthetic per-call amount large enough to satisfy the default minimum payout after the default commission split. Production writes are blocked unless `--allow-production` or `SKILLHUB_P0_DEMO_ALLOW_PRODUCTION=true` is set. Use that only for a planned production demo rehearsal because it creates skill, review, profile/terms/payout-readiness, price, project, install, API-key, invocation, usage-event, transaction, split, balance, payout, notification, and audit state. Output is redacted and must not be used to share credentials.

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

Do not commit tokens or paste token values into reports. The script redacts the authorization header from error output and fails if the authorized launch-readiness body exposes credential-shaped values.

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
