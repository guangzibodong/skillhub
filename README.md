<div align="center">
  <h1>SkillHub</h1>
  <p><strong>Universal skill registry and runtime for AI agents</strong></p>
  <p>
    <a href="https://useskillhub.com">Website</a> ·
    <a href="https://api.useskillhub.com">API</a> ·
    <a href="docs/api.md">Docs</a> ·
    <a href="examples/browser-research-skill">Example Skill</a>
  </p>
</div>

---

SkillHub gives AI agents a governed way to discover, evaluate, and invoke production-ready skills. Publishers register skills with typed manifests; developers install them into projects with scoped API keys; agents call them through MCP or REST with full audit trails.

## How it works

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  AI Agent   │──MCP──│   SkillHub   │──HTTP──│   Skill     │
│  (Claude,   │  or   │   Gateway    │       │  (any HTTP  │
│   Cursor,   │ REST  │              │       │   service)  │
│   custom)   │       │  auth/policy │       │             │
└─────────────┘       └──────────────┘       └─────────────┘
```

1. **Publish** — Define a `skillhub.json` manifest, push your skill to the registry
2. **Discover** — Agents search by capability, runtime type, permission profile, or price
3. **Install** — Add a skill to a project, pin a version, configure policy gates
4. **Invoke** — Call skills through MCP `tools/call` or REST `/v1/invoke` with project-scoped keys
5. **Govern** — Per-call audit logs, budget limits, rate limiting, human review workflows

## Quick start

### Use skills (developer)

```bash
# 1. Create a project and get an API key at https://useskillhub.com/developer
# 2. Add SkillHub to your agent:

# Claude Desktop / Cursor / Windsurf — add to MCP config:
{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_proj_..."
      }
    }
  }
}

# Or call directly via REST:
curl -X POST https://api.useskillhub.com/v1/invoke \
  -H "Authorization: Bearer sk_proj_..." \
  -H "Content-Type: application/json" \
  -d '{"skill": "browser-research-pro", "input": {"query": "MCP protocol"}}'
```

### Publish skills (publisher)

```bash
# 1. Create a skillhub.json manifest
cat > skillhub.json << 'EOF'
{
  "schemaVersion": "0.1",
  "name": "my-skill",
  "displayName": "My Skill",
  "version": "1.0.0",
  "description": "What this skill does.",
  "tags": ["category"],
  "runtime": {
    "type": "http",
    "entrypoint": "https://your-api.com/skill"
  },
  "permissions": {
    "network": true,
    "browser": false,
    "filesystem": "none",
    "secrets": []
  },
  "inputSchema": {
    "type": "object",
    "required": ["query"],
    "properties": {
      "query": { "type": "string" }
    }
  },
  "outputSchema": {
    "type": "object",
    "required": ["result"],
    "properties": {
      "result": { "type": "string" }
    }
  }
}
EOF

# 2. Publish via the web console at https://useskillhub.com/publish
# 3. Skills go through verification before appearing in public search
```

## Architecture

| Component | Tech | Description |
|-----------|------|-------------|
| `apps/web` | Next.js 15, React 19, Tailwind 4 | Public site, marketplace, developer console, admin panel |
| `apps/gateway` | Hono, Cloudflare Workers / Node.js | REST API, MCP server, runtime gateway, auth |
| `packages/schema` | TypeScript | `skillhub.json` manifest types and JSON Schema |
| `packages/sdk` | TypeScript | Client SDK (monorepo source, not yet published) |
| `packages/cli` | TypeScript | CLI tool (monorepo source, not yet published) |
| `supabase/` | PostgreSQL 16 | Database migrations |

### Infrastructure

- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: Cloudflare R2 (skill packages)
- **Auth**: Email code + Google OAuth + GitHub OAuth
- **Deploy**: Docker Compose (self-hosted) or Cloudflare Workers (gateway)

## API

Base URL: `https://api.useskillhub.com`

### Public endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/skills/search` | Search skills by query, category, runtime, price, permissions |
| GET | `/v1/skills/:slug` | Get full skill manifest and metadata |
| POST | `/mcp` | MCP JSON-RPC (public `tools/list`, `resources/list`, `resources/read`) |

### Project-scoped endpoints (API key required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/invoke` | Invoke an installed skill |
| POST | `/mcp` | MCP `tools/list` (project skills) and `tools/call` (invoke) |

### Developer endpoints (user token)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/developer/projects` | Create a project |
| POST | `/v1/projects/:slug/installed-skills` | Install a skill |
| POST | `/v1/projects/:slug/api-keys` | Generate API key (reveal-once) |
| POST | `/v1/projects/:slug/runtime/test` | Test invocation |

