# SkillHub Product Management Operating Model

Status: active

This document defines how SkillHub product decisions are made before UI and code work starts. Its purpose is simple: define requirements first, design UI second, then implement and verify. SkillHub is an operating platform, not a collection of decorative pages.

SkillHub is a real marketplace and runtime governance product. Every feature must serve a developer, publisher, or platform operator workflow and must connect to durable state, permissions, review, notifications, ledger, payout, runtime governance, or audit.

## Product Manager Role

The product manager owns requirement control for SkillHub.

Decision rights:

- Define the user, job, and scenario for every feature.
- Set priority as P0, P1, or P2.
- Decide whether a feature may enter UI design or implementation.
- Maintain journeys, page information architecture, state language, data objects, permissions, notifications, admin operations, and acceptance criteria.
- Reject visual-only changes that do not improve product value.
- Reject fake features that have no state, backend, permission model, or acceptance path.
- Require internal state, records, review views, and admin visibility before final payment, payout, or email integrations are connected.

The product manager does not replace UI, frontend, backend, QA, or operations roles. The PM makes sure those roles are building the same product.

## Core Product Principle

SkillHub must satisfy this rule:

```text
On the first visit, users understand what SkillHub solves.
On the second visit, users have operational work worth returning for.
At launch, the platform has review, state, ledger, notification, and admin loops.
```

Every requirement must answer:

1. Who uses it?
2. Why does the user need it the first time?
3. Why will the user come back?
4. What operational data does it create?
5. How does it improve trust, distribution, revenue, or retention?
6. How can an admin review, correct, govern, or audit it?
7. What data tables, APIs, pages, notifications, and audit records are required?

## Product Roles And Jobs

### Visitor

Job:

- Understand what SkillHub is.
- Judge whether the platform is trustworthy.
- See real skills, publishers, install paths, review rules, and operating terms.
- Choose marketplace browsing, publishing, agent integration, docs, or account entry.

Repeat-use hook:

- Public trust, marketplace supply, integration docs, terms, and publisher signals make the product credible before signup.

### Developer / Agent Builder

Job:

- Find a skill an AI agent can safely use.
- Compare permissions, pricing, runtime, verification, feedback, incidents, and alternatives.
- Install a skill into an organization project.
- Use project API keys, MCP, REST, or SDK calls under project policy, budget, subscription, and metering controls.
- Manage version pins, updates, incidents, usage, billing, and runtime logs.

Repeat-use hook:

- Return to monitor runtime health, cost, keys, updates, incidents, approvals, invoices, and better alternatives.

### Publisher / Skill Author

Job:

- Package an AI capability as an installable, reviewable, monetizable skill.
- Save drafts, manage versions, submit exact semantic versions, review automated checks, and respond to reviewer notes.
- Complete profile, terms, payout readiness, and pricing blockers.
- Track installs, calls, feedback, buyer requests, revenue, refunds, disputes, payout state, curation placement, and appeals.

Repeat-use hook:

- Return to fix review/runtime issues, respond to buyer demand and feedback, publish new versions, improve distribution, and manage earnings.

### Platform Reviewer / Trust Operator

Job:

- Review skill versions.
- Judge permissions, runtime posture, examples, data retention, and risk.
- Handle feedback moderation, abuse reports, takedowns, restrictions, suspensions, incidents, and audit notes.

Repeat-use hook:

- Review queues, incidents, abuse reports, and feedback change every day and need durable decisions.

### Finance Admin

Job:

- Manage commission rules, transactions, splits, balances, refunds, disputes, and payouts.
- Preserve immutable historical money records.
- Review high-value, failed, or blocked payouts before provider money movement.

Repeat-use hook:

- Return for matured balances, payout review, provider failures, blocked retry conditions, refund/dispute adjustments, and ledger anomalies.

### Super Admin

Job:

- Maintain identity, organizations, permissions, templates, launch readiness, migration visibility, and privileged recovery.

Repeat-use hook:

- Return for launch readiness, configuration gaps, template coverage, migration drift, user/org risk, and production operations.

## Requirement Levels

SkillHub requirements have five levels. Lower levels cannot skip higher levels.

### L0: Product Definition

Defines what the platform is, what it is not, who it serves, and why it can compound value over time.

Sources:

- `docs/product-requirements.md`
- `docs/user-value-and-retention.md`

### L1: Domain Requirements

Defines major domains:

- Account and organization.
- Skill registry and publishing.
- Marketplace discovery.
- Developer projects.
- Publisher workspace.
- Review and trust.
- Runtime gateway.
- Billing and commission.
- Payouts.
- Notifications and webhooks.
- Admin operations.

Sources:

- `docs/technical-implementation-plan.md`
- `docs/full-build-plan.md`

### L2: User Journey Requirements

