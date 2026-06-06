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

## Latest Implementation Review

Admin review is now closer to an operating workflow rather than a status list: each review row is expected to carry a secret-safe evidence package with publisher readiness, payout state, exact version, manifest summary, redacted runtime target, permission flags, and schema field counts. This directly supports Journey C because reviewers can judge supply quality and risk before approving, rejecting, or blocking a skill version.

Publisher monetization is now closer to an operating workflow as well: `/publisher` exposes a paid marketplace readiness command panel before the per-skill workbench, summarizing paid listing readiness, blocker counts, draft paid prices, payout readiness, profile/terms gates, and per-skill next actions. The pricing form now explains when active paid pricing is commercially blocked while still allowing draft pricing, which makes Journey B feel like a marketplace operations console instead of a pile of disconnected forms.

Payout operations now have stronger explainability: publisher payout summaries expose readiness blockers, minimum payout, manual review threshold, balance-state meaning, latest payout reason, retry condition, and next action. Finance admins must record a reason for decisions, a provider reference when marking paid, and a retry condition when blocking a payout. This closes a key money-flow trust gap because publishers can understand why money is pending, available, reserved, failed, blocked, or paid without guessing from ledger rows.

Launch readiness now has customer-facing credibility thresholds instead of only infrastructure checks. `/v1/admin/launch-readiness` can warn operators when verified supply, publisher diversity, developer project activity, successful invocations, or published feedback are below the decided launch targets. This helps the team answer whether SkillHub has enough marketplace proof for customer demos and public launch, not just whether the server is configured.

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

The product now treats in-app and email notification choices as user-owned state before the final email provider is connected, while organization webhook delivery is governed by organization webhook endpoint status and event subscriptions. That keeps the platform ready for real operations without hard-coding one noisy notification behavior for every user or letting one user's preference suppress organization-level webhook fanout.

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

Added product-management governance, covering:

- [Product Management Operating Model](./product-management-operating-model.md), defining the PM role, decision rights, product gates, priority rules, required artifacts, and how parallel AI roles should work without inventing product scope independently.
- [Feature Requirement Template](./feature-requirement-template.md), defining the required spec fields before UI or code begins.
- [Page Requirements Matrix](./page-requirements-matrix.md), defining each public, account, publisher, developer, dashboard, project, and admin page by primary user, page job, action, data source, and acceptance criteria.
- [Product Decision Log](./product-decision-log.md), tracking public-launch blockers, paid-marketplace blockers, runtime strategy, paid publishing access, payout thresholds, refund/dispute policy, review SLA, auth launch policy, notification/webhook governance, and high-risk permission matrix decisions.
- [Requirements Freeze Workshop](./requirements-freeze-workshop.md), recording the multi-role product meeting, P0 journeys, frozen product rules, reusable `/publish` prototype assets, paid-marketplace design defaults, UI entry criteria, and maximum-parallel team topology.
- [P0 Journey Specs](./p0-journey-specs.md), approving the three UI-entry journeys for developer discovery/install/test, publisher upload/review/monetization/improvement, and admin review/governance/launch operations.
- Updated product and technical plans so future UI/code work must map to approved requirements rather than ad hoc visual ideas.

Added deployment migration-runner coverage, covering:

- Existing 1Panel Postgres volumes no longer depend on manual migration lists.
- Applied SQL files are tracked in `schema_migrations` with checksums.
- Fresh databases, pre-runner production databases, and already-tracked databases have explicit migration start behavior.
- The server update document now uses one migration command before rebuilding the web and API containers.
- Admin launch readiness now surfaces migration-runner history, latest applied migration, and expected latest migration so deployment drift is visible before operators discover missing columns in production workflows.

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

- Public marketplace catalog, skill detail, publisher directory/profile, platform overview, and public feedback surfaces now read live APIs first. Bundled fallback content is suppressed in production-like runtimes unless `SKILLHUB_ENABLE_DEMO_FALLBACK=true` is explicitly enabled for a controlled demo.
- Marketplace operating overview now reads the platform overview API and shows developer, publisher, and operator loops side by side, making repeat-use reasons visible before a user signs in.
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
- `/publish` now uses the signed-in organization-scoped user session for manifest submission instead of asking for an admin token in the browser form, making the first publisher upload path feel like self-service product onboarding.

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
- Runtime key revocation now requires a reason plus `REVOKE` or key-last-four confirmation in the project console, then writes actor-scoped audit and in-app notification records.
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
- Buyer request submissions now bind to an owned SkillHub skill slug and exact reviewed/in-review version, include delivery notes and evidence URL, store submitted/decision timestamps, and show the delivered skill/version/review state to both publisher and buyer. This turns demand into an auditable delivery workflow instead of a lightweight message board.

