# SkillHub Technical Implementation Plan

This document turns the full product requirements into implementation order, domain boundaries, database tables, API surfaces, and acceptance checks.

SkillHub is a two-sided AI-agent skill marketplace:

- Publishers upload, maintain, verify, and monetize skills.
- Developers discover, install, approve, and run skills inside agent projects.
- Platform admins operate trust, review, incidents, money states, and payouts.

The implementation should make these three workspaces real before final payment and email provider integrations are connected.

## Product Value To Preserve In Engineering

Every feature should create at least one of these values:

- Developer value: faster skill discovery, safer installs, predictable runtime behavior, project-level control, usage/cost visibility.
- Publisher value: easier packaging, review credibility, install distribution, runtime feedback, demand signals, future revenue.
- Platform value: review control, risk visibility, audit trail, immutable money records, quality and ranking signals.

If a feature does not support one of those values, it is secondary.

Engineering work now follows the product-management gate defined in [Product Management Operating Model](./product-management-operating-model.md). Before UI or implementation work starts, the feature must have a requirement shape based on [Feature Requirement Template](./feature-requirement-template.md) and must map to the page or journey source of truth in [Page Requirements Matrix](./page-requirements-matrix.md). Small verified bug fixes can bypass the full template, but must still preserve the existing acceptance standard.

## Implementation Domains

### 1. Identity And Workspace

Purpose:

- Let users own organizations, publisher profiles, and developer projects.
- Separate developer, publisher, reviewer, finance, and admin permissions.

Core tables:

- `users`
- `organizations`
- `organization_members`
- `publisher_profiles`
- `projects`
- `api_keys`
- `user_access_tokens`
- `user_auth_identities`
- `email_login_challenges`
- Final auth-provider identities for Google, GitHub, and email login

API groups:

- `/v1/orgs/*`
- `/v1/projects/*`
- `/v1/api-keys/*`
- `/v1/publisher/profile`
- `/v1/auth/*`
- `/v1/account/*`

Acceptance checks:

- A project belongs to one organization.
- API keys are project-scoped and revocable.
- Publisher actions require publisher or owner role.
- Admin actions require reviewer, finance, or super admin role.
- Login/register UI supports Google OAuth, GitHub OAuth, and email registration/login once the final provider is connected.
- Email verification-code login stores HMAC-hashed short-lived challenges, consumes them once, limits attempts, and creates httpOnly web sessions only after verification.
- Personal center exposes profile, connected accounts, organization membership, roles, notification preferences, session/token security, billing profile, and payout readiness links.

### 2. Skill Registry And Publishing

Purpose:

- Turn uploaded skills into versioned contracts.
- Keep runtime behavior inspectable before installation.

Core tables:

- `skills`
- `skill_versions`
- `skill_reviews`
- `skill_runtime_checks`

API groups:

- `/v1/skills/search`
- `/v1/skills/:slug`
- `/v1/skills`
- `/v1/skills/:slug/versions`
- `/v1/publisher/skills/:skillSlug/versions`
- `/v1/publisher/skills/:skillSlug/versions/:version/submit`
- `/v1/reviews/*`

Acceptance checks:

- A submitted skill version must have a valid manifest.
- Review submission must create automated manifest, runtime, example, and security checks for the submitted version.
- Review queue and publisher version APIs must derive submitted time, three-business-day SLA due time, queue age, hours remaining, and `not_submitted`/`on_track`/`due_soon`/`overdue`/`decided` status without storing secret or provider data.
- The admin review console must turn those review SLA and automated-check fields into an operational queue view with counts, filters, recommended priority reasons, and sort modes so reviewers can process overdue, due-soon, high-risk, warning, and blocking submissions before normal queue work.
- A verified skill version must have a review decision and no failed, queued, or running automated checks. Warning checks require reviewer notes.
- A new version cannot silently replace a verified version.
- Approved or installed versions cannot be overwritten; publishers must create a new semantic version.
- Publisher version history must expose per-version manifest, review status, review SLA state, runtime checks, installs, calls, and created time.
- Public discovery and default installs must prefer approved versions when draft or submitted updates exist.
- Suspended skills cannot be installed or invoked.

### 3. Discovery And Developer Retention

Purpose:

- Make developers return to manage installed skills, versions, permissions, incidents, and cost.

Core tables:

- `project_skill_installs`
- `project_skill_policies`
- `skill_update_events`
- `skill_incidents`
- `saved_skills`
- `skill_feedback`
- `marketplace_curation_rules`
- `marketplace_curation_appeals`

API groups:

- `/v1/projects/:projectId/installed-skills`
- `/v1/projects/:projectId/policies`
- `/v1/projects/:projectId/update-inbox`
- `/v1/projects/:projectId/saved-skills`
- `/v1/skills/:slug/feedback`
- `/v1/admin/skill-feedback`
- `/v1/admin/marketplace-curation`
- `/v1/publisher/skills/:skillSlug/marketplace-appeals`
- `/v1/admin/marketplace-curation/appeals`

Acceptance checks:

- An installed skill records project, skill, version pin, approval state, and permission policy.
- High-risk skills require owner approval before invocation.
- Saving a high-risk project policy with approval cleared must require owner/admin authority, synchronously move the matching installed skill from `owner_required` to `approved`, record the approving user on the policy, and write audit plus notification records so runtime gating reflects the UI decision.
- Developers can see updates, deprecations, incidents, and replacements for installed skills.
- Adopting a `new_version` update changes the project install's pinned `skill_version_id` only when the target version has an approved review; draft, queued, rejected, blocked, or missing versions cannot be adopted into runtime.
- Version adoption recalculates install approval state from the target manifest, so high-permission updates return to owner review before agents can invoke them.
- Saved skills and collections exist before purchase flows are added.
- Published feedback is public, new feedback starts in moderation, and admin decisions are audited.
- Marketplace recommendation can be curated through featured, standard, or suppressed rules with bounded boost, required reason, optional expiry, and audit logs.
- Public search uses active curation internally but never exposes internal boost values or operator reasons.
- Suppressed or under-distributed publishers can request formal curation review with evidence, SLA, publisher-visible status, admin decision, audit logs, and notification events.

### 4. Publisher Retention

Purpose:

- Make publishers return to fix review issues, improve listings, respond to demand, and watch operational performance.

Core tables:

- `publisher_profiles`
- `skill_reviews`
- `skill_runtime_checks`
- `usage_events`
- `buyer_requests`
- `publisher_quality_scores`
- `skill_feedback`

API groups:

- `/v1/publisher/overview`
- `/v1/publisher/skills`
- `/v1/publisher/reviews`
- `/v1/publisher/runtime-checks`
- `/v1/publisher/buyer-requests`
- `/v1/publisher/skill-feedback/:feedbackId/response`

Acceptance checks:

- Publishers can see review status and reviewer notes.
- Publisher workspaces must combine review status, reviewer notes, exact-version metadata, automated check evidence, and concrete repair actions into a single review repair loop so rejected, blocked, warning, or unsubmitted versions lead directly back to version editing and resubmission.
- Publisher workspaces must show review submitted time, default three-business-day SLA due time, queue age, and due-soon/overdue/decided state inside the repair loop so authors understand when to wait and when to follow up.
- Runtime checks expose pass/fail/warning/queued/running state, latest messages, structured blocking semantics, target fields, fix categories, and next action.
- Publisher analytics include installs, calls, success rate, latency, and errors.
- Buyer requests can be opened, claimed, submitted, matched, and closed.
- Submitted buyer-request builds must store an exact owned skill slug/version delivery package with delivery notes, evidence URL, platform review status, submitted time, buyer decision note, and decision time so demand, acceptance, disputes, and future bounty/commission workflows can point back to a reviewed SkillHub contract.
- Publishers can receive moderated feedback signals that explain buyer adoption and quality gaps.
- Publishers can respond to published buyer feedback only for skills owned by their organization; responses are public on skill detail pages and write audit plus notification records.
- Publishers can see their current marketplace placement, operator reason, expiry, and safe improvement hints without exposing internal boost math.
- Publishers can create and track marketplace distribution appeals when they have fixed quality gaps or need suppressed placement reconsidered.