Every user role must have end-to-end journeys:

- First visit.
- Signup/login.
- Create, discover, publish, install, or review.
- Complete the core task.
- Return later for operational work.
- Recover from failure, review rejection, incident, refund, dispute, payout block, or notification.

Source:

- `docs/p0-journey-specs.md`

### L3: Feature Specification

Before a feature enters UI or code, it should define:

- User role.
- Trigger scenario.
- Successful outcome.
- Page location.
- Main flow.
- Empty, loading, error, blocked, and permission-denied states.
- Data objects.
- APIs.
- Permissions.
- Notifications.
- Audit records.
- Finance impact.
- English and Chinese copy.
- Acceptance criteria.

Template:

- `docs/feature-requirement-template.md`

### L4: Implementation Acceptance

A feature is complete only when:

- The page matches the approved requirement.
- API data is real or the fallback is explicitly allowed.
- State is traceable.
- Role permissions are correct.
- Admins can inspect, review, repair, or audit the workflow.
- English and Chinese UI are usable.
- Desktop and mobile do not overflow.
- Typecheck, build, and feasible smoke tests pass.

## Development Gate

Any UI or code task must pass these gates in order:

1. Product Gate: user, scenario, flow, states, and acceptance are clear.
2. Data Gate: required read/write objects are clear.
3. Permission Gate: who can see, change, approve, or audit is clear.
4. Ops Gate: admin, audit, notification, finance, or runtime visibility is clear.
5. UI Gate: page information architecture and interaction states are clear.
6. Code Gate: implementation starts.
7. QA Gate: typecheck, build, smoke, responsive, and acceptance checks pass.

If a feature cannot pass Product Gate, do not start UI.

## Priority Rules

### P0

Without this, real users or customers will treat the product as a toy.

Typical P0:

- Signup/login and account center.
- Developer discovery, install, project invocation, and runtime governance.
- Publisher upload, versioning, review, pricing readiness, payout readiness, and improvement loops.
- Admin review, risk, finance, payout, notification, audit, and launch readiness.
- Public pages that explain product value, trust, integration, and marketplace rules.

### P1

Without this, the platform can demo but has weaker retention or operational efficiency.

Typical P1:

- Marketplace recommendation policy.
- Publisher quality scoring and distribution appeals.
- Developer collections, updates, and invoice improvements.
- Feedback response loops.
- Webhook, notification preference, and template management depth.

### P2

Enhances growth, conversion, or efficiency without blocking the first production launch.

Typical P2:

- Advanced filters and aggregation.
- SEO/GEO growth pages.
- Help center and tutorials.
- Advanced analytics.
- Multi-author revenue splits.

## Current P0 Control Points

Before broad visual polish, keep these control points locked:

- Page-level requirements must remain the source of truth for every public, developer, publisher, account, dashboard, and admin page.
- Developer discovery-to-runtime must prove that a listing becomes project state and runtime state.
- Publisher upload-to-monetization must prove that authors understand review blockers, paid blockers, feedback, demand, revenue, and payout state.
- Admin operations must prove review, trust, incidents, finance, payouts, notifications, launch readiness, identity, and audit are operated from the console.
- Shared state language must stay consistent across verification, risk, review, runtime health, install, subscription, ledger, payout, refund/dispute, notification, webhook, and launch readiness.

## Required Product Artifacts

Maintain these documents:

- Product requirements: `docs/product-requirements.md`
- Technical implementation plan: `docs/technical-implementation-plan.md`
- Product management operating model: `docs/product-management-operating-model.md`
- Feature requirement template: `docs/feature-requirement-template.md`
- Page requirements matrix: `docs/page-requirements-matrix.md`
- Product decision log: `docs/product-decision-log.md`
- Requirements freeze workshop: `docs/requirements-freeze-workshop.md`
- P0 journey specs: `docs/p0-journey-specs.md`

## 48-Hour Product Focus

The fastest high-quality path remains:

1. Maintain the approved page and journey matrix.
2. Finish the three P0 journeys:
   - Developer discovers, installs, and tests a skill.
   - Publisher uploads, submits, monetizes, and improves a skill.
   - Admin reviews, governs, and prepares launch readiness.
3. Convert journey gaps into UI, API, and QA tasks.
4. Implement only work that maps back to the approved journeys.

## Parallel Agent Rules

When multiple AI roles run in parallel:

- Product Manager owns requirements and priority.
- UI/UX owns page structure and interaction after requirements are approved.
- Frontend owns implementation of approved UI states.
- Backend owns data, API, permissions, state machines, and audit.
- QA owns verification against acceptance criteria.
- Customer Critic challenges whether the product feels real and worth returning to.

No role should invent product scope independently. If a new need appears, it returns to the Product Manager and decision log first.