Added project installed-skill lifecycle controls, covering:

- Project operators can mark installed skills as `installed`, `suspended`, or `removed` inside their own organization scope.
- Runtime invocation blocks any install that is not active, so pause/remove controls have real operational effect.
- Each install status change writes audit and in-app notification records.
- Suspended and removed transitions now require a reason and confirmation phrase in the project console, and the backend persists that reason in audit/notification payloads.
- Project detail now gives developers a concrete repeat-use loop for disabling risky skills, restoring safe skills, and preserving an audit trail.

Added project subscription lifecycle controls, covering:

- Project operators can mark subscriptions as `active`, `paused`, or `canceled` inside their own organization scope.
- Runtime invocation blocks subscription-priced skills when the project subscription is missing, expired, paused, past due, or canceled.
- Each subscription status change writes audit and in-app notification records before payment provider webhooks are connected.
- Paused and canceled transitions now require a reason and confirmation phrase in the project console, and the backend persists actor-scoped audit metadata before final billing-provider integrations are connected.
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

Added skill detail install readiness, covering:

- CLI, MCP, and SDK command shapes are copyable from the skill detail page.
- The same install panel shows review trust, permission risk, runtime posture, project availability, billing/subscription gate, latest version, and last-reviewed signals before the developer saves, subscribes, installs, or tests.
- This reduces first-use friction because developers can move from "looks useful" to "ready for this project" without guessing which operational gate will block the agent later.

Added developer-side subscription creation, covering:

- Developers can start a provider-deferred subscription trial from the skill detail project action panel for subscription-priced skills.
- The API requires an organization-scoped project operator, a public verified skill, and an active subscription price before it writes subscription state.
- Existing project-skill subscription rows are refreshed instead of creating duplicate current-state rows, while every create or refresh writes audit and in-app notification records.
- This closes the paid discovery gap before payment-provider checkout is connected: subscription skills can now move from discovery to subscription state, install, policy review, and non-billable runtime test instead of only being blocked by the runtime gate.

Added subscription-period ledger posting, covering:

- Active paid subscription periods now post into immutable `transactions` with `source_type='subscription'` and a unique period `source_reference`.
- Trialing subscriptions remain a runtime testing/unlock state and do not create revenue until they are moved to `active`.
- Subscription posting creates commission splits, pending publisher balances, and billing notifications for publisher and project organizations before payment-provider checkout is connected.
- The admin finance console now shows unposted usage, unposted subscription periods, pending balances, and available balances beside actions for usage posting, subscription posting, and balance release.
- This closes the commercial gap where a developer could subscribe to a skill but the platform had no durable revenue record for commission, invoice, refund, dispute, publisher-balance, or payout workflows.

Added subscription-period renewal operations, covering:

- Expired active subscriptions can advance to the next monthly period only after the expiring period has a posted positive subscription transaction.
- Renewal writes admin audit and in-app billing notifications for publisher and project organizations before payment-provider webhooks are connected.
- The admin finance console now shows renewable subscription periods and gives finance operators a renew action beside posting and balance-release jobs.
- This keeps subscription runtime access and recurring revenue aligned: operators can catch up by posting the current period, renewing it, then posting the next period without skipping a month.

Added developer-visible subscription ledger diagnostics, covering:

- `/v1/developer/projects/:projectSlug` subscription rows now expose the current period's ledger state, linked posted subscription transaction, gross amount, invoice-line count, and renewal readiness.
- `/dashboard/projects/[slug]` shows trial access, awaiting-post, posted, renewal-due, not-billable, and not-postable states beside subscription pause/restore/cancel controls.
- This strengthens developer repeat-use value because project operators can reconcile runtime access, subscription billing, generated invoices, and admin renewal state from the project command center instead of guessing from a plain subscription status.

Added MCP project runtime execution, covering:

- `/mcp` now supports initialization, public tool discovery, project API-key scoped installed-tool listing, and `tools/call`.
- MCP `tools/call` reuses the existing SkillHub runtime path, so install state, version pin, verification, owner approval, permission policy, rate limit, budget, subscription state, invocation logs, usage events, and per-call metering all remain enforced.
- This strengthens developer and agent-builder value because MCP clients can move from discovering SkillHub skills to actually calling project-approved tools without bypassing governance.

