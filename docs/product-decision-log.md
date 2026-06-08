# SkillHub Product Decision Log

This log tracks product decisions that affect scope, launch readiness, paid marketplace rollout, architecture, UI, operations, legal, finance, or customer commitments.

Each P0 decision must have an owner, target date, status, and acceptance impact before related UI or implementation is treated as final. The current multi-role freeze proposal is recorded in [Requirements Freeze Workshop](./requirements-freeze-workshop.md).

## Decision Status

- `open`: not decided.
- `proposed`: preferred option exists but is not locked.
- `decided`: locked for current build.
- `revisit`: intentionally deferred with a review trigger.

## P0 Decisions

### D001: Public Launch Blockers

Status: decided

Owner: Product Manager

Target: within 48 hours

Question:

- Which readiness checks block public launch, and which only create warnings?

Decision:

- Public launch blockers include account entry, core public pages, marketplace discovery, skill detail, publish path, publisher workspace, developer project path, admin review/risk visibility, migration readiness, notification-template coverage, secret-safe launch readiness, and production demo fallback disabled.
- OAuth providers can be configuration-required for public launch if email-code access is working and the UI/readiness panel explains missing callback/client configuration.
- Payment, payout provider movement, and final legal terms are paid-marketplace blockers, not public-launch blockers.

Acceptance impact:

- `/admin/launch-readiness` must separate public-launch blockers from paid-marketplace blockers.

### D002: Paid Marketplace Launch Blockers

Status: proposed

Owner: Product Manager + Finance + Legal

Target: before paid skill activation is enabled publicly

Question:

- What must be ready before paid skills can be activated by real publishers?

Current assumption:

- Verified skill review, publisher profile, accepted publisher terms, verified manual payout readiness, active commission rule, refund/dispute policy, payout threshold, review SLA, finance admin workflow, and provider-deferred payment state visibility are required.

Design default:

- Paid activation remains invite-only until payment provider, refund/dispute, and legal review are finalized. P0 publisher payouts use manual PayPal/Alipay transfer records instead of payout-provider automation.

Acceptance impact:

- Active `per_call` and `subscription` pricing cannot bypass paid-readiness blockers.

### D003: Runtime Strategy For Phase One

Status: decided

Owner: Product Manager + Engineering

Target: within 48 hours

Question:

- Does SkillHub only route to external runtimes, proxy HTTP/MCP runtimes, host managed runtimes, or support a combination in phase one?

Decision:

- Phase one supports external HTTP/MCP runtimes governed through SkillHub policy, versioning, metering, and logging.
- SkillHub may proxy/route calls through its runtime gateway where needed for governance.
- Local execution is restricted and requires human review.
- MCP `tools/call` must reuse the same runtime governance path as REST invocation.

Acceptance impact:

- Review checks, trust copy, liability copy, docs, and runtime UI must match the chosen strategy.

### D004: Paid Publishing Access

Status: proposed

Owner: Product Manager

Target: before paid launch

Question:

- Is paid publishing invite-only at launch?

Current assumption:

- Paid publishing should start invite-only until payout/KYC/provider, review SLA, support, refund/dispute, and finance operations are proven.

Design default:

- UI should expose paid-activation eligibility/invite state, but real paid launch remains blocked until finance/legal/provider review.

Acceptance impact:

- Publisher workspace must show invite or paid-activation eligibility if invite-only is chosen.

### D005: Minimum Payout And Manual Review Threshold

Status: proposed

Owner: Finance + Product Manager

Target: before payout workflow is customer-visible

Question:

- What is the minimum payout amount and what amount triggers manual review?

Current assumption:

- Minimum payout and manual review threshold should be configurable, displayed in publisher payout readiness, and audited when changed.

Design default:

- Initial UI copy and thresholds use USD 50 minimum payout and USD 1,000 manual review threshold as configurable defaults.

Acceptance impact:

- Payout request UI and admin queue must match the configured thresholds.
- Publisher payout readiness must show the minimum payout amount, manual review threshold, blocked/failed retry condition, and next action using the same configured values as the backend.

### D006: Refund And Dispute Window

Status: proposed

Owner: Legal + Finance + Product Manager

