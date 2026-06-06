# SkillHub API

Base URL:

```txt
https://api.useskillhub.com
```

## Search Skills

```bash
curl "https://api.useskillhub.com/v1/skills/search?q=research"
curl "https://api.useskillhub.com/v1/skills/search?runtimeType=http&billingModel=per_call&verificationStatus=verified&sort=recommended"
```

Supported public discovery parameters:

- `q`: free-text search across slug, display name, description, and tags.
- `tags`: comma-separated exact tag filters.
- `limit`: result count, capped at 100.
- `permissionLevel`: `low`, `medium`, or `high`.
- `runtimeType` or `runtime`: `http`, `mcp`, or `local`.
- `billingModel` or `pricing`: `free`, `per_call`, or `subscription`.
- `verificationStatus` or `verification`: public discovery accepts the registry status filter, but marketplace search only returns public skills in `submitted`, `verified`, or `deprecated` states.
- `sort`: `recommended`, `adoption`, `success`, `low_risk`, or `recent`.

Response:

```json
{
  "skills": [
    {
      "id": "browser-research",
      "slug": "browser-research",
      "displayName": "Browser Research",
      "description": "Research a web topic and return concise findings with source URLs.",
      "tags": ["research", "browser", "citations"],
      "version": "0.1.0",
      "verificationStatus": "verified",
      "permissionLevel": "medium",
      "runtimeType": "http",
      "billingModel": "per_call",
      "installCount": 1280,
      "invocationCount": 8400,
      "successRate": 0.982,
      "avgLatencyMs": 1800,
      "averageRating": 4.7,
      "feedbackCount": 18,
      "updatedAt": "2026-06-05T00:00:00.000Z"
    }
  ]
}
```

Recommended ranking combines query relevance, verification status, permission risk, install evidence, invocation volume, runtime success, published feedback rating, feedback count, freshness, and active marketplace curation signals. Search remains public because it returns marketplace-safe discovery metadata only. Internal curation fields such as manual boost, suppression reason, and operator notes are never included in the public search response.

## Admin Marketplace Curation

Marketplace curation lets operators improve discovery quality without editing skill records directly. Public search uses the active curation rule internally for `sort=recommended`; admin endpoints expose the rule, quality signals, and audit path.

Read the curation queue:

```bash
curl "https://api.useskillhub.com/v1/admin/marketplace-curation?limit=30" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`GET /v1/admin/marketplace-curation` requires `support`, `admin`, or `super_admin`. It returns skill identity, visibility, verification state, current placement, boost, reason, expiry, install/call/success signals, feedback counts, and open/monitoring incident counts. If the production database is available but the curation migration has not run, the API returns a clear `500` instead of silently showing demo data.

Create or update a rule:

```bash
curl -X PUT "https://api.useskillhub.com/v1/admin/marketplace-curation/browser-research" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "placement": "featured",
    "boost": 120,
    "reason": "Verified skill with strong success rate and current buyer demand.",
    "endsAt": "2026-06-12T00:00:00.000Z"
  }'
```

`PUT /v1/admin/marketplace-curation/:skillSlug` requires `reviewer`, `admin`, or `super_admin`.

Request body:

- `placement`: `featured`, `standard`, or `suppressed`.
- `boost`: integer from `-250` to `250`; the API clamps out-of-range values.
- `reason`: required operator reason, stored in the audit log and admin UI.
- `endsAt`: optional ISO timestamp; if provided it must be in the future.

Rules:

- `featured` is allowed only for public skills in `submitted` or `verified` review status.
- `suppressed` lowers public discovery ordering across sort modes but is not a takedown; use trust/suspension flows for removal.
- Every write stores previous and next rule values in `admin_audit_logs`.
- Every write queues an in-app `marketplace.curation.updated` notification event.
- Public search keeps using the same response schema and does not expose internal reasons or boost values.

## Marketplace Curation Appeals

Publishers can request a formal marketplace distribution review when a listing is suppressed, when new quality evidence is available, or when they want featured placement reconsidered.

Create a publisher appeal:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/skills/browser-research/marketplace-appeals" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestedPlacement": "standard",
    "appealReason": "Runtime checks now pass and the listing has new buyer feedback.",
    "evidenceUrl": "https://example.com/skillhub/browser-research/runtime-evidence"
  }'
```

Rules:

- Publisher appeals require a publisher, owner, admin, or super-admin organization-scoped user token.
- The skill must belong to the token organization.
- `requestedPlacement` is `standard` or `featured`.
- `appealReason` is required.
- Only one `open` or `under_review` appeal can exist per skill at a time.
- Each appeal stores the current placement, requested placement, current curation reason, evidence URL, submitter, publisher organization, and seven-day SLA target.
- Appeal creation writes an audit row and queues in-app notifications for platform operators and the publisher organization.

Publishers can list their own appeal history:

```bash
curl "https://api.useskillhub.com/v1/publisher/marketplace-appeals?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Admin/support operators can read the appeal queue:

```bash
curl "https://api.useskillhub.com/v1/admin/marketplace-curation/appeals?limit=30" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Admin/reviewer operators can record a decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/marketplace-curation/appeals/$APPEAL_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "placement": "standard",
    "boost": 0,
    "reason": "Publisher supplied passing runtime evidence and no open incidents remain."
  }'
```

Decision actions:

- `review`: move the appeal to `under_review` with an operator reason.
- `approve`: approve the appeal and upsert the skill's marketplace curation rule with chosen placement, boost, optional expiry, audit log, and publisher notification.
- `reject`: reject with a required reason.
- `close`: close without changing marketplace placement.

Featured approvals still require a public listing in `submitted` or `verified` review status. The public marketplace never exposes appeal reasons or internal boost values.

## Get Skill Manifest

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research"
```

The public marketplace and skill detail pages read these registry endpoints first. In local development or controlled staging demos, bundled demo content can fill unavailable registry responses. In production-like runtimes (`NODE_ENV=production`, `VERCEL_ENV=production`, or `SKILLHUB_ENV=production`), demo fallback is disabled unless `SKILLHUB_ENABLE_DEMO_FALLBACK=true` is explicitly set, so unavailable or empty live registry data renders an empty marketplace or a not-found skill detail instead of fake supply. Skill cards merge search summaries, manifest runtime/permission data, and public price records from `/v1/skills/:slug/prices`. The marketplace uses `/v1/skills/search?sort=recommended` as the first discovery source before local interactive filtering.

## Public Publishers

Public publisher profiles expose marketplace trust signals without revealing private organization billing, user, or payout-account details.

```bash
curl "https://api.useskillhub.com/v1/publishers"
curl "https://api.useskillhub.com/v1/publishers/skillhub"
```

The response includes:

- Publisher display name, public slug, profile status, payout readiness state, and derived trust level.
- Public skill count, verified skill count, install count, runtime call count, active paid skill count, and average success rate.
- Public skill rows with verification status, permission risk, pricing model, install count, call count, success rate, and version.

The web app uses this data for `/publishers`, `/publishers/[slug]`, marketplace publisher links, and skill-detail publisher trust panels. Production-like runtimes suppress bundled publisher fallback unless `SKILLHUB_ENABLE_DEMO_FALLBACK=true` is explicitly enabled, so public publisher trust signals remain tied to live registry data.

## Registry Stats

```bash
curl "https://api.useskillhub.com/v1/stats"
```

## Public Operating Terms

The web app exposes public marketplace operating terms at:

```txt
https://app.useskillhub.com/terms
https://app.useskillhub.com/terms?lang=zh
```

The terms page is not an API endpoint. It documents the current operating policy for buyer/developer use, publisher responsibilities, review and takedown, commission and payout states, refunds and disputes, data retention, notifications and webhooks, and provider-deferred payment/email integrations. It is intended to make pre-launch marketplace rules visible while final payment provider, payout provider, tax/KYC, refund-window, and minimum-payout decisions remain open.

Final legal terms can replace or extend this page before paid marketplace launch without changing the API state machines for reviews, installs, runtime invocations, ledger posting, payout requests, adjustment records, notification events, or audit logs.

## Publisher Operating Terms Acceptance

Publisher terms acceptance is a durable commercial-readiness record. It stores the accepted public operating terms version, acceptance timestamp, and accepting user id on the publisher profile.

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/terms/accept" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"termsVersion":"2026-06-05-prelaunch-operating-terms"}'
```

`POST /v1/publisher/terms/accept` requires a publisher, owner, admin, or super-admin organization-scoped user token. If the organization does not yet have a publisher profile, the API creates one using the organization name, then records the acceptance.

The response returns the updated `publisherProfile`:

```json
{
  "publisherProfile": {
    "id": "PUBLISHER_PROFILE_ID",
    "organizationId": "ORGANIZATION_ID",
    "displayName": "SkillHub Publisher",
    "status": "active",
    "payoutStatus": "verification_required",
    "termsAcceptedAt": "2026-06-05T00:00:00.000Z",
    "termsAcceptedByUserId": "USER_ID",
    "termsVersion": "2026-06-05-prelaunch-operating-terms",
    "createdAt": "2026-06-05T00:00:00.000Z",
    "updatedAt": "2026-06-05T00:00:00.000Z"
  }
}
```

Every acceptance writes `publisher.terms.accepted` to `admin_audit_logs` and queues a publisher in-app notification. Raw tokens, OAuth secrets, payment-provider credentials, and email-provider credentials are never involved in or exposed by this endpoint.

## Platform Overview

These endpoints expose the first real operating shape for the two-sided marketplace. They are safe to use before payment and email providers are connected because they read product states, not external provider movement.

```bash
curl "https://api.useskillhub.com/v1/platform/overview"
curl "https://api.useskillhub.com/v1/developer/overview"
curl "https://api.useskillhub.com/v1/admin/overview"
```

Publisher overview is organization scoped and requires a publisher, owner, or admin user token:

```bash
curl "https://api.useskillhub.com/v1/publisher/overview" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The overview includes:

- Developer installed-skill and update-inbox signals.
- Publisher review, runtime-check, buyer-request, and balance signals scoped to the token organization.
- Admin review, payout, notification, incident, and runtime-risk signals.

