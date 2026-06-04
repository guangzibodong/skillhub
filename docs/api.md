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

The public marketplace and skill detail pages now read these registry endpoints first, then fall back to bundled demo content if the API is unavailable. Skill cards merge search summaries, manifest runtime/permission data, and public price records from `/v1/skills/:slug/prices`.

## Registry Stats

```bash
curl "https://api.useskillhub.com/v1/stats"
```

## Platform Overview

These endpoints expose the first real operating shape for the two-sided marketplace. They are safe to use before payment and email providers are connected because they read product states, not external provider movement.

```bash
curl "https://api.useskillhub.com/v1/platform/overview"
curl "https://api.useskillhub.com/v1/developer/overview"
curl "https://api.useskillhub.com/v1/admin/overview"
```

Publisher overview is organization scoped and requires a publisher, owner, or admin user token:

```bash
curl "https://api.useskillhub.com/v1/publisher/overview" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The overview includes:

- Developer installed-skill and update-inbox signals.
- Publisher review, runtime-check, buyer-request, and balance signals scoped to the token organization.
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

Project writes are organization scoped. When a user token installs a skill, updates a project policy, creates a project API key, or revokes a project API key, the gateway resolves the project organization and requires a matching organization membership. New project records are created under the user token's organization, not a global demo organization.

## Developer Project Operations

These endpoints model the developer side of the marketplace: installed skills, permission policies, and update/deprecation/incident inboxes.

Read the developer project operations view:

```bash
curl "https://api.useskillhub.com/v1/developer/projects?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response is scoped to the token organization and includes each project with active/revoked API key counts, installed/approved/owner-review skill counts, policy count, monthly budget, runtime calls, success/error/blocked counts, average latency, billable usage, gross usage cost, active subscriptions, and update-inbox count.

Read a single developer project command-center view:

```bash
curl "https://api.useskillhub.com/v1/developer/projects/research-agent" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response is scoped to the token organization and returns the project summary plus installed skills, per-skill policy and budget state, per-skill runtime and usage metrics, API key metadata, update inbox items, recent runtime invocations, subscription records, and invoice summaries. This powers `/dashboard/projects/[slug]` so developers can manage one agent project without stitching together many operational endpoints.

Read installed skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Install or update a skill version for a project:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skillSlug":"browser-research","version":"0.1.0"}'
```

Pause, restore, or remove an installed skill:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/installed-skills/browser-research/status" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended"}'
```

Allowed install statuses:

- `installed`: active and eligible for runtime policy checks.
- `suspended`: visible in the project console but blocked at runtime.
- `removed`: retained for audit and restoration, but blocked at runtime.

Install status changes are scoped to the token organization and write audit plus in-app notification records. Runtime invocation rejects any install that is not `installed`.

Pause, restore, or cancel a project subscription:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/subscriptions/demo-subscription-browser-research/status" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"paused"}'
```

Allowed project-managed subscription statuses:

- `active`: runtime can use subscription-priced skills when the current period is still valid.
- `paused`: the subscription is retained for restoration, but runtime calls are blocked.
- `canceled`: the subscription is closed and cannot be restored from the project console.

Subscription status changes are scoped to the token organization and write audit plus in-app notification records. Runtime invocation rejects subscription-priced skills when the project has no active or trialing subscription, when the period is expired, or when the subscription is paused, past due, or canceled.

Read project skill policies:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/policies" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
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
curl "https://api.useskillhub.com/v1/projects/research-agent/update-inbox" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Handle an update inbox item:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/update-inbox/demo-update-browser-research/action" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "scheduledFor": "2026-06-05T14:00:00.000Z",
    "note": "Review in the next agent release window."
  }'
```

Allowed update action statuses:

- `acknowledged`: the project operator has seen the update and left it in the queue.
- `scheduled`: the update has an owner-visible planned handling time.
- `adopted`: the update has been handled and leaves the active inbox.
- `ignored`: the project intentionally dismissed the update and it leaves the active inbox.

List project saved skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/saved-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Save a skill to a project collection before installing or buying:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/saved-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "collectionName": "evaluation"
  }'
```

Remove a saved skill:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/saved-skills/SAVED_SKILL_ID/remove" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Project installed skills, project policies, update inbox reads, and saved skill reads are protected by user access tokens and scoped to the token organization. Writes are protected by user access tokens and role checks. Update actions and saved-skill changes write project-scoped state, admin audit records, and in-app notifications. Project API keys are separate runtime credentials and cannot manage project policy.

The project detail console at `/dashboard/projects/[slug]` exposes the same policy, install, update-inbox, and saved-skill controls so developers can approve owner-review skills, adjust permission limits, set filesystem/network/browser/secret access, tune rate limits, update monthly budget caps, pause risky skills, restore suspended installs, handle version/security/incidents updates, save candidate skills for evaluation, or remove skills without leaving the workspace.

