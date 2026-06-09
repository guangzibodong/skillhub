# Public Acceptance QA

Status: Developer Preview public acceptance checklist

Use this checklist before a production update or customer walkthrough. It matches the current public state: registry discovery and public inspection are live; runtime invocation requires authenticated project keys and project policy checks; paid marketplace payment capture, automated payouts, tax/KYC automation, final legal terms, and final email delivery are prelaunch.

## Pages

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
- `/publishers/skillhub?lang=en`
- `/publishers/skillhub?lang=zh`
- `/publishers/skillhub-publisher?lang=en`
- `/login?lang=en`
- `/login?lang=zh`
- `/dashboard?lang=en`

## API

- `GET /health`
- `GET /v1/skills/search?limit=50`
- `GET /v1/skills/browser-research`
- `GET /v1/publishers`
- `GET /v1/publishers/skillhub`
- `GET /mcp`

## Expected Public State

- Public skills: 2.
- Verified skills: 1.
- Submitted skills: 1.
- Callable skills: 1.
- `browser-research`: public, verified, callable after signed-in project setup.
- `dataset-summarizer`: public, submitted, inspection-only.
- Submitted skills do not show install, runtime test, project handoff, subscription, billing, ledger, or developer workspace actions as currently available.
- Public pages do not show copy-ready CLI/SDK install commands unless package release metadata proves public availability.
- Publisher links use the canonical public slug `/publishers/skillhub`; the legacy slug `/publishers/skillhub-publisher` must still render a valid public profile or redirect safely.
- Public paid-marketplace copy is labeled as Developer Preview, future paid workflow, prelaunch integration, or manual finance review.
- Anonymous navigation stays focused on Home, Registry, Marketplace, Docs, Publish, and Sign in.
- Anonymous Dashboard renders only the sign-in gate, not protected workspace controls.
- Chinese pages keep technical identifiers such as REST, MCP, SDK, CLI, HTTP, JSON, runtime, schema, `browser-research`, and `dataset-summarizer` in English, but translate basic UI labels and descriptions.

## Routine No-Write Verification

Run the public production gate after deploying rebuilt containers:

```bash
pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
```

Run the local source/page gate before committing:

```bash
pnpm smoke -- --skip-api --skip-app
```

