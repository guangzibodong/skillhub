# SkillHub P0 Journey Specs

Status: approved for UI phase

Date: 2026-06-06

Source documents:

- [Requirements Freeze Workshop](./requirements-freeze-workshop.md)
- [Page Requirements Matrix](./page-requirements-matrix.md)
- [Product Decision Log](./product-decision-log.md)
- [Technical Implementation Plan](./technical-implementation-plan.md)
- [API](./api.md)

These three journeys are the P0 operating spine of SkillHub. UI, backend, QA, and automation work should map to one or more steps below. If a new feature does not improve these journeys, it is not P0.

## Shared Requirements

### Product Rules

- SkillHub is an AI-agent skill registry, marketplace, runtime gateway, and ledger-backed operating platform.
- The product must prove that a marketplace listing can become project state, runtime state, trust state, billing state, notification state, and audit state.
- Production UI must not silently depend on demo data. Any fallback must be public-safe and explicitly controlled.
- No UI may expose raw credentials, secrets, verification codes, service tokens, OAuth secrets, webhook secrets, API-key salts, or user tokens after first reveal.
- English and Chinese copy must use the same product terms for states and actions.

### Shared State Language

Use these state groups consistently across UI and API copy:

- Review: `draft`, `submitted`, `in_review`, `verified`, `rejected`, `deprecated`, `suspended`.
- Preflight/checks: `queued`, `running`, `passed`, `warning`, `failed`.
- Install: `installed`, `suspended`, `removed`, with owner approval state for high risk.
- Runtime: `success`, `error`, `blocked`, with latency and error code.
- Subscription: `trialing`, `active`, `paused`, `past_due`, `canceled`, `expired`.
- Ledger: `posted`, `pending`, `available`, `paid`, `reversed`, `blocked`.
- Payout: `requested`, `review`, `processing`, `paid`, `failed`, `blocked`.
- External delivery: `queued`, `processing`, `sent`, `failed`, `skipped`.
- Launch readiness: `blocker`, `warning`, `ready`, `deferred`.

### Shared UI Components To Plan Before Page Polish

- Status chip.
- Risk badge.
- Verification badge.
- Runtime health badge.
- Money state chip.
- Flow step list.
- Checklist/preflight panel.
- Code/command panel.
- Empty state.
- Blocked state.
- Action result with next steps.
- Audit/notification event row.
- Redacted payload summary.

## Journey A: Developer Discovers, Installs, And Tests A Skill

### Objective

Let a developer move from marketplace discovery to governed project runtime without leaving unclear gaps. The journey must prove SkillHub is not a static directory: a discovered skill becomes project install state, policy state, runtime invocation state, usage/cost state, update state, and notification/audit state.

### Primary User

Developer / Agent Builder

### Secondary Users

- Organization owner/admin for high-risk approval.
- Finance user for billing and invoice readiness.
- Publisher as the downstream recipient of usage, feedback, and support signals.
- Admin/trust operator when reports or incidents are created.

### Entry Points

- `/marketplace`
- `/skills/[slug]`
- `/developer`
- `/dashboard/projects/[slug]`
- `/agents`

### User Jobs

- Find a skill that solves an agent task.
- Decide whether the skill is safe enough to install.
- Install the skill into a project with clear policy and version pinning.
- Test the skill through the same runtime governance path an agent will use.
- Monitor cost, failures, incidents, updates, and subscriptions after install.

### Main Flow

1. Developer browses `/marketplace`.
2. Developer searches and filters by query, category, pricing model, runtime, permission risk, verification state, and ranking.
3. Marketplace card shows display name, publisher, verification, risk, runtime, pricing, install command, rating/feedback, install/call evidence, and buyer-safe recommendation reason.
4. Developer opens `/skills/[slug]`.
5. Skill detail shows manifest, schemas, examples, permissions, runtime, pricing, changelog, support, publisher trust, published feedback, incidents/deprecation state, and similar/replacement skills.
6. Skill detail exposes copyable CLI, MCP, and SDK command shapes plus an install-readiness checklist for review trust, permission risk, runtime posture, project availability, billing/subscription gate, latest version, and last-reviewed signal.
7. Signed-in developer selects a project.
8. Developer saves the skill to a collection or installs it into the project.
9. Install writes organization-scoped project install state with a pinned approved version where available.
10. If skill risk is high, install enters owner approval before runtime use.
11. Developer opens `/dashboard/projects/[slug]`.
12. Project detail shows installed skills, policy controls, budget, rate limit, subscription state, runtime history, update inbox, API keys, invoices, saved skills, and REST/MCP snippets.
13. Developer creates a project API key. Raw key is revealed once, then only fingerprint metadata remains.
14. Developer runs a test invocation from the console. The test uses the same runtime policy path as production invocation, but is marked non-billable.
15. Runtime record appears with status, latency, error code if any, skill version, and policy result.
16. Developer sees usage, cost, subscription ledger state, invoice records, update/incident inbox, and notifications.

