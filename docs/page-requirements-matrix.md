# SkillHub Page Requirements Matrix

This matrix is the product manager source of truth for page-level work. A page is ready for UI design only when its user, job, primary action, data source, states, and acceptance criteria are clear. Detailed P0 journey execution requirements live in [P0 Journey Specs](./p0-journey-specs.md).

## Page Standard

Every page must define:

- Primary user.
- Page job.
- Primary action.
- Repeat-use reason.
- Data source.
- Empty/error/blocked states.
- Admin or operational visibility when relevant.
- Mobile and desktop acceptance.
- English and Chinese copy.

## Public Website

### Home `/`

Primary user: Visitor, developer, publisher, customer evaluator.

Page job:

- Explain that SkillHub is a registry, marketplace, and runtime gateway for AI agents.
- Prove it is an operating platform, not a static directory.
- Send users to marketplace, publishing, agent integration, or account entry.

Primary action:

- Browse marketplace.
- Publish a skill.
- Read agent integration.

Data source:

- Platform overview API.
- Marketplace preview.
- Safe fallback only when production demo fallback is explicitly allowed.

Acceptance:

- First viewport communicates the product category.
- Shows developer, publisher, and operator loops.
- Shows an explicit console access map for `/login`, `/account`, `/developer`, `/publisher`, and `/admin`, including role expectations and no-shared-password guidance.
- Shows a shared operating evidence chain that connects publisher supply, admin review, marketplace install, runtime governance, ledger split, payout, and audit without using fake production rows.
- Registry search on the home page submits into `/marketplace` with a real query parameter instead of behaving like a decorative input.
- Shows public trust and operating proof.
- Links to marketplace, publishers, agents, docs, publish, login/account, and terms.

### Marketplace `/marketplace`

Primary user: Developer / agent builder.

Page job:

- Let users discover, compare, and shortlist trusted skills.
- Show marketplace operation: ranking, trust, runtime, pricing, and publisher signals.

Primary action:

- Search/filter skills.
- Open skill detail.
- Copy install command.
- Move toward save/install once signed in.

Data source:

- `/v1/skills/search`
- `/v1/platform/overview`
- `/v1/publishers`

Acceptance:

- Filters cover category, pricing, runtime, permission risk, verification state, and ranking.
- Search and filter state is deep-linkable through URL parameters so homepage handoff, customer demos, and shared discovery links reproduce the same catalog view.
- Cards show install command, risk, runtime, price, verification, rating, installs/calls when available.
- Buyer-safe recommendation reasons are visible.
- Cards show an after-install project handoff strip so developers can see that copying an install command leads to project install state, policy gate, runtime logs, and usage ledger state.
- Publisher trust path is visible.
- Shows the operating evidence chain from discovery to install, runtime governance, ledger, and payout so visitors can see the catalog is backed by operational state.
- No internal curation boost/reason is exposed publicly.

### Registry `/registry`

Primary user: Developer / agent builder, publisher, customer evaluator.

Page job:

- Explain the versioned skill-contract layer behind marketplace discovery.
- Show what a valid SkillHub manifest records before a listing becomes installable.
- Connect registry contracts to review, runtime governance, ledger, payout, notification, and audit state.

Primary action:

- Open the public registry API.
- Compare public skills in the marketplace.
- Continue to the publisher submission path.

Data source:

- `/v1/skills/search`
- `/v1/stats`
- Shared operating evidence chain counts derived from public registry state.

Acceptance:

- Does not duplicate marketplace filtering or buyer comparison.
- Shows the registry protocol position, manifest quality bar, skill lifecycle, runtime resolution path, public API endpoint, and live public registry rows.
- Makes clear that production-like environments do not fill fake public supply unless demo fallback is explicitly enabled.
- Shows high-risk, verified, MCP, and registry-call signals where available.
- Desktop and mobile layouts must not horizontally overflow, including the manifest snippet and skill table.

### Skill Detail `/skills/[slug]`

