# SkillHub Product Requirements

## Product Definition

SkillHub is a universal skill registry, marketplace, and runtime gateway for AI agents.

The product lets:

- Developers and AI-agent builders find trusted skills.
- Publishers package and monetize reusable agent skills.
- Platform operators review, monitor, and govern skills.
- Agents discover and call skills through stable contracts, APIs, SDKs, CLI, and MCP.

## Problem

AI agents repeatedly rebuild the same capabilities: web research, CRM enrichment, support triage, spreadsheet analysis, invoice extraction, code review, and workflow integrations.

Current problems:

- Skills are scattered across repos, prompts, MCP servers, scripts, and APIs.
- Agents cannot reliably compare permissions, runtime behavior, or output schemas.
- Developers do not have a consistent install, versioning, or trust model.
- Skill authors do not have a clear publishing and monetization path.
- Marketplaces without review, ledger, and payout controls are unsafe to operate.

## Positioning

SkillHub should be:

- A registry for skill contracts.
- A marketplace for discovery, pricing, reviews, and trust.
- A runtime gateway for agent calls.
- A ledger-backed platform for usage, commissions, and payouts.

It should not be positioned as:

- Only a prompt library.
- Only an MCP directory.
- Only a SaaS landing page.
- Only a WordPress content site.

## Target Users

### Developer / Agent Builder

Needs:

- Find skills by task, category, permissions, price, runtime, and trust level.
- Inspect manifest, schemas, examples, and permissions before installing.
- Install by CLI, SDK, or MCP.
- Manage projects, API keys, budgets, subscriptions, and usage.
- Pin versions for predictable agent behavior.

### Publisher / Skill Author

Needs:

- Create skill packages.
- Submit versions for review.
- Track review comments and runtime checks.
- Choose pricing model.
- See usage, errors, revenue, refunds, and payout state.
- Connect payout account when paid publishing is enabled.

### Platform Reviewer

Needs:

- Review submitted skills.
- Compare manifest versions.
- Inspect permissions, runtime, examples, data policy, and risk level.
- Approve, reject, block, deprecate, or suspend skills.
- Leave decision notes and audit trail.

### Finance Admin

Needs:

- See GMV, platform fees, publisher shares, refunds, disputes, and payouts.
- Review blocked or high-value payouts.
- Understand why a balance is pending, available, paid, reversed, or blocked.
- Never edit historical money records directly.

### Super Admin

Needs:

- Manage users, organizations, publishers, skills, reviews, payouts, disputes, and audit logs.
- Override platform states with reasoned audit logs.
- Monitor system health.

## Core Product Areas

### Public Website

Required pages:

- Home.
- Marketplace.
- Registry.
- Skill detail.
- Agent integration.
- Docs.
- Publish entry.
- Pricing/terms later.

The public website must explain:

- What SkillHub is.
- Why agents need skill contracts.
- How developers install and call skills.
- How publishers earn money.
- How permissions and trust work.

### Marketplace

Requirements:

- Search skills.
- Filter by category.
- Filter by pricing model.
- Show risk level.
- Show price.
- Show runtime.
- Show install command.
- Show verification status.
- Link to skill detail.

Skill card must include:

- Name.
- Short description.
- Author later.
- Category.
- Tags.
- Price.
- Rating or quality signal.
- Success rate and latency once real data exists.
- Permission risk.
- Install command.

### Skill Detail

Requirements:

- Skill name, category, author, and summary.
- Verification state.
- Pricing model.
- Install commands for CLI, MCP, and SDK.
- Runtime type.
- Input/output schema examples.
- Permissions and reason for each permission.
- Security review notes.
- Use cases.
- Changelog.
- Operator notes or reviews.
- Deprecation and support expectations later.

### Publisher Dashboard

Requirements:

- Publisher overview.
- Skills list.
- Version status.
- Review pipeline.
- Runtime check results.
- Pricing setup.
- Usage analytics.
- Earnings ledger.
- Payout readiness.
- Payout history.
- Notification preferences, with actual email protocol integration deferred until the final integration phase.

### Developer Dashboard

Requirements:

- Projects.
- Project API keys.
- Approved skills.
- Version pins.
- Budgets and rate limits.
- Usage analytics.
- Subscriptions.
- Invoices.
- Webhooks.
- Notification preferences, with actual email protocol integration deferred until the final integration phase.

### Admin Dashboard

Requirements:

- Platform metrics.
- Skill review queue.
- Risk command center.
- Runtime incidents.
- Finance ledger.
- Payout review.
- Refund/dispute operations.
- User and org management.
- Audit stream.
- Notification/event templates, with actual email protocol integration deferred until the final integration phase.

## Skill Lifecycle Requirements

States:

```text
draft
submitted
in_review
verified
rejected
deprecated
suspended
```

Flow:

```text
publisher creates draft
-> schema validation
-> automated checks
-> submitted for review
-> reviewer decision
-> verified marketplace listing
-> new versions require review
-> incidents can deprecate or suspend listing
```

Acceptance criteria:

- A skill cannot become verified without a review record.
- A new version does not silently replace a verified version without review.
- Rejected and suspended skills record a reason.
- Public marketplace should show only allowed public listings.

## Runtime Requirements

