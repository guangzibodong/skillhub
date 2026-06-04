# SkillHub API

Base URL:

```txt
https://api.useskillhub.com
```

## Search Skills

```bash
curl "https://api.useskillhub.com/v1/skills/search?q=research"
```

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
      "permissionLevel": "medium"
    }
  ]
}
```

## Get Skill Manifest

```bash
curl "https://api.useskillhub.com/v1/skills/browser-research"
```

## Registry Stats

```bash
curl "https://api.useskillhub.com/v1/stats"
```

## Platform Overview

These endpoints expose the first real operating shape for the two-sided marketplace. They are safe to use before payment and email providers are connected because they read product states, not external provider movement.

```bash
curl "https://api.useskillhub.com/v1/platform/overview"
curl "https://api.useskillhub.com/v1/developer/overview"
curl "https://api.useskillhub.com/v1/publisher/overview"
curl "https://api.useskillhub.com/v1/admin/overview"
```

The overview includes:

- Developer installed-skill and update-inbox signals.
- Publisher review, runtime-check, buyer-request, and balance signals.
- Admin review, payout, notification, incident, and runtime-risk signals.

## Developer Project Operations

These endpoints model the developer side of the marketplace: installed skills, permission policies, and update/deprecation/incident inboxes.

Read installed skills:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/installed-skills"
```

Install or update a skill version for a project:

```bash
curl -X POST "https://api.useskillhub.com/v1/projects/research-agent/installed-skills" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"skillSlug":"browser-research","version":"0.1.0"}'
```

Read project skill policies:

```bash
curl "https://api.useskillhub.com/v1/projects/research-agent/policies"
```

Update a project skill policy:

```bash
curl -X PUT "https://api.useskillhub.com/v1/projects/research-agent/policies/browser-research" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
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
curl "https://api.useskillhub.com/v1/projects/research-agent/update-inbox"
```

Writes are temporarily protected by the operator token until full account auth and role checks are connected.

## Review Workflow

Submit a skill for review:

```bash
curl -X POST "https://api.useskillhub.com/v1/skills/browser-research/submit" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN"
```

Read the admin review queue:

```bash
curl "https://api.useskillhub.com/v1/admin/reviews" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN"
```

Record a review decision:

```bash
curl -X POST "https://api.useskillhub.com/v1/admin/reviews/$REVIEW_ID/decision" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","notes":"Manifest, runtime, permissions, and examples accepted."}'
```

Decision status can be:

- `approved`: skill becomes verified.
- `rejected`: skill becomes rejected and keeps reviewer notes.
- `blocked`: skill becomes suspended and writes risk/audit events.

## Publish Skill

Publishing requires `SKILLHUB_ADMIN_TOKEN` on the server.

```bash
curl -X POST "https://api.useskillhub.com/v1/skills" \
  -H "Authorization: Bearer $SKILLHUB_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"manifest": { ... }}'
```

## MCP Discovery

```bash
curl -X POST "https://api.useskillhub.com/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```