Primary user: Developer / agent builder.

Page job:

- Let a developer decide if a skill is safe and useful enough to install into an agent project.

Primary action:

- Save skill to project.
- Install skill to project.
- Start trial/subscription if needed.
- Test installed skill.
- Submit feedback or trust report.

Data source:

- Public skill manifest.
- Price records.
- Published feedback.
- Similar/replacement skill suggestions.
- Signed-in project actions.

Acceptance:

- Shows manifest, schemas, examples, permissions, runtime, pricing, changelog, support, feedback, publisher trust, incidents/deprecation state, and install paths.
- Install paths are copyable and paired with a readiness checklist for review trust, permission risk, runtime posture, project availability, billing/subscription gate, latest version, and last-reviewed signal.
- The install section includes a developer handoff packet that summarizes contract pin, organization project state, policy gate, reveal-once runtime key, governed test, and usage-ledger implications before the developer leaves for the project command center.
- Signed-in project actions are scoped to the current organization.
- Runtime test uses the same governance path as normal runtime calls.
- Feedback enters moderation before public display.
- Trust report creates an operator queue item.

### Publishers Directory `/publishers`

Primary user: Developer, publisher, customer evaluator.

Page job:

- Show that SkillHub has a supplier side with quality and operating signals.

Primary action:

- Browse publisher profiles.
- Inspect a publisher's public trust profile.

Data source:

- `/v1/publishers`

Acceptance:

- Shows verified publisher count, public skill count, install/call evidence, payout readiness state where safe, and top public skills.
- Does not expose private payout, organization, or user data.

### Publisher Public Profile `/publishers/[slug]`

Primary user: Developer / buyer.

Page job:

- Help buyers judge whether a publisher is trustworthy.

Primary action:

- Inspect publisher's public skills.
- Open skill detail.

Data source:

- `/v1/publishers/:slug`

Acceptance:

- Shows trust level, verified skill count, runtime success signals, public skill list, active paid skill count, and public operating notes.
- Does not expose internal curation boost, private payout details, or private organization members.

### Agent Integration `/agents`

Primary user: Developer / agent builder.

Page job:

- Explain how an agent connects to SkillHub through MCP, REST, SDK, CLI, and project-scoped keys.

Primary action:

- Copy integration snippets.
- Go to developer workspace.

Data source:

- Static integration copy plus public endpoint URLs.

Acceptance:

- Explains project API key governance, installed skills, version pins, budgets, subscriptions, logs, and MCP `tools/call` parity with runtime invoke.
- Includes production-before-use checklist.

### Docs `/docs`

Primary user: Developer, publisher, operator.

Page job:

- Provide product and technical reference for manifest, API, SDK, MCP, publishing, pricing, payout, and operations.

Primary action:

- Copy examples.
- Navigate to deeper docs.

Data source:

- Static docs and API references.

Acceptance:

- Must not be a marketing page.
- Must include manifest requirements, API endpoints, runtime governance, publishing flow, pricing/ledger, payout states, and notification states.

### Terms `/terms`

Primary user: Buyer, publisher, platform operator.

Page job:

- Make marketplace operating rules visible before final legal/payment integrations.

Primary action:

- Read rules.
- Continue to publish or marketplace.

Data source:

- Public operating terms.

Acceptance:

- Covers buyer responsibilities, publisher responsibilities, review/takedown, refunds/disputes, data retention, notifications/webhooks, payout and provider-deferred boundaries.

## Account And Entry

### Login/Register `/login`

Primary user: New or returning user.

Page job:

- Let users enter through email code, Google, GitHub, or token fallback.

Primary action:

- Request email code.
- Verify email code.
- Start Google/GitHub login.
- Use token fallback.

Data source:

- `/v1/auth/providers`
- `/v1/auth/email/request-code`
- `/v1/auth/email/verify-code`
- OAuth start/callback endpoints.

Acceptance:

- OAuth buttons are not fake: configuration-required state must show callback URLs and missing config names.
- Email signup/login does not issue a session before code verification.
- Token fallback is clearly for bootstrap, invitation, or operator recovery.
- Login page must show where users go after access: account center, developer workspace, publisher workspace, and admin operations, with role-required states instead of implying a shared backend password.
- Login page must summarize account-entry readiness before the forms: email-code launch path, Google/GitHub configuration state, token fallback boundary, current session state, and post-login workspace destinations.

### Account Center `/account`

Primary user: Signed-in user.

Page job:

- Show identity, organization, connected login methods, sessions, roles, workspace readiness, shortcuts, and preferences.

Primary action:

- Revoke old sessions.
- Disconnect OAuth identity safely.
- Manage notification preferences.
- Navigate to developer, publisher, dashboard, admin.

Data source:

- `/v1/account`
- `/v1/account/sessions`
- `/v1/notifications/preferences`

Acceptance:

- Never exposes raw tokens after first reveal.
- Shows only token fingerprints.
- Prevents lockout when disconnecting OAuth identity.
- Shows workspace readiness for team, tokens, projects, owned skills, unread notifications, billing, invoice, publisher and payout states.
- Shows console shortcuts with role-aware status so users can understand why `/developer`, `/publisher`, or `/admin` is available, sign-in-required, or role-required.
- Shows a compact account command strip for identity, session security, workspace readiness, and operations readiness before detailed panels so the personal center feels like an account backend rather than a settings page.

## Publisher Workspace

### Publish Entry `/publish`

Primary user: Publisher / skill author.

Page job:

- Let a publisher create or update a skill draft from a manifest and understand the path to review, verification, pricing, and payout readiness.

Primary action:

- Paste manifest.
- Run client preflight.
- Save draft.
- Continue to publisher workspace.

Data source:

- Signed-in user session.
- `/v1/skills`

Acceptance:

- Shows preflight for JSON, identity, runtime, schemas, permissions, commercial readiness.
- Shows current publisher access state with required roles, sign-in-required or role-required states, and the rule that gateway writes remain organization-scoped.
- Turns preflight warnings/blockers into a repair queue with target fields and next actions.
- Shows a secret-safe reviewer evidence packet before version submission.
- Explains draft -> version submit -> automated checks -> review -> verified -> commercial readiness.
- Does not ask users to paste raw admin/service tokens.
- Success state links to publisher workspace and skill detail.
- Immediate review-submission success shows the real review handoff: queued/refreshed state, review id, risk, automated-check counts, and links into publisher review, paid-readiness, and account/terms workspace sections.
- Does not claim a skill is verified just because draft save succeeded.

### Publisher Workspace `/publisher`

Primary user: Publisher / skill author.

Page job:

- Operate owned skills after first upload.

Primary action:

- Submit version for review.
- Edit unlocked draft/new version.
- Set pricing.
- Accept terms.
- Submit PayPal/Alipay payout receiving details.
- Respond to feedback.
- Claim buyer requests.
- Request marketplace distribution review.

Data source:

- `/v1/publisher/overview`
- `/v1/publisher/skills`
- `/v1/publisher/profile`
- `/v1/publisher/balances`
- `/v1/publisher/buyer-requests`
- Notification and payout endpoints.

Acceptance:

- Shows review status, latest automated checks, version history, pricing blockers, feedback, usage, revenue, refunds/disputes, payout readiness, buyer requests, curation placement and appeal status.
- Shows a role-aware workspace access panel explaining current session, required publisher roles, sign-in-required, role-required, and gateway-enforced write boundaries.
- Shows a publisher operations priority queue above the detailed panels. The queue must derive ordered next actions from readiness, rejected/blocked/overdue reviews, automated check failures or warnings, paid activation blockers, buyer requests, unanswered published feedback, payout readiness, refund/dispute attention, and marketplace placement or appeal state.
- Shows a paid marketplace readiness command panel that aggregates publisher profile, current terms, payout readiness, paid-price drafts, active paid listings, and per-skill paid activation blockers before the detailed skill cards.
- Shows the publisher-focused operating evidence chain with live readiness, review, pricing, and payout signals so authors understand how upload work becomes reviewed supply and future revenue state.
- Payout readiness explains pending, available, locked, paid, failed, and blocked money states; request blockers; minimum payout; manual review threshold; latest payout reason; retry condition; and next action.
- Shows a review repair loop that combines the latest exact version, review submitted time, SLA due state, reviewer notes, automated check evidence, structured blocker/advisory semantics, target fields, and concrete repair actions for rejected, blocked, warning, overdue, or unsubmitted versions.
- Paid activation blockers are explicit.
- Active paid pricing controls must communicate when review, terms, payout, or publisher readiness blocks activation; publishers can still save draft pricing while the backend remains the source of truth.
- Buyer request submission requires selecting an owned skill/version, delivery note, and evidence URL; request cards show the submitted skill, version, review state, evidence link, and buyer decision note where present.
- Approved or installed versions cannot be edited in place.
- Publisher sees why to come back next week because the top queue points to concrete review, runtime, pricing, feedback, demand, payout, distribution, ledger, or account work instead of only showing metrics.

## Developer Workspace

### Developer Command Center `/developer`

Primary user: Developer / agent builder.

Page job:

- Give a high-level operating center for projects, runtime keys, installed skills, budgets, buyer requests, billing, notifications, team, and webhooks.

Primary action:

- Create project.
- Open project detail.
- Manage team, billing, notification preferences, webhooks.
- Create buyer request.

Data source:

- `/v1/developer/overview`
- `/v1/developer/projects`
- `/v1/organization/team`
- `/v1/organization/billing`
- `/v1/organization/webhooks`
- `/v1/notifications`

Acceptance:

- Shows projects, active keys, installed skills, update counts, billing readiness, notification inbox, team access, webhook setup, and buyer requests.
- Shows a role-aware workspace access panel explaining current session, required developer roles, sign-in-required, role-required, and gateway-enforced write boundaries.
- Shows the developer-focused operating evidence chain with live project, install, runtime call, and budget signals so an install command visibly becomes project governance state.
- Shows a developer operations priority queue above the detailed panels. The queue must derive ordered next actions from no projects, missing active project keys, projects without installed skills, owner approval, suspended installs or policy, update inbox, runtime failures or low success rate, billing readiness, unread notifications, team setup, webhook setup, and buyer requests without adding fake task rows.
- Developer can create a project without admin intervention.

### Dashboard `/dashboard`

Primary user: Signed-in organization member.

Page job:

- General workspace overview and bridge into developer/publisher/admin areas.

Primary action:

- Navigate to project, publisher, admin, account, billing, notifications.

Data source:

- Platform/developer/publisher overview where authorized.

Acceptance:

- Must not become a duplicate of every workspace.
- Should show session state and operational shortcuts.
- Shows a role-aware workspace command center before deep panels: account access, developer workspace, publisher workspace, and admin operations each expose required roles, sign-in-required, role-required, or available state.
- Shows the three frozen P0 journeys together so signed-in users and customer evaluators understand where developer install/test, publisher upload/monetization, and admin governance continue.
- Shows the shared operating evidence chain with dashboard-owned signals for projects, verified owned skills, ledger rows, and launch blocker/warning counts.
- Shows a dashboard P0 demo chain that derives publish, checks, review, listing, install, runtime, ledger/payout, notification/readiness/audit proof from existing workspace state, marking each stage as proof visible, needs attention, or waiting for data without adding fake task rows.
- Uses admin launch-readiness summary only as secret-safe counts and next-action context; it must not expose OAuth secrets, email keys, service tokens, raw tokens, passwords, or other credentials.
- Keeps detailed project, publisher, finance, payout, notification, and admin work in the dedicated workspaces instead of turning `/dashboard` into an unbounded duplicate console.

