# SkillHub Acceptance Team QA

Status: launch-readiness role walkthrough

This runbook creates three real acceptance identities and uses them to inspect the P0 operating flows from the user's point of view. It is not a fake demo-data shortcut. The accounts use the normal public password signup and login path, while the admin account is promoted only through the server-controlled service-token path.

Never paste, screenshot, commit, or print the generated credentials file.

## Create The Acceptance Team

Run this on the production server after pulling the latest repository code and loading the server environment. The command writes credentials to a private local file only.

```bash
cd /opt/skillhub
pnpm acceptance:team -- --api-url http://127.0.0.1:18787 --app-url https://useskillhub.com --output /root/skillhub-acceptance-team.json --allow-production-write
```

The script requires `SKILLHUB_SERVICE_TOKEN` or `SKILLHUB_ADMIN_TOKEN` in the server shell. Do not paste that value into chat, screenshots, docs, or commits.

What the script does:

- Creates or verifies a normal password-login developer account.
- Creates or verifies a normal password-login publisher partner account.
- Creates or verifies a normal password-login admin account, then promotes it with the server service token.
- Logs in all three accounts through `/v1/auth/password/login`.
- Verifies each account with `/v1/auth/me`.
- Verifies the admin account can read `/v1/admin/launch-readiness`.
- Writes usernames, passwords, one-time smoke tokens, and walkthrough URLs to the private output file.

If the command is re-run with the same output file, it reuses the stored generated passwords. If the output file is gone and the same run id is reused, create a new `--run-id` because the script cannot recover an existing password from SkillHub.

## Role Walkthroughs

Use the credential file only on the server or in a secure password manager. Do not copy credentials into issue text. When reporting bugs, use role names instead of usernames.

### 1. Developer / Normal User

Start:

```txt
https://useskillhub.com/login?lang=zh
```

Walkthrough:

- Log in with the developer account.
- Open `/account?lang=zh` and confirm identity, workspace readiness, login methods, sessions, and role-aware console map.
- Open `/marketplace?lang=zh`, search/filter, copy public inspect commands, and open every visible skill card that looks relevant.
- Open a verified skill detail page and check that install/test actions explain project login, policy, runtime key, and billing/ledger state honestly.
- Open `/developer?lang=zh` and `/dashboard?lang=zh`; confirm the page explains missing projects, missing keys, no installs, or next actions without looking broken.

Acceptance focus:

- Discovery must become real project or runtime state when the required login/project conditions exist.
- Submitted or preview-only skills must not imply public runtime install.
- Empty states must tell the developer what to do next.
- Chinese and English labels must match the same product state.

### 2. Publisher / Third-Party Partner

Start:

```txt
https://useskillhub.com/login?lang=zh
```

Walkthrough:

- Log in with the publisher partner account.
- Open `/publish?lang=zh`; paste or inspect the manifest preflight path and confirm save/submit states are clear.
- Open `/publisher?lang=zh`; check review repair, version status, paid-readiness, terms, payout readiness, buyer requests, feedback, and revenue/payout panels.
- Open `/account?lang=zh`; confirm the role map points the publisher to the right workspaces.
- Open `/terms?lang=zh`; verify manual PayPal/Alipay transfer and provider-deferred payment boundaries are clear.

Acceptance focus:

- The publisher must understand what is blocked, what can be submitted, what is preview, and what requires admin review.
- Paid activation must stay gated until terms, profile, payout readiness, pricing, and finance/legal/provider blockers are satisfied.
- Manual payout collection must stay simple: PayPal or Alipay receiving details, finance review, external transfer, transfer reference, audit.

### 3. Admin / Operator

Start:

```txt
https://useskillhub.com/admin-login?lang=zh
```

Walkthrough:

- Log in with the admin account.
- Open `/admin?lang=zh` and `#launch-readiness`; confirm the console reads like operations, not decorative metrics.
- Inspect review queue, launch readiness, identity directory, trust/risk, finance, payout, notification, webhook, curation, and audit panels.
- Confirm admin routes stay hidden from public login navigation but remain reachable through the direct operator link and role-aware account/dashboard maps.
- Confirm launch blockers and paid-marketplace blockers are separated.

Acceptance focus:

- Admin must be able to see what blocks launch and what only blocks paid marketplace activation.
- Protected admin actions must require the admin role.
- No secret, token, OAuth credential, raw API key, provider key, or password-shaped value should appear in admin page HTML or API responses.

## Bug Capture Format

Use this format for issues found during acceptance:

```txt
Role:
URL:
Language:
Viewport:
Expected:
Actual:
Severity: P0/P1/P2
Evidence: screenshot without credentials, or short description
Suggested fix:
```

Severity guide:

- P0: Blocks login, role access, publish submission, developer install/test, admin launch-readiness, or leaks secrets.
- P1: Confusing CTA, wrong preview/ready state, broken bilingual copy, missing empty/error feedback, or mobile layout issue in a P0 journey.
- P2: Polish issue that does not block launch acceptance.

## Follow-Up QA Commands

Routine public no-write gate:

```bash
pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
```

Protected admin gate after loading the admin acceptance token from the private file into the server shell:

```bash
pnpm smoke:p0 -- --prod --timeout-ms 30000
```

Mutating Journey A and Journey B checks are opt-in and should be run only when the operator intentionally wants production write records:

```bash
pnpm smoke:p0 -- --prod --include-mutating --allow-production --timeout-ms 30000
```