Target: before paid launch

Question:

- How long can buyers request refunds, and which disputes trigger automatic balance reversal?

Current assumption:

- Provider-deferred refund/dispute states can exist now, but final public terms need legal review before paid launch.

Design default:

- Refund/dispute UI can show provider-deferred states and adjustment records now, but final refund window language must remain replaceable before real money movement.

Acceptance impact:

- `/terms`, admin adjustment UI, project adjustment history, and publisher revenue adjustment history must use the same policy.

### D007: Paid Skill Review SLA

Status: proposed

Owner: Product Manager + Trust Operator

Target: before paid launch

Question:

- What SLA should publishers expect for paid-skill review, marketplace curation appeals, and critical incident handling?

Current assumption:

- Paid skills need a stricter SLA than free draft listings; critical incidents need a separate faster response target.

Design default:

- Paid-skill review SLA display default: 3 business days.
- Marketplace curation appeal SLA display default: 7 calendar days.
- Critical incident first-response display default: 24 hours.

Acceptance impact:

- Publisher workspace, admin queues, terms, and notification templates must display consistent SLA language.

### D008: Auth Provider Launch Policy

Status: decided

Owner: Product Manager + Engineering

Target: before public launch

Question:

- Which login methods are required for public launch?

Decision:

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

Status: decided

Owner: Product Manager + Trust Operator + Engineering

Target: within 48 hours

Question:

- Which permissions require owner approval, reviewer notes, second review, or paid-launch blocking?

Decision:

- Filesystem write, secret access, local execution, destructive workflows, payment actions, and sensitive personal, financial, business, or credential data handling are high risk.
- High-risk skills require reviewer notes.
- High-risk installs require project owner approval before runtime.
- Local execution and destructive/payment workflows require stronger review before paid activation.

Acceptance impact:

- Marketplace cards, skill detail, publisher preflight, admin review queue, and project policy approval must use the same risk matrix.

### D011: P0 Manual Publisher Payouts

Status: decided

Owner: Product Manager + Finance

Target: current P0 build

Question:

- How should publisher payouts work before a payout provider and tax/KYC automation are connected?

Decision:

- Publishers submit only PayPal or Alipay receiving details, including account, optional account holder, and optional finance notes.
- Finance manually transfers money outside SkillHub after reviewing the payout request and records the transfer reference in the admin payout decision.
- SkillHub still keeps the ledger, publisher balances, payout reservation, payout state machine, retry/block reasons, audit logs, notifications, and publisher/admin visibility.
- Full payout-provider onboarding, automated tax/KYC, and provider money movement remain deferred integrations.

Acceptance impact:

- Publisher payout setup must collect PayPal/Alipay receiving details instead of sending authors to a provider handoff.
- Admin payout decisions require a transfer reference when marking a payout paid.
- Payout records may keep the existing `providerReference` API field for compatibility, but product copy must label it as a transfer reference.

## P1 Decisions

### D101: Marketplace Ranking Policy Weighting

Status: open

Owner: Product Manager

Question:

- What are the buyer-safe ranking explanations and how often should manual curation expire or be reviewed?

Acceptance impact:

- Public marketplace copy, admin curation controls, and publisher improvement hints must stay consistent.

### D102: Launch Success Thresholds

Status: decided

Owner: Product Manager

Question:

- How many verified skills, active publishers, active projects, successful invocations, and published feedback rows are enough for launch credibility?

Decision:

- Early public-launch credibility thresholds are:
  - 5 public verified skills.
  - 2 active publishers with public marketplace supply.
  - 3 active developer projects with an installed skill or runtime activity.
  - 20 successful governed runtime invocations.
  - 5 published buyer feedback rows.
- These thresholds are launch credibility warnings, not payment-provider blockers.
- Operators may tune the defaults with `SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS`, `SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS`, `SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS`, `SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS`, and `SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK`.

Acceptance impact:

- `/v1/admin/launch-readiness` and `/admin` must track these thresholds from real marketplace, project, invocation, and feedback state.
- Missing thresholds should create operator warnings so the team knows what supply, demand, runtime, or trust proof to build before showing the platform to customers.

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