### 5. Runtime And Metering

Purpose:

- Give agents a safe path to call skills through a project policy and version contract.

Core tables:

- `api_keys`
- `project_skill_installs`
- `project_skill_policies`
- `skill_invocations`
- `usage_events`

API groups:

- `/v1/runtime/invoke`
- `/v1/usage/*`
- `/mcp`

Acceptance checks:

- Runtime calls authenticate project API keys.
- Gateway checks install state, version pin, permission approval, budget, and rate limit.
- Every invocation records status, latency, error code, and skill version.
- Only successful billable invocations can create billable usage.
- `/mcp` supports MCP initialization, public tool discovery, project API-key scoped installed-tool listing, and `tools/call` execution through the same runtime policy, subscription, usage, and metering path as `/v1/runtime/invoke`.

### 6. Billing-Ready Ledger

Purpose:

- Model commercial flows safely before integrating a payment provider.

Core tables:

- `skill_prices`
- `subscriptions`
- `commission_rules`
- `transactions`
- `transaction_splits`
- `publisher_balances`
- `refunds`
- `disputes`

API groups:

- `/v1/prices/*`
- `/v1/subscriptions/*`
- `/v1/transactions/*`
- `/v1/publisher/balances/*`
- `/v1/admin/finance/commission-rules`
- `/v1/admin/finance/*`

Acceptance checks:

- Usage logs never pay publishers directly.
- Posted transactions create immutable splits.
- Active subscription periods create posted `subscription` transactions through an idempotent `source_reference`; `trialing` subscriptions remain runtime access state and do not produce revenue ledger rows.
- Subscription period renewal advances only expired `active` periods that already have a posted transaction for the previous period, then writes audit and notification records before the next period can be posted.
- Developer project command-center subscription rows expose buyer-safe ledger state for the current period, including trial access, awaiting-post, posted, renewal-ready, linked transaction metadata, and invoice-line linkage.
- Finance and publisher ledger summaries expose usage-vs-subscription source mix with gross, platform fee, publisher share, transaction count, and recent row source references.
- Commission rules are versioned.
- Finance admins can list active, scheduled, and ended commission rules from the admin console.
- Creating a new commission rule requires a reason, keeps platform and publisher bps totaling 10000, closes overlapping open rules, and writes audit plus notification records.
- New commission rules affect future ledger posting only; existing `transaction_splits` keep their original `commission_rule_id`.
- Balance changes use pending, available, paid, reversed, and blocked states.
- Refunds and disputes add adjustment records instead of editing history.

### 7. Payout And Notification States

Purpose:

- Prepare all payout and email workflows before final providers are connected.

Core tables:

- `payout_accounts`
- `payout_account_onboarding_sessions`
- `payouts`
- `notification_events`
- `notification_templates`
- `notification_preferences`
- `organization_webhook_endpoints`
- `webhook_delivery_events`
- Delivery-attempt fields on `notification_events`: attempts, last attempt, next retry, delivery provider, provider message id, error, and status.

API groups:

- `/v1/payouts/*`
- `/v1/notifications/*`
- `/v1/organization/team/*`
- `/v1/organization/webhooks/*`
- `/v1/admin/incidents/*`
- `/v1/admin/payouts/*`
- `/v1/admin/notifications/*`
- `/v1/admin/notification-deliveries/*`
- `/v1/admin/launch-readiness`

Acceptance checks:

- Paid publishing requires acceptable payout account state.
- Payout account onboarding remains provider-deferred until final provider integration; the gateway accepts only `manual_deferred` and validates handoff URLs before storing onboarding sessions.
- Payout requests above a threshold enter manual review.
- Blocked payout records reason and retry condition.
- Publisher payout summary exposes readiness blockers, request eligibility, expected initial payout status, balance-state explanations, latest payout reason, retry condition, and next action.
- Finance payout decisions require provider reference when marking paid and retry condition when blocking a payout.
- Review, incident, billing, payout, refund, and dispute events are recorded before email delivery exists.
- External `email` and `webhook` delivery events can be listed separately from in-app unread notifications.
- Admin/support operators can mark an external delivery sent, failed, skipped, or queued for retry with a required reason, audit log, and provider metadata.
- Email verification challenge delivery status stays synchronized with the matching `auth.email.code.requested` delivery event without exposing the raw code in admin lists.
- Fresh deployments seed active default templates for the main account, review, runtime, billing, payout, buyer-request, feedback, trust, curation, and delivery-operation events before provider-specific email or webhook integrations are connected.
- External delivery processing fans in-app business events into email/webhook queue rows using user email notification preferences and organization webhook endpoint subscriptions, then renders the active template for the delivery channel and locale at send time.
- Admin/support operators can process due external delivery events in batches, including dry-run mode, Resend-backed email delivery when configured, explicit provider-configuration failure states, and webhook fan-out into `webhook_delivery_events`.
- Admin/support operators can inspect launch readiness without exposing secrets, covering identity providers, email delivery, webhook worker schema, database migrations, required active notification-template coverage, runtime key hashing, commission rules, publisher terms acceptance, payout state, demo fallback, legacy signup, service token presence, and final-provider-deferred areas.
- Launch readiness exposes migration-runner history from `schema_migrations` so operators can see whether the server has run the current expected migration before the API depends on new columns or tables.
- Launch readiness exposes configurable credibility thresholds from real marketplace state: verified public skills, active publishers with public supply, active developer projects, successful governed invocations, and published buyer feedback.

## Frontend Pages To Make Real

### Public

- `/`: product value, trust model, registry preview.
- `/registry`: public versioned contract registry that explains manifest quality, lifecycle, runtime resolution, governance evidence, and the live `/v1/skills/search` endpoint without duplicating marketplace comparison.
- `/marketplace`: searchable catalog with filters, install commands, trust, pricing, and request board.
- `/skills/[slug]`: copyable CLI/MCP/SDK install commands, install-readiness checklist, project save/install/test actions, schemas, permissions, runtime, security notes, pricing, changelog, support, published feedback, and feedback submission.
- `/publishers`: public publisher trust directory with supplier ranking, verified inventory, install evidence, runtime calls, payout readiness, and top public skills.
- `/publishers/[slug]`: public publisher trust profile with marketplace-safe skill and operating signals.
- `/agents`: public agent integration guide with MCP, REST, SDK/CLI paths, project-scoped key guidance, runtime-governance explanation, and production-before-use checklist.
- `/docs`: manifest, API, SDK, MCP, publishing, review, pricing, payout states.
- `/terms`: public operating terms for buyers, publishers, platform operators, refunds, disputes, data retention, takedown, notifications, and provider-deferred payment/email boundaries.
- Shared operating evidence chain: home and marketplace must show how a skill moves from publish contract to review, install, governed runtime, ledger split, payout, notification, and audit without using fake production rows.

### Developer Workspace