The public marketplace page uses `/v1/platform/overview` for its operating overview section. That section presents buyer/developer, publisher, and platform-operator loops side by side so visitors can see why teams return after first discovery: project controls and update inboxes for developers, review/runtime/revenue queues for publishers, and review/risk/money/notification queues for operators. If the API is unavailable, production-like runtimes return empty/zero operating signals unless `SKILLHUB_ENABLE_DEMO_FALLBACK=true` is explicitly enabled for a controlled demo.

## Identity And RBAC

Business API writes use user access tokens with role checks. The deployment service token can bootstrap the first user token and remains available for emergency service operations, but it is no longer the product permission model. In the current gateway environment the service token is read from `SKILLHUB_ADMIN_TOKEN`; API examples call it `SKILLHUB_SERVICE_TOKEN` to distinguish it from user credentials.

Create an initial user token from the service token:

```bash
curl -X POST "https://api.useskillhub.com/v1/auth/bootstrap-token" \
  -H "Authorization: Bearer $SKILLHUB_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator@useskillhub.com",
    "displayName": "SkillHub Operator",
    "organizationSlug": "skillhub",
    "organizationName": "SkillHub",
    "role": "owner",
    "platformRole": "admin",
    "tokenName": "Initial user token"
  }'
```

The raw user token is returned only once. SkillHub stores only the token hash, prefix, and last four characters.

Request an email verification code for public signup or existing-user login:

```bash
curl -X POST "https://api.useskillhub.com/v1/auth/email/request-code" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "signup",
    "email": "builder@example.com",
    "displayName": "Agent Builder",
    "organizationName": "Agent Builder Lab",
    "organizationSlug": "agent-builder-lab",
    "role": "owner"
  }'
```

For an existing user:

```bash
curl -X POST "https://api.useskillhub.com/v1/auth/email/request-code" \
  -H "Content-Type: application/json" \
  -d '{"mode":"login","email":"builder@example.com"}'
```

`POST /v1/auth/email/request-code` creates an `email_login_challenges` record with a 10-minute HMAC-hashed 6-digit code, queues an `auth.email.code.requested` email notification event, and returns a challenge id. In non-production or when `SKILLHUB_EMAIL_AUTH_DEBUG_CODES=true`, the response may include `deliveryPreviewCode` for provider-deferred testing before the email provider is connected. Production email delivery should send the queued notification payload and keep code preview disabled.

Verify the code and create the browser/session token:

```bash
curl -X POST "https://api.useskillhub.com/v1/auth/email/verify-code" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"CHALLENGE_ID","code":"123456"}'
```

`POST /v1/auth/email/verify-code` locks and consumes the challenge in one transaction, enforces expiry and attempt limits, then either creates the new user/workspace membership for `signup` or logs an existing user into their first workspace for `login`. Successful verification writes the `email` identity with verified state, creates a 14-day `shub_user_...` session token, records audit logs, queues in-app notifications, and returns the token once so the web app can store it in the `skillhub_user_token` httpOnly cookie without showing it on the page.

Set `SKILLHUB_DISABLE_PUBLIC_SIGNUP=true` to turn public email workspace creation off for invite-only deployments; existing users can still request `mode=login` codes. The old `/v1/auth/signup` direct-token endpoint is legacy and disabled by default; it only works when `SKILLHUB_ENABLE_LEGACY_SIGNUP_TOKEN=true` is explicitly set.

Read public login-method readiness:

```bash
curl "https://api.useskillhub.com/v1/auth/providers"
```

The response lists `email`, `google`, `github`, and `token` methods. Email code signup/login is active through `/v1/auth/email/request-code` and `/v1/auth/email/verify-code`. Google and GitHub report `active` only when client id, client secret, OAuth state secret, and callback base URL are configured; otherwise the UI shows `configuration_required` instead of a fake redirect button.

OAuth provider rows include launch-operator fields:

- `callbackUrl`: the exact callback URL to register in the provider app when `SKILLHUB_AUTH_CALLBACK_BASE_URL` is configured.
- `missingConfiguration`: secret-safe environment variable names still needed before live redirect can start.
- `configuration`: boolean readiness for client id, client secret, callback base URL, and OAuth state secret.

The `/login` page surfaces these fields directly and shows success or error notices after provider callbacks return with `?oauth=connected` or `?oauth=error`.

The public app also exposes a console access map on `/`, `/login`, and `/account`. It links the product workspaces without relying on a shared password:

- `/login` and `/account` for email-code access, OAuth readiness, connected identities, session fingerprints, and workspace readiness.
- `/developer` for project, runtime key, install, policy, buyer-request, billing, team, notification, and webhook operations.
- `/publisher` for skill publishing, review repair, pricing blockers, buyer demand, feedback, revenue, payout readiness, and notification operations.
- `/admin` for review, trust, incidents, identity, launch readiness, ledger, payout, external delivery, webhook outbox, and audit operations.

The console map uses the active `/v1/auth/me` subject when present to show sign-in-required, available, or role-required states. It does not display raw tokens, passwords, OAuth secrets, email provider keys, or service tokens.

Start a provider login:

```bash
curl -i "https://api.useskillhub.com/v1/auth/oauth/google/start?returnTo=/account"
curl -i "https://api.useskillhub.com/v1/auth/oauth/github/start?returnTo=/account"
```

The start endpoint signs a short-lived state payload and redirects to the provider. Register these provider callback URLs:

```txt
https://api.useskillhub.com/v1/auth/oauth/google/callback
https://api.useskillhub.com/v1/auth/oauth/github/callback
```

The callback endpoint exchanges the provider code, reads a verified email/profile, creates or reuses the SkillHub user, reuses the first existing organization membership or creates a new owner workspace, mints a 14-day `shub_user_...` session token, stores it in the `skillhub_user_token` httpOnly cookie, and redirects back to the app `returnTo` URL.

Connected login identities are stored in `user_auth_identities`. Google and GitHub callbacks first look up the provider identity by provider user id; if it already exists, SkillHub reuses that user even when the provider email has changed. If no provider identity exists, SkillHub falls back to the verified provider email, then records the connected provider email, verification state, connection time, latest login time, and provider metadata. Email registration also records an `email` identity so the account center can distinguish modeled identity state from a raw token session.

Required OAuth environment:

```env
NEXT_PUBLIC_APP_URL=https://app.useskillhub.com
SKILLHUB_AUTH_CALLBACK_BASE_URL=https://api.useskillhub.com
SKILLHUB_AUTH_COOKIE_DOMAIN=.useskillhub.com
SKILLHUB_OAUTH_STATE_SECRET=replace-with-a-long-random-secret
SKILLHUB_EMAIL_AUTH_SECRET=replace-with-a-different-long-random-secret
SKILLHUB_EMAIL_AUTH_DEBUG_CODES=false
SKILLHUB_EMAIL_PROVIDER=resend
SKILLHUB_EMAIL_FROM=no-reply@useskillhub.com
RESEND_API_KEY=
SKILLHUB_GOOGLE_CLIENT_ID=
SKILLHUB_GOOGLE_CLIENT_SECRET=
SKILLHUB_GITHUB_CLIENT_ID=
SKILLHUB_GITHUB_CLIENT_SECRET=
```

Inspect the current token subject:

```bash
curl "https://api.useskillhub.com/v1/auth/me" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Read the active user's account center summary:

```bash
curl "https://api.useskillhub.com/v1/account" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`GET /v1/account` requires a user-scoped token. It returns the user's profile, current organization, memberships, active token-session metadata, login-method states, and workspace readiness signals: team members, active tokens, project count, skill count, unread notifications, notification preference count, billing profile readiness, invoice readiness, publisher profile status, and payout status. Login methods include provider connection metadata where available: `providerEmail`, `emailVerified`, `connectedAt`, and `lastLoginAt`. This powers `/account`, the personal center for profile, connected login methods, organization roles, notification preferences, session/token security, billing shortcuts, and payout readiness.

Read user-owned account sessions:

```bash
curl "https://api.useskillhub.com/v1/account/sessions" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`GET /v1/account/sessions` requires a user-scoped token. It returns token-session fingerprints only:

- `tokenId`, `name`, `tokenPrefix`, and `tokenLast4`.
- `createdAt`, `lastUsedAt`, `expiresAt`, and `revokedAt`.
- `organizationId`, `organizationName`, and `organizationSlug`.
- `status`: `active`, `expired`, or `revoked`.
- `isCurrent`: true for the token used on this request.

Revoke an old account session:

```bash
curl -X POST "https://api.useskillhub.com/v1/account/sessions/$TOKEN_ID/revoke" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`POST /v1/account/sessions/:tokenId/revoke` can revoke only sessions owned by the active user. It refuses to revoke the current request token; users should use `/account` sign out for the current browser session. A successful revocation writes `auth.session.revoked` to `admin_audit_logs` and queues an `account.security.session_revoked` in-app notification.

Disconnect a connected OAuth login identity:

```bash
curl -X POST "https://api.useskillhub.com/v1/account/identities/google/disconnect" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/account/identities/github/disconnect" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`POST /v1/account/identities/:provider/disconnect` requires a user-scoped token and accepts only `google` or `github`. The endpoint deletes the connected provider identity only when the user still has another OAuth provider connected or at least one separate active user token. This prevents disconnecting the last practical sign-in path while email/passwordless login remains a deferred provider integration. A successful disconnect writes `auth.identity.disconnected` to `admin_audit_logs` and queues an `account.security.identity_disconnected` in-app notification.

Admin/support operators can inspect the platform identity directory:

```bash
curl "https://api.useskillhub.com/v1/admin/identity?limit=12" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The directory returns summary counts for users, organizations, admin users, and active tokens, plus organization rows with member/project/skill/publisher/invocation/ledger signals and user rows with platform roles, memberships, token counts, and last token use. It is read-only so platform operators can understand adoption and access health before final OAuth/passwordless provider integration is connected.

Web console session:

- `/login` is now a product account entry. It shows email-code access, Google OAuth, GitHub OAuth, and token fallback states. OAuth provider redirects become live when provider credentials, callback base URL, and state secret are configured.
- `/login` lets a new user create a workspace or an existing user log in through an email code; token fallback is reserved for invites, bootstrap, or the team console.
- `/account` centralizes profile, organization role, modeled connected accounts with Google/GitHub disconnect guardrails, token security with old-session revocation, workspace readiness, and notification preferences for the active user.
- `/`, `/login`, and `/account` show the role-aware console access map so customers can discover backend routes and understand that production access uses account login, OAuth, or invite/recovery tokens rather than a public password.
- The web app validates the token with `/v1/auth/me` before storing it.
- The raw token is stored only in an httpOnly browser cookie named `skillhub_user_token`.
- Dashboard reads, project writes, publisher operations, billing controls, notification actions, trust reports, and invoice downloads prefer this cookie token.
- `SKILLHUB_USER_TOKEN` and `SKILLHUB_ADMIN_TOKEN` remain server-side fallbacks for bootstrap, demos, and emergency operator deployments.
- Production web consoles treat `NODE_ENV=production`, `VERCEL_ENV=production`, or `SKILLHUB_ENV=production` as production-like. In that mode, public marketplace, skill detail, publisher directory/profile, public feedback, admin, finance, trust, publisher, developer, team, billing, notification, and project operations return empty operational states instead of bundled demo rows when a token/API/database is unavailable.
- `SKILLHUB_ENABLE_DEMO_FALLBACK=true` may be used only for local demos or controlled staging walkthroughs where fake operator data is expected.

Role boundaries:

- Project operations require `developer`, `owner`, `admin`, or `super_admin`.
- Publisher operations require `publisher`, `owner`, `admin`, or `super_admin`.
- Review operations require `reviewer`, `admin`, or `super_admin`.
- Finance, refunds, disputes, and payouts require `finance`, `admin`, or `super_admin`.
- Platform admin read operations require `support`, `admin`, or `super_admin`.

Project writes are organization scoped. When a user token installs a skill, updates a project policy, creates a project API key, or revokes a project API key, the gateway resolves the project organization and requires a matching organization membership. New project records are created under the user token's organization, not a global demo organization.

Organization owners and admins can manage team access before a full OAuth/passwordless provider is connected:

```bash
curl "https://api.useskillhub.com/v1/organization/team" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/organization/team/members" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"finance@example.com","displayName":"Finance Operator","role":"finance"}'

curl -X POST "https://api.useskillhub.com/v1/organization/team/members/$USER_ID/tokens" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokenName":"Finance console access"}'

curl -X POST "https://api.useskillhub.com/v1/organization/team/members/$USER_ID/remove" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Member roles are `owner`, `admin`, `developer`, `publisher`, `reviewer`, and `finance`. Adding a member creates or reuses the user record and upserts the organization membership. Token creation returns the raw `shub_user_*` token once, stores only the hash/prefix/last4, and lets that member sign in through `/login` before a final auth provider is connected. Removing a member deletes the organization membership and revokes that member's organization-scoped user access tokens. Each change records an admin audit log and queues an in-app account notification for the organization.

Organization webhook endpoints are stored before external delivery workers are connected. They let teams configure callback URLs, event topics, status, and signing-secret fingerprints:

```bash
curl "https://api.useskillhub.com/v1/organization/webhooks" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/organization/webhooks" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/skillhub/webhooks",
    "description": "Operations automation receiver",
    "events": ["skill.update", "runtime.incident", "account.security"],
    "status": "active"
  }'

curl -X PUT "https://api.useskillhub.com/v1/organization/webhooks/$ENDPOINT_ID" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"paused","events":["finance.billing","publisher.payout"]}'

curl -X POST "https://api.useskillhub.com/v1/organization/webhooks/$ENDPOINT_ID/rotate-secret" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Webhook URLs must use `https`. Endpoint statuses are `active`, `paused`, and `disabled`. Create and rotate responses return the raw `whsec_*` signing secret once; SkillHub stores only the hash, prefix, and last four characters until the final delivery worker/provider integration is connected. Each create, update, or rotation records an admin audit row and queues an in-app account notification.

## Developer Project Operations

These endpoints model the developer side of the marketplace: installed skills, permission policies, and update/deprecation/incident inboxes.

Create a developer project:

```bash
curl -X POST "https://api.useskillhub.com/v1/developer/projects" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Research Agent","slug":"research-agent"}'
```

Project creation is scoped to the token organization. The slug must be unique inside that organization. The API writes a project audit log and an in-app notification so the project lifecycle is visible before any runtime API keys or installed skills exist.

Read the developer project operations view:

```bash
curl "https://api.useskillhub.com/v1/developer/projects?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response is scoped to the token organization and includes each project with active/revoked API key counts, installed/approved/owner-review skill counts, policy count, monthly budget, runtime calls, success/error/blocked counts, average latency, billable usage, gross usage cost, active subscriptions, and update-inbox count.

Read a single developer project command-center view:

```bash
curl "https://api.useskillhub.com/v1/developer/projects/research-agent" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response is scoped to the token organization and returns the project summary plus installed skills, per-skill policy and budget state, per-skill runtime and usage metrics, API key metadata, update inbox items, recent runtime invocations, subscription records, and invoice summaries. This powers `/dashboard/projects/[slug]` so developers can manage one agent project without stitching together many operational endpoints.

Subscription records in this response include buyer-safe ledger visibility for the current period:

- `ledgerState`: `trial_access`, `awaiting_post`, `posted`, `renewal_due`, `not_billable`, or `not_postable`.
- `ledgerTransactionId`, `ledgerSourceReference`, `ledgerGrossCents`, `ledgerCurrency`, `ledgerStatus`, and `ledgerPostedAt` when the active subscription period has been posted to `transactions`.
- `ledgerInvoiceCount`, the count of generated invoice line items already linked to that subscription-period transaction.
- `renewalReady`, true only when the active subscription period has expired and its positive subscription transaction is already posted, allowing the admin renewal processor to advance the period without skipping revenue.

This keeps project operators from treating subscriptions as a black box: trialing access, unposted active periods, posted billable periods, invoice linkage, and renewal readiness are visible from the same project command-center payload.

Read installed skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Install or update a skill version for a project:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skillSlug":"browser-research","version":"0.1.0"}'
```

Pause, restore, or remove an installed skill:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/installed-skills/browser-research/status" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended","reason":"Runtime incident triage while the publisher confirms allowed domains."}'
```

Allowed install statuses:

- `installed`: active and eligible for runtime policy checks.
- `suspended`: visible in the project console but blocked at runtime.
- `removed`: retained for audit and restoration, but blocked at runtime.

Install status changes are scoped to the token organization and write audit plus in-app notification records. Runtime invocation rejects any install that is not `installed`.
Changing an installed skill to `suspended` or `removed` requires a human-readable `reason`; the project console also requires a confirmation phrase before submitting the change. Restoring to `installed` may use the default audit reason when no reason is supplied.

Create a project subscription from a subscription-priced skill:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/subscriptions" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "crm-enrichment",
    "status": "trialing"
  }'
```

`POST /v1/projects/:projectSlug/subscriptions` requires an organization-scoped project operator token. The project must belong to the token organization. The skill must be public, verified, priced as `subscription`, and have an active price. Optional request fields are `priceId`, `status` (`trialing` or `active`), and `trialDays` (clamped to 1-90 days). If a project already has a subscription row for the skill, SkillHub refreshes the latest row with the current active price and period instead of creating duplicate active billing state. Creation is provider-deferred until payment checkout is connected, but it still writes `subscriptions`, `admin_audit_logs`, and an in-app `project_subscription.created` or `project_subscription.refreshed` notification so runtime governance, project dashboards, and future payment reconciliation have durable state.

Pause, restore, or cancel a project subscription:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/subscriptions/demo-subscription-browser-research/status" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"paused","reason":"Budget owner requested a temporary usage freeze."}'
```

Allowed project-managed subscription statuses:

- `active`: runtime can use subscription-priced skills when the current period is still valid.
- `paused`: the subscription is retained for restoration, but runtime calls are blocked.
- `canceled`: the subscription is closed and cannot be restored from the project console.

Subscription status changes are scoped to the token organization and write audit plus in-app notification records. Runtime invocation rejects subscription-priced skills when the project has no active or trialing subscription, when the period is expired, or when the subscription is paused, past due, or canceled.
Changing a project subscription to `paused` or `canceled` requires a human-readable `reason`; the project console also requires a confirmation phrase before submitting the change. Restoring to `active` may use the default audit reason when no reason is supplied.

Read project skill policies:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/policies" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Update a project skill policy:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/policies/browser-research" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxPermissionLevel": "medium",
    "allowNetwork": true,
    "allowBrowser": true,
    "filesystemAccess": "none",
    "monthlyBudgetCents": 48000,
    "rateLimitPerMinute": 60,
    "approvalRequired": false
  }'
```

Read the installed-skill update inbox:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/update-inbox" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Each update item includes the installed version, target version, target review status, and an adoption state:

```json
{
  "id": "update-id",
  "skillSlug": "browser-research",
  "eventType": "new_version",
  "currentVersion": "0.1.0",
  "targetVersion": "0.2.0",
  "targetReviewStatus": "approved",
  "adoptionState": "ready"
}
```

`adoptionState` values are:

- `ready`: a reviewed target version can be adopted.
- `awaiting_review`: the target version exists but has not been approved.
- `missing_version`: the update does not point to a version record.
- `removed_install`: the project removed the install and must reinstall before adopting.
- `not_version_update`: security, incident, deprecation, or operational updates can be acknowledged, scheduled, marked handled, or ignored but do not switch version pins.

Handle an update inbox item:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/update-inbox/demo-update-browser-research/action" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "scheduledFor": "2026-06-05T14:00:00.000Z",
    "note": "Review in the next agent release window."
  }'
```

Allowed update action statuses:

- `acknowledged`: the project operator has seen the update and left it in the queue.
- `scheduled`: the update has an owner-visible planned handling time.
- `adopted`: for `new_version` events, SkillHub updates the project's installed `skill_version_id` to the approved target version, recalculates install approval state from the target manifest, and then removes the update from the active inbox. If the target version is draft, queued, rejected, blocked, missing, or belongs to a removed install, the API rejects adoption. For non-version operational events, `adopted` means the update has been handled and leaves the active inbox.
- `ignored`: the project intentionally dismissed the update and it leaves the active inbox.

