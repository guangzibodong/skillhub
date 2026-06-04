# SkillHub Technical Implementation Plan

This document turns the full product requirements into implementation order, domain boundaries, database tables, API surfaces, and acceptance checks.

SkillHub is a two-sided AI-agent skill marketplace:

- Publishers upload, maintain, verify, and monetize skills.
- Developers discover, install, approve, and run skills inside agent projects.
- Platform admins operate trust, review, incidents, money states, and payouts.

The implementation should make these three workspaces real before final payment and email provider integrations are connected.

## Product Value To Preserve In Engineering

Every feature should create at least one of these values:

- Developer value: faster skill discovery, safer installs, predictable runtime behavior, project-level control, usage/cost visibility.
- Publisher value: easier packaging, review credibility, install distribution, runtime feedback, demand signals, future revenue.
- Platform value: review control, risk visibility, audit trail, immutable money records, quality and ranking signals.

If a feature does not support one of those values, it is secondary.

## Implementation Domains

### 1. Identity And Workspace

Purpose:

- Let users own organizations, publisher profiles, and developer projects.
- Separate developer, publisher, reviewer, finance, and admin permissions.

Core tables:

- `users`
- `organizations`
- `organization_members`
- `publisher_profiles`
- `projects`
- `api_keys`

API groups:

- `/v1/orgs/*`
- `/v1/projects/*`
- `/v1/api-keys/*`
- `/v1/publisher/profile`

Acceptance checks:

- A project belongs to one organization.
- API keys are project-scoped and revocable.
- Publisher actions require publisher or owner role.
- Admin actions require reviewer, finance, or super admin role.

### 2. Skill Registry And Publishing

Purpose:

- Turn uploaded skills into versioned contracts.
- Keep runtime behavior inspectable before installation.

Core tables:

- `skills`
- `skill_versions`
- `skill_reviews`
- `skill_runtime_checks`

API groups:

- `/v1/skills/search`
- `/v1/skills/:slug`
- `/v1/skills`
- `/v1/skills/:slug/versions`
- `/v1/reviews/*`

Acceptance checks:

- A submitted skill version must have a valid manifest.
- A verified skill version must have a review decision.
- A new version cannot silently replace a verified version.
- Suspended skills cannot be installed or invoked.

### 3. Discovery And Developer Retention

Purpose:

- Make developers return to manage installed skills, versions, permissions, incidents, and cost.

Core tables:

- `project_skill_installs`
- `project_skill_policies`
- `skill_update_events`
- `skill_incidents`
- `saved_skills`

API groups:

- `/v1/projects/:projectId/installed-skills`
- `/v1/projects/:projectId/policies`
- `/v1/projects/:projectId/update-inbox`
- `/v1/projects/:projectId/saved-skills`

Acceptance checks:

- An installed skill records project, skill, version pin, approval state, and permission policy.
- High-risk skills require owner approval before invocation.
- Developers can see updates, deprecations, incidents, and replacements for installed skills.
- Saved skills and collections exist before purchase flows are added.

### 4. Publisher Retention

Purpose:

- Make publishers return to fix review issues, improve listings, respond to demand, and watch operational performance.

Core tables:

- `publisher_profiles`
- `skill_reviews`
- `skill_runtime_checks`
- `usage_events`
- `buyer_requests`
- `publisher_quality_scores`

API groups:

- `/v1/publisher/overview`
- `/v1/publisher/skills`
- `/v1/publisher/reviews`
- `/v1/publisher/runtime-checks`
- `/v1/publisher/buyer-requests`

Acceptance checks:

- Publishers can see review status and reviewer notes.
- Runtime checks expose pass/fail state and next action.
- Publisher analytics include installs, calls, success rate, latency, and errors.
- Buyer requests can be opened, claimed, submitted, matched, and closed.

### 5. Runtime And Metering

Purpose:

- Give agents a safe path to call skills through a project policy and version contract.

Core tables:

- `api_keys`
- `project_skill_installs`
- `project_skill_policies`
- `skill_invocations`
- `usage_events`

