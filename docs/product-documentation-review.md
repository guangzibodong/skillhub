# Product Documentation Review

This review checks whether the SkillHub product documents are detailed enough to guide product and engineering work.

## Review Result

The previous documents were directionally correct but incomplete.

They described:

- Registry.
- Marketplace.
- Runtime gateway.
- Trust layer.
- Dashboard areas.
- Ledger and payout constraints.

They did not explain deeply enough:

- Why users come the first time.
- Why users come back.
- How publishers and developers are different marketplace sides.
- What practical value each side receives before payment integration.
- What quality bar uploaded skills must pass.
- How search/ranking should work.
- What repeat-use loops keep the platform alive.
- What signals should compound into marketplace trust.

## Main Product Risk

The biggest risk is building a complete-looking platform that behaves like a static directory.

A static directory can attract a first click, but it does not create strong repeat use.

SkillHub must become an operating workspace:

- Developers return to manage installed skills, usage, budgets, versions, incidents, and approvals.
- Publishers return to manage reviews, runtime checks, installs, usage, quality, buyer requests, and revenue state.
- Admins return to manage review queues, risk, trust, ranking, incidents, ledger, payouts, disputes, and notifications.

## Two-Sided Marketplace Risk

SkillHub has two external user groups:

- Supply side: uploaders/publishers.
- Demand side: downloaders/developers/agent builders.

If publishers do not see demand, feedback, analytics, trust, or future earnings, they will not maintain skills.

If developers do not see safety, installability, quality, and operational control, they will not trust skills in real agent workflows.

The documents now explicitly define first-visit and repeat-visit value for both sides.

## What Was Added

Added [User Value And Retention Strategy](./user-value-and-retention.md), covering:

- Developer first-visit value.
- Developer repeat-visit value.
- Publisher first-visit value.
- Publisher repeat-visit value.
- Marketplace flywheel.
- Search and ranking logic.
- Uploaded skill quality bar.
- Verified and paid skill requirements.
- Required retention product surfaces.

Updated [Product Requirements](./product-requirements.md), adding:

- Supply-side and demand-side definitions.
- First-visit and repeat-visit value.
- Discovery/ranking requirements.
- Installed-skill management.
- Publisher analytics.
- Buyer request board.
- Skill upload quality requirements.
- Verified skill requirements.
- Paid skill requirements.

Updated [Full Build Plan](./full-build-plan.md), adding:

- Installed skill inventory.
- Skill update/deprecation inbox.
- Saved skills and collections.
- Install analytics.
- Listing quality checklist.
- Buyer request board.
- Incident response queue.
- Ranking and quality signals.
- Verified publisher and verified skill states.
- Abuse reports and takedown workflow.

Updated [Marketplace Competitive Research](./marketplace-competitive-research.md), adding lessons from:

- Smithery.
- Composio.
- Toolhouse.
- Agent.ai.
- Hugging Face Hub.
- Docker Hub.
- GitHub Marketplace.
- Chrome Web Store.
- OpenAI GPT Store.
- Stripe Connect.

Added [Technical Implementation Plan](./technical-implementation-plan.md), mapping:

- Product value by user side.
- Implementation domains.
- Database tables.
- API groups.
- Frontend surfaces.
- Acceptance checks.

Added the first retention operations migration, covering:

- Installed skills and project skill policies.
- Runtime checks, update events, and incidents.
- Saved skills and buyer requests.
- Usage events.
- Notification templates, events, and preferences.

Added first operational API endpoints, covering:

- Project installed skills.
- Project skill policies.
- Installed-skill update inbox.
- Skill review submission.
- Admin review queue.
- Admin review decisions and audit/event recording.

Added first runtime API endpoints, covering:

- Project API key creation, listing, and revocation.
- Project API key authentication for runtime calls.
- Runtime policy checks against installed skills, approval state, permission policies, rate limits, and budgets.
- Invocation logging and usage event recording.
- SDK and CLI runtime calls.

Added first billing-ledger API endpoints, covering:

- Skill price setup and listing.
- Billable usage processing.
- Transaction creation.
- Commission split creation.
- Pending publisher balance creation.
- Matured balance release.
- Read-only finance ledger summary.

Connected the operating UI to live platform data, covering:

- Admin finance metrics from the ledger.
- Admin money table from recent ledger transactions.
- Admin notification/audit stream from notification events.
- Dashboard publisher balances and revenue ledger from the same finance source.