### Project Detail `/dashboard/projects/[slug]`

Primary user: Developer / agent operator.

Page job:

- Manage one agent project's installed skills, policies, API keys, runtime calls, subscriptions, invoices, saved skills, updates, and connection instructions.

Primary action:

- Create/revoke API key.
- Edit policy.
- Pause/remove/restore install.
- Adopt/ignore/schedule update.
- Generate invoice.
- Run test invocation.
- Copy REST/MCP snippets.

Data source:

- `/v1/developer/projects/:slug`
- Project install, policy, key, update, invoice, subscription, saved skill, runtime test endpoints.

Acceptance:

- Shows a project operations priority queue above detailed panels. The queue must derive ordered next actions from missing active keys, missing installed skills, owner approval, suspended installs or policy, update inbox decisions, runtime quality issues, missing runtime proof, subscription/ledger/invoice gaps, and saved-skill follow-up without adding fake task rows.
- Priority queue actions link into the exact project panels for policies, runtime test, runtime calls, API keys, update inbox, saved skills, subscriptions, invoices, and refund/dispute adjustments.
- Shows project-scoped refund and dispute impact history as read-only buyer/operator context, and unresolved adjustment records can surface in the project priority queue while finance decisions remain in admin workflows.
- Runtime actions use project-scoped authorization.
- High-risk permission changes require owner approval.
- High-risk owner approval saves require owner/admin authority and must synchronize the installed-skill approval state, policy approval timestamp, audit trail, and notification event before runtime invocation is considered unblocked.
- Version adoption only works for approved versions.
- Subscription and budget gates are visible before runtime use.
- API keys are reveal-once.

## Admin Workspace

### Admin Command Center `/admin`

Primary user: Reviewer, trust operator, finance admin, support, super admin.

Page job:

- Operate platform review, trust, finance, notification, identity, webhook, and launch readiness workflows.

Primary action:

- Review skills.
- Decide feedback/takedown/incidents.
- Process finance ledger, payouts, refunds, disputes.
- Manage commission rules.
- Manage notification templates and delivery.
- Inspect launch readiness.
- Inspect identity directory.

Data source:

- `/v1/admin/overview`
- `/v1/admin/reviews`
- `/v1/admin/skill-feedback`
- `/v1/admin/abuse-reports`
- `/v1/admin/incidents`
- `/v1/admin/finance/*`
- `/v1/admin/payouts`
- `/v1/admin/notifications`
- `/v1/admin/notification-templates`
- `/v1/admin/notification-deliveries`
- `/v1/admin/webhook-deliveries`
- `/v1/admin/launch-readiness`
- `/v1/admin/audit-logs`
- `/v1/admin/identity-directory`

Acceptance:

- Privileged actions require reason where applicable.
- Shows a role-aware workspace access panel explaining current session, required reviewer/finance/support/admin roles, sign-in-required, role-required, and gateway-enforced write boundaries.
- Shows the admin-focused operating evidence chain with live GMV, pending balance, review/risk, and ledger-row signals so operators can trace review, finance, payout, delivery, and audit work.
- Shows an admin operations priority queue above the detailed panels. The queue must derive ordered next actions from launch readiness, skill review SLA and automated-check evidence, incidents, abuse reports, feedback moderation, payouts, refunds, disputes, notification delivery, webhook delivery, marketplace curation appeals, commission setup, and identity health.
- Commission setup must appear in the admin priority queue when no commission rule exists or when rules exist but none is active.
- Review queue exposes SLA pressure, blocker, high-risk, and warning filters with recommended priority reasons so reviewers can decide what to process first.
- Review cards expose the secret-safe evidence package before decision controls: publisher, payout readiness, exact version, manifest summary, redacted runtime target, permission flags, and schema field counts.
- Audit log is separate from notification events.
- Launch readiness is secret-safe.
- Launch readiness shows customer-facing credibility thresholds for verified public skills, active publishers, active developer projects, successful invocations, and published feedback so operators know whether the marketplace has enough proof for customer demos or public launch.
- Payout decisions require finance reason, transfer reference when marking paid, and retry condition when blocking; admins can see the publisher-facing next action before deciding.
- No raw OAuth secrets, email keys, service tokens, API salts, webhook secrets, verification codes, user tokens, or passwords are displayed.
- Finance actions do not mutate historical splits silently.