List project saved skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/saved-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Save a skill to a project collection before installing or buying:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/saved-skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "collectionName": "evaluation"
  }'
```

The public skill detail page exposes the same project-scoped workflow: developers can choose one of their projects, save the current listing into a named evaluation collection, or install the skill directly into the project's installed-skill inventory. The install action calls `/v1/projects/:projectSlug/installed-skills`; high-permission skills still enter owner-review policy state through the existing project install rules.

Remove a saved skill:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/saved-skills/SAVED_SKILL_ID/remove" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Project installed skills, project policies, update inbox reads, and saved skill reads are protected by user access tokens and scoped to the token organization. Writes are protected by user access tokens and role checks. Update actions and saved-skill changes write project-scoped state, admin audit records, and in-app notifications. Project API keys are separate runtime credentials and cannot manage project policy.

The project detail console at `/dashboard/projects/[slug]` exposes the same policy, install, update-inbox, and saved-skill controls so developers can approve owner-review skills, adjust permission limits, set filesystem/network/browser/secret access, tune rate limits, update monthly budget caps, pause risky skills, restore suspended installs, handle version/security/incidents updates, save candidate skills for evaluation, or remove skills without leaving the workspace.

List generated project invoices:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Generate or refresh an invoice from posted project transactions:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/invoices/generate" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "usd",
    "periodStart": "2026-06-01T00:00:00.000Z",
    "periodEnd": "2026-07-01T00:00:00.000Z"
  }'
```

Read an invoice with line items:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices/INVOICE_ID" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Download an invoice CSV:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/invoices/INVOICE_ID/download" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -o skillhub-invoice.csv
```

Invoices are generated from immutable posted `transactions`, not raw invocation logs. Regenerating the same project, period, and currency refreshes the same invoice totals and line items. Generation writes an audit record and in-app notification before payment-provider invoice APIs are connected.

## Organization Billing

Read the current organization billing readiness state:

```bash
curl "https://api.useskillhub.com/v1/organization/billing" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Update invoice billing profile:

```bash
curl -X PUT "https://api.useskillhub.com/v1/organization/billing/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "billingName": "Acme AI Ops",
    "billingEmail": "billing@example.com",
    "taxId": "US-123456",
    "country": "US",
    "addressLine1": "123 Market Street",
    "city": "San Francisco",
    "region": "CA",
    "postalCode": "94105",
    "invoiceNotes": "Route invoices to AI operations cost center."
  }'
```

Add or update a payment method state record. `providerPaymentMethodId` is a provider reference only; send no raw card or bank credentials to SkillHub:

```bash
curl -X POST "https://api.useskillhub.com/v1/organization/billing/payment-methods" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "manual",
    "providerCustomerId": "cus_manual_demo",
    "providerPaymentMethodId": "pm_manual_invoice",
    "methodType": "invoice",
    "status": "pending",
    "isDefault": true
  }'
```

Update an existing payment method state:

```bash
curl -X PUT "https://api.useskillhub.com/v1/organization/billing/payment-methods/PAYMENT_METHOD_ID" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready","isDefault":true}'
```

Organization billing is scoped to the token organization and available to owner/admin/finance roles. Payment method records store provider references, status, brand, and last4-style metadata only; raw card or bank credentials must stay with the final payment provider integration. Every billing profile or payment method state change writes audit and in-app notification records.

## Project API Keys

Project API keys authenticate agent runtime calls. The raw key is returned only once when it is created; SkillHub stores only a hash plus display metadata.
Project API key management is tenant scoped: project operators can list, create, and revoke keys only for projects in their authorized organization. The project detail console at `/dashboard/projects/[slug]` exposes the same create-and-revoke workflow and shows the raw key only immediately after creation.

Create a project API key:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/api-keys" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Research Agent runtime"}'
```

List project API keys:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/api-keys" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Revoke a project API key:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/api-keys/$KEY_ID/revoke" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Replacement key is deployed and the old runtime key can be retired."}'
```

Revoking a project API key requires a human-readable `reason`, writes `project_api_key.revoked` audit and in-app notification records, and immediately blocks runtime requests using that key. The project console requires typing `REVOKE` or the key's last four characters before submitting the revocation.

## Runtime Invocation

Runtime calls use a project API key, not a user or service token.

```bash
curl -X POST "https://api.useskillhub.com/v1/runtime/invoke" \
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "input": {
      "query": "MCP server registry trends"
    }
  }'
```

Before recording a successful invocation, the gateway checks:

- Project API key is valid and not revoked.
- Skill is installed for the project.
- Installed version matches when a version is requested.
- Skill is verified or deprecated, not draft, rejected, or suspended.
- Project install is approved.
- Project policy allows the skill permission profile.
- Rate limit and monthly budget are not exceeded.

Every allowed call writes a `skill_invocations` row. Successful calls also write a `usage_events` row. Per-call prices make the usage event billable; free and subscription skills still record usage without direct per-call billing. Subscription-priced skills must have an active or trialing project subscription whose current period has not expired; paused, past-due, canceled, missing, or expired subscriptions are blocked before execution and recorded as blocked invocations.

External runtime proxying is disabled by default. When `SKILLHUB_RUNTIME_PROXY=enabled`, HTTP runtime skills can be proxied to their manifest entrypoint. Otherwise the gateway returns a metered contract response so policy, logging, and billing paths can be tested safely.

Signed-in developers can run a non-billable project test invocation from the web console before handing a project API key to an agent:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/runtime/test" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "input": {
      "query": "MCP server registry trends"
    }
  }'
```

The test endpoint requires an organization-scoped developer/owner/admin token and the target project must belong to that organization. It reuses the same install, version, verification, approval, policy, subscription, rate-limit, budget, invocation-log, and runtime execution path as `/v1/runtime/invoke`, but marks successful usage events as non-billable so console tests do not create payable ledger activity. The project command center at `/dashboard/projects/[slug]` exposes this as a runtime test panel beside installed-skill policy controls and recent invocation logs.

SDK:

```ts
import { SkillHubClient } from "@useskillhub/sdk";

const skillhub = new SkillHubClient({
  apiKey: process.env.SKILLHUB_PROJECT_API_KEY,
});
const result = await skillhub.run("browser-research", {
  query: "MCP server registry trends",
});
```

CLI:

```bash
SKILLHUB_API_KEY="$SKILLHUB_PROJECT_API_KEY" \
  skillhub run browser-research '{"query":"MCP server registry trends"}'
```

## Publisher Skill Operations

Publisher skill writes are organization scoped. A publisher token can publish, submit for review, and price only skills owned by its organization. The deployment service token can still perform controlled bootstrap operations, but product writes should use `SKILLHUB_USER_TOKEN`.

Read the publisher skill operations view:

```bash
curl "https://api.useskillhub.com/v1/publisher/skills?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response includes each owned skill's latest version, version history, verification state, latest review signal, review SLA state, runtime check summary, latest runtime check details, install count, call count, success/error/blocked counts, average latency, billable usage, gross usage revenue, pricing state, commercial paid-activation blockers, quality score, listing checklist, and publisher-visible marketplace distribution signal.

`commercial` explains whether the skill can activate paid pricing and why it is blocked:

```json
{
  "commercial": {
    "paidActivationReady": false,
    "blockers": ["review", "payout", "terms"],
    "publisherStatus": "active",
    "payoutStatus": "verification_required",
    "termsAcceptedAt": null,
    "termsVersion": null,
    "requiresTermsVersion": "2026-06-05-prelaunch-operating-terms"
  }
}
```

Possible blocker values are `publisher_profile`, `publisher_status`, `payout`, `terms`, `current_terms`, and `review`.

`runtime.checks` contains the latest result for each automated review-check type, so publishers can see the exact reason behind pass, warning, failed, queued, or running states without waiting for an admin note:

```json
{
  "runtime": {
    "checkCount": 4,
    "passedCount": 2,
    "failedCount": 1,
    "warningCount": 1,
    "health": "needs_attention",
    "checks": [
      {
        "checkType": "runtime",
        "status": "failed",
        "message": "Runtime declaration needs a reachable secure endpoint.",
        "isBlocking": true,
        "fixCategory": "runtime",
        "targetField": "runtime.entrypoint",
        "nextAction": "Use a reachable HTTPS endpoint before resubmitting this version.",
        "latencyMs": null,
        "checkedAt": "2026-06-05T08:00:00.000Z",
        "createdAt": "2026-06-05T08:00:00.000Z"
      }
    ]
  }
}
```

`message` is evidence copy for humans. `isBlocking`, `fixCategory`, `targetField`, and `nextAction` are the structured remediation contract used by publisher repair loops and admin review cards. Warnings may be non-blocking but still require reviewer notes or publisher evidence.

Publisher runtime health is derived from the latest checks only: `failed` becomes `needs_attention`, `warning`, `queued`, or `running` becomes `warning`, passed checks become `healthy`, and missing checks remain `not_checked`.

`versions` gives publishers a durable skill-version management surface:

```json
{
  "versions": [
    {
      "id": "6e3d...",
      "version": "0.2.0",
      "status": "draft",
      "reviewStatus": null,
      "reviewSubmittedAt": null,
      "reviewSlaBusinessDays": 3,
      "reviewSlaDueAt": null,
      "reviewSlaHoursRemaining": null,
      "reviewQueueAgeHours": null,
      "reviewSlaStatus": "not_submitted",
      "runtimeCheckCount": 0,
      "installCount": 0,
      "callCount": 0,
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  ]
}
```

Read the version history for one owned skill:

```bash
curl "https://api.useskillhub.com/v1/publisher/skills/browser-research/versions?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Create a new version or update an unlocked draft version:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/skills/browser-research/versions" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "manifest": {
      "schemaVersion": "0.1",
      "name": "browser-research",
      "displayName": "Browser Research",
      "version": "0.2.0",
      "description": "Research a web topic and return concise findings with source URLs.",
      "tags": ["research", "browser"],
      "runtime": { "type": "http", "entrypoint": "https://example.com/skillhub/browser-research" },
      "permissions": { "network": true, "browser": true, "filesystem": "none", "secrets": [] },
      "inputSchema": { "type": "object", "properties": { "query": { "type": "string" } } },
      "outputSchema": { "type": "object", "properties": { "summary": { "type": "string" } } }
    }
  }'
```