### Required UI States

Marketplace:

- Loading search.
- Empty search.
- API unavailable public-safe fallback.
- Filtered result count.
- Recommendation explanation.
- Signed-out state for project actions.

Skill detail:

- Signed-out project actions blocked with login/account entry.
- No projects state with create-project path.
- Install success with link to project detail.
- Install blocked by verification, suspension, subscription, role, or high-risk approval.
- Runtime test loading/success/error/blocked.
- Feedback submission pending moderation.
- Trust report submitted.

Project detail:

- No API key state.
- API key reveal-once success.
- Policy save success/error.
- High-risk owner approval required.
- Budget/rate-limit/subscription block.
- Update adoption blocked for unapproved target version.
- Invoice generation success/error.
- Runtime test result.

### Data And API Requirements

Public discovery:

- `GET /v1/skills/search`
- `GET /v1/skills/:slug`
- `GET /v1/skills/:slug/prices`
- `GET /v1/skills/:slug/feedback`
- Public publisher endpoints.

Project operations:

- Developer project list/detail endpoints.
- Project create endpoint.
- Project saved-skill endpoints.
- Project installed-skill endpoints.
- Project policy endpoints.
- Project update-inbox action endpoint.
- Project API key create/list/revoke endpoints.
- Project invoice endpoints.
- Project subscription lifecycle endpoints.
- Project runtime test endpoint.

Runtime:

- `POST /v1/runtime/invoke`
- MCP `tools/list`
- MCP `tools/call`

### Permission Rules

- Project reads/writes require an organization-scoped user token.
- Developer, owner, admin, or super admin can manage project operations according to role policy.
- High-risk installs require owner approval before runtime.
- Cross-organization project, install, saved skill, invoice, subscription, and key access must be denied server-side.
- Public marketplace must not expose internal curation boost, operator notes, private payout details, or private organization members.

### Notification And Audit Requirements

Write audit records for:

- Project creation.
- Skill save/install/remove/suspend/restore.
- Policy changes.
- API key creation/revocation.
- Subscription state changes.
- Update adoption/ignore/schedule.
- Runtime trust reports.

Create notification events for:

- Install/update decisions.
- High-risk approval needs.
- Runtime incidents and deprecations.
- Billing/subscription/invoice events.
- Account/security events.

### Acceptance Criteria

Functional:

- A developer can complete marketplace -> skill detail -> install/save -> project detail -> runtime test.
- Runtime test does not bypass install, policy, budget, subscription, or logging.
- API keys are reveal-once.
- Version adoption only works for approved target versions.
- High-risk updates reset approval state.

Product:

- A customer can see that marketplace decisions persist into project operations.
- Skill trust is visible before install.
- The project page gives a reason to return next week: usage, cost, updates, incidents, keys, invoices, subscriptions.

Technical:

- Public endpoints return marketplace-safe fields.
- Project writes are organization-scoped.
- Errors are actionable and do not expose secrets.

QA:

- Test English and Chinese flows.
- Test signed-out, no-project, no-key, high-risk, subscription-blocked, budget-blocked, suspended-skill, and unapproved-version states.
- Test desktop and mobile no overflow for command snippets, API key fingerprints, long skill names, and error messages.

## Journey B: Publisher Uploads, Submits, Monetizes, And Improves A Skill

### Objective

Let a publisher turn an agent capability into an operated marketplace product with draft, version, review, runtime check, pricing, payout readiness, feedback, buyer demand, revenue, and distribution loops.

### Primary User

Publisher / Skill Author

### Secondary Users

- Reviewer/trust operator for review decisions.
- Finance admin for paid readiness, refunds, disputes, and payouts.
- Developer/buyer through feedback, installs, and buyer requests.
- Super admin for launch readiness and identity recovery.

### Entry Points

- `/publish`
- `/publisher`
- `/skills/[slug]`
- `/terms`
- `/account`

### User Jobs