Added project agent-connection onboarding, covering:

- `/dashboard/projects/[slug]` now shows REST and MCP connection snippets, the MCP endpoint, active project-key state, and the project slug in the developer project command center.
- Copy actions expose endpoint and command snippets while keeping raw project API keys reveal-once through the existing key creation flow.
- This strengthens install-to-run value because developers can move from a managed project to an actual agent runtime configuration without hunting through API docs or bypassing project governance.

Added publisher-visible revenue source explainability, covering:

- Finance and publisher ledger summaries now break posted revenue into per-call usage and subscription-period sources with gross, platform fee, publisher share, and transaction count.
- `/publisher` shows a revenue source mix before the detailed ledger and labels each recent row with source type plus compact source reference.
- This strengthens publisher repeat-use value because skill authors can tell whether earnings are driven by agent calls, recurring subscriptions, or later adjustment workflows before the final payment provider is connected.

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

Added admin notification template management, covering:

- Admin/support operators can list, create, and update reusable notification templates from `/admin`.
- Templates are unique by `templateKey`, `channel`, and `locale`, so SkillHub can maintain separate in-app, email, webhook, English, and Chinese variants.
- Template lifecycle states are `draft`, `active`, and `archived`, allowing operators to stage copy before final email or webhook providers are connected.
- Each template change writes an admin audit log and queues an in-app platform notification, keeping communication changes reviewable instead of hidden in code.

Added default notification template seeding, covering:

- `027_default_notification_templates.sql` seeds active templates for the main account, review, runtime, billing, payout, buyer-request, feedback, trust, marketplace-curation, and delivery-operation events.
- User-facing defaults include English and Chinese variants where appropriate, while webhook defaults use compact JSON event bodies for downstream systems.
- The seed uses `(template_key, channel, locale)` conflict protection and never overwrites templates that operators have already edited in `/admin`.
- Launch readiness now expects migration 027, making missing default template coverage visible before a fresh production environment is treated as ready.
- Launch readiness now also checks the required active template matrix by exact `template_key`, channel, and locale, so partial or accidentally archived template coverage becomes a concrete missing-template blocker instead of passing on total row count alone.

Added external notification delivery operations, covering:

- `notification_events` now stores delivery attempts, last attempt time, next retry time, provider name, and provider message id for external `email` and `webhook` events.
- Admin/support operators can inspect the external delivery queue from `/admin` without mixing it with user-owned in-app unread notifications.
- Delivery decisions support sent, failed, retry, and skipped states with required reasons, audit logs, provider metadata, and redacted payload summaries.
- Email verification-code delivery decisions synchronize `email_login_challenges.delivery_status`, making signup/login support inspectable before final SMTP/API worker integration.
- Raw verification codes are redacted from admin delivery lists, preserving the provider-worker path without exposing sensitive login material in the operations UI.

Added notification delivery batch processing, covering:

- `/v1/admin/notification-deliveries/process` processes due external `email` and `webhook` events in `dry_run` or `deliver` mode.
- In `deliver` mode, the processor now fans eligible in-app business events into email and webhook queue rows using user notification preferences and organization webhook endpoint subscriptions, then reports fanout counts to the admin console.
- Email and webhook processing now render active `notification_templates` by event type, channel, and locale at delivery time, so default or operator-edited templates control actual outbound copy/payload without changing business event writers.
- Resend-backed email sending is ready when `SKILLHUB_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `SKILLHUB_EMAIL_FROM` are configured; missing provider configuration becomes an explicit failed state instead of a silent queue stall.
- Webhook processing fans organization-scoped external events into `webhook_delivery_events` for active subscribed endpoints, then the dedicated webhook outbox worker handles signed network delivery and retry response capture.
- `/admin` now exposes a compact Process due control and result summary so operators can run dry-runs and delivery batches without leaving the platform command center.

Added webhook outbox network delivery, covering:

- `webhook_delivery_events` now has a claimable `processing` state, `last_attempted_at`, and due-event index support for reliable batch processing.
- Admin/support operators can inspect endpoint-level webhook outbox rows from `/admin`, including endpoint URL/status, attempt count, HTTP status, response body excerpt, last attempt, and next retry.
- Admin/support operators can process due webhook deliveries in dry-run or delivery mode through `/v1/admin/webhook-deliveries/process`.
- Delivery mode sends signed HTTP POST requests, captures response status/body, marks successful rows delivered, marks failures with retry backoff, updates endpoint delivery health, recovers stale processing rows, and writes audit plus platform notification records.
- v0 webhook signing uses the stored `sha256(secret)` hash as the HMAC key because raw endpoint secrets are shown only once and are not stored; receivers verify by hashing their one-time `whsec_...` secret before HMAC verification.

Added true admin audit stream, covering:

- Admin/support operators can read recent `admin_audit_logs` through `/v1/admin/audit-logs`.
- `/admin` now shows actor, action, entity, reason, metadata summary, and timestamp from audit records instead of using notification delivery events as a stand-in.
- This separates governance history from in-app/email/webhook delivery state, making review, finance, access, incident, template, and trust actions easier to inspect during operations.

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

Added admin identity directory, covering:

- Admin/support operators can inspect users, organizations, platform roles, memberships, token counts, active token counts, and last token use from `/admin`.
- Organization rows include member, project, skill, publisher-profile, invocation, and posted-ledger signals so platform operators can see which accounts are actually adopting the marketplace.
- The endpoint is read-only, giving safe operational visibility before final OAuth/passwordless user-management tooling is connected.

Added organization webhook endpoint management, covering:

- Owner/admin/developer users can configure HTTPS callback URLs, event-topic subscriptions, and active/paused/disabled state from `/developer`.
- Create and rotate actions return a raw `whsec_*` signing secret once while storing only the hash, prefix, and last four characters.
- Endpoint records include last-delivery status, delivery timestamp, and failure count fields, plus a `webhook_delivery_events` outbox table consumed by the signed delivery worker.
- This turns organization webhook endpoint subscriptions into an operational integration surface with real HTTP delivery state before email and payment providers are finalized.

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

Added marketplace curation and ranking governance, covering:

- `marketplace_curation_rules` stores one auditable ranking rule per skill with `featured`, `standard`, or `suppressed` placement, bounded boost, required reason, optional expiry, and creator/updater metadata.
- Public recommended search uses active curation internally while keeping boost values, operator reasons, and notes out of public API responses.
- Suppressed rules lower public discovery ordering across sort modes but do not replace trust-and-safety takedown, restriction, or suspension workflows.
- `/admin` now exposes ranking controls beside installs, calls, success rate, feedback, pending feedback, incidents, visibility, and review status, so operators act from evidence rather than arbitrary manual ranking.
- Curation writes require reviewer/admin-level access, store previous and next values in `admin_audit_logs`, and queue in-app notification events before external email/webhook providers are connected.
- The product requirements now define curation fairness: publishers need visibility into reason, expiry, quality gaps, and appeal path; buyers need marketplace-safe recommendation explanations instead of a black-box order.

Added skill feedback and review moderation, covering:

- `skill_feedback` stores rating, public title/body, use case, reviewer organization, project context, moderation status, moderation reason, and publish timestamp.
- Public skill detail pages read published feedback and rating summaries from the API. Production-like runtimes return empty public feedback instead of demo reviews when the API/database is unavailable.
- Signed-in developers can submit feedback from the skill detail page; new feedback enters moderation instead of becoming public immediately.
- Trust operators can publish, hide, reject, or reopen feedback from `/admin`, with required reasons, audit logs, and queued publisher notifications.
- This strengthens developer trust because listings now show real usage signals, and strengthens publisher retention because feedback creates a concrete improvement loop.
- Search summaries and recommended ranking now use published average rating and feedback count, so feedback affects discovery instead of staying isolated on the detail page.
- Publisher skill operations now show rating plus published/pending feedback counts, giving authors a repeat-use reason to return and improve listings.

Added automated review checks and approval gating, covering:

- Review submission now records automated manifest, runtime declaration, example schema, and security permission checks for the submitted skill version.
- Admin review queue responses include the latest check result per type, and `/admin` shows those results directly inside each review card.
- Approvals are blocked when checks are missing, failed, queued, or running; warning checks can still be approved with reviewer notes so high-risk permissions and local runtimes keep a human judgment path.
- This strengthens marketplace trust because verified listings now require both operator decision and system-generated review evidence instead of relying on a free-form approval note alone.
- This strengthens publisher retention because authors can see concrete pass/fail/warning reasons to fix before resubmitting, rather than waiting for opaque manual review.

Added publisher-facing review-check diagnostics, covering:

- `/v1/publisher/skills` now returns the latest automated check details per skill version instead of only aggregate counts.
- Runtime health uses latest checks only, so historical review-check records do not pollute the current publisher status.
- Publisher skill cards show each manifest, runtime, example, and security check with pass/fail/warning state and the exact message.
- This closes the upload-review-fix loop for publishers because they can repair blocked runtime or example issues before resubmitting, without waiting for a separate admin explanation.

Added admin commission rule management, covering:

- Finance operators can list active, scheduled, and ended commission rules from `/v1/admin/finance/commission-rules` and the `/admin` finance workspace.
- Creating a rule requires a finance reason, validates that platform and publisher bps total 10000, closes overlapping open rules, and records audit plus notification events.
- Ledger posting continues to attach each `transaction_splits` row to the active commission rule at posting time, so new rules affect future revenue only.
- Historical transaction splits are never rewritten when commission settings change, preserving finance traceability before final payment provider integration is connected.
- This gives SkillHub a real platform-operator control for marketplace monetization instead of hiding the revenue split as an unchangeable code default.

Added publisher-facing marketplace distribution diagnostics, covering:

- `/v1/publisher/skills` now returns each owned skill's active marketplace placement, operator reason, optional expiry, and publisher-safe improvement hints.
- The publisher skill operations UI shows featured, standard, or suppressed distribution beside review, runtime, pricing, usage, and feedback signals.
- Improvement hints are derived from visibility, review state, latest runtime checks, open incidents, success rate, feedback, and usage, while internal boost math stays admin-only.
- This closes the marketplace curation loop for publishers because they can see why distribution changed and what to fix before asking for more exposure.

Added marketplace curation appeal workflow, covering:

- `marketplace_curation_appeals` stores publisher distribution review requests with current placement, requested placement, appeal reason, evidence URL, SLA, operator decision reason, submitter, publisher organization, and status.
- Publishers can request standard or featured distribution reconsideration from their skill operations cards, and can see the latest appeal status and operator reason.
- Admin marketplace operations now include an appeal queue where reviewers can start review, approve with a curation-rule update, reject, or close with required reasons.
- Appeal creation and decisions write admin audit logs and queued in-app notifications before email/webhook providers are connected.
- This completes the fairness loop promised by marketplace curation: operators can suppress or feature listings, publishers can understand the reason, and there is a formal path to request reconsideration.

Added auth and personal-center product requirements, covering:

- Login/register must become a product-grade entry with Google login, GitHub login, and email registration/login rather than a token-only operator console.
- The personal center must manage profile, connected accounts, organization roles, notification preferences, session/token security, billing shortcuts, and payout readiness shortcuts.
- This keeps account UX from becoming an afterthought while the marketplace operations layer is being built.

Added account center implementation foundation, covering:

- `/v1/auth/providers` exposes email, Google, GitHub, and token login-method readiness so the UI can show real provider state instead of decorative OAuth buttons.
- `/v1/account` aggregates the active user's profile, organization membership, token-session metadata, login-method states, team/token/project/skill counts, unread notifications, notification preference count, billing readiness, publisher profile status, and payout status.
- `/login` now presents email registration, Google OAuth, GitHub OAuth, and token fallback as one coherent product entry; Google/GitHub are clearly configuration-required until credentials are present, then become real provider redirects.
- `/account` now gives users a personal center for profile, connected login methods, organization roles, session/token security, workspace readiness, workspace shortcuts, and notification preferences.
- This strengthens first-visit value because a new user can create a real workspace with email registration, and repeat-visit value because account readiness, notifications, billing, payout, and role context are visible from one page.

Added OAuth login foundation, covering:

- Google and GitHub start endpoints create signed short-lived OAuth state with a safe `returnTo` path and redirect to the provider.
- Callback endpoints exchange provider codes, require verified email/profile data, upsert SkillHub users by email, reuse existing organization membership when available, or create a new owner workspace for first-time users.
- Successful callbacks mint a 14-day user access token, set it as the same httpOnly `skillhub_user_token` browser session used by the web console, record audit and in-app notification events, and return users to `/account`.
- OAuth remains environment-driven: provider secrets are never committed, and the login UI stays in configuration-required mode until the deployment supplies callback base URL, client ids, client secrets, and state secret.
- This removes the biggest normal-user onboarding gap after token login: developers and publishers can enter the same real dashboard surfaces through a standard identity provider once production credentials are configured.

Added connected auth identity storage, covering:

- `user_auth_identities` stores email, Google, and GitHub identities separately from user access tokens.
- OAuth callbacks now prefer provider user id lookup before verified-email fallback, which keeps the same SkillHub user when a provider email changes.
- Account summaries expose provider email, verification state, connection time, and latest login time for the personal center.
- `/account` Chinese copy was repaired and the connected login-method cards now show real provider identity state instead of only generic provider readiness.
- This strengthens account trust and retention because users can see how they are connected, while admins gain a future foundation for disconnect, session review, and account-security workflows.

Added account session security management, covering:

- `/v1/account/sessions` lists current, active, expired, and revoked user-owned token sessions using fingerprints, organization context, activity time, and expiry state without returning raw tokens.
- `/v1/account/sessions/:tokenId/revoke` lets users revoke old non-current sessions while blocking current-session self-revocation, keeping sign-out behavior clear.
- Session revocation writes `auth.session.revoked` audit logs and queues `account.security.session_revoked` notifications before final email/webhook delivery is connected.
- `/account` now shows a session security panel with current-session state, token fingerprints, last-used signals, and old-session revoke controls.
- This strengthens repeat-use trust because developers, publishers, finance users, and admins can clean up stale account access before sensitive marketplace actions such as publishing, payout requests, billing changes, and review decisions.

Added connected identity disconnect guardrails, covering:

- `/v1/account/identities/:provider/disconnect` lets users disconnect Google or GitHub identities while requiring another OAuth provider or a separate active user token before deletion.
- Disconnect decisions remove only the modeled provider identity, not raw sessions; users still manage active token sessions through the session security panel.
- Identity disconnects write `auth.identity.disconnected` audit logs and queue `account.security.identity_disconnected` notifications before final email/webhook delivery is connected.
- `/account` connected login cards now show provider-level disconnect controls with inline action feedback.
- This strengthens account trust because users can remove stale provider connections without accidentally locking themselves out of publisher, developer, finance, or admin operations.

Added email verification-code access, covering:

- `email_login_challenges` stores email signup/login challenges with HMAC-hashed 6-digit codes, expiry, attempt limits, delivery status, metadata, and single-use consumption.
- `/v1/auth/email/request-code` queues an email notification event for signup or login without issuing a session token.
- `/v1/auth/email/verify-code` consumes the challenge in a transaction, verifies the email identity, creates or logs into the correct workspace, mints a 14-day user session, writes audit and in-app notification events, and lets the web app store the token in an httpOnly cookie without showing a long-lived token on screen.
- `/login` now has a two-step email-code form for creating a workspace or logging into an existing workspace, while token fallback remains for invitations and operators.
- The legacy `/v1/auth/signup` direct-token endpoint is disabled by default, reducing the biggest remaining account-onboarding shortcut before production OAuth and email-provider delivery are fully configured.
- This strengthens first-visit trust because normal users can enter through an expected email-code flow instead of copying a raw token, and it strengthens launch readiness because the email-provider worker can attach to existing queued email events.

Added publisher skill version management, covering:

- `/v1/publisher/skills` now returns owned skill version history with per-version manifest, review state, runtime checks, install count, call count, and created time.
- Publishers can read `/v1/publisher/skills/:skillSlug/versions`, save a new version or update an unlocked draft through `/v1/publisher/skills/:skillSlug/versions`, and submit a specific version through `/v1/publisher/skills/:skillSlug/versions/:version/submit`.
- Approved or installed versions are locked against in-place mutation, protecting developers who pin versions and preserving trust in verified contracts.
- Creating a new version records a skill update event, audit log, and in-app notification before final email/webhook providers are connected.
- Public discovery and default install selection now prefer approved versions, so a draft update does not silently replace the currently trusted contract.
- The publisher skill operations UI now includes a version manager with version history, manifest editor, save-version action, and per-version review submission.
- This strengthens publisher retention because authors can keep improving skills after first upload, and it strengthens developer trust because verified behavior remains stable while new versions move through review.

Added publisher upload entry hardening, covering:

- `/publish` now presents upload as the first step in an operated marketplace workflow instead of a one-off form.
- The page explains draft save, exact-version submission, automated checks, reviewer decision, and commercial readiness before the publisher reaches `/publisher`.
- The form uses signed-in session language and removes the old raw-token/admin-token mental model from the visible product UI.
- Client preflight separates blockers from warnings across JSON, identity, runtime, schemas, permissions, and commercial readiness, so publishers can save valid drafts while understanding what will affect review and paid activation later.
- Success states preserve the saved draft's exact version, expose whether it is a new or updated draft, let the publisher submit that version for review immediately, and still route to the workspace and public skill detail.

Added publisher workspace copy and next-action hardening, covering:

- `/publisher` now uses clean English and Chinese copy for the page, skill operations, review checks, version management, marketplace distribution, feedback response, and server-action result messages.
- Skill cards now derive a next operating step from version, review, check, commercial, feedback, and distribution state.
- Skill cards now include a review repair loop that combines latest exact version, reviewer notes, failed/warning/open check evidence, and repair actions; when repair or resubmission is needed, the version manager opens directly.
- This improves the repeat-use loop because publishers see what to do next after saving a draft instead of only seeing metrics and forms.

Added structured automated-check remediation, covering:

- `028_runtime_check_remediation.sql` adds blocking flag, fix category, target field, and next action to `skill_runtime_checks`.
- Review submission stores remediation metadata for manifest, runtime, example, and security checks instead of forcing UI or reviewers to infer repair actions from free-text messages.
- `/v1/admin/reviews`, publisher skill operations, admin review cards, and publisher repair loops now expose next action and target field beside automated evidence.
- This strengthens Journey B and Journey C because rejected, blocked, warning, or incomplete reviews now produce concrete repair instructions and reviewer context.

Added review SLA visibility, covering:

- Review queue and publisher skill/version APIs now derive submitted time, three-business-day SLA due time, queue age, hours remaining, and `not_submitted`/`on_track`/`due_soon`/`overdue`/`decided` status without adding a migration.
- `/admin` shows queue age and SLA pressure beside each review card so operators can prioritize due-soon or overdue supply review.
- `/publisher` shows review submitted time, SLA, queue age, and decision state inside the review repair loop and version history, so authors understand whether to wait, repair, or follow up.
- This improves publisher retention and operator credibility because review status is now a timed operating workflow instead of an opaque queued label.

Added admin review queue prioritization, covering:

- `/admin` now summarizes total reviews, SLA pressure, blocking automated checks, high-risk submissions, warning checks, and decision-ready items.
- Reviewers can filter the queue by SLA pressure, blockers, high risk, or warnings and sort by recommended priority, oldest submitted, earliest SLA due time, or highest risk.
- Each review card now shows the derived priority label, score, and reasons so admins can explain why a row should be handled before normal queue work.
- This improves Journey C because the review page behaves like an operations queue instead of a passive list.

Added developer project version adoption, covering:

- Project update inbox rows now expose current installed version, target version, target review status, and adoption readiness.
- Marking a `new_version` update as adopted now changes the project's pinned installed skill version only when the target version has an approved review.
- Draft, queued, rejected, blocked, missing, or removed-install updates are blocked from adoption so agents cannot run unreviewed contracts by clicking through an inbox item.
- High-permission target versions reset the install approval state to owner review, preserving runtime governance after version changes.
- `/dashboard/projects/[slug]` now shows version transition state in the update inbox and disables adoption until the target version is review-ready.
- This closes the publisher-to-developer version loop: publishers can ship reviewed updates, and developers can deliberately move agent projects onto those versions without losing policy protection.

Added project-level runtime testing, covering:

- `/dashboard/projects/[slug]` now lets developers choose an installed skill, submit JSON input, and run a non-billable console test through the same project runtime gateway used by agent calls.
- Test results show invocation id, runtime status, version, latency, billing state, mode, and JSON output or blocking error.
- The REST connection snippet now uses a skill installed in the current project instead of a hardcoded example slug.
- This closes the Journey A project-side acceptance gap because developers can inspect policies, run the governed test, and verify the new invocation in the recent runtime log without leaving the project command center.

Added admin launch readiness, covering:

- `/v1/admin/launch-readiness` gives support/admin operators a single production-readiness report for OAuth callbacks, cookie domain, email-code delivery, webhook worker schema, migration state, notification templates, runtime API-key hashing, commission rules, payout state, demo fallback, legacy signup, service-token presence, public signup policy, and intentionally deferred payment-provider work.
- `/admin` now shows blocker, warning, ready, and deferred counts beside sectioned operator actions, so rollout work is visible from the command center instead of scattered across environment notes and migrations.
- The readiness report is secret-safe: it exposes only configured/missing state, counts, URLs, and next actions, never raw provider secrets, tokens, salts, webhook secrets, verification codes, or credentials.
- This improves launch discipline because the team can separate true production blockers from intentional final integrations such as payment-provider onboarding.

Added public operating terms, covering:

- `/terms` gives buyers, publishers, and operators a public rule surface for marketplace use, publishing responsibilities, review/takedown, commission/payout, refunds/disputes, data retention, incidents, notifications/webhooks, and provider-deferred payment/email integrations.
- The home footer and docs page link to the terms page, so marketplace rules are discoverable from the product instead of hidden inside internal requirements.
- The page is bilingual and explicitly separates current operating policy from final legal terms, which can be finalized once provider, tax/KYC, refund-window, payout-threshold, and paid-launch decisions are locked.
- This improves launch credibility because developers and publishers can understand what happens after install, billing, dispute, incident, or takedown events before money movement is fully connected.

Added publisher terms acceptance, covering:

- `024_publisher_terms_acceptance.sql` adds accepted terms timestamp, terms version, and accepting user id to publisher profiles.
- `/v1/publisher/terms/accept` records acceptance for publisher, owner, admin, or super-admin organization-scoped users, then writes audit and publisher notification events.
- `/publisher` now includes current terms acceptance in the launch checklist, and publisher account panels show the accepted version and timestamp beside payout readiness.
- Launch readiness now reports whether the publisher terms acceptance columns exist, so missing migration state is visible before paid publishing goes live.

Added paid pricing commercial-readiness enforcement, covering:

- Active paid price writes now require an existing active publisher profile, verified payout readiness, current accepted operating terms, and verified skill review.
- The billing service no longer creates a verified payout fallback when a missing publisher profile is discovered during pricing or ledger operations; missing setup remains visible as `not_configured`.
- `/v1/publisher/skills` returns skill-level commercial blockers, and the publisher skill manager shows those blockers beside pricing so authors know whether review, payout, profile, or terms work is preventing paid activation.
- This closes a real marketplace safety gap: paid listings cannot become active just because the UI submitted a price, and publishers get a clear return loop for completing commercial setup.

Added OAuth provider readiness rollout, covering:

- `/v1/auth/providers` now returns Google/GitHub callback URLs, missing launch configuration variable names, and secret-safe readiness booleans for client id, client secret, callback base URL, and OAuth state secret.
- `/login` shows provider setup hints, exact callback URLs when available, missing configuration chips, and callback success/error notices after redirects return.
- This closes the account-entry UX gap where OAuth buttons could look real without telling operators what still needed to be configured for production login.

Added public agent integration guide depth, covering:

- `/agents` now shows MCP, REST, and SDK/CLI integration paths with concrete command/config snippets instead of only describing the runtime concept.
- The page explains project-scoped keys, installed-skill governance, version pins, permission approval, budgets, subscriptions, logs, and usage events as the runtime boundary for real agent use.
- This strengthens first-visit developer value because agent builders can understand how to connect SkillHub before they create a project, then continue into the developer console for the governed setup.

Added publisher responses to buyer feedback, covering:

- `026_skill_feedback_publisher_responses.sql` adds public publisher response fields to moderated feedback without changing the feedback moderation state machine.
- Publishers can respond only to published feedback on skills owned by their organization; each response writes audit and buyer notification records.
- `/v1/publisher/skills` now returns recent published feedback rows, and the publisher workspace exposes response forms so authors can address buyer concerns without leaving operations.
- Public skill detail pages show publisher responses under the matching feedback, improving buyer trust and giving publishers a concrete retention loop after feedback is moderated.
- Launch readiness now checks the response columns so production operators can catch a missing migration before feedback-response workflows silently fail.

Added payout explainability hardening, covering:

- `030_payout_explainability.sql` adds payout retry-condition and next-action fields.
- `/v1/publisher/payouts` returns request eligibility, blockers, expected initial payout status, and next action beside balances and payout rows.
- Failed payouts release balances and explain retry path; blocked payouts keep balances locked and require a finance retry condition.
- `/publisher` shows balance-state explanations, disabled request reasons, latest payout notes, provider reference, retry condition, and next action in English and Chinese.
- `/admin` shows payout next action before decisions and requires finance notes, provider reference for paid records, and retry condition for blocked records.
- Launch readiness now expects migration `030_payout_explainability.sql`.

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
