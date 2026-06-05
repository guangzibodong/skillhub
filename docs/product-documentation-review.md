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

## Notification Preference Value

Notification preferences are part of the repeat-use loop, not a cosmetic setting.

- Developers return when installed skills change, incidents affect a project, invoices are ready, or account actions need approval.
- Publishers return when reviews finish, buyer requests match their skills, payout status changes, or quality issues need repair.
- Operators return when billing, dispute, payout, and risk events need human action.

The product now treats in-app, email, and webhook choices as user-owned state before the final email provider is connected. That keeps the platform ready for real operations without hard-coding one noisy notification behavior for every user.

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

- Public marketplace catalog and skill detail pages now read registry search, manifests, and public price records first, while keeping bundled content as fallback.
- Admin finance metrics from the ledger.
- Admin money table from recent ledger transactions.
- Admin notification/audit stream from notification events.
- Dashboard publisher balances and revenue ledger from the same finance source.

Added payout workflow states, covering:

- Payout requests reserve concrete publisher balance rows.
- Admin can approve, mark paid, fail, or block payout requests.
- Dashboard withdrawal operations now let verified publishers request payout for eligible available balances, turning earnings visibility into an actual payout workflow before provider money movement is connected.

Added trust and takedown operations, covering:

- User-scoped skill abuse reports for security, privacy, quality, spam, billing, malicious runtime, and other trust issues.
- Admin trust queue for triage, dismissal, publisher warning, listing restriction, suspension, and resolution.
- Takedown history, audit logs, skill update events, and queued notifications so trust decisions are durable before external support/legal tooling is integrated.
- Skill detail pages now expose the report flow directly, giving developers and project operators a clear way to send listing/runtime problems into the trust queue.
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
- Dashboard publisher account operations now expose public publisher profile editing, payout handoff creation, handoff link access, and readiness decisions. This gives publishers a concrete setup loop before real payment-provider onboarding is connected.

Added tenant-scoped refund and dispute history, covering:

- Publisher read-only refund and dispute history scoped by owned skill organization.
- Project read-only refund and dispute history scoped by project organization and slug.
- Dashboard revenue-adjustment panel so publishers can see which skills, projects, amounts, and statuses affected earnings.
- Clear separation between finance-admin decision endpoints and publisher/developer visibility endpoints.

Added publisher skill operations analytics, covering:

- Publisher read-only skills endpoint scoped by authorized organization.
- Skill ownership checks for publish/update, review submission, and price writes.
- Aggregated publisher signals for review, runtime checks, installs, calls, success/error/blocked counts, latency, billable usage, pricing, and quality checklist.
- Dashboard publishing pipeline now reads owned skill operations data and exposes review submission plus pricing controls, giving publishers a concrete reason to return, improve listings, and move skills toward monetization.

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

Added publisher-scoped revenue ledger depth, covering:

- Publisher finance ledger reads scoped to the authorized organization and publisher profile.
- Summary of gross revenue, platform fee, publisher share, pending balance, available balance, and unprocessed billable usage for the current publisher.
- Recent transaction rows limited to the current publisher's transaction splits and balance rows.
- Dashboard revenue ledger now reads the publisher-scoped ledger instead of the admin global finance ledger, giving publishers a trustworthy repeat-use earnings view.

Added buyer request board depth, covering:

- Developer organizations can create missing-skill requests with category, bounty, due date, and description.
- Publishers can read open demand plus their own claimed requests, claim open requests, and submit builds.
- Developers can match, close, or cancel their own requests after publisher submission.
- Every buyer request state change writes audit and in-app notification records before email delivery exists.
- Dashboard now shows buyer request status, bounty, requester, due date, and next action, giving publishers a concrete demand loop.
- Dashboard now lets developers create demand and decide submitted work, while publishers can claim requests and submit builds from the same buyer request exchange.

Added project installed-skill lifecycle controls, covering:

- Project operators can mark installed skills as `installed`, `suspended`, or `removed` inside their own organization scope.
- Runtime invocation blocks any install that is not active, so pause/remove controls have real operational effect.
- Each install status change writes audit and in-app notification records.
- Project detail now gives developers a concrete repeat-use loop for disabling risky skills, restoring safe skills, and preserving an audit trail.

