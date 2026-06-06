# SkillHub Product Decision Log

This log tracks product decisions that affect scope, launch readiness, paid marketplace rollout, architecture, UI, operations, legal, finance, or customer commitments.

Each P0 decision must have an owner, target date, status, and acceptance impact before related UI or implementation is treated as final.

## Decision Status

- `open`: not decided.
- `proposed`: preferred option exists but is not locked.
- `decided`: locked for current build.
- `revisit`: intentionally deferred with a review trigger.

## P0 Decisions

### D001: Public Launch Blockers

Status: open

Owner: Product Manager

Target: within 48 hours

Question:

- Which readiness checks block public launch, and which only create warnings?

Current assumption:

- Public launch blockers should include account entry, core public pages, marketplace discovery, skill detail, publish path, publisher workspace, developer project path, admin review/risk visibility, migrations, secret-safe launch readiness, and production demo fallback disabled.

Acceptance impact:

- `/admin/launch-readiness` must separate public-launch blockers from paid-marketplace blockers.

### D002: Paid Marketplace Launch Blockers

Status: open

Owner: Product Manager + Finance + Legal

Target: before paid skill activation is enabled publicly

Question:

- What must be ready before paid skills can be activated by real publishers?

Current assumption:

- Verified skill review, publisher profile, accepted publisher terms, payout readiness, active commission rule, refund/dispute policy, payout threshold, review SLA, finance admin workflow, and provider-deferred payment state visibility are required.

Acceptance impact:

- Active `per_call` and `subscription` pricing cannot bypass paid-readiness blockers.

### D003: Runtime Strategy For Phase One

Status: open

Owner: Product Manager + Engineering

Target: within 48 hours

Question:

- Does SkillHub only route to external runtimes, proxy HTTP/MCP runtimes, host managed runtimes, or support a combination in phase one?

Current assumption:

- Phase one should prefer external HTTP/MCP runtimes through SkillHub governance and metering. Local execution remains restricted and requires manual review.

Acceptance impact:

- Review checks, trust copy, liability copy, docs, and runtime UI must match the chosen strategy.

### D004: Paid Publishing Access

Status: open

Owner: Product Manager

Target: before paid launch

Question:

- Is paid publishing invite-only at launch?

Current assumption:

- Paid publishing should start invite-only until payout/KYC/provider, review SLA, support, refund/dispute, and finance operations are proven.

Acceptance impact:

- Publisher workspace must show invite or paid-activation eligibility if invite-only is chosen.

### D005: Minimum Payout And Manual Review Threshold

Status: open

Owner: Finance + Product Manager

Target: before payout workflow is customer-visible

Question:

- What is the minimum payout amount and what amount triggers manual review?

Current assumption:

- Minimum payout and manual review threshold should be configurable, displayed in publisher payout readiness, and audited when changed.

Acceptance impact:

- Payout request UI and admin queue must match the configured thresholds.

### D006: Refund And Dispute Window

Status: open

Owner: Legal + Finance + Product Manager

Target: before paid launch

Question:

- How long can buyers request refunds, and which disputes trigger automatic balance reversal?

Current assumption:

- Provider-deferred refund/dispute states can exist now, but final public terms need legal review before paid launch.

Acceptance impact:

- `/terms`, admin adjustment UI, project adjustment history, and publisher revenue adjustment history must use the same policy.

### D007: Paid Skill Review SLA

Status: open

Owner: Product Manager + Trust Operator

Target: before paid launch

Question:

- What SLA should publishers expect for paid-skill review, marketplace curation appeals, and critical incident handling?

Current assumption:

- Paid skills need a stricter SLA than free draft listings; critical incidents need a separate faster response target.

Acceptance impact:

- Publisher workspace, admin queues, terms, and notification templates must display consistent SLA language.

### D008: Auth Provider Launch Policy

Status: proposed

Owner: Product Manager + Engineering

Target: before public launch

Question:

- Which login methods are required for public launch?

Current assumption:

- Email-code access is required. Google and GitHub can remain configuration-required until production OAuth credentials are configured, but the UI must show exact callback URLs and missing configuration names.

Acceptance impact:

- `/login`, `/account`, and `/admin/launch-readiness` must show provider status without fake OAuth buttons.

### D009: Notification And Webhook Governance

Status: decided

Owner: Product Manager + Engineering

Decision:

- User notification preferences govern user-owned in-app/email channels.
- Organization webhook delivery is governed by organization webhook endpoints: endpoint status and subscribed events.
- Individual user webhook preferences must not suppress organization-level webhook fanout.

Acceptance impact:

- `/developer`, `/account`, `/admin`, docs, and notification delivery APIs must preserve this distinction.

### D010: High-Risk Permission Matrix

Status: open

Owner: Product Manager + Trust Operator + Engineering

Target: within 48 hours

Question:

- Which permissions require owner approval, reviewer notes, second review, or paid-launch blocking?

Current assumption:

- Filesystem write, secret access, local execution, destructive workflows, payment actions, and sensitive data handling are high risk.

Acceptance impact:

- Marketplace cards, skill detail, publisher preflight, admin review queue, and project policy approval must use the same risk matrix.

## P1 Decisions

### D101: Marketplace Ranking Policy Weighting

Status: open

Owner: Product Manager

Question:

- What are the buyer-safe ranking explanations and how often should manual curation expire or be reviewed?

Acceptance impact:

- Public marketplace copy, admin curation controls, and publisher improvement hints must stay consistent.

### D102: Launch Success Thresholds

Status: open

Owner: Product Manager

Question:

- How many verified skills, active publishers, active projects, successful invocations, and published feedback rows are enough for launch credibility?

Acceptance impact:

- Product dashboard and launch-readiness messaging should track these thresholds.

## How To Add A Decision

Use this shape:

```md
### Dxxx: Decision Title

Status:

Owner:

Target:

Question:

Options:

Current assumption:

Decision:

Acceptance impact:
```
