# SkillHub

Universal skills for AI agents.

SkillHub is a registry and runtime layer for agent skills. It gives AI agents a way to discover, evaluate, and call reusable skills through a common package format, HTTP API, and MCP-compatible gateway.

## Product Shape

- `apps/web`: public site and SaaS console.
- `apps/gateway`: Cloudflare Worker API and agent gateway.
- `packages/schema`: the `skillhub.json` manifest contract.
- `packages/sdk`: TypeScript client for apps and agents.
- `packages/cli`: `skillhub` developer CLI.
- `docs`: platform architecture and package docs.
- `examples`: reference skill packages.
- `supabase`: database migrations.

## MVP Scope

- Publish and validate skill packages.
- Search skills by task, tags, permission profile, and runtime.
- Manage organizations, projects, API keys, and skill versions.
- Expose agent-friendly discovery endpoints.
- Provide SDK and CLI foundations.

## Local Development

This repository is prepared for `pnpm`.

```bash
pnpm install
pnpm dev
```

The current workspace can be committed once Git is installed and GitHub authentication is configured safely.