Added project subscription lifecycle controls, covering:

- Project operators can mark subscriptions as `active`, `paused`, or `canceled` inside their own organization scope.
- Runtime invocation blocks subscription-priced skills when the project subscription is missing, expired, paused, past due, or canceled.
- Each subscription status change writes audit and in-app notification records before payment provider webhooks are connected.
- Project detail now gives developers and agent operators a concrete repeat-use loop for controlling recurring spend, pausing risky paid skills, and restoring required skills without losing the billing history.

Added project update-inbox handling controls, covering:

- Project operators can acknowledge, schedule, adopt, or ignore installed-skill update events inside their own organization scope.
- Adopted and ignored updates leave the active inbox and project update counts, while the project-scoped decision record remains available for audit and future operational history.
- Each update action writes audit and in-app notification records before email delivery exists.
- Project detail now gives developers and agent operators a concrete repeat-use loop for handling new versions, security notices, deprecations, and incidents instead of letting update warnings become static dashboard noise.

Added project saved skills, covering:

- Project operators can save candidate skills into named project collections before installing, approving, subscribing, or buying.
- Saved skills are organization scoped and show collection, verification state, permission risk, pricing model, and installed status inside the project command center.
- Each save or removal writes audit and in-app notification records before email delivery exists.
- This strengthens developer repeat visits because teams can build and revisit evaluation shortlists instead of losing discovery work between sessions.

Added skill detail project actions, covering:

- Developers can choose a project from a public skill detail page and either save the skill for evaluation or install it into the project's installed-skill inventory.
- The listing-to-project path uses the same organization-scoped saved-skill and install APIs as the project command center, so discovery becomes an operational state change rather than a static marketplace view.
- This improves second-visit value because a developer's marketplace decisions reappear later in project policy, budget, update, invoice, and runtime-control surfaces.

Added project invoice records, covering:

- Project operators can list, generate, inspect, and download CSV invoices for a project inside their own organization scope.
- Invoices are generated from posted `transactions`, not raw usage logs, so finance views remain tied to the immutable ledger.
- Each invoice generation writes audit and in-app notification records before payment-provider invoice APIs are connected.
- Project detail now gives developers, finance operators, and organization owners a concrete repeat-use loop for reconciling agent spend, archiving cost records, and preparing internal approvals.

Added organization billing readiness, covering:

- Organization owners, admins, and finance operators can maintain invoice profile data and payment method state records inside their own organization scope.
- Payment method records store provider references and status metadata only, keeping raw card or bank credentials out of SkillHub until the final payment-provider integration.
- Each billing profile or payment method state change writes audit and in-app notification records.
- Dashboard finance operations now gives organization owners and finance users a concrete repeat-use loop for keeping billing details complete, preparing provider onboarding, and ensuring invoices are operationally usable.

Added user notification inbox, covering:

- Organization-scoped users can read in-app notification events addressed to themselves or their organization.
- Users can mark unread notification events as read, using existing `queued` and `sent` states before external delivery providers are connected.
- Users can see unread/read totals and per-topic counts, then mark all unread in-app notifications as read when the current action queue is cleared.
- Dashboard now surfaces notification context and links to the relevant project, skill, dashboard, or admin view.
- This turns audit/event recording into a user-visible repeat-use loop instead of leaving notifications as admin-only operational logs.

Added runtime incident operations, covering:

- Trust and platform operators can list active incidents, open a new incident by skill slug, assign severity, and move incidents through monitoring, resolution, and postmortem states from `/admin`.
- Incident decisions require a reason, update the canonical `skill_incidents` row, write a skill update event for installed-skill inboxes, create an admin audit record, and queue an in-app notification for the publisher organization.
- Admin risk summaries now include live incident signals before abuse, feedback, refund, and dispute rows, making operational recovery part of the command center instead of static dashboard text.
- This gives developers and publishers a second-visit loop around runtime trust: developers see incidents through update/notification surfaces, while publishers see the operational reason their skill needs recovery or postmortem work.

Added web console token session, covering:

- Operators can sign in through `/login` with a bootstrap-created user access token before a final OAuth/passwordless provider is connected.
- The token is validated against `/v1/auth/me` and stored in an httpOnly cookie, then used by dashboard reads and core server actions ahead of server environment token fallbacks.
- Dashboard now shows session source, organization scope, role summary, and masked token label, making it clearer whether operations are running as a real user or an environment fallback.
- This strengthens the product's operational value because project, publisher, billing, notification, trust, and invoice flows can be exercised by different organization-scoped users instead of one deployment-wide operator token.

Added organization team access management, covering:

- Owners and admins can list organization members, add or update a member by email, assign `owner`, `admin`, `developer`, `publisher`, `reviewer`, or `finance`, generate a one-time-visible organization-scoped login token, and remove access from `/developer`.
- Removing a member also revokes organization-scoped user access tokens, so the visible team list and token counts have real operational effect before a final auth provider is connected.
- Every team access change writes an admin audit record and queues an in-app account notification for the organization.
- This strengthens repeat-use value because real teams can divide project operations, publishing, finance, and trust responsibilities instead of sharing one bootstrap token.

Added developer project creation, covering:

- Organization-scoped users can create a new agent project from `/dashboard` without relying on implicit project upserts from API-key or install actions.
- The API validates project name/slug, enforces organization-local slug uniqueness, writes an audit log, and queues an in-app notification.
- The dashboard returns a direct link to the new project command center so the next action is creating runtime keys, installing skills, and setting policies.
- This strengthens developer retention because a workspace can grow from discovery into multiple real agent projects, each with its own keys, installs, budgets, updates, invoices, and usage history.

Added tenant-scoped publisher overview, covering:

- Publisher overview now requires publisher, owner, or admin authorization instead of serving global marketplace aggregates publicly.
- Review pipeline, runtime-check, buyer-request, and balance signals are composed from organization-scoped publisher skill, finance ledger, and buyer-request data.
- This strengthens publisher trust because a repeat-use dashboard summary now reflects the publisher's own operating backlog, demand opportunities, and revenue state.

Added dedicated publisher workspace, covering:

- `/publisher` now separates skill-author operations from the mixed developer/publisher dashboard.
- Publishers can manage owned skills, submit reviews, set pricing, claim buyer demand, inspect revenue, watch refunds/disputes, prepare payout accounts, request withdrawals, read notifications, and tune notification preferences from one page.
- The buyer request exchange now has a publisher-only mode, so skill authors see demand-side actions without developer request creation controls mixed into the workflow.
- This strengthens repeat visits because publishers have a clear home for "what needs action today" across review, demand, revenue, payout, and trust states.

Added dedicated developer workspace, covering:

- `/developer` now separates agent-operator workflows from the mixed developer/publisher dashboard.
- Developers can create projects, drill into project command centers, monitor installed-skill/key/budget/runtime signals, create and manage buyer requests, maintain billing readiness, read notifications, and tune notification preferences from one page.
- The buyer request exchange now has a developer-only mode, so skill buyers can publish demand and decide their own requests without publisher claim controls mixed into the workflow.
- This strengthens repeat visits because developers have a clear home for "what needs action today" across projects, keys, approvals, usage, demand, billing, and notifications.

Added admin review operations, covering:

- `/admin` now reads the live skill review queue instead of static review rows.
- Reviewers can approve, reject, or block skill submissions with required reviewer notes from the admin console.
- Decisions call the review workflow API, which updates listing verification state and records audit, skill-update, and notification events before external email/provider integrations are connected.
- This strengthens platform trust because submitted skills now have an operator-controlled path from publisher submission to verified, rejected, or suspended listing state.

Added admin payout operations, covering:

- `/admin` now exposes the live payout queue as an operator decision surface instead of a read-only summary list.
- Finance operators can approve payouts into processing, mark provider payout completion, record provider references, fail payouts back to available balances, or block payouts for further review.
- Decisions call the payout workflow API, which updates payout state, linked publisher balance state, audit records, and notification events before final payment-provider APIs are connected.
- This strengthens marketplace trust because publisher withdrawals now have a controlled finance path from request to processing, paid, failed, or blocked state.

Added admin refund and dispute operations, covering:

- `/admin` now exposes refund requests and payment disputes as a finance decision surface instead of only showing them in the risk summary.
- Finance operators can approve, reject, post, or fail refunds with required reasons and optional provider references.
- Trust and finance operators can move disputes through open, warning-needs-response, won, or lost states, including optional refund posting when a dispute is lost.
- Decisions call the adjustment workflow API, which preserves the immutable ledger model by creating adjustment transactions and reversed publisher balances instead of editing historical revenue.
- This strengthens developer billing trust and publisher revenue trust because both sides can see that disputed money follows a controlled, auditable path before final payment-provider APIs are connected.

Added public skill replacement discovery, covering:

- Skill detail pages now show similar and replacement skills instead of leaving each listing as an isolated page.
- Suggestions are scored by category, shared tags, runtime, permission risk, pricing model, free fallback status, and verified listing state.
- Each suggestion explains why it matches, exposes risk, price, runtime, verification, install command, and a direct detail link.
- This strengthens developer first-visit value because users can compare choices before installing, and repeat-use value because deprecated, suspended, or high-risk skills have a visible replacement path.

Added public publisher trust profiles, covering:

- Public API endpoints now expose publisher profiles and public publisher detail by slug without requiring a user token.
- `/publishers/[slug]` shows publisher status, payout readiness state, derived trust level, public skill count, verified skills, install evidence, runtime calls, active paid skills, and average success rate.
- Marketplace cards and skill detail pages now link to the publisher profile, so a developer can evaluate the supplier behind a skill before installing it.
- This strengthens developer first-visit trust and publisher repeat-use motivation because publisher profile quality becomes part of marketplace credibility and distribution.

Added the public publisher trust directory, covering:

- `/publishers` gives developers a browseable supplier directory instead of making publisher trust reachable only from individual skill cards.
- Marketplace now exposes publisher count, verified publisher count, and a direct publisher-directory path beside catalog discovery.
- Directory cards rank publishers by trust level, verified skill inventory, install evidence, runtime calls, payout readiness, active paid skills, and average success rate.
- This improves first-visit trust because buyers can compare suppliers before installing, and improves publisher repeat-use motivation because public quality signals become a distribution surface.

Added marketplace discovery controls, covering:

- The public marketplace browser now filters by category, pricing model, permission risk, runtime, and verification state instead of only category and price.
- Marketplace sorting now supports recommended ranking, most installed, highest runtime success, lowest risk, and recently reviewed skills.
- Recommended ranking combines query relevance, verification state, permission risk, success rate, install evidence, rating, and review freshness.
- Empty-state and reset flows make the catalog usable when buyers combine filters too narrowly.
- This improves first-visit value because developers can narrow to safe, installable skills faster, and improves publisher motivation because verified, low-risk, reliable skills receive better discovery treatment.

Added API-backed marketplace discovery, covering:

- `/v1/skills/search` now accepts runtime, billing model, verification status, permission level, tag, query, limit, and sort parameters.
- Search summaries now include marketplace-safe runtime type, billing model, install count, invocation count, success rate, average latency, and freshness fields when available.
- API recommended ranking uses query relevance, verification state, permission risk, install evidence, invocation volume, runtime success, and update freshness.
- The web marketplace uses recommended API search as its first source, so the browser, CLI, SDK, and agents can converge on the same public discovery contract.

Added skill feedback and review moderation, covering:

- `skill_feedback` stores rating, public title/body, use case, reviewer organization, project context, moderation status, moderation reason, and publish timestamp.
- Public skill detail pages read published feedback and rating summaries from the API, with fallback demo data when the API is unavailable.
- Signed-in developers can submit feedback from the skill detail page; new feedback enters moderation instead of becoming public immediately.
- Trust operators can publish, hide, reject, or reopen feedback from `/admin`, with required reasons, audit logs, and queued publisher notifications.
- This strengthens developer trust because listings now show real usage signals, and strengthens publisher retention because feedback creates a concrete improvement loop.
- Search summaries and recommended ranking now use published average rating and feedback count, so feedback affects discovery instead of staying isolated on the detail page.
- Publisher skill operations now show rating plus published/pending feedback counts, giving authors a repeat-use reason to return and improve listings.

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
