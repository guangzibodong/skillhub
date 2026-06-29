# 全项目未实现功能审计与分步实现计划

## 审计范围

本计划将未实现或半实现能力分为三类：

- P0 可点 UI 缺行为：用户能看到并点击，但没有产生预期行为。
- P1 行为不完整/状态不一致：功能存在，但状态、URL、数据流或恢复路径不完整。
- Roadmap/Preview：文案明确标注预览、预发布或需要业务决策的能力。

本轮只处理 P0/P1 中不需要业务决策的缺口。支付、自助结算、自动提现、税务/KYC 自动化、生产外部 runtime proxy、实时事故状态页等 Preview/Roadmap 能力只记录，不直接实现。

## 首批发现

### P0 可点 UI 缺行为

- 找技能页排序工具栏只暴露“推荐”，没有入口切换“安装最多 / 成功率最高 / 风险最低 / 最近审核”。
- “视图：紧凑”按钮无状态、无 onClick、无布局变化。
- 移动端“筛选结果”按钮无行为。

### P1 行为不完整/状态不一致

- 搜索 form 提交只带 `q/lang`，会丢失当前分类、风险、运行时、验证、排序等筛选状态。
- 服务端按 URL 参数预筛选后只把筛选后的 `skills` 传给客户端，用户点“重置筛选”无法恢复完整目录。
- 服务端找技能页固定 `limit: 50`，与页面常量 `MARKETPLACE_PAGE_SKILL_LIMIT = 720` 不一致，目录统计和重置体验可能被截断。
- 低风险排序需要统一输出为公开 API/文档兼容的 `sort=low_risk`，并继续兼容读取旧拼法。

## 本轮实施

- 找技能页客户端增加完整排序控件，支持 `recommended`、`adoption`、`success`、`lowRisk`、`recent`。
- URL 低风险排序输出规范化为 `sort=low_risk`，读取继续兼容 `lowRisk`、`low-risk`、`low_risk`。
- 增加 `view=compact|comfortable` 状态，默认 `compact` 保持现有视觉基线，`comfortable` 使用更宽松卡片布局。
- 移动端筛选按钮打开筛选面板，支持关闭按钮、Esc 和点击遮罩关闭。
- 搜索表单提交保留当前筛选、排序和视图参数。
- 找技能页服务端默认拉取完整公开目录，limit 使用 `MARKETPLACE_PAGE_SKILL_LIMIT`，URL 参数只作为客户端初始状态。

## 不在本轮直接实现

- 自助支付、支付 provider 会话、自动扣费。
- 自动提现、税务/KYC 自动化、付款账户校验。
- 生产外部 runtime proxy 或真实第三方工具执行链路。
- 实时状态页事故流、公开 SLA 自动化。
- 需要运营、法务、财务或安全策略决策的新后端状态机。

## 验收标准

- `/marketplace?lang=zh` 默认显示完整目录，主导航和筛选正常。
- 切换排序后列表顺序变化，URL 同步 `sort`。
- `sort=low_risk` 页面初始状态正确，高风险项不应排在低风险前。
- 切换视图后 URL 同步 `view`，卡片布局 class 变化。
- 移动宽度下点击“筛选结果”能打开筛选面板，并能关闭。
- 已选分类、风险、运行时后提交搜索，筛选参数不丢失。
- 从带筛选 URL 进入后点击“重置筛选”，恢复完整目录而不是只显示初始筛选子集。

## 建议测试命令

```bash
rtk pnpm run typecheck
rtk pnpm run lint
rtk node tests/marketplace-directory.test.mjs
rtk pnpm smoke
```

如本地依赖或外部服务不可用，至少运行可离线的类型检查和 marketplace 目录测试，并记录失败原因。
