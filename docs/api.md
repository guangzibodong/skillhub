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
