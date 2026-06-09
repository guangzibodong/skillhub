# SkillHub

Universal skills for AI agents.

SkillHub is a registry and runtime layer for agent skills. It gives AI agents a way to discover, evaluate, and call reusable skills through a common package format, HTTP API, and MCP-compatible gateway.

## Current status

SkillHub is currently in Developer Preview.

Public registry discovery and public skill inspection are live. Runtime invocation requires authenticated project keys and project policy checks.

CLI and SDK packages exist in the monorepo, but they are not published as public copy-and-run installs unless release/package metadata explicitly says otherwise.

Paid marketplace, payment capture, automated payouts, tax/KYC automation, final legal terms, and final email provider delivery are prelaunch integrations.

## Product Shape

- `apps/web`: public site and SaaS console.
- `apps/gateway`: Cloudflare Worker API and agent gateway.
- `packages/schema`: the `skillhub.json` manifest contract.
- `packages/sdk`: TypeScript client source. Public package publication is not claimed in Developer Preview.
- `packages/cli`: CLI source. Public copy-and-run installation is not claimed until a release/package exists.
- `docs`: platform architecture and package docs.
- `examples`: reference skill packages.
- `supabase`: database migrations.

## Product Scope

- Complete product definition first; phased implementation second.
- Real accounts, organizations, roles, projects, and API keys.
- Database-backed skill publishing, versions, validation, review, and marketplace listings.
- Search skills by task, tags, permission profile, runtime, and pricing model.
- Agent-friendly discovery and invocation endpoints.
- Project API keys and runtime policy gates for installed skills.
- Ledger-ready usage model for future paid marketplace operations.
- Usage, transactions, commission splits, balances, payout states, refunds, and disputes.
- Preview manual payout workflow: publishers submit PayPal/Alipay receiving details and finance records manual transfers; provider-specific payout automation can replace this later.
- Notification events and templates, with actual email protocol integration handled at the final integration stage.
- Payment capture, payout provider automation, tax/KYC automation, final legal terms, and final email provider delivery remain prelaunch integrations.
- CLI and SDK packages are present in the monorepo but are not yet published for public copy-and-run installation.

## Product Documents

- [Product requirements](docs/product-requirements.md)
- [Product documentation review](docs/product-documentation-review.md)
- [User value and retention](docs/user-value-and-retention.md)
- [Technical architecture](docs/technical-architecture.md)
- [Technical implementation plan](docs/technical-implementation-plan.md)
- [Full build plan](docs/full-build-plan.md)
- [Marketplace platform design](docs/marketplace-platform-design.md)
- [Competitive research](docs/marketplace-competitive-research.md)

## Local Development

This repository is prepared for `pnpm`.

```bash
pnpm install
pnpm dev
```

The current workspace can be committed once Git is installed and GitHub authentication is configured safely.