- Upload a valid skill contract.
- Understand what blocks review or paid activation.
- Submit a specific version for human review.
- Improve listing quality using runtime checks, feedback, installs, and buyer demand.
- Complete commercial readiness before paid publishing.
- Track earnings, adjustments, balances, and payout readiness.

### Main Flow

1. Publisher signs in through email/OAuth/token fallback as appropriate.
2. Publisher opens `/publish`.
3. Publisher pastes `skillhub.json`.
4. Client preflight checks JSON, identity, runtime, schemas, permissions, and commercial readiness.
5. Publisher saves the manifest as an organization-scoped draft using `/v1/skills`.
6. Success state links to `/publisher` and the public skill detail.
7. Publisher opens `/publisher`.
8. Publisher sees owned skills, review status, latest automated checks, version history, installs, calls, runtime health, pricing blockers, feedback, buyer requests, revenue, refunds/disputes, payout readiness, marketplace placement, and appeal status.
9. Publisher edits unlocked draft or creates a new semantic version.
10. Publisher submits an exact version for review.
11. System creates automated checks: manifest, runtime, example, security.
12. Reviewer approves, rejects, or blocks with notes.
13. Verified skill becomes eligible for public trusted discovery.
14. Publisher completes profile, terms, payout readiness, and pricing setup.
15. Paid activation remains blocked until verified review, active publisher profile, accepted terms, payout readiness, active commission rule, and invite/paid eligibility where applicable.
16. Publisher responds to published feedback, claims buyer requests, views placement reason, and files appeal when quality gaps are fixed.
17. Publisher tracks ledger, refunds/disputes, balances, payout request state, and notifications.

### Required UI States

Publish entry:

- Signed-out state with login path.
- Manifest parse success/error.
- Preflight passed/warning/blocked.
- Draft save pending/success/error.
- Success next actions.
- Commercial-readiness advisory.
- No raw token/admin token fields.

Publisher workspace:

- No publisher profile.
- Profile active/inactive/blocked.
- Terms not accepted.
- Payout not configured/verification required/verified/blocked.
- No skills.
- Draft/submitted/in_review/verified/rejected/suspended/deprecated skill states.
- Version locked/unlocked.
- Automated check queued/running/passed/warning/failed.
- Review notes present/missing.
- Review repair loop: latest exact version, review submitted time, SLA due state, reviewer notes, automated check evidence, structured blocker/advisory semantics, target field, concrete next action, and automatic version-workbench entry when waiting, fixing, following up, or resubmitting is needed.
- Pricing free/draft/active/archived.
- Paid activation blockers.
- No feedback / pending feedback / published feedback / publisher response.
- Buyer request open/claimed/submitted/matched/closed/canceled.
- Marketplace placement featured/standard/suppressed with publisher-safe reason and appeal path.
- Balance pending/available/paid/reversed/blocked.
- Payout requested/review/processing/paid/failed/blocked.

### Data And API Requirements

Publishing:

- `POST /v1/skills`
- Publisher skill list/detail/version endpoints.
- Version save/update endpoint.
- Version submit endpoint.
- Skill review submission endpoint.

Publisher operations:

- `/v1/publisher/overview`
- `/v1/publisher/skills`
- `/v1/publisher/profile`
- `/v1/publisher/terms/accept`
- Publisher pricing endpoints.
- Publisher balances and ledger endpoints.
- Publisher payout readiness/request endpoints.
- Publisher refund/dispute history endpoints.
- Publisher buyer-request endpoints.
- Publisher feedback response endpoint.
- Publisher marketplace appeal endpoints.
- Publisher notification endpoints.

### Permission Rules

- Publisher writes require publisher, owner, admin, or super admin role in the owning organization.
- A publisher cannot create, edit, submit, price, or respond to feedback for another organization's skill.
- Approved or installed versions cannot be modified in place.
- Paid activation cannot bypass commercial blockers.
- Service tokens are not the product permission model and should not appear in publish UI.

### Notification And Audit Requirements

Write audit records for:

- Draft create/update.
- Version create/update/submit.
- Review submission.
- Pricing changes.
- Terms acceptance.
- Payout onboarding/readiness/request.
- Feedback response.
- Buyer request claim/submit.
- Marketplace appeal creation.

Create notification events for:

- Review submitted/approved/rejected/blocked.
- Runtime check warnings/failures.
- Buyer requests and feedback moderation outcomes.
- Pricing/terms/payout readiness changes.
- Ledger posting, refund/dispute impact, payout decisions.
- Marketplace curation updates and appeal decisions.