Version rules:

- `manifest.name` must match the managed skill slug.
- Approved versions and versions installed by projects are locked; publishers must create a new semantic version instead of mutating them.
- Creating a new version writes a `skill_update_events` row, an audit log row, and an in-app notification event before final email/webhook delivery is connected.
- Public discovery prefers approved versions, so a draft or submitted update does not silently replace a verified contract.
- Review SLA fields are derived from the latest review submission for that exact version. `reviewSlaStatus` can be `not_submitted`, `on_track`, `due_soon`, `overdue`, or `decided`; the default display target is three business days from `reviewSubmittedAt`.

Submit a specific version for review:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/skills/browser-research/versions/0.2.0/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`marketplace` shows the publisher how the listing is currently distributed and what to improve next:

```json
{
  "marketplace": {
    "placement": "standard",
    "reason": "Keep improving runtime checks before featured placement.",
    "endsAt": null,
    "updatedAt": "2026-06-05T08:00:00.000Z",
    "improvementHints": [
      { "key": "fix_runtime_checks", "severity": "critical" },
      { "key": "collect_feedback", "severity": "warning" }
    ]
  }
}
```

Placements are `featured`, `standard`, and `suppressed`. Improvement hints are publisher-safe guidance derived from visibility, review state, latest runtime checks, open incidents, success rate, feedback, usage, and active marketplace curation. Admin-only internal ranking boost values are not returned to publishers.

If a skill slug already belongs to another organization, SkillHub rejects the publish/update request instead of moving ownership silently.

The dashboard publisher skill operations panel uses this view with the review-submission and pricing endpoints below. Publishers can inspect each owned skill's quality checklist, latest automated review-check reasons, review SLA, install/call/success signals, marketplace distribution state, recent published buyer feedback, submit the latest version for review, respond to published feedback, and save free, per-call, or subscription pricing without leaving the workspace. The same response powers the review repair loop by combining `review`, `versions`, and `runtime.checks` into exact-version status, reviewer notes, automated check evidence, SLA pressure, and repair actions for rejected, blocked, warning, overdue, or unsubmitted versions.
The `/publish` entry page now also keeps the saved draft response's exact semantic version and can submit that same version for review immediately after draft save, so first-time publishers can move from manifest upload to automated review evidence without manually finding the version in `/publisher`.

## Buyer Request Board

Buyer requests let developer organizations ask for missing agent skills and let publishers claim demand before building. The workflow is stored before payment and email integrations are connected, and every state change records audit and in-app notification rows.

Developer-side reads and creation:

```bash
curl "https://api.useskillhub.com/v1/developer/buyer-requests?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/developer/buyer-requests" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Slack incident summarizer",
    "description": "Summarize incident threads into timeline, owner actions, and customer-impact notes.",
    "category": "ops",
    "bountyCents": 45000,
    "currency": "usd",
    "dueAt": "2026-06-30T00:00:00.000Z"
  }'
```

Publisher-side request board:

```bash
curl "https://api.useskillhub.com/v1/publisher/buyer-requests?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Publishers see open requests plus requests claimed by their own publisher organization. They can claim open requests and submit builds. A build submission is a delivery package, not just a status change: it must reference a skill and exact version owned by the publisher organization, and that version must already have entered platform review (`queued`, `in_review`, or `approved`; rejected or blocked versions are not accepted).

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/buyer-requests/$REQUEST_ID/claim" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/publisher/buyer-requests/$REQUEST_ID/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "slack-incident-summarizer",
    "version": "0.1.0",
    "deliveryNote": "Submitted the reviewed skill version with sample incident timeline output and console test evidence.",
    "evidenceUrl": "https://example.com/skillhub/slack-incident-summarizer-demo"
  }'
```

Developers can match, close, or cancel requests owned by their organization:

```bash
curl -X POST "https://api.useskillhub.com/v1/developer/buyer-requests/$REQUEST_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"matched","reason":"Submitted skill satisfies the request."}'
```

Buyer request rows include the delivery package when a publisher has submitted work:

- `submittedSkillId`, `submittedSkillSlug`, `submittedSkillName`, and `submittedSkillVerificationStatus`.
- `submittedSkillVersionId`, `submittedSkillVersion`, and `submittedSkillReviewStatus`.
- `deliveryNote`, `evidenceUrl`, and `submittedAt`.
- `decisionNote` and `decidedAt` after the buyer records `matched`, `closed`, or `canceled`.

Buyer request states:

- `open`
- `claimed`
- `submitted`
- `matched`
- `closed`
- `canceled`

The dashboard buyer request exchange uses these endpoints directly: developers can create requests and record match/close/cancel decisions, while publishers can claim open demand and submit builds from the same workspace.

## Skill Pricing

Read skill prices:

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research/prices"
```

Set a skill price:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/prices" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "billingModel": "per_call",
    "unitAmountCents": 2,
    "currency": "usd",
    "status": "active"
  }'
```

Setting a price requires publisher, owner, admin, or super-admin authorization and is scoped to the token organization. Publishers can save free pricing, paid draft pricing, and archived pricing while commercial setup is incomplete.

Active paid pricing is a commercial-readiness gate. A `per_call` or `subscription` price with `status=active` requires:

- An existing publisher profile.
- Publisher profile status `active`.
- Publisher payout status `verified`.
- Current publisher operating terms accepted with the current terms version.
- Skill verification status `verified`.

If any prerequisite is missing, the API rejects the write with an actionable error such as `Paid active pricing requires verified payout readiness.`, `Paid active pricing requires accepting the current publisher operating terms.`, or `Paid active pricing requires a verified skill review.` The publisher dashboard also reads `/v1/publisher/skills` commercial blockers and shows them beside the pricing controls.

Supported `billingModel` values:

- `free`
- `per_call`
- `subscription`

Until final payment-provider onboarding is connected, the internal publisher and payout states are still modeled in the database so pricing, metering, and ledger behavior can be tested safely.

## Skill Feedback And Reviews

Public skill feedback is a marketplace trust signal. Anyone can read published feedback, while submission requires a user-scoped token and starts in moderation.

Read published feedback and rating summary:

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research/feedback?limit=12"
```

Submit feedback for moderation:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/feedback" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "title": "Reliable for daily research agents",
    "body": "The manifest is clear, permissions match the workflow, and the output schema is stable.",
    "useCase": "Daily market research",
    "projectSlug": "research-agent"
  }'
```

Feedback fields:

- `rating`: integer from 1 to 5.
- `title`: short public summary.
- `body`: operational detail for developers and publishers.
- `useCase`: optional context that helps future buyers evaluate fit.
- `projectSlug`: optional organization-scoped project link when the reviewer used the skill inside a project.

Platform trust operators can read and decide the queue:

```bash
curl "https://api.useskillhub.com/v1/admin/skill-feedback?status=pending&limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/admin/skill-feedback/$FEEDBACK_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"publish","reason":"Useful implementation feedback from a verified project operator."}'
```

Decision actions are `publish`, `hide`, `reject`, and `reopen`. Decisions update moderation state, write an admin audit log, and queue an in-app notification for the skill publisher. The public skill detail page shows only `published` feedback and the rating summary.

Publishers can respond to published feedback for skills owned by their organization:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/skill-feedback/$FEEDBACK_ID/response" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Thanks for the production note. The next reviewed version will add source timestamps while keeping the current output contract pinned."
  }'
```

Rules:

- The token must be user-scoped and organization-scoped with publisher, owner, admin, or super-admin privileges.
- The feedback must belong to a skill owned by the token organization.
- Only `published` feedback can receive a publisher response.
- Saving a response updates the public feedback row, writes `skill_feedback.publisher_response` to `admin_audit_logs`, and queues an in-app `skill.feedback.publisher_response` notification for the reviewer organization when available.
- `/v1/publisher/skills` includes recent published feedback rows and existing publisher response state so the publisher workspace can reply without a separate lookup.

## Runtime Incident Operations

Runtime incidents are trust-operator records for production failures that affect installed skills, agent projects, or marketplace confidence. They are separate from user abuse reports: an incident tracks operational impact and recovery, while an abuse report tracks policy, security, privacy, billing, or malicious-behavior review.

Read the admin incident queue:

```bash
curl "https://api.useskillhub.com/v1/admin/incidents?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN"
```

Open a runtime incident for a skill:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/incidents" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skillSlug": "browser-research",
    "severity": "high",
    "title": "Citation runtime timeout spike",
    "summary": "Runtime p95 latency crossed the project policy threshold after a source parsing change."
  }'
```

Update an incident decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/incidents/$INCIDENT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "monitoring",
    "severity": "high",
    "reason": "Publisher rolled back the parser and project operators should watch p95 latency for the next hour."
  }'
```

Incident statuses are `open`, `monitoring`, `resolved`, and `postmortem`. Severities are `low`, `medium`, `high`, and `critical`. Creating or updating an incident writes `skill_incidents`, records a skill update event for installed-skill inboxes, writes an admin audit log, and queues an in-app notification for the publisher organization. `resolved` and `postmortem` decisions set `resolved_at` while keeping the historical audit trail intact.

## Finance Ledger

SkillHub never pays publishers from raw usage logs or raw subscription rows. Billable usage and active paid subscription periods must be posted into the ledger first:

```text
usage_events
-> transactions
-> transaction_splits
-> publisher_balances
```

Subscription transactions use `transactions.source_type = 'subscription'` plus a durable `source_reference` in the form `subscription:<subscription_id>:<period_start>`. The reference is unique for subscription transactions, so a finance job can be retried without posting the same subscription period twice. `trialing` subscriptions can unlock runtime testing during a valid period, but only `active` subscription periods create revenue ledger entries.

Read the finance ledger:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/ledger" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Read the current publisher's scoped revenue ledger:

```bash
curl "https://api.useskillhub.com/v1/publisher/finance/ledger" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The publisher ledger is read-only and scoped to the token organization. It returns the same summary and recent transaction shape as the admin finance ledger, but only for transaction splits and balances attached to the current publisher profile. This is the source for the dashboard revenue ledger shown to publishers.

