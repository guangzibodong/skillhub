# SkillHub Architecture

SkillHub has three layers:

1. Registry: stores skills, manifests, versions, verification status, ownership, package assets, and search metadata.
2. Runtime gateway: lets agents discover and invoke skills through HTTP and MCP-compatible endpoints.
3. Trust layer: validates manifests, enforces permissions, logs calls, supports reviews, and tracks verification state.

## Core Services

- Web app: Next.js dashboard for developers and organizations.
- Gateway: Cloudflare Workers API for low-latency discovery and runtime calls.
- Database: Supabase Postgres for registry data, organizations, projects, keys, and audit logs.
- Package storage: Cloudflare R2 for signed skill package uploads.
- Async jobs: Cloudflare Queues for verification, indexing, and package scans.

## First Public API

- `GET /health`
- `GET /v1/skills/search?q=...`
- `GET /v1/skills/:slug`
- `POST /v1/skills`
- `POST /v1/skills/:slug/versions`
- `POST /mcp`

## Trust Model

Every skill declares permissions in its manifest. Runtime callers can filter by permission level before loading a skill. Verified skills require passing schema validation, examples, evals, and manual review.