Runtime types:

- HTTP.
- MCP.
- Local, restricted and reviewed carefully.

Invocation requirements:

- Project API key authentication.
- Skill version lookup.
- Permission policy check.
- Budget/rate-limit check.
- Invocation record.
- Latency and status tracking.
- Error code tracking.

Future execution modes:

- Proxy to external HTTP runtime.
- Proxy to MCP runtime.
- Route to managed connector/tool runtime.
- Local execution only in controlled environments.

## Money Requirements

Initial pricing models:

- Free.
- Paid per successful call.
- Monthly subscription.

Commission:

- Default platform fee: 20%.
- Default publisher share: 80%.
- Payment processing fees recorded separately.

Money requirements:

- Usage logs do not pay publishers directly.
- Billable usage creates transactions.
- Transactions create transaction splits.
- Splits create publisher balance entries.
- Balance starts pending.
- Balance becomes available after delay/risk window.
- Payout requires verified payout account.
- Refunds and disputes create adjustment records.
- Historical splits are never edited silently.

## Payout Requirements

Payout account states:

```text
not_configured
verification_required
verified
blocked
```

Payout states:

```text
requested
review
processing
paid
failed
blocked
```

Rules:

- No paid publishing before payout/KYC state is acceptable.
- No payout while account is suspended.
- Payout above threshold enters manual review.
- Blocked payout requires reason and retry condition.
- Every finance admin action writes audit log.

## Trust And Safety Requirements

SkillHub must track:

- Manifest validity.
- Runtime reachability.
- Permission risk.
- Secret requirements.
- Data retention notes.
- Version history.
- Publisher identity.
- Review decisions.
- Abuse reports later.

High-risk examples:

- Local execution.
- Filesystem write.
- Secret access.
- Payment or destructive workflow.
- Sensitive personal or business data handling.

High-risk skills require:

- Human review.
- Owner approval before installation.
- Clear permission explanation.
- Stronger audit logging.

## Full Product Scope

SkillHub should be specified as the full operating product from the beginning. We are not defining a reduced version. The implementation can still happen in phases, but the product requirements should remain complete so we do not design ourselves into a corner.

The full product must include:

- Auth.
- Organizations.
- Role-based access.
- Projects.
- Project API keys.
- Publisher profiles.
- Skill create/edit/version APIs.
- Skill review queue.
- Marketplace skill detail backed by database.
- Usage event table.
- Dashboard data from API.
- Admin review actions.
- Runtime invocation and metering.
- Pricing and subscriptions.
- Transaction ledger.
- Commission splits.
- Publisher balances.
- Payout review.
- Refunds and disputes.
- Admin audit logs.
- Notification/event templates.

## Deferred Final Integrations

These are product requirements, but the external integrations should be implemented last:

- Payment provider API integration.
- Payment capture.
- Connected payout account onboarding.
- Actual provider payout movement.
- Full tax/KYC automation.
- Email sending protocol and provider integration.

Even before these integrations are connected, SkillHub must still model:

- Payment states.
- Payout states.
- Balance states.
- Refund/dispute states.
- Notification triggers.
- Email template records.
- Audit logs for every payment, payout, dispute, refund, and notification action.

## Explicit Non-Goals

These should not be part of the first full product build unless we intentionally reopen scope:

- Multi-author revenue splits.
- Enterprise offline invoicing.
- Private enterprise marketplace.
- Arbitrary local code execution without a controlled runtime boundary.

## Success Metrics

Product metrics:

- Published skills.
- Verified skills.
- Active publishers.
- Active developer projects.
- Skill installs.
- Agent invocations.
- Successful invocation rate.
- Median runtime latency.
- Paid conversion rate later.
- Publisher earnings later.

Operational metrics:

- Review queue age.
- Failed runtime checks.
- Runtime error rate.
- Payout review age.
- Dispute/refund count.
- Admin actions with missing reason should be zero.

## Open Decisions

These need final decisions before implementation:

- Auth provider: NextAuth/Auth.js, Clerk, Supabase Auth, or custom session.
- Payment provider and region strategy.
- Whether SkillHub hosts skills, proxies skills, or only routes to external runtimes in phase one.
- Whether paid publishing launches invite-only.
- Minimum payout threshold.
- Review SLA for paid skills.
- Public terms for refunds, disputes, data retention, and takedowns.

## Phase Plan

### Phase 1: Real Accounts And Roles

- Auth.
- Users.
- Organizations.
- Membership roles.
- Publisher profile.
- Developer projects.
- API keys.

### Phase 2: Real Registry Workflow

- Skill CRUD.
- Skill versions.
- Manifest validation.
- Automated checks.
- Review queue.
- Admin approve/reject/block.

### Phase 3: Runtime And Usage

- Invocation endpoint.
- Version pinning.
- Permission policy.
- Project budgets.
- Usage events.
- Runtime logs.

### Phase 4: Marketplace Money

- Prices.
- Free/per-call/subscription access.
- Transactions.
- Transaction splits.
- Publisher balances.
- Read-only finance dashboard.

### Phase 5: Payouts

- Provider integration.
- Connected accounts.
- Payout requests.
- Payout review.
- Refunds and disputes.
- Public marketplace terms.
