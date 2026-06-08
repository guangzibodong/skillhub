# SkillHub Technical Architecture

This document is the source of truth for how SkillHub should be built as an operating product.

SkillHub is not only a website. It is a registry, marketplace, runtime gateway, trust system, notification/event system, and ledger-backed commerce platform for AI-agent skills.

## Architecture Principles

- API-first: every public UI action should map to a stable API operation.
- Contract-first: skills are defined by `skillhub.json`, not by marketing copy.
- Registry and marketplace are separate but connected: the registry stores capability contracts; the marketplace adds discovery, trust, pricing, and commercial operations.
- Ledger before payout: usage logs never trigger payouts directly.
- Version everything that affects behavior or money: skill versions, commission rules, prices, manifests, review decisions, and payout states.
- Separate user dashboard and admin dashboard from day one.
- High-risk skills require explicit review, permission explanation, and audit trail.

## Current Stack

```text
apps/web       Next.js public site, marketplace, dashboard, admin UI
apps/gateway   Hono API gateway for registry, publish, stats, and MCP discovery
packages/schema skillhub.json schema and TypeScript types
packages/sdk    TypeScript SDK foundation
packages/cli    skillhub CLI foundation
supabase         Postgres migrations
deploy/docker   Docker images for web and gateway
```

Production currently runs on a Debian server through Docker Compose:

```text
app.useskillhub.com -> reverse proxy -> skillhub-web -> Next.js
api.useskillhub.com -> reverse proxy -> skillhub-api -> Hono gateway
Postgres            -> skillhub-postgres
Redis               -> skillhub-redis
```

## Target Service Boundaries

### Web App

Responsibilities:

- Public home, registry, marketplace, docs, and skill detail pages.
- Publisher/developer dashboard.
- Platform admin dashboard.
- Authenticated user workflows once auth is added.
- No secret payment or runtime execution logic in browser code.

### Gateway API

Responsibilities:

- Public skill search and manifest lookup.
- Skill publish and version submission API.
- MCP-compatible discovery endpoint.
- Runtime invocation proxy in later phases.
- Usage event recording.
- Webhook receivers from payment provider and external services.

### Registry Domain

Owns:

- Skills.
- Skill versions.
- Manifests.
- Runtime declarations.
- Permissions.
- Tags and search metadata.
- Verification status.

### Trust And Review Domain

Owns:

- Automated manifest validation.
- Runtime reachability tests.
- Permission classification.
- Human review queue.
- Approval/rejection decisions.
- Abuse reports and takedowns.
- Admin audit logs.

### Runtime Domain

Owns:

- API key validation.
- Project budget/rate-limit checks.
- Permission policy checks.
- Runtime routing to HTTP, MCP, or local execution adapters.
- Invocation logs.
- Error and latency metrics.

### Metering And Billing Domain

Owns:

- Billable usage records.
- Price lookup.
- Subscription access checks.
- Transaction creation.
- Transaction splits.
- Publisher balances.
- Refunds and disputes.

### Payout Domain

Owns:

- Publisher payout account state.
- KYC/provider verification status.
- Available balance.
- Payout requests.
- Manual payout review.
- Payout provider status updates.

Use a marketplace payment provider such as Stripe Connect for connected accounts and payout movement. SkillHub should record the ledger and state; the provider should handle regulated money movement where possible.

Payment provider API integration should be implemented in the final integration phase. The product and database must still model payment, balance, payout, refund, and dispute states before the provider is connected.

### Notification Domain

Owns:

- Notification events.
- Email templates.
- User notification preferences.
- Review, publish, runtime incident, billing, payout, refund, and dispute notification triggers.
- Notification delivery state.

Email sending protocol and provider integration should be implemented in the final integration phase. Before that, the system should still record notification events and template state so the product flow is clear.

## Core Data Model

Already started in migrations:

```text
organizations
projects
skills
skill_versions
api_keys
skill_invocations
```

Marketplace and operations migrations add:

```text
users
organization_members
organization_billing_profiles
organization_payment_methods
publisher_profiles
skill_reviews
skill_prices
subscriptions
project_invoices
project_invoice_line_items
commission_rules
transactions
transaction_splits
publisher_balances
payout_accounts
payouts
refunds
disputes
admin_audit_logs
notification_events
notification_templates
notification_preferences
```

The implementation plan expands this into the next retention and operations tables:

```text
project_skill_installs
project_skill_policies
project_update_actions
skill_runtime_checks
skill_update_events
skill_incidents
saved_skills
buyer_requests
publisher_quality_scores
usage_events
```

Important rules:

- `skill_versions.manifest` is immutable for production use. New behavior needs a new version.
- `commission_rules` are versioned. Historical transaction splits must not be recalculated silently.
- `transactions` are immutable business events. Corrections use `adjustment` or `refund` rows.
- `publisher_balances` derive from transaction splits and payout state.
- `admin_audit_logs` must cover skill approvals, takedowns, refunds, disputes, and payout decisions.
- Notification events should be recorded before an email provider is connected, so business workflows do not depend on a late provider decision.

