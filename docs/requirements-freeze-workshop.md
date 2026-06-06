# SkillHub Requirements Freeze Workshop

Status: approved for UI phase

Date: 2026-06-06

Purpose: stop ad hoc UI/code work, align all agent roles, freeze the P0 product scope, preserve existing prototype work, and enter UI only after the core journeys are locked.

## Meeting Roles

The workshop used the existing agent group as a product team:

- Main lead: product/engineering integrator, final assembly, git, release discipline.
- Dalton: product manager and meeting chair.
- Hume: user/customer critic.
- Einstein: backend and architecture lead.
- Boole: UI/UX lead.
- Curie: QA and launch acceptance lead.
- Jason: frontend implementation lead.

No new agent was added because the thread already reached the practical agent limit. The current 7-person core team is enough for maximum useful parallelism without creating merge chaos.

## Automation Decision

The previous `skillhub` heartbeat automation has been deleted.

Reason:

- The project is now in requirements-freeze mode.
- Automatic implementation should not resume until the P0 decisions and core journeys are locked.
- Future automation should be recreated only after the UI/implementation plan is approved.

## Prototype Asset Decision

The previous `/publish` UI work is not wasted.

It is saved locally as a git stash:

```text
publish preflight prototype before requirement freeze
```

Reusable assets:

- Manifest textarea and live JSON parsing.
- Preflight checks for identity, runtime, schema, permissions, and commercial readiness.
- Readiness score, blocker, and warning UI model.
- Draft-save success next actions.
- Publisher pipeline copy: draft -> checks -> review -> verified -> commercial readiness.

Do not reuse blindly:

- Do not let `/publish` define the whole publisher workspace.
- Do not imply preflight equals verified review.
- Do not keep any admin-token or raw-token mental model.
- Do not merge the large page-specific CSS until shared readiness/check/flow styles are designed.

## Frozen Product Positioning

SkillHub is frozen as:

```text
AI agent skill registry + marketplace + runtime gateway + ledger-backed operating platform.
```

SkillHub is not:

- A prompt library.
- A static MCP directory.
- A landing-page SaaS concept.
- A WordPress content site.
- A demo dashboard with fake controls.

## Frozen P0 User Roles

The P0 user roles are:

- Visitor: understands the product, trust model, marketplace, publishing path, agent integration, and terms.
- Developer / Agent Builder: discovers, installs, governs, runs, and monitors skills inside agent projects.
- Publisher / Skill Author: uploads, submits, verifies, monetizes, improves, and supports skills.
- Reviewer / Trust Operator: reviews versions, feedback, abuse, takedowns, incidents, and curation.
- Finance Admin: controls ledger, commission, refunds, disputes, balances, and payouts.
- Super Admin: controls platform readiness, identity, templates, audit, migration visibility, and privileged recovery.

These roles should not be renamed or re-scoped during the UI phase without a formal decision-log update.

## Frozen P0 Journeys

The detailed approved journey specs are maintained in [P0 Journey Specs](./p0-journey-specs.md). UI and implementation work should map to those specs.

### Journey A: Developer Discovers, Installs, And Tests A Skill

Routes:

- `/marketplace`
- `/skills/[slug]`
- `/developer`
- `/dashboard/projects/[slug]`

Required flow:

1. Search/filter marketplace.
2. Inspect skill detail: verification, runtime, pricing, schemas, permissions, publisher trust, incidents, feedback, alternatives.
3. Save or install into an organization-scoped project.
4. Review policy, owner approval, budget, rate limit, subscription state, and version pin.
5. Create/revoke reveal-once project API key.
6. Copy REST/MCP/SDK snippets.
7. Run test invocation through the same runtime governance path.
8. See runtime log, usage, cost, invoice/subscription state, updates, incidents, and notifications.

Acceptance:

- A developer can prove the marketplace is not a static directory because a listing becomes project state and runtime state.

### Journey B: Publisher Uploads, Submits, Monetizes, And Improves A Skill

Routes:

- `/publish`
- `/publisher`
- `/skills/[slug]`

Required flow:

1. Paste manifest and run preflight.
2. Save organization-scoped draft.
3. Manage versions.
4. Submit an exact semantic version for review.
5. See automated checks: manifest, runtime, example, security.
6. Receive reviewer decision and notes.
7. Complete terms, profile, payout readiness, and pricing blockers.
8. Track installs, calls, feedback, buyer requests, revenue, refunds, disputes, payout state, placement, and appeals.

Acceptance:

- A publisher can understand exactly why a skill is blocked, what to fix, and why returning next week matters.

### Journey C: Admin Reviews, Governs, And Launches Operations

Routes:

- `/admin`
- `/terms`
- `/docs`

Required flow:

1. Inspect launch readiness.
2. Process skill review queue with check evidence.
3. Moderate feedback.
4. Handle abuse/takedown and runtime incidents.
5. Manage marketplace curation and appeals.
6. Process ledger, commission, balances, payouts, refunds, and disputes.
7. Manage notification templates, external delivery, and webhook outbox.
8. Inspect identity directory and audit stream.

Acceptance:

- Admin pages must feel like an operations console, not a metrics decoration page.

## Frozen P0 Product Rules

### Account And Auth

- Email-code access is required for public launch.
- Google and GitHub login are supported when configured.
- If OAuth credentials are missing, the UI must show configuration-required state with callback URLs and missing config names.
- Token fallback is only for bootstrap, invitations, and recovery.
- Raw user tokens must never be shown after first reveal.

### Skill Version Governance

- Skill lifecycle remains:

```text
draft -> submitted -> in_review -> verified/rejected -> deprecated/suspended
```