### Acceptance Criteria

Functional:

- A publisher can upload a draft, submit a version, see automated checks, see review decision, and understand pricing/payout blockers.
- Verified or installed versions cannot be edited in place.
- Paid price activation blocks until all commercial requirements are met.
- Publisher feedback response appears publicly only on published feedback.

Product:

- Publisher sees why to return: review fixes, checks, feedback, buyer requests, revenue, payout, placement, appeals.
- A customer can see publisher workflow is not just a textarea.

Technical:

- Skill ownership is enforced server-side.
- Version and pricing errors are actionable.
- Ledger and payout views are publisher-scoped.

QA:

- Test draft, invalid manifest, short description warning, high-risk permission warning, HTTPS warning, local runtime warning.
- Test version locked state.
- Test paid blocker combinations.
- Test publisher with no profile, no terms, no payout, rejected review, verified review.
- Test mobile editor and long manifest text without page overflow.

## Journey C: Admin Reviews, Governs, And Launches Operations

### Objective

Let platform operators run SkillHub as a real marketplace: review supply, govern risk, process finance states, manage notifications/webhooks, inspect identity and audit, and decide launch readiness without exposing secrets.

### Primary Users

- Reviewer / Trust Operator.
- Finance Admin.
- Support/Admin.
- Super Admin.

### Secondary Users

- Developers affected by installs, runtime, incidents, refunds, and subscriptions.
- Publishers affected by review, feedback, curation, ledger, disputes, and payouts.

### Entry Points

- `/admin`
- `/terms`
- `/docs`

### User Jobs

- Decide whether a skill version can become trusted supply.
- Handle reports, feedback, incidents, and marketplace distribution fairly.
- Process usage/subscription ledger, commission, balances, refunds, disputes, and payouts.
- Manage notification templates and delivery operations.
- Inspect identity, organization, and audit health.
- Know whether the platform is ready for public or paid launch.

### Main Flow

1. Admin opens `/admin`.
2. Command center shows blocker/warning/ready/deferred launch readiness, review queue, risk queue, finance queue, notification delivery failures, webhook outbox, identity signals, and audit stream.
3. Reviewer opens skill review item.
4. Review queue can be filtered and sorted by SLA pressure, blocking automated checks, high-risk permissions, warning checks, oldest submission, earliest due time, and recommended priority.
5. Review card shows publisher, skill, exact version, manifest summary, permissions, runtime, latest automated checks, risk, queue age, SLA state, priority reason, and notes.
6. Reviewer approves, rejects, or blocks with required notes/reason.
7. Trust operator moderates feedback, abuse reports, takedown actions, incidents, and curation appeals with required reasons.
8. Finance admin processes usage/subscription posting, commission rules, balance release, payout decisions, refunds, and disputes without mutating historical splits.
9. Admin manages notification templates and processes external email/webhook delivery queues.
10. Admin processes webhook outbox rows with signed delivery, response capture, retry, and redacted payloads.
11. Admin inspects identity directory and audit logs.
12. Launch readiness separates public-launch blockers from paid-marketplace blockers and deferred integrations.

### Required UI States

Admin overview:

- No permission.
- API unavailable.
- Launch blocker/warning/ready/deferred.
- Empty queue.
- Queue aging/overdue.
- Review queue filters for SLA pressure, blocking automated checks, high-risk permissions, and warning checks.
- Review queue sort modes for recommended priority, oldest submitted, earliest SLA due time, and highest risk.
- Secret-safe review evidence package present for each item, with publisher readiness, manifest summary, redacted runtime target, permission flags, and schema counts.
- Action pending/success/error.

Review:

- Check missing/queued/running/failed blocks approval.
- Warning requires reviewer notes.
- Approve/reject/block reason required where applicable.
- Suspended/rejected result visible.

Trust:

- Abuse triage/dismiss/warn/restrict/suspend/resolve.
- Incident open/monitoring/resolved/postmortem.
- Feedback publish/hide/reject/reopen.
- Curation featured/standard/suppressed with bounded boost, expiry, and reason.
- Appeal review/approve/reject/close.

Finance:

- Unposted usage.
- Unposted subscription periods.
- Renewable subscription periods.
- Pending/available/blocked balances.
- Payout requested/review/processing/paid/failed/blocked.
- Refund/dispute open/decided/lost/won.
- Commission active/scheduled/ended.

Notifications/webhooks:

- Template draft/active/archived.
- External delivery queued/failed/skipped/sent.
- Webhook delivery pending/processing/failed/delivered.
- Provider missing configuration.
- Redacted payload summary.

Identity/audit:

- User/org counts.
- Membership roles.
- Token metadata only.
- Audit rows separate from notification delivery.

### Data And API Requirements

Admin overview:

- `/v1/admin/overview`
- `/v1/admin/launch-readiness`
- `/v1/admin/audit-logs`
- `/v1/admin/identity-directory`

Review/trust:

- `/v1/admin/reviews`
- Review decision endpoints.
- `/v1/admin/skill-feedback`
- Feedback decision endpoints.
- `/v1/admin/abuse-reports`
- Abuse decision endpoints.
- `/v1/admin/incidents`
- Incident decision endpoints.
- `/v1/admin/marketplace-curation`
- `/v1/admin/marketplace-curation/appeals`

Finance:

- Admin finance ledger endpoints.
- Commission rule endpoints.
- Usage/subscription processor endpoints.
- Balance release endpoints.
- Admin payout queue/decision endpoints.
- Refund/dispute endpoints.

Notifications/webhooks:

- Admin notification list endpoints.
- Notification template endpoints.
- External delivery list/decision/process endpoints.
- Webhook delivery list/process endpoints.

### Permission Rules

- Admin read: support, admin, super admin where appropriate.
- Review/trust decisions: reviewer, admin, super admin where appropriate.
- Finance decisions: finance, admin, super admin.
- Super admin can recover/override only through reasoned audited actions.
- Every privileged write requires server-side role enforcement.
- Cross-organization private data must not leak through admin helper responses unless the role is allowed.

### Notification And Audit Requirements

All privileged decisions must write `admin_audit_logs` with:

- Actor.
- Action.
- Entity type and id.
- Required reason where applicable.
- Previous values.
- Next values.
- Metadata.
- Timestamp.

Create notification events for:

- Review decisions.
- Incident and abuse decisions.
- Feedback moderation.
- Curation changes and appeal decisions.
- Ledger posting and finance operations.
- Payout/refund/dispute decisions.
- Template/delivery/webhook operations.
- Identity/security actions.

### Acceptance Criteria

Functional:

- Admin can process review, trust, finance, notification, webhook, identity, and launch readiness workflows from `/admin`.
- Review approval is blocked when automated checks are failed, queued, or running.
- Finance actions preserve immutable historical splits.
- Delivery and webhook queues expose retry state and redacted payloads.

Product:

- A customer can see the platform has real operations, not decorative metrics.
- Every queue has a next action and recovery path.
- Launch readiness clearly separates public blockers, paid blockers, warnings, ready checks, and deferred final integrations.

Technical:

- Launch readiness is secret-safe.
- Audit log is separate from notification delivery events.
- Admin APIs return redacted summaries for sensitive payloads.

QA:

- Test role matrix for support, reviewer, finance, admin, super admin, and ordinary user.
- Test required reason validation.
- Test redaction for secrets/codes/tokens.
- Test finance immutability and adjustment records.
- Test desktop/mobile for dense queues, long reasons, payload summaries, and filter panels.

## End-To-End Demo Acceptance

The first serious customer demo should prove this chain:

```text
publisher upload
-> preflight/draft
-> version submit
-> automated checks
-> admin review approval
-> marketplace listing
-> developer install into project
-> project policy/key setup
-> runtime test
-> invocation/usage/audit/notification
-> ledger/payout readiness visible
```

Demo failure conditions:

- User must paste raw service/admin token to do normal product work.
- Marketplace listing does not become project state.
- Runtime call bypasses project install or policy.
- Review approval does not show automated evidence.
- Money page shows revenue without immutable transaction/split/balance trail.
- Admin action changes state without audit.
- Public or admin UI exposes raw secrets, tokens, codes, or credentials.

## UI Phase Work Packages

After these specs are accepted, UI work should start in this order:

1. Shared state and component system.
2. Journey A public discovery and project runtime surfaces.
3. Journey B publish entry and publisher workspace.
4. Journey C admin operations console.
5. Account entry and account center hardening.
6. End-to-end demo polishing and mobile/i18n QA.

## Change Control

Changing these P0 journeys requires updating:

- This document.
- [Requirements Freeze Workshop](./requirements-freeze-workshop.md).
- [Page Requirements Matrix](./page-requirements-matrix.md).
- [Product Decision Log](./product-decision-log.md), if the change affects product policy.
