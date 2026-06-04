# SkillHub Marketplace Platform Design

SkillHub is evolving from a registry and gateway into a marketplace and runtime layer for AI-agent skills. The product must separate three concerns from day one:

- Platform operations: SkillHub admins manage quality, risk, disputes, money rules, and platform health.
- Publisher operations: skill authors publish, maintain, price, and monitor their skills.
- Buyer/agent operations: developers and agents discover, subscribe to, and call skills safely.

## Product Areas

### Public Website

- Home: platform positioning, registry preview, gateway status, trust model.
- Registry: searchable skills with tags, verification, permission risk, version, pricing signal.
- Skill detail: overview, author, pricing, runtime type, manifest, schema, permissions, changelog, reviews.
- Docs: manifest contract, API, SDK, MCP, pricing and platform terms.
- Pricing: platform fee, paid skill pricing models, publisher payout timing.

### Current Web Route Map

- `/marketplace`: public marketplace model, pricing modes, commission split, and payout flow.
- `/dashboard`: publisher and developer workspace, including skill operations, projects, usage, earnings, and withdrawal readiness.
- `/admin`: platform operations for reviews, risk, finance, payout review, disputes, and audit trails.
- `/publish`: manifest submission console; paid publishing should later move behind authenticated publisher accounts.

These pages are intentionally separated even before authentication is connected. The user-facing dashboard and the platform admin dashboard must not share permissions, data loaders, or money actions once real accounts are added.

### Publisher Dashboard

- Overview: revenue, calls, success rate, active skills, review queue status.
- Skills: create, submit, update version, archive, view verification status.
- Skill analytics: calls, latency, errors, conversion, top consumers.
- Pricing: free, paid per call, subscription, bundle.
- Earnings: pending balance, available balance, paid out, refunds, disputes, platform fee.
- Payouts: connect payout account, request payout, payout history, tax/KYC status.
- Settings: organization, team members, API keys, webhook endpoints.

### Buyer / Developer Dashboard

- Projects: app or agent projects that consume skills.
- API keys: project-scoped keys, rate limits, rotation.
- Usage: calls, cost, errors, latency, skill breakdown.
- Subscriptions: active paid skills, plan, renewal, cancellation.
- Invoices: receipts, payment method, billing email.
- Saved skills: favorites, pinned versions, approved permission levels.

### Admin Dashboard

- Platform overview: GMV, revenue, payouts due, disputes, failed calls, active publishers.
- Skill review: submitted skills, manifest diff, permission risk, runtime test, approve/reject.
- Users and orgs: account status, publisher status, risk flags.
- Finance: transactions, platform fees, publisher shares, refunds, disputes, payout batches.
- Payout review: high-value payouts, blocked payouts, KYC missing, fraud flags.
- Moderation: reports, takedowns, abuse, malicious runtime entries.
- System: gateway health, queue health, API usage, audit logs.

## Roles

- Visitor: browse public pages and public skills.
- Developer: create projects, keys, subscriptions, call skills.
- Publisher: publish and monetize skills.
- Organization owner: manage teams, billing, payout account.
- Reviewer: approve/reject skills.
- Finance admin: payout operations, refunds, disputes.
- Super admin: full platform control.

## Skill Lifecycle

1. Draft: publisher creates skill manifest.
2. Submitted: publisher submits for review.
3. Automated checks: schema validation, runtime reachability, permission classification.
4. Human review: admin checks description, risk, policy, and sample output.
5. Verified: skill appears in public registry.
6. Version update: new version goes through review while old version remains available.
7. Deprecated: skill remains visible but discouraged.
8. Suspended: skill is hidden or blocked due to risk, abuse, or payment issue.

## Money Flow

SkillHub should not implement marketplace money movement by manually storing card data or directly holding user funds in the app database. Use a marketplace payment provider such as Stripe Connect for global rollout, because it supports connected accounts, onboarding, balances, platform fees, and payouts.

Initial model:

- Customer pays SkillHub checkout.
- SkillHub records an order or usage charge.
- Platform fee is calculated.
- Publisher share is credited to publisher balance.
- Refunds and disputes reduce available or future balance.
- Payouts are created only after the balance becomes available.

Recommended first pricing models:

- Free skill: no money flow, usage is still metered.
- Paid per call: every successful billable call creates a usage transaction.
- Monthly subscription: buyer pays recurring access to a skill or publisher bundle.

Delay complex models:

- Multi-author split.
- Revenue share between publisher teams.
- Enterprise contracts with offline invoices.
- Token-based prepaid credits.

## Commission Rules

Use versioned commission rules so historical transactions remain auditable.

Example:

- Platform fee: 20%.
- Publisher share: 80%.
- Payment processing fee: provider-dependent; record separately.
- Refund policy: refund reverses platform fee and publisher share proportionally when possible.
- Dispute policy: disputed amount and dispute fees are tracked against the responsible account according to payment provider model and platform terms.

Core records:

- `commission_rules`
- `transactions`
- `transaction_splits`
- `publisher_balances`
- `payouts`
- `refunds`
- `disputes`

## Payout / Withdrawal Design

Publisher payout states:

- Not configured: publisher has not connected a payout account.
- Verification required: payout provider needs more identity or business information.
- Pending balance: money exists but is not withdrawable yet.
- Available balance: eligible for payout.
- Payout requested: publisher requested payout or automatic payout scheduled.
- Processing: payout provider is moving funds.
- Paid: payout succeeded.
- Failed: payout failed and needs action.
- Blocked: admin or risk system blocked payout.

Withdrawal rules:

- Minimum payout threshold.
- Payout delay window for refunds and fraud review.
- Manual review above a configured amount.
- No payout while account is suspended or KYC is incomplete.
- Full ledger audit trail for every balance change.

## Data Model Draft

```text
users
organizations
organization_members
publisher_profiles
projects
api_keys

skills
skill_versions
skill_manifests
skill_reviews
skill_runtime_checks
skill_usage_events

products
prices
subscriptions
orders
invoices

commission_rules
transactions
transaction_splits
publisher_balances
payout_accounts
payouts
refunds
disputes

admin_audit_logs
webhook_events
```

## MVP Order

### Phase 1: Real Platform Foundation

- Auth and organizations.
- Publisher dashboard.
- Skill detail pages.
- Review workflow.
- Usage event table.

### Phase 2: Metering and Billing-Ready

- Project API keys.
- Usage analytics.
- Billable usage records.
- Pricing fields on skills.
- Admin finance dashboard in read-only mode.

### Phase 3: Marketplace Payments

- Payment provider integration.
- Connected payout accounts.
- Platform commission rules.
- Publisher balances.
- Payout history.

### Phase 4: Production Finance

- Refunds and disputes.
- Tax/KYC status.
- Payout risk review.
- Automated payout schedule.
- Public marketplace terms.

## Non-Negotiables

- Never pay out from raw usage logs. Usage must be converted into immutable transactions.
- Never edit historical commission results. Add adjustment transactions instead.
- Do not let publishers publish paid skills before payout/KYC status is valid.
- Every admin action on skills, payouts, refunds, and disputes must be audited.
- Keep free publishing and paid publishing as separate states.