## Main User Flows

### Publisher Publish Flow

```text
Publisher creates skill manifest
-> manifest schema validation
-> draft skill version
-> automated checks
-> submitted review
-> reviewer approves/rejects/blocks
-> verified listing appears in registry/marketplace
-> publisher sets pricing
-> paid listing requires payout account readiness
```

### Developer Install Flow

```text
Developer searches marketplace
-> opens skill detail
-> reviews permissions, runtime, price, output schema
-> creates project or chooses existing project
-> approves permission policy and budget
-> installs via CLI/MCP/SDK
-> project API key calls gateway
```

### Agent Invocation Flow

```text
Agent requests skill
-> gateway authenticates project API key
-> gateway checks subscription lifecycle, budget, and version pin
-> gateway checks permission policy
-> runtime adapter executes skill
-> invocation is logged
-> billable success creates usage event
-> usage event later becomes transaction
```

### Money Flow

```text
Billable usage or subscription event
-> transaction
-> transaction split using active commission rule
-> publisher pending balance
-> balance becomes available after delay/risk window
-> payout request or scheduled payout
-> payout review if needed
-> manual PayPal/Alipay transfer for P0
-> admin audit trail
```

## API Shape

Current public API:

```text
GET  /health
GET  /v1/stats
GET  /v1/skills/search
GET  /v1/skills/:slug
POST /v1/skills
POST /mcp
```

Target API groups:

```text
/v1/auth/*
/v1/orgs/*
/v1/projects/*
/v1/api-keys/*
/v1/skills/*
/v1/skills/:slug/versions/*
/v1/reviews/*
/v1/runtime/invoke
/v1/usage/*
/v1/prices/*
/v1/subscriptions/*
/v1/transactions/*
/v1/publisher/balances/*
/v1/payouts/*
/v1/notifications/*
/v1/admin/*
/v1/webhooks/*
```

## Auth And Permissions

Target roles:

- Visitor.
- Developer.
- Publisher.
- Organization owner.
- Reviewer.
- Finance admin.
- Super admin.

Auth requirements:

- User sessions for web dashboard.
- Project-scoped API keys for agent calls.
- Admin-only routes protected by role checks.
- Publisher payout and pricing actions require organization ownership or publisher role.
- Every admin decision writes an audit log.

## Runtime Risk Model

Risk inputs:

- Network access.
- Browser access.
- Filesystem read/write access.
- Secret access.
- External user data handling.
- Payment or business-impacting actions.
- Local command execution.

Risk levels:

- Low: no external network, no browser, no filesystem write, no secrets.
- Medium: network, browser, uploaded-file read, or business data handling.
- High: filesystem write, secrets, local execution, payment impact, or sensitive data workflows.

High-risk skills require human review and may require project owner approval before installation.

## Observability

Minimum production telemetry:

- API request count, latency, and error rate.
- Skill invocation count, latency, status, and error code.
- Runtime check results.
- Review queue age.
- Failed payment/webhook events.
- Payout review queue.
- Audit log count by action.

## Deployment Model

Current production:

```bash
cd /opt/skillhub
git pull --ff-only
./scripts/run-postgres-migrations.sh
docker compose -f docker-compose.1panel.yml up -d --build
```

Future improvements:

- Add CI build check before deployment.
- Keep the database migration runner in every deployment path and track applied SQL in `schema_migrations`.
- Add production backup plan for Postgres.
- Add release notes and rollback steps.
- Add uptime monitoring for app and API health.

## Full Product Build Order

Read [Technical Implementation Plan](./technical-implementation-plan.md) for the database, API, frontend, and acceptance mapping.

This is not a reduced release plan. It is the order for building the complete product without mixing concerns.

### Phase 1: Platform Foundation

- Auth.
- Organizations.
- Role-based access control.
- Projects.
- Project API keys.
- Publisher profiles.
- Real dashboard data loaders.

### Phase 2: Registry And Review

- Skill create/update APIs.
- Skill versions.
- Automated manifest checks.
- Runtime reachability checks.
- Admin review queue.
- Public verified marketplace detail pages.

### Phase 3: Runtime And Metering

- Invocation API.
- Project budget and rate limits.
- Usage events.
- Runtime logs.
- Version pinning.
- Webhook events.

### Phase 4: Billing And Ledger

- Skill prices.
- Free/per-call/subscription access.
- Transactions.
- Transaction splits.
- Publisher balances.
- Admin finance dashboard.

### Phase 5: Finance, Payout States, And Notifications

- Payment state records.
- Payout account state.
- Payout requests.
- Refund/dispute state.
- Notification events.
- Email templates.
- User notification preferences.
- Admin finance and notification dashboards.

### Phase 6: Final External Integrations

- Payment provider integration.
- Connected payout accounts.
- KYC status.
- Real payment capture.
- Real payout movement.
- Email sending protocol/provider integration.
- Provider webhook handling.
- Risk holds from provider signals.
- Public marketplace terms.
