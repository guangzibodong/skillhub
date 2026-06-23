# SkillHub Solutions Page Redesign Design

Date: 2026-06-23
Scope: `/solutions?lang=zh` and localized `/solutions` hub only.
Prototype: `.superpowers/brainstorm/solutions-20260623102521/content/solutions-prototype-v1.html`

## Goal

Redesign the SkillHub solutions page so it explains real business workflows that can be executed by AI agents through SkillHub Skills. The page should feel credible, international, and practical, not like a generic AI landing page or a decorative card wall.

The page job is:

- Help visitors who do not know Skill names start from a business problem.
- Explain that SkillHub is an Agent Skill registry and runtime control layer, not a normal human-operated app directory.
- Show which agent environments can use these Skills, using approved official colored logos/assets where available.
- Make each solution concrete enough to answer: what problem is solved, what Skills are used, what output is produced, and what still requires review or runtime control.
- Keep claims launch-safe: no fake customer proof, no unsupported compliance claim, no promise of automatic production execution.

Homepage redesign is explicitly out of scope.

## Recommended Direction

Use the approved prototype direction:

> Business problem -> Skill bundle -> Agent call -> controlled delivery.

This is better than a simple "AI solutions" grid because SkillHub's business is not selling vague AI transformation. SkillHub helps agents discover, inspect, and run reusable Skills with clear manifests, inputs, outputs, permission boundaries, project keys, and review evidence.

## Page Structure

### 1. Hero

Purpose: establish the category in one screen.

Content hierarchy:

- Eyebrow: `Solutions · Agent Skill Workflows`
- H1: `把业务问题拆成 Agent 可以执行的 Skill 工作流。`
- Body copy: explain that SkillHub solutions are not prompt collections or fake AI case studies. They start from business pain, map to Skills, and define inputs, outputs, and runtime boundaries.
- Primary CTA: `查看 8 个解决方案`
- Secondary CTA: `打开 Marketplace`
- Tertiary/doc link: `阅读接入文档`

Hero visual:

- A workflow preview panel showing four steps:
  1. 业务问题
  2. Skill 组合
  3. Agent 调用
  4. 受控交付
- Include supported-agent logo strip:
  - Codex
  - Claude Code
  - Gemini CLI
  - GitHub Copilot
  - OpenClaw
  - Hermes Agent
- Production must use official colored logos/assets where licensing permits. If an official asset is unavailable, use a restrained text mark rather than a fake badge.

Design notes:

- Do not use fake trust seals.
- Avoid an over-black empty background. Use the existing site brand palette with soft green/mint accents, subtle depth, and content density.
- The hero should look like a working system map, not a pasted dashboard image.

### 2. Workflow Selector

Purpose: let users find a solution by their job, not by knowing Skill names.

Layout:

- Left: compact vertical selector of the 8 workflows.
- Middle: selected workflow detail.
- Right: adoption boundary and operating notes.

Default selected workflow:

- SEO / GEO growth, because it clearly demonstrates SkillHub's "diagnose -> brief -> repair queue" pattern and matches existing business positioning.

Each selected workflow should show:

- Inputs the agent can pass into Skills.
- Outputs the team receives.
- Recommended Skill chain.
- Free starter path.
- Pro path.
- Runtime or human-review boundary.

### 3. Eight Solution Tracks

Purpose: prove the page covers real business work, not abstract AI features.

Each card must answer:

- Who it is for.
- Which pain it addresses.
- What output it produces.
- Which Skills are involved.
- Where to go next.

The eight tracks:

1. SEO / GEO Growth
   - Solves: AI search visibility, entity clarity, citation gaps, content briefs, technical repair queues.
   - Skills: GEO Answer Auditor, SEO Page Auditor, Content Brief Builder.
   - Outputs: visibility report, content brief, repair priority list.

2. E-commerce Operations
   - Solves: product page copy, listing QA, review mining, SKU launch checks, Shopify handoff.
   - Skills: Product Title Optimizer, Shopify PDP Auditor, Listing QA Checklist.
   - Outputs: listing QA report, review insight summary, launch checklist.

3. Support / Knowledge Base
   - Solves: ticket routing, grounded reply drafts, knowledge gaps, escalation summaries.
   - Skills: Knowledge Base Answer, Support Triage, Support Escalation.
   - Outputs: reply draft, escalation summary, knowledge-base gap list.

4. Sales / CRM
   - Solves: account research, CRM cleanup, call summaries, objections, follow-up.
   - Skills: Lead Research Brief, CRM Cleanup, Sales Call Summarizer.
   - Outputs: account brief, CRM cleanup notes, next-step recommendation.

5. Content Operations
   - Solves: topic planning, campaign briefs, content calendar, multi-channel drafts, brand QA.
   - Skills: Content Calendar, Campaign Brief, Brand QA.
   - Outputs: topic map, campaign brief, review checklist.

6. Data / Spreadsheet Automation
   - Solves: CSV cleanup, field mapping, duplicate checks, metric explanations, report summaries.
   - Skills: Spreadsheet Cleaner, CSV Header Mapper, Metric Explainer.
   - Outputs: cleaned table, data dictionary, operator summary.

