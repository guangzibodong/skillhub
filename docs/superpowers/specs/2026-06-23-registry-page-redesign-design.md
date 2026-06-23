# SkillHub Registry Page Redesign Design

Date: 2026-06-23
Scope: `/registry?lang=zh` and localized `/registry` page only.
Approved prototype: `.superpowers/brainstorm/registry-20260623/content/registry-prototype-v1.html`
Approved visual direction: v3 screenshots in `.superpowers/brainstorm/registry-20260623/`.

## Goal

Redesign the SkillHub Registry page so it explains SkillHub's public Skill API as the contract layer behind marketplace discovery and project runtime. The page should feel like a credible registry and protocol workbench for AI Agent Skills, not a generic AI landing page, a documentation dump, or a duplicate marketplace search page.

The page job is:

- Explain that Registry is the versioned Skill contract layer.
- Show what an Agent, developer, publisher, and operator can inspect before runtime use.
- Make clear that public contract inspection is different from marketplace comparison and logged-in workspace runtime.
- Preserve live registry rows and real public API entry points.
- Avoid fake data, fake trust badges, fake partnerships, or unsupported automation/compliance claims.

Homepage and Marketplace redesigns are out of scope for this task.

## Product Positioning

Use this core distinction throughout the page:

- Marketplace: human-facing discovery, comparison, pricing intent, examples, publisher trust, and adoption choice.
- Skill API / Registry: machine-readable contracts: slug, version, manifest, schema, permissions, runtime, verification state, and public endpoint links.
- Workspace runtime: signed-in project adoption, Project Keys, policy approval, logs, usage, billing-preview evidence, and governed REST/MCP invocation.

This distinction is important because `/registry` should not duplicate Marketplace filtering. Search and buyer comparison belong to `/marketplace`; Registry should explain the contract layer that makes Marketplace listings governable and Agent-readable.

## Recommended Direction

Use the v3 prototype direction:

> Let Agent read the contract first, then run through project governance.

The first viewport should feel like an operational registry console:

- Left: concise positioning, CTAs, and proof tiles.
- Right: a contract console showing a concrete Skill contract, API endpoint, schema, permissions, runtime, and registry signals.

The visual mood should be darker, technical, and high-trust, but not empty black. It should use the same green/mint SkillHub brand accents as the current homepage and the redesigned Marketplace direction.

## Page Structure

### 1. Hero: Contract Console

Purpose: immediately explain what Registry is and why it exists.

Content:

- Eyebrow: `Public Skill API · Contract Registry`
- H1: `让 Agent 先读合约，再安全运行。`
- Body: explain that Registry records each Skill's version, manifest, schema, permissions, runtime, and review state before an Agent or team invokes it.
- Primary CTA: `打开公开 API`
- Secondary CTA: `去 Marketplace 对比`
- Tertiary CTA: `提交 Skill`

Hero visual:

- A console for one example contract, such as `support-triage · v0.1.0`.
- Show:
  - API endpoint
  - input schema
  - output schema
  - permissions
  - runtime type
  - registry signals
  - runtime boundary
  - marketplace boundary
- The console can have a subtle scan highlight or live-state motion, with reduced-motion fallback.

Implementation note:

- The H1 must not be clipped or collide with the console at desktop widths.
- Chinese heading line breaks must be controlled and natural.

### 2. Where Registry Fits

Purpose: prevent confusion between Registry, Marketplace, and Workspace runtime.

Use three operational cards:

1. Marketplace
   - Human discovery, categories, pricing intent, publisher trust, examples, and comparison.
2. Skill API
   - Agent/system contract layer: manifest, schema, runtime, permissions, review state, and endpoint.
3. Workspace runtime
   - Project install, version pinning, Project Key, policy approval, logs, usage, and billing-preview evidence.

This section should appear early, before deeper manifest detail.

### 3. Contract Lifecycle

Purpose: show that Skills have state, not just marketing cards.

Show a horizontal lifecycle on desktop and stacked cards on mobile:

1. Draft
   - Publisher saves manifest, schema, permissions, runtime, examples, and support details.
2. Review
   - Automated checks and human review evaluate version, risk, examples, and runtime boundary.
3. Verified
   - Verified versions become public contracts and are eligible for project adoption.
4. Adopt
   - Signed-in project pins a version, approves policy, and creates a Project Key.
5. Invoke
   - REST or MCP calls pass through the governed gateway and leave invocation, usage, and audit evidence.

### 4. Manifest Quality Bar

Purpose: explain what a valid Skill contract must answer.

Use six compact field cards:

- Identity: name, display name, semantic version, category, tags, support, changelog.
- Runtime: HTTP, MCP, or restricted local runtime; target, transport, health posture.
- Schema: input schema, output schema, required fields, examples, typed result shape.
- Permission: network, browser, filesystem, secrets, sensitive data, destructive/write/payment workflows.
- Trust: review status, checks, incidents, feedback, deprecation, replacement path.
- Commercial: billing model, price intent, publisher terms, finance-reviewed paid readiness.

