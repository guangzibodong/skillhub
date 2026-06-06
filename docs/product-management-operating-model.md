# SkillHub Product Management Operating Model

本文档定义 SkillHub 的产品经理角色、需求治理方式和开发准入标准。目的很简单：先定需求，再设计 UI，再写代码，避免靠感觉堆页面。

SkillHub 是一个真实运营型平台，不是展示型网站。每个功能都必须服务于开发者、发布者或平台运营者的真实工作流，并且必须能进入数据、权限、审核、通知、账务或运行治理体系。

## Product Manager Role

产品经理是 SkillHub 的需求总控角色，拥有以下决策权：

- 定义用户是谁，以及当前功能解决哪个用户的哪个任务。
- 决定功能优先级：P0、P1、P2。
- 决定功能是否进入设计和代码阶段。
- 维护用户旅程、页面信息架构、状态机、数据对象、权限、通知、后台操作和验收标准。
- 拒绝只改善视觉但不增强产品价值的页面改动。
- 拒绝没有状态、没有后台、没有验收标准的“假功能”。
- 在支付接口、邮件协议等外部集成前，要求先建好内部状态、记录、审核和运营视图。

产品经理不替代 UI、前端、后端、测试或运营角色。产品经理负责让这些角色不要各做各的。

## Core Product Principle

SkillHub 的核心产品原则：

```text
用户第一次来，必须知道这里能解决什么。
用户第二次来，必须有值得回来的工作流。
平台上线运营，必须有审核、状态、账务、通知和后台闭环。
```

因此每个需求都必须回答：

1. 谁使用它？
2. 用户为什么第一次需要它？
3. 用户为什么第二次还会回来？
4. 它产生什么可运营数据？
5. 它如何提升信任、分发、收入或留存？
6. 平台管理员如何审核、纠错或追责？
7. 需要哪些数据表、API、页面、通知和审计记录？

## Product Roles And Jobs To Be Done

### Visitor

Job:

- 理解 SkillHub 是什么。
- 判断平台是否可信。
- 看到真实技能、发布者、安装路径、审核规则和运营能力。
- 选择注册、浏览市场、发布技能或阅读文档。

Must see:

- 清晰的市场定位。
- 真实技能卡片和技能详情。
- 发布者可信信号。
- 公开运营条款。
- Agent 接入方式。

### Developer / Agent Builder

Job:

- 找到能被智能体安全使用的技能。
- 比较权限、价格、运行时、评分、审核状态和替代技能。
- 把技能安装到项目，并用项目 API key、MCP 或 SDK 调用。
- 管理版本、权限、预算、订阅、发票、事故和更新。

Repeat-use reason:

- 查看项目运行状态。
- 处理版本更新和事故。
- 控制预算和订阅。
- 轮换 API key。
- 复查账单和使用记录。

### Publisher / Skill Author

Job:

- 把一个 AI 能力包装成可安装、可审核、可变现的技能。
- 创建草稿、提交版本、查看审核和自动检查结果。
- 完成上架质量、定价、条款和提现准备。
- 追踪安装、调用、反馈、收入、退款争议和提现状态。

Repeat-use reason:

- 修复审核或运行检查问题。
- 回复用户反馈。
- 处理买方需求。
- 发布新版本。
- 查看收入和提现准备。
- 对市场分发结果发起申诉。

### Platform Reviewer / Trust Operator

Job:

- 审核技能版本。
- 判断权限、运行时、示例、数据保留和风险。
- 处理滥用举报、下架、限制、事故和反馈审核。
- 记录原因和审计轨迹。

Repeat-use reason:

- 审核队列和风险队列每天变化。
- 事故和反馈需要持续处理。
- 高风险技能需要人工判断。

### Finance Admin

Job:

- 管理佣金规则、交易、分账、余额、退款、争议和提现。
- 保证历史账务不可被静默篡改。
- 在最终支付接口接入前，先让内部账务状态完整可查。

Repeat-use reason:

- 处理待成熟余额。
- 审核提现。
- 处理退款和争议。
- 检查账务异常和未 post 项。

### Super Admin

Job:

- 维护平台身份、组织、权限、模板、上线准备、迁移状态和运营健康。
- 对关键操作有最终追责和恢复能力。

Repeat-use reason:

- 发布前检查 launch readiness。
- 监控系统配置缺口。
- 管理模板、通知、用户和组织风险。

## Requirement Levels

SkillHub 需求分 5 层，低层不能跳过高层：

### L0: Product Definition

回答平台是什么、不是什么、服务谁、长期靠什么形成壁垒。

Owner: 产品经理。

Source:

- `docs/product-requirements.md`
- `docs/user-value-and-retention.md`

### L1: Domain Requirements

定义大模块：

- 账号和组织。
- 技能注册与发布。
- 市场发现。
- 开发者项目。
- 发布者工作台。
- 审核与信任。
- 运行网关。
- 账务和分佣。
- 提现。
- 通知。
- 管理后台。

Owner: 产品经理 + 技术负责人。

Source:

- `docs/technical-implementation-plan.md`
- `docs/full-build-plan.md`

### L2: User Journey Requirements

每个用户角色必须有端到端旅程：

- 首次访问。
- 注册登录。
- 创建/发现/发布。
- 完成核心任务。
- 第二次回来处理运营事项。
- 遇到失败、审核、事故、退款、提现、通知时怎么走。

Owner: 产品经理 + UI/UX。

