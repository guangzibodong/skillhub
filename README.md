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

- Real accounts, organizations, roles, projects, and API keys.
- Database-backed skill publishing, versions, validation, and review.
- Search skills by task, tags, permission profile, runtime, and pricing model.
- Expose agent-friendly discovery and invocation endpoints.
- Record usage in a ledger-ready way for future billing and payouts.

## Product Documents

- [Product requirements](docs/product-requirements.md)
- [Technical architecture](docs/technical-architecture.md)
- [MVP plan](docs/mvp.md)
- [Marketplace platform design](docs/marketplace-platform-design.md)
- [Competitive research](docs/marketplace-competitive-research.md)

## Local Development

This repository is prepared for `pnpm`.

```bash
pnpm install
pnpm dev
```

The current workspace can be committed once Git is installed and GitHub authentication is configured safely.
