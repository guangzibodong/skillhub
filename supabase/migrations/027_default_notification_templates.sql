insert into notification_templates (template_key, channel, locale, subject, body, status, updated_at)
values
  (
    'auth.email.code.requested',
    'email',
    'en',
    'Your SkillHub verification code',
    'Use code {{code}} to continue signing in to SkillHub. The code expires soon. If you did not request this, you can ignore this message.',
    'active',
    now()
  ),
  (
    'auth.email.code.requested',
    'email',
    'zh',
    'SkillHub 验证码',
    '请使用验证码 {{code}} 继续登录 SkillHub。验证码会很快过期。如果不是你本人操作，可以忽略这条消息。',
    'active',
    now()
  ),
  (
    'auth.email.signup.verified',
    'in_app',
    'en',
    'Workspace created',
    'Your SkillHub workspace is ready. Create a project, install a skill, or publish your first skill package.',
    'active',
    now()
  ),
  (
    'auth.email.signup.verified',
    'in_app',
    'zh',
    '工作区已创建',
    '你的 SkillHub 工作区已经准备好。你可以创建项目、安装技能，或发布第一个技能包。',
    'active',
    now()
  ),
  (
    'skill.review.submitted',
    'in_app',
    'en',
    'Skill submitted for review',
    'Skill {{skillSlug}} entered review. Track automated checks and reviewer notes from the publisher workspace.',
    'active',
    now()
  ),
  (
    'skill.review.submitted',
    'in_app',
    'zh',
    '技能已提交审核',
    '技能 {{skillSlug}} 已进入审核。你可以在发布者工作台查看自动检查和审核意见。',
    'active',
    now()
  ),
  (
    'skill.review.approved',
    'in_app',
    'en',
    'Skill review approved',
    'Skill {{skillSlug}} has been approved and can appear in marketplace discovery.',
    'active',
    now()
  ),
  (
    'skill.review.approved',
    'in_app',
    'zh',
    '技能审核已通过',
    '技能 {{skillSlug}} 已通过审核，可以进入市场发现流程。',
    'active',
    now()
  ),
  (
    'skill.review.approved',
    'email',
    'en',
    'Skill review approved',
    'Skill {{skillSlug}} has been approved. Review pricing, distribution, and publisher readiness before paid launch.',
    'active',
    now()
  ),
  (
    'skill.review.approved',
    'email',
    'zh',
    '技能审核已通过',
    '技能 {{skillSlug}} 已通过审核。正式付费上线前，请检查定价、分发状态和发布者准备度。',
    'active',
    now()
  ),
  (
    'skill.review.rejected',
    'in_app',
    'en',
    'Skill review needs changes',
    'Skill {{skillSlug}} was not approved yet. Review the notes and automated check results before resubmitting.',
    'active',
    now()
  ),
  (
    'skill.review.rejected',
    'in_app',
    'zh',
    '技能审核需要修改',
    '技能 {{skillSlug}} 暂未通过审核。请查看审核意见和自动检查结果后再重新提交。',
    'active',
    now()
  ),
  (
    'runtime.incident.opened',
    'in_app',
    'en',
    'Runtime incident opened',
    'A {{severity}} runtime incident was opened for {{skillSlug}}. Review impact, recovery steps, and publisher response.',
    'active',
    now()
  ),
  (
    'runtime.incident.opened',
    'in_app',
    'zh',
    '运行事故已创建',
    '技能 {{skillSlug}} 已创建 {{severity}} 级运行事故。请查看影响范围、恢复步骤和发布者响应。',
    'active',
    now()
  ),
  (
    'runtime.incident.opened',
    'email',
    'en',
    'Runtime incident opened for {{skillSlug}}',
    'SkillHub opened a {{severity}} runtime incident for {{skillSlug}}. Check the admin or publisher workspace for recovery status.',
    'active',
    now()
  ),
  (
    'runtime.incident.opened',
    'email',
    'zh',
    '技能 {{skillSlug}} 发生运行事故',
    'SkillHub 已为技能 {{skillSlug}} 创建 {{severity}} 级运行事故。请在后台或发布者工作台查看恢复状态。',
    'active',
    now()
  ),
  (
    'runtime.incident.opened',
    'webhook',
    'en',
    'runtime.incident.opened',
    '{"event":"runtime.incident.opened","skillSlug":"{{skillSlug}}","severity":"{{severity}}","incidentId":"{{incidentId}}"}',
    'active',
    now()
  ),
  (
    'billing.usage_posted',
    'in_app',
    'en',
    'Billable usage posted',
    'Usage for {{skillName}} was posted to the ledger. Gross {{grossCents}}, platform fee {{platformFeeCents}}, publisher share {{publisherShareCents}}.',
    'active',
    now()
  ),
  (
    'billing.usage_posted',
    'in_app',
    'zh',
    '可计费用量已入账',
    '技能 {{skillName}} 的用量已进入账本。总额 {{grossCents}}，平台费用 {{platformFeeCents}}，发布者分成 {{publisherShareCents}}。',
    'active',
    now()
  ),
  (
    'billing.subscription_posted',
    'in_app',
    'en',
    'Subscription period posted',
    'A subscription period for {{skillName}} was posted to the ledger and is ready for invoice, split, balance, refund, and dispute workflows.',
    'active',
    now()
  ),
  (
    'billing.subscription_posted',
    'in_app',
    'zh',
    '订阅周期已入账',
    '技能 {{skillName}} 的订阅周期已入账，可进入发票、分账、余额、退款和争议流程。',
    'active',
    now()
  ),
  (
    'billing.subscription_posted',
    'webhook',
    'en',
    'billing.subscription_posted',
    '{"event":"billing.subscription_posted","skillName":"{{skillName}}","transactionId":"{{transactionId}}","amountCents":"{{amountCents}}"}',
    'active',
    now()
  ),
  (
    'payout.requested',
    'in_app',
    'en',
    'Payout requested',
    'A payout request for {{publisherName}} was created. Track finance review, manual transfer reference, and linked balance state from the admin console.',
    'active',
    now()
  ),
  (
    'payout.requested',
    'in_app',
    'zh',
    '提现请求已创建',
    '{{publisherName}} 的提现请求已创建。请在后台跟踪财务审核、人工转账凭证和关联余额状态。',
    'active',
    now()
  ),
  (
    'payout.mark_paid',
    'in_app',
    'en',
    'Payout marked paid',
    'Payout {{payoutId}} was marked paid and linked balances moved to paid state.',
    'active',
    now()
  ),
  (
    'payout.mark_paid',
    'in_app',
    'zh',
    '提现已标记为已支付',
    '提现 {{payoutId}} 已标记为已支付，关联余额已进入已支付状态。',
    'active',
    now()
  ),
  (
    'buyer_request.created',
    'in_app',
    'en',
    'Buyer request opened',
    'A buyer request was opened for {{title}}. Publishers can claim demand and submit matching builds.',
    'active',
    now()
  ),
  (
    'buyer_request.created',
    'in_app',
    'zh',
    '买家需求已创建',
    '买家需求 {{title}} 已创建。发布者可以认领需求并提交匹配方案。',
    'active',
    now()
  ),
  (
    'buyer_request.submitted',
    'in_app',
    'en',
    'Buyer request build submitted',
    'A publisher submitted a build for {{title}}. Review the submission and decide whether to match or close the request.',
    'active',
    now()
  ),
  (
    'buyer_request.submitted',
    'in_app',
    'zh',
    '买家需求方案已提交',
    '发布者已为 {{title}} 提交方案。请查看提交内容，并决定是否匹配或关闭需求。',
    'active',
    now()
  ),
  (
    'account.security.session_revoked',
    'in_app',
    'en',
    'Account session revoked',
    'A SkillHub account session was revoked. Review active sessions if this was unexpected.',
    'active',
    now()
  ),
  (
    'account.security.session_revoked',
    'in_app',
    'zh',
    '账号会话已撤销',
    '一个 SkillHub 账号会话已被撤销。如果这不是预期操作，请检查当前活跃会话。',
    'active',
    now()
  ),
  (
    'account.security.identity_disconnected',
    'in_app',
    'en',
    'Login identity disconnected',
    'A connected login identity was disconnected from your SkillHub account. Confirm another sign-in path remains available.',
    'active',
    now()
  ),
  (
    'account.security.identity_disconnected',
    'in_app',
    'zh',
    '登录身份已断开',
    '一个已连接的登录身份已从你的 SkillHub 账号断开。请确认仍然保留其他可用登录方式。',
    'active',
    now()
  ),
  (
    'platform.notification_delivery.processed',
    'in_app',
    'en',
    'Notification delivery batch processed',
    'An external notification delivery batch was processed. Review failed or skipped rows in the admin delivery queue.',
    'active',
    now()
  ),
  (
    'platform.notification_delivery.processed',
    'in_app',
    'zh',
    '通知投递批处理已完成',
    '一批外部通知投递任务已处理。请在后台投递队列查看失败或跳过的记录。',
    'active',
    now()
  ),
  (
    'auth.email.login.verified',
    'in_app',
    'en',
    'Email login verified',
    'Your email login was verified. Review account sessions if this was unexpected.',
    'active',
    now()
  ),
  (
    'auth.email.login.verified',
    'in_app',
    'zh',
    '邮箱登录已验证',
    '你的邮箱登录已经完成验证。如果这不是你本人操作，请检查账号会话。',
    'active',
    now()
  ),
  (
    'skill.review.blocked',
    'in_app',
    'en',
    'Skill review blocked',
    'Skill {{skillSlug}} was blocked during review. Review the operator notes, runtime checks, and risk signals before resubmitting.',
    'active',
    now()
  ),
  (
    'skill.review.blocked',
    'in_app',
    'zh',
    '技能审核已阻止',
    '技能 {{skillSlug}} 在审核中被阻止。请查看运营备注、运行检查和风险信号后再重新提交。',
    'active',
    now()
  ),
  (
    'billing.subscription_period.renewed',
    'in_app',
    'en',
    'Subscription period renewed',
    'The subscription period for {{skillName}} was renewed. Post the new period before invoice, split, balance, refund, or dispute workflows continue.',
    'active',
    now()
  ),
  (
    'billing.subscription_period.renewed',
    'in_app',
    'zh',
    '订阅周期已续期',
    '技能 {{skillName}} 的订阅周期已续期。请先入账新周期，再继续发票、分账、余额、退款或争议流程。',
    'active',
    now()
  ),
  (
    'billing.subscription_period.renewed',
    'webhook',
    'en',
    'billing.subscription_period.renewed',
    '{"event":"billing.subscription_period.renewed","skillName":"{{skillName}}","subscriptionId":"{{subscriptionId}}","periodStart":"{{periodStart}}","periodEnd":"{{periodEnd}}"}',
    'active',
    now()
  ),
  (
    'payout.review',
    'in_app',
    'en',
    'Payout entered review',
    'Payout {{payoutId}} entered finance review because it requires manual approval before finance transfers funds.',
    'active',
    now()
  ),
  (
    'payout.review',
    'in_app',
    'zh',
    '提现进入审核',
    '提现 {{payoutId}} 已进入财务审核，需要人工批准后才能进入财务转账。',
    'active',
    now()
  ),
  (
    'payout.approve',
    'in_app',
    'en',
    'Payout approved',
    'Payout {{payoutId}} was approved for manual transfer. Track transfer reference and linked balance state from finance operations.',
    'active',
    now()
  ),
  (
    'payout.approve',
    'in_app',
    'zh',
    '提现已批准',
    '提现 {{payoutId}} 已批准进入人工转账。请在财务后台跟踪转账凭证和关联余额状态。',
    'active',
    now()
  ),
  (
    'payout.fail',
    'in_app',
    'en',
    'Payout failed',
    'Payout {{payoutId}} failed. Review the finance reason and retry conditions before creating a new payout action.',
    'active',
    now()
  ),
  (
    'payout.fail',
    'in_app',
    'zh',
    '提现失败',
    '提现 {{payoutId}} 已失败。请查看财务原因和重试条件后再发起新的提现操作。',
    'active',
    now()
  ),
  (
    'payout.block',
    'in_app',
    'en',
    'Payout blocked',
    'Payout {{payoutId}} was blocked. Resolve the finance reason before funds can move again.',
    'active',
    now()
  ),
  (
    'payout.block',
    'in_app',
    'zh',
    '提现已阻止',
    '提现 {{payoutId}} 已被阻止。需要解决财务原因后资金才能继续流转。',
    'active',
    now()
  ),
  (
    'skill.feedback.created',
    'in_app',
    'en',
    'Skill feedback submitted',
    'New feedback for {{skillSlug}} is waiting for moderation before it becomes public.',
    'active',
    now()
  ),
  (
    'skill.feedback.created',
    'in_app',
    'zh',
    '技能反馈已提交',
    '技能 {{skillSlug}} 收到新的反馈，发布到公开页面前需要先完成审核。',
    'active',
    now()
  ),
  (
    'skill.feedback.published',
    'in_app',
    'en',
    'Skill feedback published',
    'Feedback for {{skillSlug}} was published and now contributes to marketplace trust signals.',
    'active',
    now()
  ),
  (
    'skill.feedback.published',
    'in_app',
    'zh',
    '技能反馈已发布',
    '技能 {{skillSlug}} 的反馈已发布，并会进入市场信任信号。',
    'active',
    now()
  ),
  (
    'skill.feedback.publisher_response',
    'in_app',
    'en',
    'Publisher responded to feedback',
    'A publisher response was added to feedback for {{skillSlug}}. Review the public response for accuracy and support quality.',
    'active',
    now()
  ),
  (
    'skill.feedback.publisher_response',
    'in_app',
    'zh',
    '发布者已回复反馈',
    '技能 {{skillSlug}} 的反馈已添加发布者回复。请检查公开回复是否准确、支持质量是否合格。',
    'active',
    now()
  ),
  (
    'marketplace.curation.updated',
    'in_app',
    'en',
    'Marketplace placement updated',
    'Marketplace placement for {{skillSlug}} changed. Review reason, expiry, quality gaps, and appeal path from the publisher workspace.',
    'active',
    now()
  ),
  (
    'marketplace.curation.updated',
    'in_app',
    'zh',
    '市场分发状态已更新',
    '技能 {{skillSlug}} 的市场分发状态已变更。请在发布者工作台查看原因、到期时间、质量缺口和申诉路径。',
    'active',
    now()
  ),
  (
    'marketplace.curation.appeal_created',
    'in_app',
    'en',
    'Marketplace appeal created',
    'A marketplace distribution appeal was created for {{skillSlug}}. Review evidence and SLA from the admin queue.',
    'active',
    now()
  ),
  (
    'marketplace.curation.appeal_created',
    'in_app',
    'zh',
    '市场分发申诉已创建',
    '技能 {{skillSlug}} 已创建市场分发申诉。请在后台队列查看证据和 SLA。',
    'active',
    now()
  ),
  (
    'marketplace.curation.appeal_approved',
    'in_app',
    'en',
    'Marketplace appeal approved',
    'Marketplace appeal for {{skillSlug}} was approved. Review updated placement and next quality actions.',
    'active',
    now()
  ),
  (
    'marketplace.curation.appeal_approved',
    'in_app',
    'zh',
    '市场分发申诉已通过',
    '技能 {{skillSlug}} 的市场分发申诉已通过。请查看更新后的分发状态和后续质量动作。',
    'active',
    now()
  ),
  (
    'trust.abuse_report.created',
    'in_app',
    'en',
    'Trust report created',
    'A trust report was opened for {{skillSlug}}. Review category, severity, evidence, and required action from the risk queue.',
    'active',
    now()
  ),
  (
    'trust.abuse_report.created',
    'in_app',
    'zh',
    '信任报告已创建',
    '技能 {{skillSlug}} 已创建信任报告。请在风险队列查看类别、严重级别、证据和所需动作。',
    'active',
    now()
  ),
  (
    'platform.notification_template.updated',
    'in_app',
    'en',
    'Notification template updated',
    'A notification template was changed. Review channel, locale, status, and audit trail from the admin console.',
    'active',
    now()
  ),
  (
    'platform.notification_template.updated',
    'in_app',
    'zh',
    '通知模板已更新',
    '一个通知模板已变更。请在后台查看渠道、语言、状态和审计记录。',
    'active',
    now()
  ),
  (
    'platform.webhook_delivery.processed',
    'in_app',
    'en',
    'Webhook delivery batch processed',
    'A webhook outbox batch was processed. Review failed endpoint rows, retry state, and response excerpts from the admin console.',
    'active',
    now()
  ),
  (
    'platform.webhook_delivery.processed',
    'in_app',
    'zh',
    'Webhook 投递批处理已完成',
    '一批 Webhook 出站任务已处理。请在后台查看失败端点、重试状态和响应摘要。',
    'active',
    now()
  )
on conflict (template_key, channel, locale) do nothing;