7. UI / UX QA
   - Solves: responsive overflow, clipped text, layout hierarchy, empty states, conversion friction.
   - Skills: Mobile Layout QA, Responsive Audit, Landing Page Polish.
   - Outputs: screenshot evidence, issue list, polish recommendations.

8. Developer / Security Review
   - Solves: API contracts, webhook payloads, release notes, permission risk, prompt injection review.
   - Skills: API Contract Tester, Webhook Payload Validator, Prompt Injection Guard.
   - Outputs: contract review notes, permission risk summary, release gate checklist.

### 4. Adoption Path

Purpose: show how a team moves from curiosity to controlled runtime.

Steps:

1. 选择工作流
   - Start from the blocked business job, not from a Skill name.
2. 检查 Skills
   - Inspect manifest, schema, permission profile, publisher, examples, and review state.
3. 低风险验证
   - Use public or low-risk inputs first; compare outputs with team expectations.
4. 受控接入
   - Move to project keys, runtime logs, policy checks, and human review where required.

### 5. Trust Boundary

Purpose: make the page credible by saying what SkillHub does not automate blindly.

Show a code-like policy panel or manifest panel, but it must be visually integrated and animated subtly. It should communicate:

- Public inspection can happen before runtime use.
- Project keys are required for real invocation.
- Runtime calls should leave audit evidence.
- Private customer data, write-back actions, payments, publishing, CRM updates, and security-sensitive changes require explicit project policy or human approval.

Do not imply:

- SkillHub guarantees compliance certifications.
- SkillHub replaces human approval for sensitive workflows.
- Any third-party logo means partnership or endorsement.

## Visual System

The final page should align more closely with the homepage than the raw prototype:

- Use SkillHub's existing dark technical base, but reduce the feeling of a pure black console.
- Add warm off-white text, mint/green success accents, restrained cyan or amber highlights, and subtle surface variation.
- Use wider desktop layout than the current narrow page; target a comfortable max width around 1440-1520px.
- Avoid oversized empty side gutters on desktop.
- Avoid decorative orbs, fake gradients, and generic AI SaaS hero patterns.
- Cards should be dense, scannable, and operational. Border radius should stay restrained.
- Use icons only where they improve scanning.

## Motion

Motion should make the page feel alive and system-like without becoming a toy:

- Hero workflow panel can animate a soft scanning line, step pulse, or active connection state.
- Agent logo strip can have gentle hover/focus states.
- Workflow selector can animate selected-state transitions.
- Solution cards can reveal metadata on hover with small elevation and border changes.
- Code/manifest panel can use a subtle cursor, scan highlight, or line glow.
- Respect `prefers-reduced-motion` and keep all content readable without animation.

## Responsive Requirements

Desktop:

- Use more horizontal space than the current page.
- Hero should be two-column: message and workflow panel.
- Workflow selector should fit as a 3-column operating surface when space allows.
- Solution cards should use a 4-column or balanced responsive grid on wide screens.

Tablet:

- Hero can remain two-column if readable; otherwise stack.
- Workflow selector can become two columns: selector plus detail, with boundary panel below.

Mobile:

- No horizontal overflow at 390px.
- Hero content stacks before the workflow panel.
- Agent logos wrap cleanly.
- Workflow selector becomes a compact stacked list.
- Solution cards become single column.
- Buttons remain at least 44px high.
- Long Chinese labels must wrap without clipping.

## Content Rules

Use concrete business copy:

- "用于诊断、生成、检查、整理、交接" is safer than "全自动解决".
- Always connect each solution to an output.
- Explain Free vs Pro as adoption path, not forced upsell.
- Keep supported-agent wording as compatibility, not official endorsement.
- Avoid fake metrics, fake customers, fake awards, and fake trust logos.

## Implementation Boundaries

Expected files:

- `apps/web/components/growth-page.tsx`
- `apps/web/lib/growth-content.ts`
- `apps/web/app/globals.css`

Do not modify homepage files for this task.

Keep existing route architecture:

- `/solutions/page.tsx` should continue to call `GrowthHubRoute("solutions")`.
- `/solutions/[slug]/page.tsx` should continue to call `GrowthDetailRoute("solutions")`.
- The redesign should live inside the existing `SolutionsHubPage` branch unless implementation discovers a strong reason to extract focused subcomponents.

## Acceptance Criteria

- `/solutions?lang=zh` clearly explains SkillHub as Agent Skill workflows.
- Supported agents are visible in the first viewport.
- The 8 solution tracks are concrete, business-readable, and linked to Skills and outputs.
- The page avoids fake trust badges and unsupported claims.
- Desktop uses the available screen width better than the current page.
- Mobile at 390px has no horizontal overflow or clipped text.
- Motion has reduced-motion fallback.
- Footer and site navigation remain present.
- Homepage remains unchanged.

## Design Risks To Watch During Implementation

- The prototype direction can still feel too much like a terminal if the final CSS overuses black panels.
- Official logos may require asset availability or licensing checks; fallback should be honest text marks, not imitation logos.
- Existing Chinese content in terminal output may appear garbled due to PowerShell encoding, so browser-rendered QA is required.
- Long bilingual copy can make cards too tall; final implementation should keep cards scannable with compact blocks.
