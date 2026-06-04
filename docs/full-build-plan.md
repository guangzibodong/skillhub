# SkillHub Full Build Plan

SkillHub does not use a reduced-release product definition. The product must be designed as a complete operating platform from the beginning.

Implementation can happen in phases, but each phase should fit the complete product architecture:

- Registry.
- Marketplace.
- Runtime gateway.
- Trust and review.
- Metering.
- Ledger.
- Payout states.
- Notifications.
- Admin operations.

Payment provider APIs and email sending protocols are final external integrations. Their states, records, triggers, and dashboards must still be designed earlier.

## Build Goal

Let a real publisher submit, operate, and monetize skills; let a real developer install and call skills from projects; let SkillHub review, govern, meter, audit, and eventually settle money safely.

## Complete Product Capabilities

### Accounts And Organizations

- User accounts.
- Organization ownership.
- Team membership.
- Roles: developer, publisher, owner, reviewer, finance admin, super admin.
- Role-based access control.
- Audit logs for privileged actions.

### Projects And API Keys

- Developer projects.
- Project-scoped API keys.
- Key rotation and revocation.
- Project budgets.
- Rate limits.
- Approved permissions.
- Version pins.
- Installed skill inventory.
- Skill update and deprecation inbox.
- Saved skills and collections.

### Publisher System

- Publisher profile.
- Publisher verification state.
- Skill drafts.
- Skill version submissions.
- Runtime check state.
- Review comments.
- Pricing setup.
- Usage analytics.
- Install analytics.
- Listing quality checklist.
- Buyer request board.
- Incident response queue.
- Revenue ledger.
- Payout account state.

### Registry And Marketplace

- Database-backed skill catalog.
- Skill detail pages.
- Search and filters.
- Ranking and quality signals.
- Manifest display.
- Input/output schema display.
- Runtime and permission display.
- Security/trust report.
- Pricing display.
- Install commands for CLI, SDK, and MCP.
- Similar or replacement skill suggestions.
- Publisher profiles.
- Verified publisher and verified skill states.

### Review And Trust

- Automated manifest validation.
- Automated runtime reachability checks.
- Permission classification.
- Human review queue.
- Approve/reject/block/deprecate/suspend decisions.
- Risk notes.
- Admin audit trail.
- Abuse reports and takedown queue.
- High-risk owner approval workflow.

### Runtime And Metering

- Runtime invocation endpoint.
- Project API key authentication.
- Permission policy checks.
- Budget and rate-limit checks.
- Version pinning.
- Invocation logs.
- Usage events.
- Latency and error metrics.

### Ledger And Finance

- Prices.
- Free, per-call, and subscription models.
- Transactions.
- Transaction splits.
- Commission rules.
- Publisher balances.
- Refund records.
- Dispute records.
- Finance admin dashboards.

### Payout Operations

- Payout account state.
- KYC/provider verification state.
- Pending and available balances.
- Payout requests.
- Manual payout review.
- Payout blocks and retry conditions.
- Payout audit logs.

The actual payment provider and payout movement integration is last.

### Notification Operations

- Notification event records.
- Notification templates.
- Notification preferences.
- Triggers for review, publish, runtime incidents, billing, payout, refund, and disputes.
- Delivery state.

The actual email protocol/provider integration is last.

## Build Order

### Phase 1: Identity And Access Foundation

- Auth.
- Users.
- Organizations.
- Organization members.
- Role-based access.
- Admin route protection.

### Phase 2: Projects And Publisher Accounts

- Developer projects.
- Project API keys.
- Publisher profiles.
- Publisher verification state.
- Dashboard shells backed by API data.
- Installed skill inventory.
- Saved skills.

### Phase 3: Registry Workflow

- Skill drafts.
- Skill versions.
- Manifest validation.
- Package metadata.
- Public marketplace from database.
- Skill detail from database.
- Publisher listing quality checklist.
- Buyer request board.

### Phase 4: Review And Trust

- Automated checks.
- Review queue.
- Admin review actions.
- Risk labels.
- Audit logs.
- Suspension/deprecation flows.
- Verified publisher and verified skill programs.
- Abuse reports and takedown workflow.

### Phase 5: Runtime And Usage

- Invocation API.
- Runtime adapters.
- Project policy checks.
- Usage event recording.
- Runtime logs.
- Metrics and alert states.
- Installed skill health and update inbox.
- Publisher install and usage analytics.

### Phase 6: Pricing And Ledger

- Skill prices.
- Free/per-call/subscription access logic.
- Transactions.
- Transaction splits.
- Commission rules.
- Publisher balances.
- Finance dashboard.

### Phase 7: Payout And Notification States

- Payout accounts.
- Payout requests.
- Payout review.
- Refund/dispute states.
- Notification events.
- Email templates.
- Notification preferences.

### Phase 8: Final External Integrations

- Payment provider API.
- Connected payout account onboarding.
- Payment capture.
- Real payout movement.
- Provider webhooks.
- Email sending protocol/provider.
- Final public terms for refunds, disputes, takedowns, data retention, and payouts.

## Non-Negotiables

- Do not pay publishers from raw usage logs.
- Do not edit historical commission splits.
- Do not mix user dashboard permissions with admin permissions.
- Do not approve high-risk skills without human review.
- Do not let paid publishing bypass payout readiness.
- Do not make notification flows depend on a late email-provider decision.
