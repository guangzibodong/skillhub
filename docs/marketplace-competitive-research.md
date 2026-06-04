# Marketplace Competitive Research

This note captures what SkillHub should learn from current agent-tool and marketplace products. The goal is not to copy their positioning, but to make SkillHub feel like an operating product instead of a thin UI.

## Sources Reviewed

- Smithery: MCP server registry, server discovery, install commands, typed tool surfaces, and operational signals. https://smithery.ai/
- Composio: agent integrations, tool execution, managed authentication, and connected app workflows. https://composio.dev/
- Toolhouse: agent tool store and SDK-oriented tool access. https://toolhouse.ai/
- Agent.ai: marketplace-style agent discovery and public profile patterns. https://agent.ai/
- Hugging Face Hub: models, datasets, Spaces, repositories, search, downloads, model/dataset cards, collections, private team collaboration, tokens, and webhooks. https://huggingface.co/docs/hub
- Docker Hub: trusted content, verified publishers, usage insights, vulnerability scanning, webhooks, and repository operations. https://docs.docker.com/docker-hub/
- GitHub Marketplace: installable developer apps, verified publishers, free trials, ratings, and workflow-oriented app discovery. https://github.com/marketplace
- Chrome Web Store: extension review, higher scrutiny for broad/sensitive permissions, user ratings/reviews, and user support flows. https://developer.chrome.com/docs/webstore/
- OpenAI GPT Store: custom GPT discovery, public publishing requirements, categories, and engagement-based creator program direction. https://openai.com/blog/introducing-the-gpt-store
- Stripe Connect: marketplace connected accounts, platform fees, balances, and payouts. https://stripe.com/connect
- Stripe Connect docs: destination charges, separate charges and transfers, connected accounts, and payout constraints. https://docs.stripe.com/connect

## Product Patterns To Adopt

### 1. Searchable Catalog, Not Static Cards

The marketplace needs a real catalog surface:

- Search by task, integration, runtime, permission, pricing, and category.
- Filter by free, per-call, subscription, verified, and risk level.
- Show install command directly in each card.
- Give every skill a detail page with contract, safety, pricing, and version history.

### 2. Details Must Prove Operability

A skill detail page should answer:

- What does it do?
- Who maintains it?
- How do I install it?
- What permissions does it need?
- What runtime does it use?
- What is the input/output schema?
- What is the latency and success profile?
- What does it cost?
- How are refunds, incidents, and deprecations handled?

### 3. Agent Runtime Trust Is A First-Class Product Area

For AI agents, trust is not a badge. It needs:

- Permission classification.
- Runtime reachability checks.
- Manifest validation.
- Version pinning.
- Audit logs for changes and admin decisions.
- Human review for high-risk skills.
- Explicit data retention and secret-handling notes.

### 4. Marketplace Money Must Be Ledger-Led

SkillHub should not pay publishers directly from raw usage logs.

Correct sequence:

1. Usage event or subscription event.
2. Immutable transaction.
3. Transaction split.
4. Publisher pending balance.
5. Available balance after delay.
6. Payout request or automatic schedule.
7. Admin/risk review when needed.
8. Provider payout.

### 5. Dashboards Need Different Jobs

Publisher dashboard:

- Publishing pipeline.
- Runtime test state.
- Review comments.
- Pricing state.
- Usage analytics.
- Earnings ledger.
- Payout account state.

Buyer/developer dashboard:

- Projects.
- API keys.
- Approved skills.
- Version pinning.
- Budgets and rate limits.
- Invoices and subscriptions.
- Webhook events.

Admin dashboard:

- Review queue.
- Risk signals.
- Runtime incidents.
- User/org risk flags.
- Transaction batches.
- Payout holds.
- Refunds/disputes.
- Audit logs.

### 6. Return Loops Matter More Than Listing Count

Platforms that retain users give them a reason to return after the first install or upload.

Developer return loops:

- Installed item management.
- Version updates.
- Security or permission changes.
- Usage analytics.
- Incident notifications.
- Better alternatives in the same category.
- Team approval flows.

Publisher return loops:

- Review status.
- Usage and install analytics.
- Quality or security feedback.
- User requests and support issues.
- Ranking/discoverability improvements.
- Revenue, balance, and payout state.

SkillHub should not measure success only by published skill count. It should measure active installed skills, successful invocations, publisher updates, review throughput, and repeat dashboard usage.

### 7. Trust Programs Are Product Features

Docker Hub's trusted content and verified publisher programs show that trust is not only a label; it affects discovery, credibility, security posture, and publisher motivation. Chrome Web Store review processes show that broad or sensitive permissions need more review, not the same review as low-risk content.

SkillHub should treat trust as a system:

- Verified publisher.
- Verified skill.
- Restricted skill.
- Permission risk.
- Runtime health.
- Version freshness.
- Incident history.
- Data retention disclosure.
- Admin review trail.

### 8. Creator Motivation Is Broader Than Payments

Payment matters, but the first publisher value can arrive earlier:

- Distribution.
- Install commands.
- Public profile.
- Verification.
- Usage analytics.
- Buyer requests.
- Quality score.
- Reputation.
- Documentation structure.

OpenAI's GPT Store direction shows the appeal of searchable custom AI tools, but SkillHub should avoid being only an engagement directory. Publishers need clearer installability, operational analytics, and eventually transparent commercial flows.

## SkillHub Product Decisions

- Keep the public marketplace and the registry connected, but not identical. The registry is the protocol surface; the marketplace is the commercial and trust surface.
- Keep the publisher dashboard and admin dashboard separate from the start. They must not share future permissions or money actions.
- Launch with free, per-call, and subscription pricing only.
- Use a payment provider with marketplace support, such as Stripe Connect, for connected accounts and payouts.
- Build the ledger before integrating payouts.
- Treat high-risk skills as restricted listings with explicit owner approval requirements.
- Build developer and publisher return loops before optimizing for raw listing volume.
- Require quality gates before verified listing status.
- Give publishers analytics and buyer demand signals before real payout integration is connected.

## Current Implementation Changes

- Added a searchable marketplace catalog.
- Added detailed skill pages with install commands, runtime contract, safety notes, pricing, permissions, changelog, and operator notes.
- Expanded publisher/developer dashboard with publishing pipeline, project controls, runtime operations, revenue ledger, and payout readiness.
- Expanded admin dashboard with review queue, risk command center, money ledger controls, payout states, admin action rules, and audit stream.
- Added a marketplace operations migration covering users, roles, publisher profiles, reviews, pricing, subscriptions, commission rules, transactions, splits, balances, payout accounts, payouts, refunds, disputes, and admin audit logs.