- `/dashboard`: project list, installed skills, budgets, API keys, usage, invoices, update inbox.
- `/developer`: dedicated developer command center for projects, runtime keys, installed skills, budgets, buyer requests, billing readiness, and notifications.
- `/dashboard/projects/[slug]`: project command center for installed skills, per-skill policy and budget state, API keys, REST/MCP agent connection snippets, update inbox, recent runtime calls, subscriptions, and operational next actions.
- `/account`: personal center for profile, connected accounts, login methods, organization roles, notification preferences, session/token security, billing profile shortcuts, and payout readiness shortcuts.
- Developer evidence chain: developer surfaces must use project, install, runtime, and budget counts to prove marketplace choices become organization-scoped project governance state.

### Publisher Workspace

- `/publish`: package submission, role-aware publisher access, manifest preflight, repair queue, reviewer evidence packet, draft save, and immediate exact-version review submission.
- `/publisher`: dedicated publisher command center for skills, reviews, runtime checks, analytics, buyer requests, earnings, payout readiness, and notification preferences.
- Publisher evidence chain: publisher surfaces must use readiness, review, pricing-blocker, and payout signals to prove author work moves toward reviewed supply, monetization, and retained follow-up.

### Platform Admin

- `/admin`: review queue, skill feedback moderation, risk command center, finance ledger, payout review, incidents, audit stream, external notification delivery queue, webhook outbox, launch readiness.
- Admin evidence chain: admin surfaces must use finance, pending-balance, review/risk, and ledger-row signals to prove review, governance, money, delivery, and audit records are operationally connected.

## Near-Term Build Sequence

1. Add missing retention and operations tables.
2. Add API overview endpoints for developer, publisher, admin, and platform health data.
3. Wire dashboards to API-backed data where possible, with demo fallback allowed only outside production or behind an explicit demo flag.
4. Add skill install and project policy endpoints.
5. Add review queue endpoints, automated review checks, approval gates, and admin decision actions.
6. Add runtime invocation record and policy gate.
7. Add ledger creation functions for billable usage.
8. Add notification event recording.
9. Connect auth and role enforcement.
10. Integrate payment and email providers last.

## Current Implementation Progress

Completed:

- 1Panel deployment now includes a Docker Compose Postgres migration runner that records applied SQL files in `schema_migrations`, auto-starts fresh databases from `001`, repairs existing databases that have core tables but are missing the early marketplace operations baseline from `002` without rerunning non-idempotent `001`, resumes complete tracked databases after the highest recorded migration, and starts complete pre-runner production databases from `018` so manual migration lists do not keep accumulating.
- `/v1/admin/launch-readiness` now checks `schema_migrations` migration history, latest applied migration filename, recorded row count, and expected latest migration so deployment drift is visible from the admin command center.
- Retention and operations tables through migration `003_retention_operations.sql`.
- Platform, developer, publisher, and admin overview API endpoints.
- Dashboard and admin metric loading from the platform overview API with safe fallback data.
- Project installed-skill API endpoints.
- Project skill-policy API endpoints.
- Installed-skill update inbox API endpoint.
- Skill review submission endpoint.
- Admin review queue and review decision endpoints.
- Skill review submission now writes actor-aware audit rows, organization-scoped publisher notifications, and a check summary for the exact submitted version, including the case where a queued or in-review record already exists.
- Admin review console now reads the live review queue and exposes approve, reject, and block decisions with required reviewer notes.
- Skill review submission now creates automated manifest, runtime declaration, example schema, and security permission checks for the submitted version.
- Admin review queue responses now include the latest automated check results per type, and the admin console shows pass/fail/warning state inside each review card.
- Admin review queue responses now include a secret-safe evidence package with publisher status, payout readiness, exact manifest identity, runtime type/redacted target, permission flags, secret-handle count, and input/output schema field counts; the admin console renders it between reviewer notes and automated checks.
- Approved review decisions are blocked unless automated checks exist and have no failed, queued, or running result; warning results remain approvable with reviewer notes for human-risk acceptance.
- Project API key creation, listing, and revocation.
- Runtime invocation endpoint with API key auth, installed-skill gate, permission policy checks, rate limit checks, budget checks, invocation logs, and usage events.
- SDK and CLI runtime invocation helpers.
- Skill price setup and listing endpoints.
- Billable usage ledger posting from `usage_events` into `transactions`, `transaction_splits`, and pending `publisher_balances`.
- Active subscription-period ledger posting now creates exactly one posted `subscription` transaction per subscription period, then creates commission splits, pending publisher balances, and publisher/developer billing notifications through the admin finance processor.
- Active subscription renewal now advances posted, expired subscription periods to the next monthly period through an admin finance processor, preserving runtime continuity without skipping an unposted period.
- Finance ledger read endpoint and matured balance release endpoint.
- Admin notification list endpoint.
- Dashboard and admin pages reading finance ledger and notification event data with safe fallback states.
- Production web consoles now suppress demo fallback rows for admin, finance, trust, publisher, developer, team, billing, notification, and project operations unless `SKILLHUB_ENABLE_DEMO_FALLBACK=true` is explicitly set for a controlled demo.
- Payout workflow migration linking payouts to reserved publisher balance rows.
- Publisher payout readiness and request endpoints.
- Admin payout queue and payout decision endpoints.
- Payout explainability migration `030_payout_explainability.sql` adds durable retry-condition and next-action fields to payout records.
- Publisher payout readiness now returns request blockers, expected request status, latest payout next action, and retry condition so authors understand why balances are pending, available, locked, paid, failed, or blocked.
- Admin payout review console now reads the live payout queue and exposes approve, mark-paid, fail, and block decisions with finance notes, provider references, retry conditions, and next-action state.
- Payout decision enforcement now rejects `mark_paid` without a provider reference and records the acting finance operator in the payout audit row when available.
- Dashboard and admin pages reading payout readiness and payout queue data.
- Dashboard withdrawal panel now exposes payout request actions for verified publisher accounts with balances above the threshold, reserving eligible balances through the publisher payout endpoint.
- Publisher terms acceptance migration `024_publisher_terms_acceptance.sql` now stores the accepted operating terms version, acceptance timestamp, and accepting user id on `publisher_profiles`.
- `/v1/publisher/terms/accept` lets publisher, owner, admin, and super-admin users record the current commercial/refund/dispute terms with audit and notification events.
- `/publisher` now treats current terms acceptance as a publisher launch-checklist step before first paid publishing, and publisher account panels expose the accepted version and timestamp beside payout readiness.
- Active paid price writes now enforce the commercial-readiness gate: existing active publisher profile, verified payout readiness, current accepted publisher terms, and verified skill review are required before `per_call` or `subscription` pricing can become active.
- `/v1/publisher/skills` now returns skill-level commercial blockers, and the publisher skill workspace shows a paid-activation gate beside pricing controls so authors can resolve review, payout, profile, or terms issues before attempting paid activation.
- Refund and dispute workflow migration with adjustment transaction links.
- Admin refund request, refund decision, dispute open, and dispute decision endpoints.
- Dispute-lost flow can post refund adjustment records automatically.
- Admin risk table reads refund and dispute queues with safe fallback states.
- Admin refund and dispute console now lets finance operators approve, reject, post, fail, warn, win, or lose adjustment records with required reasons and optional provider references.
- User access token table and bootstrap flow for initial operator identities.
- Gateway role checks for project, publisher, reviewer, finance, and admin operations.
- `/v1/auth/me` endpoint for inspecting the active subject and roles.
- `/v1/auth/providers` endpoint now exposes product-visible login-method readiness for email registration, Google OAuth, GitHub OAuth, and token fallback, activating provider redirects only when credentials, callback base URL, and state secret are configured.
- Email verification-code access is modeled through migration `021_email_login_challenges.sql`, `/v1/auth/email/request-code`, and `/v1/auth/email/verify-code`, with HMAC-hashed 6-digit codes, 10-minute expiry, attempt limits, single-use transaction consumption, queued email notification events, verified email identity updates, 14-day user session tokens, audit logs, and httpOnly web-session storage.
- Email verification-code debug preview is now production-guarded and fail-closed in the gateway: only explicit non-production debug mode returns `deliveryPreviewCode`, production-like runtimes never return it, the email delivery processor rejects `debug_preview` in production, and sent email-code notification payloads are scrubbed of the raw code after provider handoff.
- The legacy `/v1/auth/signup` direct-token endpoint is disabled by default and requires `SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN=true`, so public users no longer bypass email verification through the product login flow.
- Google and GitHub OAuth start/callback endpoints now sign state, exchange provider codes, require verified email, create or reuse the user and organization membership, mint a 14-day user session token, set the httpOnly `skillhub_user_token` cookie, and redirect back to the app account flow.
- `user_auth_identities` migration `020_user_auth_identities.sql` now records email, Google, and GitHub login identities with provider user id, verified provider email, connection time, latest login time, avatar URL, and metadata.
- OAuth callbacks now prefer existing provider identity lookup before falling back to verified email, preventing provider email changes from accidentally creating a second SkillHub user.
- `/v1/account` endpoint now returns a user-scoped account center summary with profile, organization, memberships, token-session metadata, login-method states, team/token/project/skill counts, unread notifications, notification preference count, billing readiness, publisher profile status, and payout status.
- `/v1/account/sessions` now lists all user-owned token sessions by fingerprint, organization, activity, expiry, and current-session state without exposing raw tokens.
- `/v1/account/sessions/:tokenId/revoke` now lets users revoke old non-current sessions, blocks current-session self-revocation, writes `auth.session.revoked` audit records, and queues `account.security.session_revoked` in-app notifications.
- `/v1/account/identities/:provider/disconnect` now lets users disconnect Google or GitHub login identities only when another OAuth provider or a separate active user token remains available, preventing account lockout.
- `/account` connected login method cards now expose provider disconnect controls with inline success/error feedback, audit records, and `account.security.identity_disconnected` notification events.
- `/login` now behaves like a product account entry instead of a token-only console: email-code signup/login is active, Google/GitHub login paths become real provider redirects when configured, and token login remains the operator/team fallback.
- `/account` now gives users a personal center for profile, connected login methods, provider email, connection time, provider disconnect guardrails, organization role, session/token security with old-session revocation, workspace readiness, workspace shortcuts, and notification preferences.
- `/`, `/login`, and `/account` now expose a role-aware console access map for `/login`, `/account`, `/developer`, `/publisher`, and `/admin`, making backend routes, required roles, no-shared-password access, OAuth configuration state, and token fallback boundaries visible before customers need private instructions.
- `/developer`, `/publisher`, and `/admin` now expose role-aware workspace access panels that show current session, token fingerprint, required roles, sign-in-required or role-required states, and the gateway-enforced write boundary before users reach project, publishing, or admin controls.
- `/`, `/marketplace`, `/developer`, `/publisher`, and `/admin` now expose a shared operating evidence chain that connects publish contract, review gate, marketplace install, runtime governance, ledger split, payout, notification, and audit. Each page passes live/count signals from its own data source and keeps production empty states empty instead of filling unavailable data with bundled demo supply.
- `/registry` now presents the public skill registry as SkillHub's versioned contract layer: it explains the manifest quality bar, lifecycle, runtime resolution path, production demo-fallback boundary, live API endpoint, and registry-specific evidence before showing the public skill table.
- Project mutations and project API key creation now persist under the authorized subject organization instead of the demo organization fallback.
- Organization-scoped user tokens are required for project writes; service tokens retain demo fallback for bootstrap and controlled operator flows.
- Publisher profile and payout-account onboarding endpoints.
- Provider-deferred onboarding session records for payout handoff, completion, blocking, audit, and notifications.
- Publisher dashboard reads payout account and onboarding state.
- Dashboard publisher account panel now lets publishers update their public profile name, create deferred payout onboarding sessions, open the provider handoff link, and record payout readiness decisions while preserving existing restricted/suspended publisher status when no status change is requested.
- Publisher-scoped refund and dispute history endpoints.
- Project-scoped refund and dispute history endpoints for developer operators.
- Publisher dashboard shows recent refund and dispute activity beside ledger and payout readiness.
- Publisher skill operations endpoint aggregating owned skills, review state, runtime checks, installs, calls, success rate, latency, billable usage, pricing, and quality checklist.
- Publisher skill operations now expose latest automated review-check details per type, not only counts, so authors can diagnose manifest, runtime, example, and security issues before resubmission.
- Publisher skill publishing, review submission, and price writes now scope to the authorized subject organization and reject cross-organization slug ownership.
- Publisher dashboard publishing pipeline now reads owned skill operations data and exposes review submission plus skill price controls instead of static rows.
- Publisher dashboard skill cards now show latest automated review-check status and messages, giving authors a direct fix loop before they resubmit for operator approval.
- `/publish` now submits manifests through the signed-in organization-scoped user session via a server action, so publishers do not paste raw admin tokens into the browser form.
- Developer project operations endpoint aggregating organization-scoped projects, API keys, installs, approvals, budgets, runtime calls, success/error/blocked counts, latency, billable usage, subscriptions, and update-inbox counts.
- Dashboard buyer project controls now read developer project operations data instead of static rows.
- Developer project detail endpoint aggregating one organization-scoped project with installed skills, per-skill policies, usage, runtime quality, API key metadata, update inbox, recent invocations, and subscription records.
- `/dashboard/projects/[slug]` now exposes a project command center with drill-down links from the dashboard project list.
- Project installed-skill, project policy, and update-inbox read endpoints now require project-operator authorization and filter by the authorized organization.
- `/dashboard/projects/[slug]` now includes per-skill policy editing for permission level, network/browser/filesystem/secret access, monthly budget, rate limit, and owner approval state.
- Project API key list and revoke operations now accept the authorized organization scope to prevent cross-tenant slug collisions.
- Project API key revocation now requires a human reason, records actor-scoped audit metadata, queues an in-app notification, and the project console requires `REVOKE` or the key last four before submitting.
- `/dashboard/projects/[slug]` now includes runtime key rotation UX: create a replacement key, reveal the raw key once, copy it, and revoke old keys through an auditable confirmation flow.
- Publisher finance ledger endpoint now scopes revenue, platform-fee, publisher-share, balance, unprocessed usage, and recent transaction reads to the authorized publisher organization.
- Dashboard revenue ledger now reads the publisher-scoped finance ledger instead of the admin global finance ledger, so publishers see their own earnings state.
- Buyer request board endpoints now let developer organizations create and decide requests while publishers can view open demand, claim requests, and submit builds under organization-scoped authorization.
- Dashboard publisher workspace now shows a buyer request board with request, category, bounty, status, requester, due date, and next action signals.
- Dashboard buyer request exchange now exposes creation, claim, submit, match, close, and cancel controls so buyer demand and publisher supply can move without leaving the workspace.
- Buyer request delivery now requires a publisher-owned skill slug and exact reviewed/in-review version, stores delivery notes, evidence URL, submitted time, and buyer decision metadata, and shows the delivered skill/version/review state in publisher and developer request boards.
- Project installed-skill status endpoint now lets project operators restore, suspend, or remove installs under organization-scoped authorization, with audit and notification records.
- Suspending or removing an installed skill now requires a reason, writes that reason into audit and notification payloads, and the project console requires `SUSPEND` or `REMOVE` confirmation before submitting.
- Project detail console now exposes pause, restore, and remove controls for installed skills; runtime invocation already blocks non-installed statuses.
- Project subscription lifecycle endpoint now lets project operators pause, restore, or cancel subscriptions under organization-scoped authorization, with audit and notification records.
- Pausing or canceling a project subscription now requires a reason, writes actor-scoped audit metadata, queues an in-app notification, and the project console requires `PAUSE` or `CANCEL` confirmation before submitting.
- Project detail console now exposes subscription pause, restore, and cancel controls; runtime invocation blocks subscription-priced skills when the subscription is missing, expired, paused, past due, or canceled.
- Project detail console now exposes current subscription-period ledger state, linked transaction amount/id, invoice-line count, and renewal readiness, so developers can reconcile trialing, posted, unposted, and renewal-due subscription states without opening the admin finance console.
- Project subscription creation endpoint now lets project operators start a `trialing` or `active` provider-deferred subscription for a public verified subscription-priced skill with an active price, scoped to their organization and backed by audit plus notification records.
- Skill detail project actions now show a subscription-trial action for subscription skills, so discovery can move into save, subscribe, install, and non-billable runtime test loops from one project-scoped surface.
- Project update-inbox action endpoint now lets project operators acknowledge, schedule, adopt, or ignore installed-skill update events under organization-scoped authorization, with audit and notification records.
- Project update adoption now changes the installed skill's pinned version for approved `new_version` events, blocks unreviewed target versions, and resets high-permission updates into owner-review state.
- Project detail console now exposes update handling controls with notes, schedule dates, current version, target version, and target review state; adopted and ignored updates leave the active inbox and project update counts.
- Project saved-skill endpoints now let project operators list, save, and remove candidate skills in named collections under organization-scoped authorization, with audit and notification records.
- Project detail console now exposes saved skills beside update and billing operations so developers can keep evaluation shortlists before installing or buying.
- Project invoice endpoints now let project operators list, generate, inspect, and download CSV invoices generated from posted project transactions under organization-scoped authorization.
- Project detail console now exposes invoice generation, totals, due dates, line item counts, and CSV download links so project finance history is visible before payment-provider invoice APIs are connected.
- Organization billing endpoints now let owner/admin/finance operators read and update billing profile data plus payment method state records under organization-scoped authorization, with audit and notification records.
- Notification preference endpoints now let authenticated users read and update channel choices for review, update, runtime, billing, payout, buyer-request, and account-security topics, with user-scoped authorization and audit records.
- Admin audit log APIs now expose `admin_audit_logs` with actor, action, entity, reason, metadata, and timestamp fields for the `/admin` audit stream.
- `/admin` now separates governance audit history from notification delivery events, so operators can inspect true audit records for review, finance, trust, access, incident, and template changes.
- Admin notification template APIs now let admin/support operators list, create, and update `notification_templates` records across `in_app`, `email`, and `webhook` channels with `draft`, `active`, and `archived` lifecycle states.
- `/admin` now exposes notification template management beside the audit stream, so operators can maintain reusable communication copy before final email and webhook provider delivery is connected.
- Notification template updates write admin audit records and queued in-app platform notifications, making copy/configuration changes visible in the operations trail.
- Migration `027_default_notification_templates.sql` seeds active default notification templates for core operating events across account access, review, runtime, billing, payouts, buyer requests, feedback, trust reports, marketplace curation, and delivery operations; it uses `(template_key, channel, locale)` conflict protection so operator-edited templates are not overwritten on deploy.
- Launch readiness now verifies the required active notification-template matrix by `(template_key, channel, locale)`, not just the total active template count, so deleted or archived critical account, review, runtime, billing, payout, buyer-request, feedback, trust, curation, and delivery-operation rows become explicit launch blockers.
- Notification delivery operations migration `022_notification_delivery_operations.sql` adds attempt, retry, provider, provider-message, and delivery queue indexes for external notification events.
- Admin notification delivery APIs now let admin/support operators list external `email` and `webhook` events and mark them sent, failed, skipped, or queued for retry with required reasons and audit logs.
- `/admin` now exposes an external delivery queue with redacted payload summaries, provider metadata, attempts, errors, retry scheduling, and delivery actions; in-app notification unread state remains user-owned and is not treated as external delivery.
- `/v1/admin/notification-deliveries/process` now first fans out eligible in-app business notifications into external email/webhook delivery rows according to user email preferences and organization webhook endpoint subscriptions, reports fanout counts, and renders active templates for email text and webhook JSON payloads at delivery time.
- Email verification-code notification delivery decisions synchronize the matching `email_login_challenges.delivery_status`, keeping signup/login operations inspectable before the final email provider worker is connected.
- `/v1/admin/notification-deliveries/process` now lets admin/support operators process due external delivery events in `dry_run` or `deliver` mode.
- Email delivery processing supports Resend when `SKILLHUB_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `SKILLHUB_EMAIL_FROM` are configured; missing provider configuration records an explicit failed state instead of silently dropping login or operational email.
- Webhook processing fans matching organization-scoped external events into `webhook_delivery_events` for subscribed active endpoints without mixing webhook state with in-app unread notifications.
- Webhook delivery worker migration `023_webhook_delivery_worker.sql` adds outbox `processing` state, `last_attempted_at`, and due-event indexes so endpoint-level HTTP delivery can be claimed before network work.
- `/v1/admin/webhook-deliveries` and `/v1/admin/webhook-deliveries/process` now let admin/support operators inspect endpoint-level webhook outbox rows and process due deliveries with signed HTTP POST requests, response capture, endpoint status updates, stale-processing recovery, and retry backoff.
- `/admin` now exposes a Webhook outbox manager beside the external notification queue, so operators can see fan-out state, endpoint HTTP status, response body excerpts, attempts, and next retry without confusing it with in-app unread notifications.
- `/admin` now exposes a compact Process due control beside the external delivery queue, so operators can run provider dry-runs or delivery batches from the command center.
- `/v1/admin/launch-readiness` now returns a secret-safe production readiness report for OAuth, email-code delivery, webhook delivery, database migrations, notification templates, runtime API-key hashing, commission rules, publisher terms acceptance, payout state, production guardrails, and intentionally deferred payment-provider work.
- `/admin` now exposes launch readiness beside the command-center metrics, giving operators a single blocker/warning/ready/deferred view before production rollout.
- `/terms` now gives SkillHub a public operating-terms surface for buyer use, publisher responsibilities, review/takedown, commission/payout, refunds/disputes, data retention, notifications/webhooks, and deferred provider integrations before final legal terms and paid-marketplace provider contracts are connected.
- The home footer and docs page now link to `/terms`, so marketplace rules are discoverable from the public site instead of living only in internal docs.
- User notification inbox endpoints now let organization-scoped users read in-app events and mark unread items as read, so recorded notification events become a repeat-use dashboard surface instead of admin-only logs.
- User notification inbox responses now include unread/read/failure totals plus per-topic counts, and organization-scoped users can mark all unread in-app events as read from the API and dashboard sidebars.
- Dashboard organization operations now expose user notification preference controls before final email-provider delivery is connected; organization webhook delivery remains governed by webhook endpoint `status` and subscribed `events`.
- Dashboard organization operations now expose the user's in-app notification inbox with unread/read state and contextual links for project, skill, billing, payout, buyer-request, and trust events.
- Dashboard finance operations now exposes billing readiness, invoice profile editing, manual/provider payment method status, and default payment method controls before payment-provider APIs are connected.
- Publisher overview endpoint now requires publisher/owner/admin authorization and returns organization-scoped review, runtime-check, buyer-request, and publisher balance signals instead of global marketplace aggregates.
- Trust and safety migration now stores skill abuse reports plus takedown action history for triage, warning, restriction, suspension, dismissal, and resolution decisions.
- Abuse report APIs now let user-scoped reporters submit skill reports while trust operators list and decide the queue with audit logs, skill update events, notification records, and listing restriction/suspension state changes.
- Admin risk operations now expose a trust and takedown queue with decision controls so operators can act on quality, security, privacy, spam, billing, and malicious-runtime reports.
- Skill detail pages now expose a user-scoped trust report form so security, privacy, quality, billing, malicious-runtime, copyright, spam, and other reports can enter the takedown queue from the public listing.
- Public marketplace and skill detail pages now read live registry search, manifest, price, public publisher, platform overview, and feedback endpoints first. Bundled marketplace fallback is available only outside production or behind `SKILLHUB_ENABLE_DEMO_FALLBACK=true`; production-like runtimes render empty public states or not-found detail pages instead of fake supply when API/database data is unavailable.
- Skill detail pages now expose project-scoped save and install controls, letting developers move a discovered skill into a selected project collection or installed-skill inventory without retyping the slug in the project console.
- Skill detail pages now expose similar and replacement skill suggestions scored from category, shared tags, runtime, pricing, verification, and permission-risk signals, giving developers a comparison and fallback path before install or after deprecation/suspension.
- Public publisher profile endpoints and `/publishers/[slug]` now expose marketplace-safe trust signals, public skills, verification counts, install/call evidence, active paid skill count, payout readiness state, and skill-level detail links without exposing private organization or payout-account data.
- `/publishers` now exposes a browseable public publisher trust directory and marketplace links now surface publisher count, verified publisher count, and a supplier-trust path before install decisions.
- `/publishers` now includes a launch-safe empty state for production deployments with no live public publishers, pointing operators back to launch readiness instead of silently showing demo publisher cards.
- Public publisher reads now tolerate partially migrated live databases by deriving pending publishers from public skill ownership when `publisher_profiles` is unavailable and defaulting optional review, pricing, install, and invocation signals when their operational tables are missing; launch readiness still reports those schema gaps as deployment work.
- Marketplace discovery controls now filter by category, pricing model, permission risk, runtime, and verification state, with ranking by recommendation score, adoption, runtime success, low risk, and review freshness.
- Public skill search now supports API-level runtime, billing model, verification status, permission, tag, query, limit, and sort parameters, and returns marketplace-safe discovery metrics for web, CLI, SDK, and agent callers.
- Public skill search now treats `skills` and `skill_versions` as the core public registry read path and degrades optional review, pricing, install, invocation, feedback, and curation tables to conservative default signals instead of dropping real public supply during partial migrations.
- Marketplace curation migration `018_marketplace_curation.sql` now stores one active ranking rule per skill with placement, bounded boost, required reason, optional expiry, creator/updater, and timestamps.
- Admin marketplace curation APIs now let platform operators read skill quality signals and let reviewer/admin roles update ranking placement with required reasons, previous/next audit metadata, and queued notification events.
- Public recommended search now applies active curation internally while keeping internal boost and operator reasons out of marketplace-safe search responses.
- `/admin` now exposes marketplace ranking controls beside quality, incident, audit, and notification operations so ranking changes happen from an auditable platform command center.
- Marketplace curation appeals now let publishers request standard or featured distribution reconsideration with reason, evidence URL, current placement, requested placement, SLA, audit logs, and publisher/operator notifications.
- Admin marketplace operations now expose a curation appeal queue where reviewers can move requests under review, approve with a curation-rule update, reject, or close with required reasons.
- Publisher skill cards now show latest curation appeal status, SLA, and operator decision reason, and provide a review-request form when no appeal is open.
- The marketplace browser preserves API order for recommended discovery after local filtering, so server-side trust and curation signals remain visible to buyers.
- Web console token session now lets operators sign in with a user access token, stores it as an httpOnly cookie, shows session scope in the dashboard, and makes dashboard data/actions prefer the active user session before falling back to server environment tokens.
- Admin identity directory APIs now let admin/support operators read user, organization, platform-role, membership, token, project, skill, invocation, and ledger adoption signals without mutating access state.
- `/admin` now exposes a user and organization directory so platform operators can see account health and adoption before final OAuth/passwordless provider tooling is connected.
- Developer project creation now lets organization-scoped users create new agent projects from the dashboard, with explicit API validation, organization-local slug uniqueness, audit logging, and in-app notification records.
- `/publisher` now gives skill authors a dedicated operations workspace for owned skills, review submission, pricing, buyer demand, publisher revenue, refund/dispute watch, payout readiness, account onboarding, and notifications.
- `/developer` now gives skill buyers and agent operators a dedicated workspace for project creation, project drill-down, installed-skill/key/budget signals, buyer requests, billing readiness, notification inbox, and next operational actions.
- Skill feedback storage is now modeled in migration `016_skill_feedback.sql`, with rating, title, body, use case, reviewer/project context, moderation status, audit reason, and published timestamp.
- Public feedback APIs now expose published feedback plus full published-rating summary for each skill, while user-scoped submissions enter moderation.
- Admin skill feedback APIs now let trust operators publish, hide, reject, or reopen feedback with required reasons, audit logs, and queued publisher notifications.
- Skill detail pages now show published user feedback, average rating, reviewer organization, use case, project context, and a signed-in feedback submission form before the trust report flow.
- `/admin` now includes a skill feedback moderation queue beside trust, finance, and review operations so marketplace quality signals have an operator-owned path.
- Skill search summaries now include published feedback count and average rating, and recommended ranking uses those signals alongside verification, permission risk, install evidence, runtime success, and freshness.
- Publisher skill operations now expose average rating plus published/pending feedback counts so authors can see what buyers trust and what still needs moderation or response.
- Publisher feedback responses now add migration `026_skill_feedback_publisher_responses.sql`, a publisher-scoped response API, recent published feedback rows in `/v1/publisher/skills`, public skill-detail response display, publisher workspace response forms, audit logs, buyer notifications, and launch-readiness schema checks.
- Admin runtime incident APIs now let trust/platform operators list incidents, open a skill-scoped incident, update severity, and move incidents through `open`, `monitoring`, `resolved`, and `postmortem` with required reasons.
- Incident decisions now write skill update events, admin audit logs, and publisher in-app notifications, so developer update inboxes and publisher notifications reflect operational recovery before email delivery exists.
- `/admin` now includes a runtime incident operations queue and folds active incidents into risk metrics and command-center rows beside feedback, abuse, refund, dispute, and payout workflows.
- Organization team APIs now let owners/admins list members, add or update a member role, issue a one-time-visible organization-scoped user token, and remove a member while revoking organization-scoped access tokens.
- `/developer` now includes team access management beside organization billing and notifications, so multi-person teams can split developer, publisher, finance, review, admin, and owner responsibilities before final auth-provider integration.
- Organization webhook migration `017_organization_webhooks.sql` now stores webhook endpoint configuration plus future delivery outbox records.
- Organization webhook APIs now let owner/admin/developer users list endpoints, create HTTPS callback endpoints, update subscribed event topics and status, and rotate one-time-visible signing secrets.
- `/developer` now exposes webhook endpoint management beside team, billing, inbox, and notification preferences, so webhook endpoint subscriptions have a concrete integration surface before final delivery workers/providers are connected.
- Project runtime test invocation APIs now let signed-in developers run an installed skill through the same runtime policy, subscription, budget, invocation-log, and execution path as agent API-key calls while keeping console tests non-billable.
- Skill detail project actions now expose a JSON test input and runtime result panel beside save/install, giving developers an immediate install-to-test loop before they hand a project key to an agent.
- Project detail now exposes a project-level runtime test panel for installed skills, so developers can complete marketplace discovery, project install/policy review, console test, and recent invocation-log inspection from the project command center.
- Project detail now exposes a REST/MCP agent connection panel with copyable endpoint and command snippets, active-key state, project slug, and a governance reminder that runtime policy, budget, subscription, logging, and metering still apply.
- OAuth provider readiness now exposes exact Google/GitHub callback URLs, missing secret-safe configuration names, and per-provider readiness booleans through `/v1/auth/providers`; `/login` shows callback success/error notices and provider setup hints instead of dead OAuth buttons.
- `/agents` now functions as a real public integration guide with MCP client config, REST invocation, SDK discovery snippets, project-scoped key guidance, runtime governance, and production checklist.
- `/publish` now exposes the Journey B operating entry with clean English/Chinese copy, no raw token field, signed-in session language, shared operational status components, manifest preflight for JSON/identity/runtime/schemas/permissions/commercial readiness, warning-vs-blocker save gates, and success actions into `/publisher` plus public skill detail.
- `/publish` now preserves the saved draft's exact semantic version in the success state and lets publishers submit that version for review immediately, creating automated check evidence without forcing first-time authors to rediscover the version in `/publisher`.
- `/publish` now renders that immediate review submission as a publisher-facing handoff packet with queued/refreshed state, review id, risk, automated-check counts, and direct links into publisher review, paid-readiness, and account/terms sections; the publish entry copy also returns normalized Chinese text instead of the earlier mojibake fallback.
- `/publish` now shows the same role-aware publisher access state used by the operating workspace and converts client preflight output into a repair queue plus secret-safe reviewer evidence packet, including target fields, next actions, runtime target, schema field count, risk level, and secret-handle count.
- `/publisher` now uses clean bilingual copy for the publisher command center, publisher skill cards, version/review/pricing/curation/feedback actions, and action-result messages; owned skill cards also show a derived next operating step so publishers know whether to create a version, submit review, fix checks, clear paid blockers, respond to feedback, appeal distribution, or monitor verified supply.
- `/publisher` now adds a review repair loop on each owned skill card, combining latest exact version, review status, reviewer notes, automated check evidence, and repair action chips; the version workbench opens automatically when a fix, high-risk rationale, new version, or resubmission is the next needed step.
- `/publisher` now adds a paid marketplace readiness command panel above the skill workbench, aggregating ready paid listings, blocked paid listings, draft paid prices, payout readiness, profile/terms gates, and per-skill paid activation next actions before authors edit individual versions or price records.
- `/publisher` now derives a top-level publisher operations priority queue from the existing organization-scoped publisher endpoints. The queue ranks readiness gaps, review repair, runtime checks, review SLA pressure, paid activation blockers, unanswered buyer feedback, buyer demand, marketplace placement/appeal work, payout readiness, and refund/dispute attention without adding fake rows or a new API contract.
- `/admin` now derives a top-level admin operations priority queue from existing operator endpoints. The queue ranks launch blockers, review SLA/check/risk pressure, runtime incidents, abuse reports, feedback moderation, payout/refund/dispute work, notification and webhook delivery retries, curation appeals, commission setup, and identity-health gaps without adding fake task rows or a new API contract.
- `/admin` now treats a completely empty commission-rule list the same as a missing active commission rule, so paid-marketplace ledger setup appears in the finance priority queue before the first rule exists.
- Publisher pricing controls now show a pricing-gate preview beside each skill and disable the active paid-price option when the current paid listing still has commercial blockers, while draft pricing remains available and the backend remains the source of truth for enforcement.
- Migration `028_runtime_check_remediation.sql` adds structured automated-check remediation fields to `skill_runtime_checks`: blocking flag, fix category, target field, and next action.
- Review submission now stores structured remediation metadata for manifest, runtime, example, and security checks, so publishers and reviewers no longer have to infer repair steps from free-text messages.
- `/v1/admin/reviews` and publisher skill/version APIs now return the remediation fields, and `/admin` plus `/publisher` display next action and target field beside check evidence.
- Review queue and publisher skill/version APIs now derive a three-business-day review SLA from the submitted version timestamp, returning submitted time, due time, queue age, hours remaining, and `on_track`/`due_soon`/`overdue`/`decided`/`not_submitted` status; `/admin` and `/publisher` surface those signals so operators and publishers can manage queue pressure.
- `/admin` now prioritizes the skill review queue with summary counts, SLA/blocker/high-risk/warning filters, recommended priority reasons, and sort modes for priority, oldest submission, earliest SLA due time, and highest risk.
- Launch readiness now treats the runtime-check remediation columns, buyer-request delivery package columns, and payout explainability columns as schema prerequisites, and its migration-history gate expects the latest production migration `031_public_publisher_profile_backfill.sql`.
- Launch readiness now tracks configurable customer-facing credibility thresholds for verified public skills, active publishers, active developer projects, successful governed invocations, and published buyer feedback, using live database counts as operator warnings.
- Journey A developer surfaces now use clean bilingual copy across `/developer`, `/skills/[slug]`, `/dashboard/projects/[slug]`, project API keys, project policy, saved skills, update inbox, and agent connection panels.
- `/developer` now derives a per-project next operating step from key, install, owner-review, suspension, update, runtime-quality, billing, and monitoring state so developer teams see why to return after first install.
- `/developer` now derives a top-level developer operations priority queue from existing project, buyer-request, billing, team, webhook, and notification endpoints. The queue ranks project creation, missing active keys, missing installs, owner approval, suspended runtime state, update inbox decisions, runtime-quality issues, billing readiness, unread notifications, team setup, webhook setup, and buyer requests without adding fake task rows or a new API contract.
- `/dashboard/projects/[slug]` now exposes a runtime readiness checklist for project keys, installed skills, high-risk policy approval, update inbox decisions, and runtime quality, making the marketplace-to-project-to-runtime governance loop visible from the project command center.
- Project policy saves now synchronize owner-approval state with installed-skill runtime eligibility: clearing high-risk approval requires owner/admin authority, records the policy approver, moves the install to `approved`, and writes audit plus notification records; requiring approval moves installed skills back to `owner_required`.
- `/dashboard/projects/[slug]` now derives a project-level operations priority queue from the project detail response. The queue ranks missing active keys, missing installed skills, owner approval, suspended runtime state, update decisions, runtime-quality issues, missing runtime proof, subscription/ledger/invoice gaps, and saved-skill follow-up, then links each item into the exact project panel without adding a fake task API.
- `/dashboard/projects/[slug]` now reads project-scoped refund and dispute history and renders a read-only adjustment impact panel beside subscriptions and invoices. Unresolved adjustment records can enter the project priority queue, while finance creation and decisions remain in `/admin` workflows.
- `/marketplace` skill cards now expose buyer-safe recommendation reasons and an after-install handoff strip for project install, policy gate, runtime log, and usage ledger state, so recommended discovery is not a black-box order and copying a command visibly leads to governed project operations.
- Marketplace discovery now supports URL-initialized and URL-preserved search/filter state for query, category, pricing, permission risk, runtime, verification, and sort, while the home registry search submits directly into that reproducible catalog view.
- `/skills/[slug]` now adds a developer handoff packet beside install commands and project actions, summarizing the contract pin, organization project state, policy gate, reveal-once runtime key, governed console test, billing/subscription gate, and usage-ledger implications before developers continue into the project command center.
- `/docs` now works as a bilingual operating reference for the full P0 product: journey maps, manifest quality requirements, runtime governance path, API groups, shared lifecycle/check/balance/delivery states, and launch/operator guardrails are visible from the public site instead of only internal repository docs.
- A shared role-aware journey rail now connects the key P0 surfaces: home shows all three journey paths, developer pages show marketplace-to-project-to-runtime progression, publisher pages show publish-to-review-to-monetization progression, and admin shows readiness-to-review-to-finance-to-delivery governance. This is a UI/IA layer only; it adds no fake success state or new API contract.
- `/dashboard` now starts with a role-aware workspace command center before the detailed operating panels. It combines session state, console access, all three P0 journey rails, the shared operating evidence chain, project/verified-skill/ledger/launch-readiness signals, and four role cards for account, developer, publisher, and admin entry without exposing credentials or replacing the dedicated workspaces.
- `/dashboard` now includes a P0 operating proof chain for customer walkthroughs. It derives eight stages from existing data only: publisher upload, version checks, admin review, marketplace listing, developer install, policy/key/runtime test, ledger/payout, and notification/readiness/audit proof, then marks each stage as proof visible, needs attention, or waiting for data without adding a fake task API.
- `/login` now opens with an account-entry readiness brief that summarizes email-code access, Google/GitHub configuration state, token fallback boundaries, current session state, and post-login workspace destinations before the forms. It keeps OAuth buttons disabled unless provider configuration is actually ready.
- `/account` now opens with an account command strip for identity, session security, workspace readiness, and operations readiness, and its workspace shortcuts now show role-aware available, sign-in-required, or role-required states using the active session rather than implying every console is open to every user.
- `/admin` launch readiness now adds secret-safe evidence drill-down. The panel turns each readiness check into an existing proof or fix target, and shows the five credibility thresholds as a customer-demo proof chain for verified public supply, active publishers, developer projects, successful governed invocations, and published feedback without adding fake task rows or exposing secrets.
- The global `Console` / `后台入口` action now lands on `/dashboard#workspace-command-center`, and the non-mutating app smoke asserts P0 operating markers plus Chinese mojibake guards across home, login, dashboard, publish, publisher, developer, and admin surfaces.
- Project skill installation and project API-key creation now write audit and organization/user notification records, making Journey A state changes visible outside the project table. `pnpm smoke:p0:developer` creates a generated project, saves and installs a skill, creates a reveal-once runtime key, runs a non-billable governed runtime test, then verifies project detail, notification, and audit visibility through APIs.
- `pnpm smoke:p0:publish` now adds a mutating Journey B -> C handoff smoke that creates a generated draft skill, submits its exact version for review, verifies publisher skill/version state, publisher notification state, admin review queue state, admin audit state, and admin notification queue state, with production API writes blocked unless explicitly allowed.
- `pnpm smoke:p0:admin` now adds a non-mutating Journey C operations smoke that checks `/admin`, protected admin API boundaries, launch readiness, review evidence, finance ledger and commission setup, payout explainability, notification and webhook queues, identity directory, audit logs, trust queues, and marketplace curation queues without exposing authorization-shaped secrets. The gateway also exposes `/v1/admin/identity-directory` as the canonical identity endpoint while preserving `/v1/admin/identity` as a compatibility alias.
- Notification delivery processing now has a safer operator rehearsal path: `dry_run` returns a `fanoutMode: preview` summary for queued in-app business events, user email preferences, and organization webhook subscriptions without inserting email/webhook delivery rows, while `deliver` continues to create the external rows. `pnpm smoke:p0:admin` now exercises both notification-delivery and webhook-outbox dry-run processors, so Journey C proves batch operations as well as queue visibility without sending provider emails, posting external webhooks, or exposing authorization-shaped secrets.
- `pnpm smoke:p0:demo` now adds a mutating end-to-end customer-demo smoke that creates a generated publisher draft, submits and approves the exact version, verifies public marketplace discovery, completes provider-deferred commercial readiness, activates a per-call price, creates a developer project, saves and installs the verified skill, creates a reveal-once project key, runs governed console runtime and billable MCP `tools/call` invocations, processes billable usage into posted transaction/split/publisher-balance rows, releases eligible balances, requests publisher payout, approves and marks the provider-deferred payout paid, then verifies project detail, publisher/admin finance and payout ledgers, notification, admin audit, and admin notification handoff without direct database access or credential exposure.
- Launch-readiness QA now has shared contract and sensitive-output validators used by both the general smoke and `pnpm smoke:p0:admin`. The contract validator requires the identity, email, webhook, marketplace-operations, launch-credibility, commercial, and production-guardrail sections plus their customer-demo evidence item keys, item fields, valid statuses, and matching summary counts, while still allowing real environments to report blockers or warnings. The sensitive-output validator fails authorized smoke runs if readiness/admin responses expose authorization-shaped strings, user/project/webhook/provider keys, raw API-key fields, or email-code previews.
- Web QA now has an explicit Next.js ESLint setup for `@useskillhub/web`, so `pnpm lint` runs as a non-interactive release gate instead of triggering Next's first-run ESLint setup prompt.
- Provider-deferred payout onboarding now rejects unsupported provider names, validates return/refresh/onboarding handoff URLs, rejects embedded URL credentials, and launch readiness treats `payout_account_onboarding_sessions` as part of the required payout-state schema before paid marketplace rollout. The P0 demo-chain smoke also asserts provider/session/URL shape during commercial-readiness setup.
- Public registry reads now degrade from the core registry outward in production-like deployments: `/v1/skills/search`, public manifest reads, skill detail, and public MCP discovery rely on `skills` and `skill_versions` first, then add review, pricing, install, invocation, feedback, and curation signals only when those optional operational tables exist. Missing optional tables produce conservative marketplace-safe defaults instead of hiding real public skills, while missing core registry tables still return empty public results rather than demo rows or 500s. Internal operational probes, writes, admin queues, and launch readiness still surface migration blockers. The general smoke now checks `/v1/skills/search?limit=5`, fails when public stats report published supply but search returns none, checks real returned `/skills/:slug` and `/publishers/:slug` detail pages, and asserts Chinese P0 page markers so bilingual customer-demo routes cannot silently regress.
- The general smoke now also runs a source-level mojibake guard before any API or app checks. It scans the web app source and QA scripts for grouped historical encoding-corruption markers such as replacement characters, `锟斤拷`, and UTF-8-as-GBK fragments, so bilingual copy regressions in files like the publish entry are caught even before they reach rendered HTML.

Next:

- Resolve any launch-readiness blockers reported by `/admin` before public launch or paid marketplace rollout.
- Configure real production email delivery with `SKILLHUB_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `SKILLHUB_EMAIL_FROM`; `/v1/admin/launch-readiness` treats missing production email delivery as a blocker, and debug preview is limited to non-production testing.
- Finalize legal review of `/terms` once payment provider, payout provider, tax/KYC region, refund window, and minimum payout decisions are locked.
- Provider-specific payout account integration to replace manual deferred onboarding URLs.
- Payment-provider customer/session integration after billing states are stable.

## Engineering Acceptance Standard

Before a feature is considered complete, it must answer:

- Which user side does it serve?
- What first-visit or repeat-visit reason does it strengthen?
- What database state does it own?
- What API operation exposes it?
- What dashboard shows it?
- What admin or audit control is needed?
- What tests or typechecks prove it does not break the platform?