Ledger summaries include source-mix fields so publishers and finance operators can distinguish posted per-call usage revenue from posted subscription-period revenue without reading raw transaction rows:

- `usageGrossCents`, `usagePlatformFeeCents`, `usagePublisherShareCents`, and `usageTransactionCount`.
- `subscriptionGrossCents`, `subscriptionPlatformFeeCents`, `subscriptionPublisherShareCents`, and `subscriptionTransactionCount`.

Recent transaction rows include `sourceType` and `sourceReference`. For subscription revenue, `sourceReference` points to the idempotent subscription-period reference, letting the publisher dashboard explain which posted period produced the earning.

Read active and historical commission rules:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/commission-rules?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Create a new commission rule version:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/commission-rules" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Public marketplace 20/80 split",
    "platformFeeBps": 2000,
    "publisherShareBps": 8000,
    "startsAt": "2026-06-05T12:00:00.000Z",
    "reason": "Launch default split approved by finance."
  }'
```

Commission rule management requires `finance`, `admin`, or `super_admin`. `publisherShareBps` may be omitted; if omitted, the API sets it to `10000 - platformFeeBps`. The platform and publisher bps must total `10000`. Creating a rule writes an admin audit log, queues an in-app finance notification, and closes any overlapping open rule at the new `startsAt` time. Existing `transaction_splits` keep their original `commission_rule_id`, so new rules affect future ledger posting without rewriting historical money records.

Post unprocessed billable usage into the ledger:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/process-usage" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":50}'
```

Ledger posting:

- Creates a posted `transactions` row.
- Creates a `transaction_splits` row using the active commission rule.
- Creates a pending `publisher_balances` row.
- Links the `usage_events` row to the transaction.
- Records a queued in-app notification event.

Post unprocessed active subscription periods into the ledger:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/process-subscriptions" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":50}'
```

Subscription ledger posting requires `finance`, `admin`, or `super_admin` and:

- Selects `active` subscription rows whose current period has started, whose period range is valid, and whose attached price is a positive subscription price.
- Skips `trialing`, `paused`, `past_due`, `canceled`, missing-price, free, and already-posted periods.
- Creates one posted `transactions` row with `source_type='subscription'` and an idempotent `source_reference`.
- Creates a `transaction_splits` row using the active commission rule.
- Creates a pending `publisher_balances` row.
- Records in-app billing notifications for the publisher organization and, when different, the project organization.

Renew posted, expired active subscription periods:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/renew-subscriptions" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":50}'
```

Subscription renewal requires `finance`, `admin`, or `super_admin` and:

- Selects `active` subscription rows whose current period has expired.
- Requires the expiring period to already have a posted positive `subscription` transaction with the matching `source_reference`.
- Advances `current_period_start` to the previous `current_period_end` and advances `current_period_end` by one month.
- Skips unposted expired periods so finance can run `process-subscriptions` first instead of silently losing revenue.
- Writes `billing.subscription_period.renewed` audit and in-app notification records for the publisher organization and, when different, the project organization.

After renewal, the new period can be posted through `POST /v1/admin/finance/process-subscriptions`. If a deployment is catching up multiple missed months, operators should alternate subscription posting and renewal batches until both unposted and renewable counts reach zero.

Release matured pending balances:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/release-balances" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":100}'
```

Balances start as `pending` and become `available` only after their risk/refund window has elapsed. The default balance delay is 14 days and can be configured with `SKILLHUB_BALANCE_DELAY_DAYS`.

## Payout Workflow

Payout provider movement is still deferred, but SkillHub now models the internal payout state machine and reserves exact balance rows before a payout can be marked paid.

Read or update the publisher profile and payout account readiness:

```bash
curl "https://api.useskillhub.com/v1/publisher/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

```bash
curl -X PUT "https://api.useskillhub.com/v1/publisher/profile" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"SkillHub Publisher","status":"active"}'
```

If `status` is omitted, the existing publisher status is preserved. This lets the dashboard update the public display name without accidentally restoring a restricted or suspended publisher profile.

The profile response includes `termsAcceptedAt`, `termsAcceptedByUserId`, and `termsVersion`, so publisher dashboards can block paid-publishing readiness until the current operating terms are accepted.

Create a payout-account onboarding handoff:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payout-account/onboarding" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "manual_deferred",
    "returnUrl": "https://app.useskillhub.com/dashboard",
    "refreshUrl": "https://app.useskillhub.com/dashboard"
  }'
```

Complete or block the deferred onboarding state:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payout-account/onboarding/complete" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SESSION_ID","status":"verified","reason":"Provider verification passed."}'
```

Current onboarding sessions are provider-deferred records. They model provider handoff URLs, session status, payout account status, publisher payout readiness, audit logs, and notification events before the final payment provider API is connected.

The dashboard publisher account panel uses these same endpoints. Publishers can edit the public publisher name, create a deferred payout-account handoff, open the handoff URL, and record a readiness decision against the latest onboarding session or payout account. The final Stripe/Connect-style provider integration can replace the manual provider handoff without changing the surrounding dashboard state model.

Read publisher payout readiness:

```bash
curl "https://api.useskillhub.com/v1/publisher/payouts" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response explains whether the publisher can request payout and why not:

```json
{
  "publisherProfile": {
    "id": "PUBLISHER_PROFILE_ID",
    "displayName": "SkillHub Publisher",
    "status": "active",
    "payoutStatus": "verified"
  },
  "balances": {
    "pendingCents": 126000,
    "availableCents": 482000,
    "blockedCents": 0,
    "paidCents": 940000,
    "currency": "usd",
    "minPayoutCents": 5000,
    "reviewThresholdCents": 100000
  },
  "readiness": {
    "canRequest": true,
    "blockers": [],
    "expectedStatus": "review",
    "nextAction": "request_payout"
  },
  "payouts": [
    {
      "id": "PAYOUT_ID",
      "amountCents": 482000,
      "currency": "usd",
      "status": "review",
      "balanceCount": 4,
      "reviewReason": "Amount exceeds manual review threshold.",
      "failureReason": null,
      "providerReference": null,
      "retryCondition": null,
      "nextAction": "await_finance_review"
    }
  ]
}
```

Readiness blocker values:

- `publisher_profile_missing`
- `publisher_not_active`
- `publisher_payout_not_verified`
- `payout_account_missing`
- `payout_account_not_verified`
- `no_available_balance`
- `amount_below_minimum`

Request a payout for all currently available publisher balances in a currency:

```bash
curl -X POST "https://api.useskillhub.com/v1/publisher/payouts" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currency":"usd"}'
```

The current provider-deferred workflow requests all available balances by currency. This avoids partial balance mutation until the final payment provider is connected.

The dashboard withdrawal panel calls this endpoint directly when the publisher has a verified payout account and available balance above the configured threshold. The request reserves all eligible available balances and moves them into the finance payout queue.

Read the admin payout queue:

```bash
curl "https://api.useskillhub.com/v1/admin/payouts?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Record a payout decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/payouts/$PAYOUT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","reason":"KYC and balance review passed."}'
```

Supported payout actions:

- `approve`: moves `requested` or `review` payouts to `processing`, clears retry condition, and sets `nextAction` to `await_provider_processing`.
- `mark_paid`: marks the payout paid, moves linked publisher balances to `paid`, stores `providerReference`, and sets `nextAction` to `complete`.
- `fail`: marks the payout failed, releases linked balances back to `available`, stores `failureReason`, stores an optional `retryCondition`, and sets `nextAction` to `request_again_after_failure`.
- `block`: blocks the payout, keeps linked balances blocked, requires both `reason` and `retryCondition`, and sets `nextAction` to `resolve_blocker_before_retry`.

Example blocked decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/payouts/$PAYOUT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "block",
    "reason": "Payout account ownership evidence is incomplete.",
    "retryCondition": "Upload matching business ownership evidence and complete payout-account verification before requesting again."
  }'
```

Every payout request and decision records an audit log and a queued in-app notification event.

## Refund And Dispute Workflow

Refunds and disputes create adjustment records instead of mutating original usage or subscription transactions.

Read the admin refund queue:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/refunds?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Request a refund against a positive usage or subscription transaction:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/refunds" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TRANSACTION_ID",
    "amountCents": 9600,
    "reason": "Duplicate billable call."
  }'
```

Record a refund decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/refunds/$REFUND_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"post","reason":"Approved after usage review."}'
```

Supported refund actions:

- `approve`: marks the refund approved but does not move ledger value yet.
- `reject`: rejects the refund request with an audit reason.
- `post`: creates a negative `transactions` row, negative `transaction_splits` row, and reversed publisher balance adjustment.
- `fail`: records that the provider or operating step failed.

Read the admin dispute queue:

```bash
curl "https://api.useskillhub.com/v1/admin/finance/disputes?limit=50" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Open a dispute:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/disputes" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TRANSACTION_ID",
    "amountCents": 7600,
    "status": "warning_needs_response",
    "reason": "Card network warning needs evidence."
  }'
```

Resolve or update a dispute:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/finance/disputes/$DISPUTE_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"lost","reason":"Evidence window expired.","postRefund":true}'
```

If a dispute is marked `lost` and `postRefund` is not false, SkillHub creates and posts the corresponding refund adjustment automatically. Every refund and dispute state change records admin audit and queued notification events.

Publisher and developer-facing history is read-only and tenant scoped. Publishers see adjustment records for skills owned by their organization; project operators see adjustment records for their own project.

```bash
curl "https://api.useskillhub.com/v1/publisher/refunds?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/publisher/disputes?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/projects/research-agent/refunds?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"

curl "https://api.useskillhub.com/v1/projects/research-agent/disputes?limit=20" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

These endpoints return transaction, skill, project, amount, status, reason, and provider/reference fields. They do not create money movement; finance users still operate refund and dispute decisions through `/v1/admin/finance/*`.

## Notification Preferences