List generated project invoices:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Generate or refresh an invoice from posted project transactions:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/invoices/generate" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "usd",
    "periodStart": "2026-06-01T00:00:00.000Z",
    "periodEnd": "2026-07-01T00:00:00.000Z"
  }'
```

Read an invoice with line items:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices/INVOICE_ID" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Download an invoice CSV:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices/INVOICE_ID/download" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -o skillhub-invoice.csv
```

Invoices are generated from immutable posted `transactions`, not raw invocation logs. Regenerating the same project, period, and currency refreshes the same invoice totals and line items. Generation writes an audit record and in-app notification before payment-provider invoice APIs are connected.

## Organization Billing

Read the current organization billing readiness state:

```bash
curl "https://api.useskillhub.com/v1/organization/billing" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Update invoice billing profile:

```bash
curl -X PUT "https://api.useskillhub.com/v1/organization/billing/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "billingName": "Acme AI Ops",
    "billingEmail": "billing@example.com",
    "taxId": "US-123456",
    "country": "US",
    "addressLine1": "123 Market Street",
    "city": "San Francisco",
    "region": "CA",
    "postalCode": "94105",
    "invoiceNotes": "Route invoices to AI operations cost center."
  }'
```

Add or update a payment method state record. `providerPaymentMethodId` is a provider reference only; send no raw card or bank credentials to SkillHub:

```bash
curl -X POST "https://api.useskillhub.com/v1/organization/billing/payment-methods" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "manual",
    "providerCustomerId": "cus_manual_demo",
    "providerPaymentMethodId": "pm_manual_invoice",
    "methodType": "invoice",
    "status": "pending",
    "isDefault": true
  }'
```

Update an existing payment method state:

```bash
curl -X PUT "https://api.useskillhub.com/v1/organization/billing/payment-methods/PAYMENT_METHOD_ID" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready","isDefault":true}'
```

Organization billing is scoped to the token organization and available to owner/admin/finance roles. Payment method records store provider references, status, brand, and last4-style metadata only; raw card or bank credentials must stay with the final payment provider integration. Every billing profile or payment method state change writes audit and in-app notification records.

## Project API Keys

Project API keys authenticate agent runtime calls. The raw key is returned only once when it is created; SkillHub stores only a hash plus display metadata.
Project API key management is tenant scoped: project operators can list, create, and revoke keys only for projects in their authorized organization. The project detail console at `/dashboard/projects/[slug]` exposes the same create-and-revoke workflow and shows the raw key only immediately after creation.

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

Every allowed call writes a `skill_invocations` row. Successful calls also write a `usage_events` row. Per-call prices make the usage event billable; free and subscription skills still record usage without direct per-call billing. Subscription-priced skills must have an active or trialing project subscription whose current period has not expired; paused, past-due, canceled, missing, or expired subscriptions are blocked before execution and recorded as blocked invocations.

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

## Publisher Skill Operations

Publisher skill writes are organization scoped. A publisher token can publish, submit for review, and price only skills owned by its organization. The deployment service token can still perform controlled bootstrap operations, but product writes should use `SKILLHUB_USER_TOKEN`.

Read the publisher skill operations view:

```bash
curl "https://api.useskillhub.com/v1/publisher/skills?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response includes each owned skill's latest version, verification state, latest review signal, runtime check summary, install count, call count, success/error/blocked counts, average latency, billable usage, gross usage revenue, pricing state, quality score, and listing checklist.

If a skill slug already belongs to another organization, SkillHub rejects the publish/update request instead of moving ownership silently.

## Buyer Request Board

Buyer requests let developer organizations ask for missing agent skills and let publishers claim demand before building. The workflow is stored before payment and email integrations are connected, and every state change records audit and in-app notification rows.

Developer-side reads and creation:

```bash
curl "https://api.useskillhub.com/v1/developer/buyer-requests?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/developer/buyer-requests" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Slack incident summarizer",
    "description": "Summarize incident threads into timeline, owner actions, and customer-impact notes.",
    "category": "ops",
    "bountyCents": 45000,
    "currency": "usd",
    "dueAt": "2026-06-30T00:00:00.000Z"
  }'
```

Publisher-side request board:

```bash
curl "https://api.useskillhub.com/v1/publisher/buyer-requests?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Publishers see open requests plus requests claimed by their own publisher organization. They can claim open requests and submit builds:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/buyer-requests/$REQUEST_ID/claim" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/publisher/buyer-requests/$REQUEST_ID/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Developers can match, close, or cancel requests owned by their organization:

```bash
curl -X POST "https://api.useskillhub.com/v1/developer/buyer-requests/$REQUEST_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"matched","reason":"Submitted skill satisfies the request."}'
```

Buyer request states:

- `open`
- `claimed`
- `submitted`
- `matched`
- `closed`
- `canceled`

The dashboard buyer request exchange uses these endpoints directly: developers can create requests and record match/close/cancel decisions, while publishers can claim open demand and submit builds from the same workspace.

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

Setting a price requires publisher, owner, admin, or super-admin authorization and is scoped to the token organization. Active paid pricing still requires a verified publisher payout state.

Supported `billingModel` values:

- `free`
- `per_call`
- `subscription`

Until final payment-provider onboarding is connected, the internal publisher and payout states are still modeled in the database so pricing, metering, and ledger behavior can be tested safely.

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

Read the current publisher's scoped revenue ledger:

```bash
curl "https://api.useskillhub.com/v1/publisher/finance/ledger" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The publisher ledger is read-only and scoped to the token organization. It returns the same summary and recent transaction shape as the admin finance ledger, but only for transaction splits and balances attached to the current publisher profile. This is the source for the dashboard revenue ledger shown to publishers.

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