Add a right-side policy stack:

- Public page does not fake supply.
- High-risk actions must go through project policy.
- Agent-readable does not mean automatically runnable.

### 5. API Quickstart

Purpose: give a concrete developer/Agent entry point without turning the page into full API docs.

Show:

```bash
curl "https://api.useskillhub.com/v1/skills/search?limit=20"

curl "https://api.useskillhub.com/v1/skills/browser-research"

# Runtime starts after sign-in:
# create project -> approve policy -> generate Project Key -> REST / MCP call
```

Explain:

- Public endpoints are for discovery and manifest inspection.
- Real runtime invocation starts only after project adoption and Project Key creation.

### 6. Live Skill API Rows

Purpose: preserve the page's current live registry data role while making it feel like API output, not a generic table.

Desktop:

- Use a compact table-like API rows panel.
- Columns: Skill contract, runtime, review, risk, action.

Mobile:

- Do not use horizontal scrolling for the main experience.
- Convert each row into a vertical contract card with labeled fields.

Data should continue to come from:

- `getSkills()`
- `getPublicPlatformStats()`
- existing public registry APIs

Do not introduce fake rows as production data.

### 7. Closing CTA

Purpose: reinforce the product model.

Message:

- `让 Skill 先成为可信合约，再成为可运行能力。`

Actions:

- `打开 Skill API`
- `去 Marketplace`

## Visual System

Use:

- Dark technical background with subtle grid and soft green/mint accents.
- A real workbench feeling: console, schema cards, lifecycle rail, API rows.
- Restrained card radius and dense but readable layout.
- Wider desktop layout than the current page, targeting roughly 1440-1500px usable width.
- Clear section rhythm with enough contrast between hero, lifecycle, manifest, quickstart, and rows.

Avoid:

- Generic AI hero language.
- Decorative orbs or unrelated visual noise.
- Fake partner/trust badges.
- Repeating Marketplace search controls.
- Long documentation paragraphs that make the page feel like an API manual.
- Dense code snippets that dominate the page on mobile.

## Motion

Allowed:

- Subtle console scan highlight.
- Soft live-state glow on verified/status indicators.
- Small hover/focus transitions on cards and buttons.
- Lifecycle line or node emphasis.

Required:

- Respect `prefers-reduced-motion`.
- No animation can be required to understand content.
- Motion should support a system/workbench feel, not an AI demo feel.

## Responsive Requirements

Desktop:

- Hero uses two columns.
- H1 does not clip or collide with the console.
- Contract console fits without horizontal page overflow.
- Lifecycle can be horizontal.
- Live rows can be table-like.

Tablet:

- Hero stacks or uses a safer narrower console layout when needed.
- Manifest quality cards can use two columns.
- Lifecycle can wrap to two columns.

Mobile at 390px:

- No horizontal page overflow.
- Hero stacks.
- H1 line breaks naturally and remains readable.
- Buttons remain at least 44px high.
- Contract console stacks.
- Code blocks scroll only inside their own panel if needed.
- Live rows become vertical contract cards, not a wide table.

## Implementation Boundaries

Expected files:

- `apps/web/app/registry/page.tsx`
- `apps/web/app/globals.css`
- Possibly `apps/web/lib/i18n.ts` if copy needs to move into dictionaries.

Keep:

- `AppShell active="registry"`
- `generateMetadata` for `/registry`
- `getSkills()`
- `getPublicPlatformStats()`
- `SkillTable` only if it can meet the new responsive contract-card behavior, otherwise replace the registry page's presentation with a scoped registry rows component while preserving the same data source.
- `OperatingEvidenceChain` only if it supports the new rhythm without making the page feel like a repeated legacy block.

Do not modify homepage files for this task.
Do not modify Marketplace behavior for this task.

## Acceptance Criteria

- `/registry?lang=zh` clearly explains Registry as the Skill API contract layer.
- The first viewport makes the page purpose obvious without reading the full page.
- Registry, Marketplace, and Workspace runtime boundaries are clear.
- Manifest quality bar explains fields in business-readable Chinese.
- Lifecycle shows Draft -> Review -> Verified -> Adopt -> Invoke.
- Public API endpoint is visible.
- Live registry rows remain present and use live data.
- Production-like behavior does not imply fake Skill supply.
- Desktop 1440px has no H1 clipping and no horizontal overflow.
- Mobile 390px has no horizontal page overflow, no clipped text, and no wide live-row table.
- Motion has reduced-motion fallback.
- Footer and global navigation remain present.

## Design Risks To Watch During Implementation

- The page can become too much like a terminal if every section uses black code panels.
- The page can become too much like documentation if the copy stays long and paragraph-heavy.
- The current `SkillTable` may not be mobile-friendly enough for the new design; inspect before reusing.
- Chinese copy rendered in PowerShell may appear garbled due to terminal encoding, so final validation must use browser screenshots.
- Keeping the Registry/Marketplace boundary clear is more important than adding another search box.
