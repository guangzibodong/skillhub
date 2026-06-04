# SkillHub API

Base URL:

```txt
https://api.useskillhub.com
```

## Search Skills

```bash
curl "https://api.useskillhub.com/v1/skills/search?q=research"
```

Response:

```json
{
  "skills": [
    {
      "id": "browser-research",
      "slug": "browser-research",
      "displayName": "Browser Research",
      "description": "Research a web topic and return concise findings with source URLs.",
      "tags": ["research", "browser", "citations"],
      "version": "0.1.0",
      "verificationStatus": "verified",
      "permissionLevel": "medium"
    }
  ]
}
```

## Get Skill Manifest

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research"
```

## Registry Stats

```bash
curl "https://api.useskillhub.com/v1/stats"
```

## Platform Overview

These endpoints expose the first real operating shape for the two-sided marketplace. They are safe to use before payment and email providers are connected because they read product states, not external provider movement.

```bash
curl "https://api.useskillhub.com/v1/platform/overview"
curl "https://api.useskillhub.com/v1/developer/overview"
curl "https://api.useskillhub.com/v1/publisher/overview"
curl "https://api.useskillhub.com/v1/admin/overview"
```

The overview includes:

- Developer installed-skill and update-inbox signals.
- Publisher review, runtime-check, buyer-request, and balance signals.
- Admin review, payout, notification, incident, and runtime-risk signals.

## Identity And RBAC

Business API writes use user access tokens with role checks. The deployment service token can bootstrap the first user token and remains available for emergency service operations, but it is no longer the product permission model. In the current gateway environment the service token is read from `SKILLHUB_ADMIN_TOKEN`; API examples call it `SKILLHUB_SERVICE_TOKEN` to distinguish it from user credentials.

Create an initial user token from the service token:

```bash
curl -X POST "https://api.useskillhub.com/v1/auth/bootstrap-token" \
  -H "Authorization: Bearer $SKILLHUB_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@useskillhub.com",
    "displayName": "SkillHub Operator",
    "organizationSlug": "skillhub",
    "organizationName": "SkillHub",
    "role": "owner",
    "platformRole": "admin",
    "tokenName": "Initial user token"
  }'
```

The raw user token is returned only once. SkillHub stores only the token hash, prefix, and last four characters.

Inspect the current token subject:

```bash
curl "https://api.useskillhub.com/v1/auth/me" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Role boundaries:

- Project operations require `developer`, `owner`, `admin`, or `super_admin`.
- Publisher operations require `publisher`, `owner`, `admin`, or `super_admin`.
- Review operations require `reviewer`, `admin`, or `super_admin`.
- Finance, refunds, disputes, and payouts require `finance`, `admin`, or `super_admin`.
- Platform admin read operations require `support`, `admin`, or `super_admin`.

## Developer Project Operations

These endpoints model the developer side of the marketplace: installed skills, permission policies, and update/deprecation/incident inboxes.

Read installed skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/installed-skills"
```

Install or update a skill version for a project:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skillSlug":"browser-research","version":"0.1.0"}'
```

Read project skill policies:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/policies"
```

Update a project skill policy:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/policies/browser-research" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPermissionLevel": "medium",
    "allowNetwork": true,
    "allowBrowser": true,
    "filesystemAccess": "none",
    "monthlyBudgetCents": 48000,
    "rateLimitPerMinute": 60,
    "approvalRequired": false
  }'
```

Read the installed-skill update inbox:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/update-inbox"
```

Writes are protected by user access tokens and role checks. Project API keys are separate runtime credentials and cannot manage project policy.

## Project API Keys

Project API keys authenticate agent runtime calls. The raw key is returned only once when it is created; SkillHub stores only a hash plus display metadata.

Create a project API key:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/api-keys" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Research Agent runtime"}'
```

List project API keys:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/api-keys" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Revoke a project API key:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/api-keys/$KEY_ID/revoke" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

## Runtime Invocation

Runtime calls use a project API key, not a user or service token.

```bash
curl -X POST "https://api.useskillhub.com/v1/runtime/invoke" \
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "input": {
      "query": "MCP server registry trends"
    }
  }'
```

Before recording a successful invocation, the gateway checks:

- Project API key is valid and not revoked.
- Skill is installed for the project.
- Installed version matches when a version is requested.
- Skill is verified or deprecated, not draft, rejected, or suspended.
- Project install is approved.
- Project policy allows the skill permission profile.
- Rate limit and monthly budget are not exceeded.

Every allowed call writes a `skill_invocations` row. Successful calls also write a `usage_events` row. Per-call prices make the usage event billable; free and subscription skills still record usage without direct per-call billing.

External runtime proxying is disabled by default. When `SKILLHUB_RUNTIME_PROXY=enabled`, HTTP runtime skills can be proxied to their manifest entrypoint. Otherwise the gateway returns a metered contract response so policy, logging, and billing paths can be tested safely.

SDK:

```ts
import { SkillHubClient } from "@useskillhub/sdk";

const skillhub = new SkillHubClient({ apiKey: process.env.SKILLHUB_PROJECT_API_KEY });
const result = await skillhub.run("browser-research", { query: "MCP server registry trends" });
```

CLI:

```bash
SKILLHUB_API_KEY="$SKILLHUB_PROJECT_API_KEY" \
  skillhub run browser-research '{"query":"MCP server registry trends"}'
```

## Skill Pricing

Read skill prices:

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research/prices"
```

Set a skill price:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/prices" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "billingModel": "per_call",
    "unitAmountCents": 2,
    "currency": "usd",
    "status": "active"
  }'
```

Supported `billingModel` values:

- `free`
- `per_call`
- `subscription`

Active paid pricing requires a verified publisher payout state. Until final payment-provider onboarding is connected, the internal publisher and payout states are still modeled in the database so pricing, metering, and ledger behavior can be tested safely.

## Finance Ledger

SkillHub never pays publishers from raw usage logs. Billable usage must be posted into the ledger first:

```text
usage_events
-> transactions
-> transaction_splits
-> publisher_balances
```

Read the finance ledger:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/ledger" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Post unprocessed billable usage into the ledger:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/process-usage" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":50}'
```

Ledger posting:

- Creates a posted `transactions` row.
- Creates a `transaction_splits` row using the active commission rule.
- Creates a pending `publisher_balances` row.
- Links the `usage_events` row to the transaction.
- Records a queued in-app notification event.

Release matured pending balances:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/release-balances" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":100}'
```

Balances start as `pending` and become `available` only after their risk/refund window has elapsed. The default balance delay is 14 days and can be configured with `SKILLHUB_BALANCE_DELAY_DAYS`.

## Payout Workflow

Payout provider movement is still deferred, but SkillHub now models the internal payout state machine and reserves exact balance rows before a payout can be marked paid.

Read publisher payout readiness:

```bash
curl "https://api.useskillhub.com/v1/publisher/payouts" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Request a payout for all currently available publisher balances in a currency:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payouts" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency":"usd"}'
```

The current provider-deferred workflow requests all available balances by currency. This avoids partial balance mutation until the final payment provider is connected.

Read the admin payout queue:

```bash
curl "https://api.useskillhub.com/v1/admin/payouts?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Record a payout decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/payouts/$PAYOUT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","reason":"KYC and balance review passed."}'
```

Supported payout actions:

- `approve`: moves `requested` or `review` payouts to `processing`.
- `mark_paid`: marks the payout paid and moves linked publisher balances to `paid`.
- `fail`: marks the payout failed and releases linked balances back to `available`.
- `block`: blocks the payout and keeps linked balances blocked until finance review resolves it.

Every payout request and decision records an audit log and a queued in-app notification event.

## Refund And Dispute Workflow

Refunds and disputes create adjustment records instead of mutating original usage or subscription transactions.

Read the admin refund queue:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/refunds?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Request a refund against a positive usage or subscription transaction:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/refunds" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TRANSACTION_ID",
    "amountCents": 9600,
    "reason": "Duplicate billable call."
  }'
```

Record a refund decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/refunds/$REFUND_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"post","reason":"Approved after usage review."}'
```

Supported refund actions:

- `approve`: marks the refund approved but does not move ledger value yet.
- `reject`: rejects the refund request with an audit reason.
- `post`: creates a negative `transactions` row, negative `transaction_splits` row, and reversed publisher balance adjustment.
- `fail`: records that the provider or operating step failed.

Read the admin dispute queue:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/disputes?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Open a dispute:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/disputes" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TRANSACTION_ID",
    "amountCents": 7600,
    "status": "warning_needs_response",
    "reason": "Card network warning needs evidence."
  }'
```

Resolve or update a dispute:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/disputes/$DISPUTE_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"lost","reason":"Evidence window expired.","postRefund":true}'
```

If a dispute is marked `lost` and `postRefund` is not false, SkillHub creates and posts the corresponding refund adjustment automatically. Every refund and dispute state change records admin audit and queued notification events.

## Admin Notifications

Notification events are recorded before the final email provider is connected. Admin can inspect queued, sent, failed, and skipped events:

```bash
curl "https://api.useskillhub.com/v1/admin/notifications?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Current events are in-app/webhook/email state records only; actual email delivery is still deferred to the final provider integration phase.

## Review Workflow

Submit a skill for review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Read the admin review queue:

```bash
curl "https://api.useskillhub.com/v1/admin/reviews" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Record a review decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/reviews/$REVIEW_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","notes":"Manifest, runtime, permissions, and examples accepted."}'
```

Decision status can be:

- `approved`: skill becomes verified.
- `rejected`: skill becomes rejected and keeps reviewer notes.
- `blocked`: skill becomes suspended and writes risk/audit events.

## Publish Skill

Publishing requires a user token with `publisher`, `owner`, `admin`, or `super_admin`.

```bash
curl -X POST "https://api.useskillhub.com/v1/skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"manifest": { ... }}'
```

## MCP Discovery

```bash
curl -X POST "https://api.useskillhub.com/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