Read or update the publisher profile and payout account readiness:

```bash
curl "https://api.useskillhub.com/v1/publisher/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

```bash
curl -X PUT "https://api.useskillhub.com/v1/publisher/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"SkillHub Publisher","status":"active"}'
```

Create a payout-account onboarding handoff:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payout-account/onboarding" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "manual_deferred",
    "returnUrl": "https://app.useskillhub.com/dashboard",
    "refreshUrl": "https://app.useskillhub.com/dashboard"
  }'
```

Complete or block the deferred onboarding state:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payout-account/onboarding/complete" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SESSION_ID","status":"verified","reason":"Provider verification passed."}'
```

Current onboarding sessions are provider-deferred records. They model provider handoff URLs, session status, payout account status, publisher payout readiness, audit logs, and notification events before the final payment provider API is connected.

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

Publisher and developer-facing history is read-only and tenant scoped. Publishers see adjustment records for skills owned by their organization; project operators see adjustment records for their own project.

```bash
curl "https://api.useskillhub.com/v1/publisher/refunds?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/publisher/disputes?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/projects/research-agent/refunds?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/projects/research-agent/disputes?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

These endpoints return transaction, skill, project, amount, status, reason, and provider/reference fields. They do not create money movement; finance users still operate refund and dispute decisions through `/v1/admin/finance/*`.

## Notification Preferences

Notification preferences are user-scoped settings for the event topics that keep developers, publishers, and operators returning to SkillHub: review decisions, skill updates, runtime incidents, billing events, payouts, buyer requests, and sensitive account changes.

Read the active user's organization-scoped in-app notification inbox:

```bash
curl "https://api.useskillhub.com/v1/notifications?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The inbox returns `channel=in_app` events addressed to the active user or their token organization. `queued` events are unread; `sent` events are already read/delivered.

Mark one notification as read:

```bash
curl -X POST "https://api.useskillhub.com/v1/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Read the active user's preferences:

```bash
curl "https://api.useskillhub.com/v1/notifications/preferences" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Update one topic:

```bash
curl -X PUT "https://api.useskillhub.com/v1/notifications/preferences" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "skill.update",
    "inAppEnabled": true,
    "emailEnabled": true,
    "webhookEnabled": false
  }'
```

These endpoints require a user-scoped token because preferences belong to a user, not the deployment service token. They persist channel state and audit records now; actual email-provider delivery is still deferred to the final provider integration phase.

## Admin Notifications

Notification events are recorded before the final email provider is connected. Admin can inspect queued, sent, failed, and skipped events:

```bash
curl "https://api.useskillhub.com/v1/admin/notifications?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Current events are in-app/webhook/email state records only; actual email delivery is still deferred to the final provider integration phase.

## Abuse Reports And Takedowns

Developers and project operators can report a skill when runtime behavior, security, privacy, billing, quality, or spam signals need trust review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research-pro/abuse-reports" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "security",
    "severity": "high",
    "title": "Unexpected outbound domain during runtime",
    "description": "The skill called an undeclared analytics endpoint.",
    "projectSlug": "research-agent",
    "evidenceUrl": "https://example.com/evidence/runtime-domain-log"
  }'
```

The skill detail page exposes the same report flow so a signed-in operator can submit security, privacy, quality, billing, malicious-behavior, copyright, spam, or other trust reports directly from the listing.

Platform trust operators can read and decide the queue:

```bash
curl "https://api.useskillhub.com/v1/admin/abuse-reports?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/admin/abuse-reports/$REPORT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"restrict","reason":"Unverified outbound domain until publisher submits a fixed runtime manifest."}'
```

Decision actions are `triage`, `dismiss`, `warn`, `restrict`, `suspend`, and `resolve`. `restrict` moves the listing to `unlisted`; `suspend` also sets `verification_status` to `suspended`. Every decision records a takedown action, admin audit log, skill update event when relevant, and queued notification event before any external support/legal provider is connected.

## Review Workflow

Submit a skill for review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Publisher review submission is scoped to the token organization. A publisher cannot submit another organization's skill by slug.

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

Publishing requires a user token with `publisher`, `owner`, `admin`, or `super_admin`. The skill is created or updated under the token organization, and existing slugs cannot be reassigned across organizations.

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