Added payout workflow states, covering:

- Payout requests reserve concrete publisher balance rows.
- Admin can approve, mark paid, fail, or block payout requests.
- Failed payouts release balances back to available; paid payouts mark balances paid.
- Every payout state change creates audit and notification records before the final provider integration.
- Admin and publisher dashboards read payout queue/readiness data with fallback states.

Added refund and dispute workflow states, covering:

- Refund requests validate against remaining refundable transaction amount.
- Posted refunds create negative adjustment transactions, negative splits, and reversed publisher balance rows.
- Disputes can be opened, updated, won, or lost.
- Lost disputes can automatically post the matching refund adjustment.
- Admin risk operations read refund and dispute queues with fallback states.

Added the first role-based access layer, covering:

- User access tokens stored as hashes with prefix/last-four metadata.
- Service-token bootstrap for creating the initial user and organization membership.
- Active subject inspection through `/v1/auth/me`.
- Gateway role checks for developer project operations, publisher operations, review actions, finance actions, and admin read operations.

Added first tenant-scoped project write enforcement, covering:

- Project installs, project policy updates, and project API key creation receive the authorized subject organization.
- User tokens must be organization scoped before project writes are allowed.
- New project records are created under the user token organization instead of the demo fallback.
- Service tokens keep the demo fallback for bootstrap and controlled operator flows.

Added provider-deferred payout account onboarding, covering:

- Publisher profile read/update endpoints scoped to the authorized organization.
- Payout account onboarding session creation with provider handoff URL, return URL, refresh URL, status, expiry, and audit trail.
- Onboarding completion can mark payout accounts verified, verification-required, blocked, or not configured.
- Publisher payout readiness now reads payout account and onboarding session state in the dashboard.

Added tenant-scoped refund and dispute history, covering:

- Publisher read-only refund and dispute history scoped by owned skill organization.
- Project read-only refund and dispute history scoped by project organization and slug.
- Dashboard revenue-adjustment panel so publishers can see which skills, projects, amounts, and statuses affected earnings.
- Clear separation between finance-admin decision endpoints and publisher/developer visibility endpoints.

Added publisher skill operations analytics, covering:

- Publisher read-only skills endpoint scoped by authorized organization.
- Skill ownership checks for publish/update, review submission, and price writes.
- Aggregated publisher signals for review, runtime checks, installs, calls, success/error/blocked counts, latency, billable usage, pricing, and quality checklist.
- Dashboard publishing pipeline now reads owned skill operations data, giving publishers a concrete reason to return and improve listings.

Added developer project operations analytics, covering:

- Developer read-only projects endpoint scoped by authorized organization.
- Aggregated project signals for API keys, installed skills, approvals, policies, budgets, runtime calls, success/error/blocked counts, latency, billable usage, subscriptions, and update-inbox counts.
- Dashboard buyer project controls now read project operations data, giving developers a concrete reason to return and manage agent project risk and cost.

Added developer project command-center depth, covering:

- Developer read-only project detail endpoint scoped by authorized organization.
- Per-project aggregation of installed skills, per-skill policies, budget state, runtime quality, usage cost, API keys, update inbox, recent invocations, and subscriptions.
- Dashboard project rows now link into `/dashboard/projects/[slug]`, giving developers a repeat-use surface for project risk review, version/update handling, key hygiene, and cost monitoring.

Added first project command-center write action, covering:

- Tenant-scoped project API key list and revoke operations.
- Project detail UI for creating replacement runtime keys, revealing the raw secret only once, copying it, and revoking old keys.
- A stronger repeat-use loop for developers who need to rotate runtime credentials without leaving the SkillHub workspace.

Added project policy operations depth, covering:

- Tenant-scoped project installed-skill, policy, and update-inbox reads.
- Project detail UI for editing per-skill permission level, network/browser/filesystem/secret access, monthly budget, rate limit, and owner approval state.
- A concrete developer retention loop around approving risky skills, lowering permission exposure, and controlling spend before agents execute skills.

## Product Standard Going Forward

Every new feature spec should answer:

1. Which user side does this serve?
2. What first-visit value does it create?
3. What repeat-visit value does it create?
4. What operational signal does it generate?
5. How does it improve trust, quality, distribution, or revenue?
6. What admin visibility or control is required?
7. What data must be stored before external payment or email providers are connected?

If a feature cannot answer these questions, it is likely decoration rather than platform value.