Notification preferences are user-scoped settings for the event topics that keep developers, publishers, and operators returning to SkillHub: review decisions, skill updates, runtime incidents, billing events, payouts, buyer requests, and sensitive account changes.

Read the active user's organization-scoped in-app notification inbox:

```bash
curl "https://api.useskillhub.com/v1/notifications?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The inbox returns `channel=in_app` events addressed to the active user or their token organization. `queued` events are unread; `sent` events are already read/delivered. The response also includes a `summary` object with `total`, `unread`, `read`, `failed`, `skipped`, and per-topic counts so dashboards can show action pressure without fetching every event.

Mark one notification as read:

```bash
curl -X POST "https://api.useskillhub.com/v1/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Mark every unread organization-scoped in-app notification as read:

```bash
curl -X POST "https://api.useskillhub.com/v1/notifications/read-all" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

This returns `updatedCount` plus the refreshed inbox `summary`.

Read the active user's preferences:

```bash
curl "https://api.useskillhub.com/v1/notifications/preferences" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Update one topic:

```bash
curl -X PUT "https://api.useskillhub.com/v1/notifications/preferences" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "skill.update",
    "inAppEnabled": true,
    "emailEnabled": true,
    "webhookEnabled": false
  }'
```

These endpoints require a user-scoped token because preferences belong to a user, not the deployment service token. They persist user channel state and audit records now; actual email-provider delivery is still deferred to the final provider integration phase. Organization webhook delivery is governed by `/v1/organization/webhooks` endpoint status and event subscriptions, not by an individual user's `webhookEnabled` preference.

## Admin Notifications

Notification events are recorded before the final email provider is connected. Admin can inspect queued, sent, failed, and skipped events:

```bash
curl "https://api.useskillhub.com/v1/admin/notifications?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Current events are in-app/webhook/email state records only; actual email delivery is still deferred to the final provider integration phase. In-app `queued` means unread for the addressed user or organization, so external delivery operations use a separate queue for `email` and `webhook` records.

Inspect external delivery events:

```bash
curl "https://api.useskillhub.com/v1/admin/notification-deliveries?limit=25&status=queued" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

The response returns `email` and `webhook` events only. Each row includes status, attempt count, last attempt, next retry, provider metadata, error, delivery timestamp, and a redacted `payloadSummary`. Sensitive payload keys such as verification `code`, token, and secret fields are never exposed through this admin listing.

Record an operator delivery decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/notification-deliveries/$NOTIFICATION_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "retry",
    "reason": "SMTP provider is not connected yet; retry after provider setup.",
    "nextAttemptAt": "2026-06-06T12:00:00.000Z",
    "provider": "provider_deferred"
  }'
```

Supported `action` values are:

- `mark_sent`: records a provider/manual send result, increments attempts, clears error, and sets `deliveredAt`.
- `mark_failed`: records an error reason, increments attempts, and keeps the event visible for operator recovery.
- `retry`: returns the event to `queued` and optionally schedules `nextAttemptAt`.
- `skip`: closes an event as intentionally skipped with a required reason.

Every delivery decision writes `admin_audit_logs` and queues an in-app platform notification. For `auth.email.code.requested`, the matching `email_login_challenges.delivery_status` is synchronized to the delivery event status so signup/login support can inspect whether a code is queued, sent, failed, or skipped.

Process due external delivery events in a batch:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/notification-deliveries/process" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"mode":"deliver"}'
```

Modes:

- `dry_run`: reports what would happen without mutating delivery state.
- `deliver`: processes due `queued` or retry-ready `failed` `email` and `webhook` events.

In `deliver` mode, the processor first fans eligible queued in-app business notifications into external delivery rows:

- Email fanout uses the notification topic derived from the event type, the target user's `notification_preferences`, and the user's email address. Missing preferences use the product default of email enabled.
- Webhook fanout uses the notification organization, exact event type, and derived topic to create one organization-scoped webhook delivery event when an active endpoint is subscribed. Endpoint `status` plus `events` is the organization-level webhook preference; per-user `webhookEnabled` does not suppress organization webhook fanout.
- Generated external rows carry `fanoutSourceNotificationId` in their payload, so repeated processor runs do not duplicate the same source notification for the same channel/user or organization.
- The response includes `fanoutCount`, `fanoutEmailCount`, `fanoutWebhookCount`, and `fanoutSourceCount` beside the existing processed/sent/failed/skipped counts.

At delivery time, email and webhook processors look for an active `notification_templates` row matching `(eventType, channel, locale)`, falling back to the language code and then `en`. Email delivery uses the rendered template subject/body as the Resend text payload. Webhook fanout stores the rendered JSON body as `renderedPayload` in `webhook_delivery_events`, while preserving the original notification payload for audit and troubleshooting. Template rendering substitutes `{{payloadKey}}` and dotted paths such as `{{skill.slug}}`; missing values render as empty strings rather than exposing raw placeholders.

Email delivery uses provider configuration. With `SKILLHUB_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `SKILLHUB_EMAIL_FROM`, the processor sends through Resend and records the provider message id. Without a provider, production processing marks the event failed with a clear configuration error. Non-production debug-code deployments can use `SKILLHUB_EMAIL_PROVIDER=debug_preview` or `SKILLHUB_EMAIL_AUTH_DEBUG_CODES=true` to mark debug email events sent without contacting a provider.

Webhook processing fans out matching organization-scoped webhook events into `webhook_delivery_events` for active endpoints whose subscribed event list matches the exact event type or its topic, then marks the external notification event sent. The webhook outbox worker consumes those endpoint-level rows and records signed HTTP delivery state separately.

## Admin Webhook Delivery Outbox

Inspect endpoint-level webhook delivery events:

```bash
curl "https://api.useskillhub.com/v1/admin/webhook-deliveries?limit=25&status=failed" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Rows include organization, endpoint URL/status, event type, attempt count, last attempt, next retry, HTTP response status/body, delivered time, and a redacted `payloadSummary`.

Process due webhook outbox rows:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/webhook-deliveries/process" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"mode":"deliver"}'
```

Modes:

- `dry_run`: reports which active endpoints would receive a signed HTTP POST without mutating state.
- `deliver`: claims due `pending`, retry-ready `failed`, or stale `processing` rows, sends signed HTTP POST requests, captures response status/body, and schedules retry backoff.

Webhook POST body:

```json
{
  "createdAt": "2026-06-05T00:00:00.000Z",
  "deliveryId": "WEBHOOK_DELIVERY_ID",
  "eventType": "skill.review.approved",
  "organizationId": "ORGANIZATION_ID",
  "payload": {
    "notificationEventId": "NOTIFICATION_EVENT_ID",
    "payload": {}
  }
}
```

Webhook request headers:

- `X-SkillHub-Delivery`: webhook delivery id.
- `X-SkillHub-Event`: event type.
- `X-SkillHub-Timestamp`: Unix timestamp seconds.
- `X-SkillHub-Signature-Version`: currently `v0-hashed-secret`.
- `X-SkillHub-Signature`: `v0=<hex hmac sha256>`.

Signature base string:

```txt
<timestamp>.<deliveryId>.<raw JSON request body>
```

Because webhook endpoint secrets are shown only once and the platform stores only `sha256(secret)`, v0 signing uses the stored secret hash as the HMAC key. Receivers verify by computing `sha256(raw whsec_... secret)` as a lowercase hex string, then HMAC-SHA256 signing the same base string. A future KMS-backed secret store can add a new signature version without changing the outbox state machine.

Operational defaults:

- `SKILLHUB_WEBHOOK_TIMEOUT_MS`: request timeout, default `8000`, clamped from 1s to 30s.
- `SKILLHUB_WEBHOOK_MAX_ATTEMPTS`: retry cap, default `8`, clamped from 1 to 20.
- Retry backoff uses 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours, then 24-hour intervals until the max attempt count is reached. Rows at the max attempt count remain visible as `failed` and are no longer selected by automatic due processing unless the cap is raised.

## Admin Launch Readiness

Inspect production readiness across account entry, provider-deferred delivery, migrations, and marketplace operations:

```bash
curl "https://api.useskillhub.com/v1/admin/launch-readiness" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

`GET /v1/admin/launch-readiness` requires `support`, `admin`, or `super_admin`. It returns a secret-safe report with:

- Environment metadata: app URL, OAuth callback base URL, production-like flag, runtime label, and check time.
- Summary counts for `blocker`, `warning`, `ready`, and `deferred`.
- Sectioned checks for identity/OAuth, email-code delivery, webhook worker schema, marketplace operations, launch credibility thresholds, commercial readiness, and production guardrails.
- Operator actions for missing callbacks, cookie domain, OAuth state secret, email-code secret, Resend configuration, migration-runner history, latest applied migration, required active notification-template coverage, runtime API-key salt, commission rules, publisher terms acceptance columns, payout tables, demo fallback, legacy signup, service token presence, and public signup policy.

The migration history check reads `schema_migrations`, reports the recorded migration count, latest applied filename, latest applied time, and compares it with the current expected production migration. It returns a warning when the migration runner has never recorded history and a blocker when the recorded latest migration is older than the code expects.

The launch credibility section reads live marketplace and runtime state, then reports warning/ready checks for:

- Verified public skills, default target `SKILLHUB_LAUNCH_MIN_VERIFIED_SKILLS=5`.
- Active publishers with public supply, default target `SKILLHUB_LAUNCH_MIN_ACTIVE_PUBLISHERS=2`.
- Active developer projects with an installed skill or runtime activity, default target `SKILLHUB_LAUNCH_MIN_ACTIVE_PROJECTS=3`.
- Successful governed invocations, default target `SKILLHUB_LAUNCH_MIN_SUCCESSFUL_INVOCATIONS=20`.
- Published buyer feedback rows, default target `SKILLHUB_LAUNCH_MIN_PUBLISHED_FEEDBACK=5`.

These are credibility warnings for customer-facing launch readiness, not final payment-provider blockers.

The endpoint reports only configured/missing state, URLs, counts, and next actions. It never returns OAuth secrets, Resend keys, service tokens, API-key salts, webhook signing secrets, raw email verification codes, user tokens, or passwords.

Admin/support operators can inspect the immutable admin audit trail:

```bash
curl "https://api.useskillhub.com/v1/admin/audit-logs?limit=30" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Audit rows return `action`, `entityType`, `entityId`, `reason`, `metadata`, actor identity when available, and `createdAt`. The `/admin` console uses this endpoint for the audit stream, while `/v1/admin/notifications` remains the delivery-event queue for in-app/email/webhook state.

Admin/support operators can also manage reusable notification templates:

```bash
curl "https://api.useskillhub.com/v1/admin/notification-templates?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Create or update a template by its unique `templateKey`, `channel`, and `locale`:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/notification-templates" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateKey": "skill.review.approved",
    "channel": "email",
    "locale": "en",
    "subject": "Skill review approved",
    "body": "Your skill {{skillSlug}} has been approved.",
    "status": "active"
  }'
```

Template channels are `in_app`, `email`, and `webhook`. Template statuses are `draft`, `active`, and `archived`. The API validates required `templateKey`, `subject`, and `body` fields, writes an admin audit row, and queues an in-app platform notification so template changes are operationally visible before final email and webhook delivery providers are connected.

Migration `027_default_notification_templates.sql` seeds active default templates for the main operating events used by the platform: email-code access, workspace creation, skill review states, runtime incidents, usage and subscription ledger posting, subscription renewal, payout review/approval/failure/blocking, buyer requests, account-security changes, feedback, marketplace curation, trust reports, notification-template changes, external delivery batches, and webhook outbox batches. User-facing rows include English and Chinese variants where appropriate, and webhook rows use compact JSON bodies. The migration inserts by `(template_key, channel, locale)` and uses `on conflict do nothing`, so running the migration on an existing deployment will not overwrite templates that admins have already edited.

Launch readiness treats required notification-template coverage as a launch prerequisite, not just a raw row count. If a critical active row is missing, `/v1/admin/launch-readiness` reports the missing `template_key::channel::locale` combinations in the notification template check detail and marks the check as a blocker until migration `027` is run or the rows are restored from `/admin`.

## Abuse Reports And Takedowns

Developers and project operators can report a skill when runtime behavior, security, privacy, billing, quality, or spam signals need trust review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research-pro/abuse-reports" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "security",
    "severity": "high",
    "title": "Unexpected outbound domain during runtime",
    "description": "The skill called an undeclared analytics endpoint.",
    "projectSlug": "research-agent",
    "evidenceUrl": "https://example.com/evidence/runtime-domain-log"
  }'
```

The skill detail page exposes the same report flow so a signed-in operator can submit security, privacy, quality, billing, malicious-behavior, copyright, spam, or other trust reports directly from the listing.

Platform trust operators can read and decide the queue:

```bash
curl "https://api.useskillhub.com/v1/admin/abuse-reports?limit=25" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN"

curl -X POST "https://api.useskillhub.com/v1/admin/abuse-reports/$REPORT_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"restrict","reason":"Unverified outbound domain until publisher submits a fixed runtime manifest."}'
```

Decision actions are `triage`, `dismiss`, `warn`, `restrict`, `suspend`, and `resolve`. `restrict` moves the listing to `unlisted`; `suspend` also sets `verification_status` to `suspended`. Every decision records a takedown action, admin audit log, skill update event when relevant, and queued notification event before any external support/legal provider is connected.

## Review Workflow

Submit a skill for review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/submit" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Publisher review submission is scoped to the token organization. A publisher cannot submit another organization's skill by slug.
Submission also records the latest automated review checks for the submitted skill version:

- `manifest`: required identity, version, tags, runtime, permission, and schema shape.
- `runtime`: runtime declaration validity and HTTPS transport posture for HTTP/MCP skills.
- `example`: input and output schema shape for example invocation review.
- `security`: permission-risk profile, secret handles, and high-risk manual-review flags.

Read the admin review queue:

```bash
curl "https://api.useskillhub.com/v1/admin/reviews" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN"
```

Each review row includes review SLA fields, a secret-safe `reviewEvidence` package, and `runtimeChecks`, an array of the latest check per type:

```json
{
  "id": "review_123",
  "reviewSubmittedAt": "2026-06-05T08:00:00.000Z",
  "reviewSlaBusinessDays": 3,
  "reviewSlaDueAt": "2026-06-10T08:00:00.000Z",
  "reviewSlaHoursRemaining": 67,
  "reviewQueueAgeHours": 5,
  "reviewSlaStatus": "on_track",
  "reviewEvidence": {
    "publisher": {
      "displayName": "SkillHub Labs",
      "organizationName": "SkillHub Labs",
      "organizationSlug": "skillhub-labs",
      "status": "active",
      "payoutStatus": "verified"
    },
    "manifestSummary": {
      "schemaVersion": "0.1",
      "name": "browser-research",
      "displayName": "Browser Research",
      "version": "0.1.0",
      "description": "Research browsing skill that collects citations and returns structured source notes.",
      "runtimeType": "http",
      "runtimeTarget": "https://api.useskillhub.com/demo/browser-research",
      "permissionLevel": "medium",
      "permissions": {
        "network": true,
        "browser": true,
        "filesystem": "none",
        "secretCount": 0
      },
      "inputType": "object",
      "inputPropertyCount": 3,
      "inputRequiredCount": 2,
      "outputType": "object",
      "outputPropertyCount": 4,
      "outputRequiredCount": 3,
      "tags": ["research", "browser", "citations"],
      "tagsCount": 3,
      "authorName": "SkillHub Labs",
      "authorUrl": "https://useskillhub.com/publishers/skillhub-labs"
    }
  },
  "runtimeChecks": [
    {
      "checkType": "manifest",
      "status": "passed",
      "message": "Manifest contract includes required identity, version, tags, runtime, permissions, and schemas.",
      "isBlocking": false,
      "fixCategory": "manifest",
      "targetField": null,
      "nextAction": "No manifest repair is needed; keep identity, version, tags, runtime, permissions, and schemas stable for this submission.",
      "latencyMs": null,
      "checkedAt": "2026-06-05T08:00:00.000Z",
      "createdAt": "2026-06-05T08:00:00.000Z"
    }
  ]
}
```

`reviewEvidence` is intentionally an operator-safe summary rather than the raw manifest. Runtime URLs remove query strings, fragments, and embedded credentials; local runtimes expose only a short command summary; secret values are never returned, and secret handles are represented by count only.

`reviewSlaStatus` can be:

- `not_submitted`: no review submission exists for the version.
- `on_track`: the review is inside the default three-business-day window.
- `due_soon`: the review is due within 24 hours.
- `overdue`: the review has crossed the SLA due time.
- `decided`: the review already has a terminal decision.

`status` can be `queued`, `running`, `passed`, `failed`, or `warning`. New check rows also expose structured remediation metadata:

- `isBlocking`: whether this check blocks approval or resubmission until repaired. Failed checks are blocking; warnings usually require reviewer notes or publisher evidence.
- `fixCategory`: the product area to repair, such as `manifest`, `runtime`, `example`, or `security`.
- `targetField`: the manifest/runtime field to inspect when a concrete field exists.
- `nextAction`: the publisher/reviewer action to take without parsing the human-readable `message`.

The approval gate refreshes missing or incomplete checks once before deciding. After that refresh, the admin console treats `failed`, `queued`, and `running` as blocking signals; `warning` can be approved only when the reviewer records notes that explain the accepted risk.

The web admin console derives queue priority from this response without requiring extra API fields. It summarizes SLA pressure, blocking checks, high-risk permissions, warning checks, and decision-ready rows, then lets reviewers filter or sort by recommended priority, oldest submission, earliest SLA due time, or highest risk.

Record a review decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/reviews/$REVIEW_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","notes":"Manifest, runtime, permissions, and examples accepted."}'
```

Decision status can be:

- `approved`: skill becomes verified only after automated checks exist and have no `failed`, `queued`, or `running` result. `warning` results are allowed with reviewer notes because high-risk permissions and local runtimes still require human judgment.
- `rejected`: skill becomes rejected and keeps reviewer notes.
- `blocked`: skill becomes suspended and writes risk/audit events.

## Publish Skill

Publishing requires a user token with `publisher`, `owner`, `admin`, or `super_admin`. The skill is created or updated under the token organization, and existing slugs cannot be reassigned across organizations.

```bash
curl -X POST "https://api.useskillhub.com/v1/skills" \
  -H "Authorization: Bearer $SKILLHUB_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"manifest": { ... }}'
```

The `/publish` web page uses the signed-in SkillHub user session for the same endpoint, so publishers can paste a manifest and submit it without exposing the raw token in the browser form. The submitted skill starts as `draft`; publishers can continue with review submission and pricing from the publisher workspace.

## MCP Discovery

The MCP endpoint exposes SkillHub to agent clients through JSON-RPC. Public calls can discover marketplace-safe tools and resources. Project-scoped calls should include a project API key; then `tools/list` returns the skills installed for that project and `tools/call` invokes the same runtime governance path as `/v1/runtime/invoke`.

```bash
curl -X POST "https://api.useskillhub.com/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Project-scoped tool listing:

```bash
curl -X POST "https://api.useskillhub.com/mcp" \
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

Call an installed project skill through MCP:

```bash
curl -X POST "https://api.useskillhub.com/mcp" \
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "browser-research",
      "arguments": {
        "query": "MCP tool marketplace launch checklist"
      }
    }
  }'
```

`tools/call` is not a shortcut around SkillHub policy. The gateway authenticates the project API key, checks the project install, version pin, verification state, owner approval, permission policy, rate limit, budget, and subscription state, then records invocation and usage events just like `/v1/runtime/invoke`. A blocked or failed call returns an MCP `isError` result with the SkillHub error code and invocation id where available.

The project command center at `/dashboard/projects/[slug]` surfaces the same REST and MCP endpoints with copyable command snippets. The UI shows only the project API-key environment variable name and active-key count; raw project keys remain reveal-once through the key-creation workflow.

The public agent integration guide at `/agents` and `/agents?lang=zh` now explains the same connection model before sign-in: MCP client configuration, REST runtime invocation, SDK discovery, project-scoped key handling, runtime governance, and the production checklist teams should complete before handing SkillHub calls to autonomous agents.