### L3: Feature Specification

每个功能进入设计和代码前，必须写清楚：

- 用户角色。
- 触发场景。
- 成功结果。
- 页面位置。
- 主流程。
- 空状态、错误状态、加载状态、权限不足状态。
- 数据对象。
- API。
- 权限。
- 通知。
- 审计。
- 账务影响。
- 多语言文案。
- 验收标准。

Owner: 产品经理。

Template: `docs/feature-requirement-template.md`

### L4: Implementation Acceptance

功能完成后必须验证：

- 页面是否符合需求。
- API 是否返回真实数据或明确受控 fallback。
- 数据状态是否可追踪。
- 角色权限是否正确。
- 管理后台是否能审核、修复或查看。
- 中英文是否都可用。
- 移动端和桌面端是否不溢出。
- 类型检查、构建、烟测是否通过。

Owner: 前端 + 后端 + 测试 + 产品经理。

## Development Gate

任何 UI 或代码任务必须按以下顺序通过：

1. Product Gate: 已写清楚用户、场景、流程、状态和验收。
2. Data Gate: 已明确需要读写哪些数据对象。
3. Permission Gate: 已明确谁能看、谁能改、谁能审核。
4. Ops Gate: 已明确后台、审计、通知或运营可见性。
5. UI Gate: 已明确页面信息架构、优先级和交互状态。
6. Code Gate: 才进入实现。
7. QA Gate: 类型检查、构建、烟测、响应式检查。

如果一个需求不能通过 Product Gate，就不要开始 UI。

## Priority Rules

### P0

没有它，平台不能被真实用户试用或客户会认为是玩具。

Typical P0:

- 注册登录和个人中心。
- 开发者发现、安装、项目调用。
- 发布者上传、版本、审核、定价准备。
- 管理后台审核、风险、账务、提现、通知、上线准备。
- 公开页面能解释平台价值、信任和使用路径。

### P1

没有它，平台可以演示，但运营效率和留存会明显不足。

Typical P1:

- 市场推荐策略。
- 发布者质量评分和分发申诉。
- 开发者收藏、更新处理、发票。
- 用户反馈和发布者回复。
- Webhook、通知偏好、模板管理。

### P2

增强体验、增长、转化或运营效率，但不阻塞第一版上线。

Typical P2:

- 高级筛选和集合。
- 内容运营和 SEO 增长页。
- 更复杂的企业权限。
- 高级分析图表。
- 多作者分账。

## Current Product Gaps To Control Before More UI

### P0 Gaps

- Page-level requirements need a single source of truth: every public page, developer page, publisher page, and admin page needs a purpose, primary user, primary action, data source, and acceptance criteria.
- Skill upload needs a formal journey spec: draft creation, manifest preflight, version submission, automated checks, reviewer decision, pricing readiness, and paid activation blockers.
- Developer discovery-to-runtime needs a formal journey spec: marketplace search, skill detail, save/install, project approval, API key/MCP connection, test run, budget/subscription gate, usage visibility.
- Publisher commercial flow needs a formal journey spec: profile, terms, payout readiness, price draft, paid activation, ledger, payout request, refund/dispute impact.
- Admin operations need a formal command-center spec: review, trust, incidents, finance, payouts, notifications, launch readiness, identity directory.
- The UI design system needs a product-grade IA map before more visual polish.

### P1 Gaps

- Retention loops need explicit acceptance: what exact inbox/task/metric makes the user come back next week?
- Marketplace ranking explanations need buyer-safe copy and publisher-safe improvement hints.
- Public publisher profiles need stronger acceptance criteria for trust.
- Notification preferences and template management need user-facing and admin-facing copy requirements.
- Multi-language copy needs product terminology rules so English and Chinese stay consistent.

### P2 Gaps

- SEO/GEO content strategy for agent-skill marketplace discovery.
- Help center and onboarding tutorials.
- Advanced analytics and benchmarking.
- Partner/publisher certification program.

## Required Product Artifacts

Before continuing broad UI development, maintain these artifacts:

- Product requirements: `docs/product-requirements.md`
- Technical implementation plan: `docs/technical-implementation-plan.md`
- Product management operating model: `docs/product-management-operating-model.md`
- Feature requirement template: `docs/feature-requirement-template.md`
- Page and journey matrix: `docs/page-requirements-matrix.md`
- Product decision log: `docs/product-decision-log.md`
- Requirements freeze workshop: `docs/requirements-freeze-workshop.md`

## 48-Hour Product Focus

The next 48 hours should not be random feature coding. The fastest high-quality path is:

1. Lock the page and journey matrix for public, developer, publisher, admin, and account areas.
2. Write feature specs for the three most important user journeys:
   - Developer discovers, installs, and tests a skill.
   - Publisher uploads, submits, monetizes, and improves a skill.
   - Admin reviews, governs, and prepares launch readiness.
3. Convert those specs into UI tasks, API tasks, and QA tasks.
4. Only then continue page polish and implementation.

## Rule For Future Agent Work

When multiple AI roles run in parallel:

- Product Manager owns requirements and priority.
- UI/UX owns page structure and interaction after requirements are approved.
- Frontend owns implementation of approved UI states.
- Backend owns data, API, permissions, state machines, and audit.
- QA owns verification against acceptance criteria.
- User/Customer role challenges whether the platform feels real and worth returning to.

No role should invent product scope independently. If a new need appears, it goes back to the Product Manager first.
