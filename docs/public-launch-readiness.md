# Public Launch Readiness

Status: Developer Preview public launch.

This checklist optimizes for being launch-ready, not looking launch-ready. If a capability is not ready for public operation, the public page must say so, gate the action, and keep the future path testable behind authenticated project or admin controls.

## Current Public State

- Public discovery: live.
- Public inspection: live.
- Public registry and skill detail pages: live.
- Authenticated runtime architecture: live behind project keys and policy checks.
- Paid marketplace operations: prelaunch.
- Payment capture: prelaunch.
- Automated payouts: prelaunch.
- Tax/KYC automation: prelaunch.
- Final email provider delivery: prelaunch.
- Public copy-and-run CLI package: prelaunch.
- Public copy-and-run SDK package: prelaunch.

## Public Supply

- Public skills: 2.
- Verified skills: 1.
- Submitted skills: 1.
- Callable skills: 1.
- `browser-research`: verified; public inspection works; install and runtime require sign-in, project state, project key, and policy checks.
- `dataset-summarizer`: submitted; public inspection only; not installable, not callable, and not eligible for project handoff until verified approval.

## Public Pages

Verify these routes before deployment:

- `/`
- `/?lang=zh`
- `/marketplace?lang=en`
- `/marketplace?lang=zh`
- `/registry?lang=en`
- `/registry?lang=zh`
- `/docs?lang=en`
- `/docs?lang=zh`
- `/skills/browser-research?lang=en`
- `/skills/browser-research?lang=zh`
- `/skills/dataset-summarizer?lang=en`
- `/skills/dataset-summarizer?lang=zh`
- `/publish?lang=en`
- `/publish?lang=zh`
- `/publishers?lang=en`
- `/publishers?lang=zh`
- `/publishers/skillhub?lang=en`
- `/publishers/skillhub?lang=zh`
- `/login?lang=en`
- `/login?lang=zh`
- `/account?lang=en`
- `/account?lang=zh`
- `/developer?lang=en`
- `/developer?lang=zh`
- `/publisher?lang=en`
- `/publisher?lang=zh`
- `/dashboard?lang=en`
- `/terms?lang=en`
- `/terms?lang=zh`
- `/support?lang=en`
- `/support?lang=zh`
- `/report?lang=en`
- `/report?lang=zh`
- `/security?lang=en`
- `/security?lang=zh`
- `/status?lang=en`
- `/status?lang=zh`

## Acceptance Checks

- Developer Preview stage is visible.
- Anonymous top nav is Home, Registry, Marketplace, Docs, Publish, Sign in.
- Anonymous top nav does not expose Publishers, Agents, API health, Account center, Dashboard, Developer, Publisher workspace, Admin, or Open workspace.
- Public pages explain what works without login and what requires login.
- Anonymous verified skill detail uses Availability, not a top-level Install section.
- Submitted skill detail uses Availability and inspection-only copy.
- Submitted skill detail does not show project handoff, runtime test, billing gate, usage ledger, or SDK/CLI runtime setup.
- Public quickstart commands work: REST search, REST inspect, and GET `/mcp` metadata if documented.
- Public pages do not imply paid marketplace, payment capture, or automated payout operations are live.
- Marketplace does not show operator queue counts as public traction.
- Publisher pages do not make payout readiness a headline trust factor.
- Login token fallback is secondary, collapsed, and labeled as invite/recovery only.
- Public support, report, security, and status paths exist.
- Security and support paths warn not to include secrets, API keys, passwords, or private user data in public reports.
- Chinese public pages do not show basic English user-facing descriptions, labels, status text, or quickstart comments except stable technical identifiers.
- Terms, docs, README, and public page copy agree on Developer Preview state.

## Verification Commands

```bash
pnpm test:skill-availability
pnpm --filter @useskillhub/web typecheck
pnpm --filter @useskillhub/gateway typecheck
pnpm --filter @useskillhub/web build
pnpm smoke -- --skip-api --skip-app
pnpm qa:anonymous -- --app-url http://127.0.0.1:3101 --timeout-ms 30000
```

Routine production no-write gate:

```bash
pnpm qa:anonymous -- --app-url https://useskillhub.com --timeout-ms 30000
pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
```

## Known Prelaunch Limits

- Manual PayPal/Alipay transfer records are the paid-marketplace preview model for finance review; provider payout automation is not public.
- Ledger and payout UI are modeled for future paid usage and admin/finance readiness, not general customer self-serve payment capture or automated payouts.
- CLI and SDK packages remain preview packages until public install methods are released.
- Support, trust report, runtime report, and admin operations must stay behind appropriate sign-in or operator gates when they write state.
- Public support/report/security/status pages are guidance paths until signed-in write flows are available.
