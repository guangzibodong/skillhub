# SkillHub Architecture

This file is now the short architecture index.

Read the full architecture here:

- [Technical Architecture](./technical-architecture.md)
- [Technical Implementation Plan](./technical-implementation-plan.md)
- [Product Requirements](./product-requirements.md)
- [Product Documentation Review](./product-documentation-review.md)
- [User Value And Retention Strategy](./user-value-and-retention.md)
- [Full Build Plan](./full-build-plan.md)
- [Marketplace Platform Design](./marketplace-platform-design.md)
- [Marketplace Competitive Research](./marketplace-competitive-research.md)

## One-Sentence Architecture

SkillHub is a contract-first registry, marketplace, runtime gateway, trust system, notification/event system, and ledger-backed commerce platform for AI-agent skills.

## System Layers

```text
Public web and dashboards
-> Gateway API
-> Registry, runtime, trust, metering, billing, payout domains
-> Postgres, Redis, object storage later, payment provider later
```

## Current Production Stack

```text
Next.js web app
Hono gateway API
Postgres
Redis
Docker Compose on Debian through 1Panel/reverse proxy
```

## Build Direction

1. Real accounts, organizations, roles, projects, and API keys.
2. Database-backed skill publishing and review workflow.
3. Runtime invocation, metering, logs, budgets, and version pins.
4. Ledger-backed pricing, transactions, splits, balances, refunds, and disputes.
5. Payout and notification states.
6. Final external integrations: payment provider API and email sending protocol.