## Core Journey Specs To Write Before More UI

Status: approved in [P0 Journey Specs](./p0-journey-specs.md). The summaries below remain the page-matrix index for those specs.

### Journey A: Developer Discovers, Installs, And Tests A Skill

Routes:

- `/marketplace`
- `/skills/[slug]`
- `/developer`
- `/dashboard/projects/[slug]`

Must specify:

- Search and filter behavior.
- Skill trust decision.
- Save/install flow.
- Project policy approval.
- API key/MCP connection.
- Test invocation.
- Usage/cost visibility.
- Update/incident follow-up.

### Journey B: Publisher Uploads, Submits, Monetizes, And Improves A Skill

Routes:

- `/publish`
- `/publisher`
- `/skills/[slug]`

Must specify:

- Manifest draft save.
- Version management.
- Automated checks.
- Review submission and decision.
- Feedback response.
- Pricing blockers.
- Terms and payout readiness.
- Revenue and payout follow-up.

### Journey C: Admin Reviews, Governs, And Launches Platform Operations

Routes:

- `/admin`
- `/terms`
- `/docs`

Must specify:

- Review queue.
- Trust/takedown queue.
- Runtime incidents.
- Feedback moderation.
- Finance ledger.
- Payout decisions.
- Notification templates/deliveries.
- Identity directory.
- Launch readiness.

## UI Design Rule

UI design starts only after the relevant page row and journey spec are approved.

If a design idea cannot be mapped to a user job, primary action, data source, or acceptance criterion, it should not be implemented yet.

## Shared Journey Navigation

Status: implemented in the web UI.

The public and console surfaces now include a shared role-aware P0 journey rail:

- Developer rail: `/marketplace`, `/skills/[slug]`, `/developer`, and `/dashboard/projects/[slug]`.
- Publisher rail: `/publish` and `/publisher`.
- Admin rail: `/admin`.
- Home rail deck: `/` shows all three P0 paths together.

Acceptance:

- The rail must show the current step, the next step, and the full role journey without implying fake success state.
- It must map only to frozen Journey A, B, and C steps.
- It must stay bilingual and responsive without horizontal overflow on mobile.
- It must help a customer understand how a public listing becomes project state, review state, runtime state, ledger state, payout state, notification state, and audit state.

## Shared Operating Evidence Chain

Status: implemented in the web UI.

The home, marketplace, dashboard, developer, publisher, and admin surfaces now include a shared operating evidence chain. The chain makes the same platform lifecycle visible from each role's viewpoint:

- Publish contract: manifest, version, permissions, runtime, examples, and pricing intent.
- Review gate: automated checks, human decision, reviewer notes, and SLA.
- Marketplace install: searchable public listing, publisher trust, install readiness, pricing, feedback, and alternatives.
- Runtime governance: project-scoped keys, approval policy, budget, rate limit, subscription state, REST, MCP, invocation logs, and usage.
- Ledger split: transactions, immutable commission splits, balances, refunds, and disputes.
- Payout and audit: balance reservation, finance decision, manual PayPal/Alipay transfer, notification delivery, and audit trail.

Acceptance:

- It must use page-owned live/count signals when available and show empty-safe production state instead of replacing missing rows with bundled demo supply.
- It must highlight the current role's stage without claiming the stage succeeded.
- It must remain bilingual, responsive, and free of horizontal overflow at mobile widths.
- It must strengthen customer demo clarity by showing that SkillHub is a marketplace operating system, not only a public homepage or static catalog.