- Verified or installed versions are immutable.
- New behavior, schemas, permissions, runtime, or pricing-sensitive changes require a new semantic version.
- Public default installs prefer approved versions.
- A skill cannot become verified without a review record and acceptable automated checks.

### Runtime Strategy

Phase one runtime strategy is frozen as:

- External HTTP/MCP runtimes governed through SkillHub policy, versioning, metering, and logging.
- SkillHub may proxy/route calls through its runtime gateway where needed for governance.
- Local execution is restricted and requires human review.
- MCP `tools/call` must reuse the same governance path as REST runtime invocation.

### High-Risk Permission Matrix

High risk:

- Local execution.
- Filesystem write.
- Secret access.
- Payment or destructive workflow.
- Sensitive personal, financial, business, or credential data handling.

Rules:

- High-risk skills require reviewer notes.
- High-risk installs require project owner approval before runtime.
- Local execution and destructive/payment workflows require stronger review before paid activation.
- Risk language must be consistent across marketplace cards, skill detail, publish preflight, admin review, and project policy UI.

### Money And Ledger

- Usage logs do not pay publishers directly.
- Billable usage and subscription periods create transactions.
- Transactions create immutable splits.
- Splits create publisher balance rows.
- Refunds and disputes create adjustment records instead of rewriting history.
- Payout requests reserve eligible balances.
- Finance actions require audit.

### Notification And Webhook Governance

- User preferences govern user-owned in-app/email channels.
- Organization webhook delivery is governed by organization webhook endpoints: endpoint status and subscribed events.
- Individual user preferences must not suppress organization-level webhook fanout.
- External email/webhook delivery is separate from user unread in-app notifications.

### Secret-Safe Operations

Admin and launch readiness must never display:

- OAuth secrets.
- Email provider keys.
- Service tokens.
- API key salts.
- Webhook signing secrets.
- Verification codes.
- User tokens.
- Passwords or credentials.

## Paid Marketplace Design Defaults

Payment provider, payout provider, KYC/tax, and final legal terms remain final-integration decisions.

For UI/state design, use these defaults until legally replaced:

- Paid publishing starts invite-only.
- Active paid pricing requires verified review, active publisher profile, accepted publisher terms, payout readiness, and active commission rule.
- Default commission remains 20% platform / 80% publisher unless a future active commission rule applies.
- Minimum payout display should be configurable; initial design default: USD 50.
- Manual payout review threshold should be configurable; initial design default: USD 1,000.
- Paid-skill review SLA display default: 3 business days.
- Curation appeal SLA display default: 7 calendar days.
- Critical incident first-response display default: 24 hours.

These defaults are allowed for UI and state-machine design. They must still be reviewed before real money movement.

## UI Phase Entry Criteria

UI work may begin only after:

- Journey A, B, and C are accepted as the P0 operating journeys.
- Page matrix remains the page source of truth.
- Shared state language is frozen: verification, risk, review, runtime health, install, subscription, ledger, payout, refund/dispute, notification, webhook, launch readiness.
- Shared components are planned before page-specific styling.
- Existing `/publish` prototype is treated as an asset pack, not a page contract.

## Team Topology For Maximum Parallel Work

Recommended core team: 7 roles.

| Role | Owner | Responsibility |
| --- | --- | --- |
| Lead integrator | Main agent | Final decisions, merge discipline, docs, git, release summary |
| Product manager | Dalton | Requirement freeze, decision log, journey acceptance |
| Customer critic | Hume | Challenge credibility, demo realism, buyer/publisher objections |
| Backend architect | Einstein | API contracts, state machines, DB, RBAC, runtime, ledger |
| UI/UX lead | Boole | IA, visual hierarchy, interaction states, responsive rules |
| QA lead | Curie | Acceptance matrix, smoke, permissions, i18n, launch checks |
| Frontend lead | Jason | Shared components, page implementation slices, frontend integration |

Additional advisors later:

- Finance/legal reviewer for paid terms, refunds, disputes, payout, tax/KYC.
- Security reviewer for high-risk permission policy and runtime execution.
- SEO/GEO reviewer for launch content only after product IA is stable.

## Parallel Work Plan After Freeze

### Wave 1: Requirements Finalization

- PM locks Journey A/B/C specs in [P0 Journey Specs](./p0-journey-specs.md).
- Architect locks API/data prerequisites.
- UX locks information architecture and state language.
- QA locks acceptance matrix.

### Wave 2: Shared UI System

- Frontend builds shared status, risk, flow, code, form, empty, blocked, and action-result components.
- UX defines page density, responsive behavior, and bilingual copy style.
- QA creates desktop/mobile/i18n checks.

### Wave 3: Journey Implementation

Parallel lanes:

- Public discovery: home, marketplace, skill detail, publishers.
- Developer journey: developer workspace, dashboard, project detail, install/test actions.
- Publisher journey: publish entry, publisher workspace, version/review/pricing/payout readiness.
- Admin journey: review, trust, finance, notification, readiness, audit.
- Account entry: login, account, sessions, provider readiness.

### Wave 4: End-To-End Demo Hardening

The demo must prove:

```text
publisher upload -> automated checks -> admin review -> marketplace listing
-> developer install -> runtime test -> usage/log/notification/audit
-> ledger/payout readiness visible
```

If this cannot be demonstrated, the product still looks like a directory.

## Change Control

After this freeze:

- Any P0 journey change must update this document, the product decision log, and the page matrix.
- Any UI addition must map to a page row and journey step.
- Any backend/API addition must map to a state, permission, audit, or data requirement.
- Any paid-marketplace change must note whether it is a design default or legally/provider-final.