API groups:

- `/v1/runtime/invoke`
- `/v1/usage/*`
- `/mcp`

Acceptance checks:

- Runtime calls authenticate project API keys.
- Gateway checks install state, version pin, permission approval, budget, and rate limit.
- Every invocation records status, latency, error code, and skill version.
- Only successful billable invocations can create billable usage.

### 6. Billing-Ready Ledger

Purpose:

- Model commercial flows safely before integrating a payment provider.

Core tables:

- `skill_prices`
- `subscriptions`
- `commission_rules`
- `transactions`
- `transaction_splits`
- `publisher_balances`
- `refunds`
- `disputes`

API groups:

- `/v1/prices/*`
- `/v1/subscriptions/*`
- `/v1/transactions/*`
- `/v1/publisher/balances/*`
- `/v1/admin/finance/*`

Acceptance checks:

- Usage logs never pay publishers directly.
- Posted transactions create immutable splits.
- Commission rules are versioned.
- Balance changes use pending, available, paid, reversed, and blocked states.
- Refunds and disputes add adjustment records instead of editing history.

### 7. Payout And Notification States

Purpose:

- Prepare all payout and email workflows before final providers are connected.

Core tables:

- `payout_accounts`
- `payouts`
- `notification_events`
- `notification_templates`
- `notification_preferences`

API groups:

- `/v1/payouts/*`
- `/v1/notifications/*`
- `/v1/admin/payouts/*`
- `/v1/admin/notifications/*`

Acceptance checks:

- Paid publishing requires acceptable payout account state.
- Payout requests above a threshold enter manual review.
- Blocked payout records reason and retry condition.
- Review, incident, billing, payout, refund, and dispute events are recorded before email delivery exists.

## Frontend Pages To Make Real

### Public

- `/`: product value, trust model, registry preview.
- `/marketplace`: searchable catalog with filters, install commands, trust, pricing, and request board.
- `/skills/[slug]`: install, schemas, permissions, runtime, security notes, pricing, changelog, support.
- `/docs`: manifest, API, SDK, MCP, publishing, review, pricing, payout states.

### Developer Workspace

- `/dashboard`: project list, installed skills, budgets, API keys, usage, invoices, update inbox.
- `/dashboard/projects/[slug]`: project command center for installed skills, per-skill policy and budget state, API keys, update inbox, recent runtime calls, subscriptions, and operational next actions.

### Publisher Workspace

- `/publish`: package submission and manifest preflight.
- Future split: `/publisher`: skills, versions, reviews, runtime checks, analytics, buyer requests, earnings, payout readiness.

### Platform Admin

- `/admin`: review queue, risk command center, finance ledger, payout review, incidents, audit stream.

## Near-Term Build Sequence

1. Add missing retention and operations tables.
2. Add API overview endpoints for developer, publisher, admin, and platform health data.
3. Wire dashboards to API-backed data where possible, with safe fallback demo data.
4. Add skill install and project policy endpoints.
5. Add review queue endpoints and admin decision actions.
6. Add runtime invocation record and policy gate.
7. Add ledger creation functions for billable usage.
8. Add notification event recording.
9. Connect auth and role enforcement.
10. Integrate payment and email providers last.

## Current Implementation Progress

Completed:

- Retention and operations tables through migration `003_retention_operations.sql`.
- Platform, developer, publisher, and admin overview API endpoints.
- Dashboard and admin metric loading from the platform overview API with safe fallback data.
- Project installed-skill API endpoints.
- Project skill-policy API endpoints.
- Installed-skill update inbox API endpoint.
- Skill review submission endpoint.
- Admin review queue and review decision endpoints.
- Project API key creation, listing, and revocation.
- Runtime invocation endpoint with API key auth, installed-skill gate, permission policy checks, rate limit checks, budget checks, invocation logs, and usage events.
- SDK and CLI runtime invocation helpers.
- Skill price setup and listing endpoints.
- Billable usage ledger posting from `usage_events` into `transactions`, `transaction_splits`, and pending `publisher_balances`.
- Finance ledger read endpoint and matured balance release endpoint.
- Admin notification list endpoint.
- Dashboard and admin pages reading finance ledger and notification event data with safe fallback states.
- Payout workflow migration linking payouts to reserved publisher balance rows.
- Publisher payout readiness and request endpoints.
- Admin payout queue and payout decision endpoints.
- Dashboard and admin pages reading payout readiness and payout queue data.
- Refund and dispute workflow migration with adjustment transaction links.
- Admin refund request, refund decision, dispute open, and dispute decision endpoints.
- Dispute-lost flow can post refund adjustment records automatically.
- Admin risk table reads refund and dispute queues with safe fallback states.
- User access token table and bootstrap flow for initial operator identities.
- Gateway role checks for project, publisher, reviewer, finance, and admin operations.
- `/v1/auth/me` endpoint for inspecting the active subject and roles.
- Project mutations and project API key creation now persist under the authorized subject organization instead of the demo organization fallback.
- Organization-scoped user tokens are required for project writes; service tokens retain demo fallback for bootstrap and controlled operator flows.
- Publisher profile and payout-account onboarding endpoints.
- Provider-deferred onboarding session records for payout handoff, completion, blocking, audit, and notifications.
- Publisher dashboard reads payout account and onboarding state.
- Dashboard publisher account panel now lets publishers update their public profile name, create deferred payout onboarding sessions, open the provider handoff link, and record payout readiness decisions while preserving existing restricted/suspended publisher status when no status change is requested.
- Publisher-scoped refund and dispute history endpoints.
- Project-scoped refund and dispute history endpoints for developer operators.
- Publisher dashboard shows recent refund and dispute activity beside ledger and payout readiness.
- Publisher skill operations endpoint aggregating owned skills, review state, runtime checks, installs, calls, success rate, latency, billable usage, pricing, and quality checklist.
- Publisher skill publishing, review submission, and price writes now scope to the authorized subject organization and reject cross-organization slug ownership.
- Publisher dashboard publishing pipeline reads owned skill operations data instead of static rows.
- Developer project operations endpoint aggregating organization-scoped projects, API keys, installs, approvals, budgets, runtime calls, success/error/blocked counts, latency, billable usage, subscriptions, and update-inbox counts.
- Dashboard buyer project controls now read developer project operations data instead of static rows.
- Developer project detail endpoint aggregating one organization-scoped project with installed skills, per-skill policies, usage, runtime quality, API key metadata, update inbox, recent invocations, and subscription records.
- `/dashboard/projects/[slug]` now exposes a project command center with drill-down links from the dashboard project list.
- Project installed-skill, project policy, and update-inbox read endpoints now require project-operator authorization and filter by the authorized organization.
- `/dashboard/projects/[slug]` now includes per-skill policy editing for permission level, network/browser/filesystem/secret access, monthly budget, rate limit, and owner approval state.
- Project API key list and revoke operations now accept the authorized organization scope to prevent cross-tenant slug collisions.
- `/dashboard/projects/[slug]` now includes runtime key rotation UX: create a replacement key, reveal the raw key once, copy it, and revoke old keys.
- Publisher finance ledger endpoint now scopes revenue, platform-fee, publisher-share, balance, unprocessed usage, and recent transaction reads to the authorized publisher organization.
- Dashboard revenue ledger now reads the publisher-scoped finance ledger instead of the admin global finance ledger, so publishers see their own earnings state.
- Buyer request board endpoints now let developer organizations create and decide requests while publishers can view open demand, claim requests, and submit builds under organization-scoped authorization.
- Dashboard publisher workspace now shows a buyer request board with request, category, bounty, status, requester, due date, and next action signals.
- Dashboard buyer request exchange now exposes creation, claim, submit, match, close, and cancel controls so buyer demand and publisher supply can move without leaving the workspace.
- Project installed-skill status endpoint now lets project operators restore, suspend, or remove installs under organization-scoped authorization, with audit and notification records.
- Project detail console now exposes pause, restore, and remove controls for installed skills; runtime invocation already blocks non-installed statuses.
- Project subscription lifecycle endpoint now lets project operators pause, restore, or cancel subscriptions under organization-scoped authorization, with audit and notification records.
- Project detail console now exposes subscription pause, restore, and cancel controls; runtime invocation blocks subscription-priced skills when the subscription is missing, expired, paused, past due, or canceled.
- Project update-inbox action endpoint now lets project operators acknowledge, schedule, adopt, or ignore installed-skill update events under organization-scoped authorization, with audit and notification records.
- Project detail console now exposes update handling controls with notes and schedule dates; adopted and ignored updates leave the active inbox and project update counts.
- Project saved-skill endpoints now let project operators list, save, and remove candidate skills in named collections under organization-scoped authorization, with audit and notification records.
- Project detail console now exposes saved skills beside update and billing operations so developers can keep evaluation shortlists before installing or buying.
- Project invoice endpoints now let project operators list, generate, inspect, and download CSV invoices generated from posted project transactions under organization-scoped authorization.
- Project detail console now exposes invoice generation, totals, due dates, line item counts, and CSV download links so project finance history is visible before payment-provider invoice APIs are connected.
- Organization billing endpoints now let owner/admin/finance operators read and update billing profile data plus payment method state records under organization-scoped authorization, with audit and notification records.
- Notification preference endpoints now let authenticated users read and update channel choices for review, update, runtime, billing, payout, buyer-request, and account-security topics, with user-scoped authorization and audit records.
- User notification inbox endpoints now let organization-scoped users read in-app events and mark unread items as read, so recorded notification events become a repeat-use dashboard surface instead of admin-only logs.
- Dashboard organization operations now expose notification preference controls so users can choose in-app, email, and webhook channels before final email-provider delivery is connected.
- Dashboard organization operations now expose the user's in-app notification inbox with unread/read state and contextual links for project, skill, billing, payout, buyer-request, and trust events.
- Dashboard finance operations now exposes billing readiness, invoice profile editing, manual/provider payment method status, and default payment method controls before payment-provider APIs are connected.
- Publisher overview endpoint now requires publisher/owner/admin authorization and returns organization-scoped review, runtime-check, buyer-request, and publisher balance signals instead of global marketplace aggregates.
- Trust and safety migration now stores skill abuse reports plus takedown action history for triage, warning, restriction, suspension, dismissal, and resolution decisions.
- Abuse report APIs now let user-scoped reporters submit skill reports while trust operators list and decide the queue with audit logs, skill update events, notification records, and listing restriction/suspension state changes.
- Admin risk operations now expose a trust and takedown queue with decision controls so operators can act on quality, security, privacy, spam, billing, and malicious-runtime reports.
- Skill detail pages now expose a user-scoped trust report form so security, privacy, quality, billing, malicious-runtime, copyright, spam, and other reports can enter the takedown queue from the public listing.
- Public marketplace and skill detail pages now read live registry search, manifest, and price endpoints with bundled marketplace content as a safe fallback.
- Skill detail pages now expose project-scoped save and install controls, letting developers move a discovered skill into a selected project collection or installed-skill inventory without retyping the slug in the project console.
- Web console token session now lets operators sign in with a user access token, stores it as an httpOnly cookie, shows session scope in the dashboard, and makes dashboard data/actions prefer the active user session before falling back to server environment tokens.
- Developer project creation now lets organization-scoped users create new agent projects from the dashboard, with explicit API validation, organization-local slug uniqueness, audit logging, and in-app notification records.

Next:

- Full OAuth/passwordless login provider integration to replace pasted bootstrap-created user access tokens.
- Provider-specific payout account integration to replace manual deferred onboarding URLs.
- Payment-provider customer/session integration after billing states are stable.

## Engineering Acceptance Standard

Before a feature is considered complete, it must answer:

- Which user side does it serve?
- What first-visit or repeat-visit reason does it strengthen?
- What database state does it own?
- What API operation exposes it?
- What dashboard shows it?
- What admin or audit control is needed?
- What tests or typechecks prove it does not break the platform?