### Publisher endpoints (user token)

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/v1/publisher/profile` | Set publisher profile |
| POST | `/v1/publisher/terms/accept` | Accept publisher terms |
| POST | `/v1/skills/:slug/prices` | Set pricing |

Full API documentation: [`docs/api.md`](docs/api.md)

## Search parameters

```
GET /v1/skills/search?q=research&category=sales&runtime=http&sort=recommended
```

| Parameter | Values |
|-----------|--------|
| `q` | Free-text search |
| `category` | `research`, `sales`, `support`, `data`, `security`, `ops` |
| `runtime` | `http`, `mcp`, `local` |
| `billingModel` | `free`, `per_call`, `subscription` |
| `permissionLevel` | `low`, `medium`, `high` |
| `verificationStatus` | `verified`, `submitted`, `deprecated` |
| `sort` | `recommended`, `adoption`, `success`, `low_risk`, `recent` |

## MCP integration

SkillHub implements the [Model Context Protocol](https://modelcontextprotocol.io/) for native agent integration.

```bash
# Public discovery
curl -X POST https://api.useskillhub.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Project-scoped invocation
curl -X POST https://api.useskillhub.com/mcp \
  -H "Authorization: Bearer sk_proj_..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":2,"method":"tools/call",
    "params":{"name":"browser-research","arguments":{"query":"..."}}
  }'
```

Supported MCP methods:
- `tools/list` — List available skills (public or project-scoped)
- `tools/call` — Invoke a skill (requires project API key)
- `resources/list` — List skill contract resources
- `resources/read` — Read a skill's full public contract

## Skill manifest

Every skill is defined by a `skillhub.json` file:

```jsonc
{
  "schemaVersion": "0.1",
  "name": "browser-research",         // unique slug
  "displayName": "Browser Research",   // human-readable
  "version": "1.0.0",                  // semver
  "description": "...",
  "author": { "name": "...", "url": "..." },
  "tags": ["research", "browser"],
  "runtime": {
    "type": "http",                    // http | mcp | local
    "entrypoint": "https://..."        // where to call
  },
  "permissions": {
    "network": true,
    "browser": false,
    "filesystem": "none",              // none | read | write
    "secrets": []                      // required secret names
  },
  "inputSchema": { /* JSON Schema */ },
  "outputSchema": { /* JSON Schema */ }
}
```

## Local development

```bash
# Prerequisites: Node.js 20+, pnpm 9+
pnpm install
pnpm dev          # starts web (3000) + gateway (8787) via Turborepo

# Individual packages
pnpm --filter @useskillhub/web dev
pnpm --filter @useskillhub/gateway dev

# Build
pnpm build

# Type check
pnpm typecheck
```

### Environment setup

```bash
cp .env.example .env
# Fill in required values (see .env.example for documentation)
```

Key variables:
- `POSTGRES_PASSWORD` — Database password
- `SESSION_SECRET` — Auth session encryption
- `SKILLHUB_ADMIN_TOKEN` — Admin API access
- `NEXT_PUBLIC_APP_URL` — Web app URL
- `NEXT_PUBLIC_API_URL` — Gateway URL

## Self-hosted deployment

```bash
# Docker Compose (production)
cp .env.production.example .env
# Configure required secrets in .env

docker compose -f docker-compose.1panel.yml up -d
```

Services:
- `web` → `:3100` (Next.js)
- `api` → `:18787` (Hono gateway)
- `postgres` → PostgreSQL 16
- `redis` → Redis 7

## QA and testing

```bash
pnpm smoke              # Full smoke test suite
pnpm smoke:p0           # P0 release gate tests
pnpm smoke:prod         # Production smoke (read-only)
pnpm qa:public          # Public launch readiness
pnpm qa:anonymous       # Anonymous user journey
```

## Project status

**Developer Preview** — the following is live:

- ✅ Public registry search and skill discovery
- ✅ MCP-compatible tool listing and invocation
- ✅ REST API for skill invocation
- ✅ Project-scoped API keys and policy gates
- ✅ Publisher skill submission and review workflow
- ✅ Admin panel with verification queue
- ✅ Per-call usage tracking and audit logs
- ✅ Marketplace curation (featured/suppressed)

**Prelaunch** (not yet live):

- ⏳ Public npm packages (`@useskillhub/sdk`, `@useskillhub/cli`)
- ⏳ Automated payouts (currently manual transfer)
- ⏳ Tax/KYC automation
- ⏳ Production email delivery (codes work in debug mode)

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api.md) | Full REST + MCP endpoint docs |
| [Architecture](docs/architecture.md) | System design and data flow |
| [Product Requirements](docs/product-requirements.md) | Feature specifications |
| [Build Plan](docs/full-build-plan.md) | Implementation phases |
| [Marketplace Design](docs/marketplace-platform-design.md) | Marketplace mechanics |
| [Skill Package](docs/skill-package.md) | Manifest format reference |
| [Deploy Guide](docs/1panel-deploy.md) | Self-hosted deployment |

## License

Proprietary. All rights reserved.
