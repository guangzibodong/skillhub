import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HeadphonesIcon,
  LifeBuoy,
  Lock,
  Mail,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Support",
    title: "We're here to help.",
    subtitle: "Choose the right path for your question",
    body: "Whether you need help with integration, have a billing question, or want to report a security issue — we have dedicated channels for every type of request.",
    primary: "Report an issue",
    secondary: "Security contact",
    channelsEyebrow: "Support channels",
    channelsTitle: "Pick the path that fits your situation",
    channels: [
      { icon: "report", title: "Issue reports", desc: "Found a bug, unexpected behavior, or documentation error? Submit a report and our team will triage within 24 hours.", action: "Report an issue", href: "/report" },
      { icon: "security", title: "Security disclosure", desc: "Discovered a vulnerability? Use our responsible disclosure process to report it safely without exposing sensitive data.", action: "Security contact", href: "/security" },
      { icon: "docs", title: "Documentation", desc: "Most integration questions are answered in our API docs, manifest reference, and getting-started guides.", action: "Read the docs", href: "/docs" },
      { icon: "status", title: "Platform status", desc: "Check real-time health of the registry, API, and runtime gateway. Historical uptime data included.", action: "View status", href: "/status" }
    ],
    guidelinesEyebrow: "Report guidelines",
    guidelinesTitle: "How to write an effective report",
    guidelines: [
      { num: "01", title: "Be specific", desc: "Include the exact URL, skill slug, or API endpoint. Vague reports take longer to investigate." },
      { num: "02", title: "Show the steps", desc: "Describe what you did, what you expected, and what actually happened. Sequence matters." },
      { num: "03", title: "Protect secrets", desc: "Never paste API keys, passwords, OAuth tokens, or private user data in any public report." },
      { num: "04", title: "Include context", desc: "Your runtime environment, SDK version, project ID (not the key), and timestamp help us reproduce faster." }
    ],
    expectEyebrow: "What to expect",
    expectTitle: "Our response process",
    expectItems: [
      { icon: "clock", label: "Acknowledgment", value: "< 24 hours", desc: "Every report receives a human response within one business day." },
      { icon: "triage", label: "Triage & priority", value: "24–72 hours", desc: "We assess severity, route to the right team, and set resolution priority." },
      { icon: "update", label: "Status updates", value: "Every 48 hours", desc: "Open tickets receive regular status updates until resolved." },
      { icon: "resolve", label: "Resolution", value: "SLA-driven", desc: "Critical: same day. High: 3 days. Medium: 1 week. Low: next sprint." }
    ],
    faqEyebrow: "Common questions",
    faqTitle: "Before you write in",
    faq: [
      { q: "How do I reset my API key?", a: "Go to Developer Workspace → Project → API Keys → Rotate. The old key is revoked immediately." },
      { q: "Why is my skill stuck in review?", a: "Reviews take 1–3 business days. Check Publisher Workspace for reviewer feedback and required changes." },
      { q: "Can I get a refund on a paid skill?", a: "Paid marketplace is in preview. No real charges are captured during Developer Preview." },
      { q: "How do I report a malicious skill?", a: "Use the Report an Issue flow. Select 'Trust & Safety' as the category. Include the skill slug." }
    ],
    ctaTitle: "Still need help?",
    ctaBody: "Our team is available during business hours. Most issues resolve within 48 hours.",
    ctaPrimary: "Report an issue",
    ctaSecondary: "Browse marketplace"
  },
  zh: {
    eyebrow: "支持",
    title: "我们随时为你提供帮助。",
    subtitle: "选择适合你问题的路径",
    body: "无论你需要集成帮助、有账单问题，还是想报告安全问题 — 我们为每种请求都有专门的渠道。",
    primary: "报告问题",
    secondary: "安全联系",
    channelsEyebrow: "支持渠道",
    channelsTitle: "选择适合你情况的路径",
    channels: [
      { icon: "report", title: "问题报告", desc: "发现 Bug、意外行为或文档错误？提交报告，我们的团队将在 24 小时内进行分类。", action: "报告问题", href: "/report" },
      { icon: "security", title: "安全披露", desc: "发现漏洞？使用我们的负责任披露流程安全地报告，不暴露敏感数据。", action: "安全联系", href: "/security" },
      { icon: "docs", title: "文档", desc: "大多数集成问题在我们的 API 文档、manifest 参考和入门指南中都有解答。", action: "阅读文档", href: "/docs" },
      { icon: "status", title: "平台状态", desc: "查看注册表、API 和运行时网关的实时健康状况。包含历史正常运行时间数据。", action: "查看状态", href: "/status" }
    ],
    guidelinesEyebrow: "报告指南",
    guidelinesTitle: "如何写出有效的报告",
    guidelines: [
      { num: "01", title: "具体明确", desc: "包含确切的 URL、技能 slug 或 API 端点。模糊的报告需要更长时间调查。" },
      { num: "02", title: "展示步骤", desc: "描述你做了什么、期望什么、实际发生了什么。顺序很重要。" },
      { num: "03", title: "保护密钥", desc: "永远不要在任何公开报告中粘贴 API Key、密码、OAuth token 或私人用户数据。" },
      { num: "04", title: "包含上下文", desc: "你的运行环境、SDK 版本、项目 ID（不是 Key）和时间戳帮助我们更快复现。" }
    ],
    expectEyebrow: "预期流程",
    expectTitle: "我们的响应流程",
    expectItems: [
      { icon: "clock", label: "确认收到", value: "< 24 小时", desc: "每份报告在一个工作日内收到人工回复。" },
      { icon: "triage", label: "分类与优先级", value: "24–72 小时", desc: "我们评估严重程度，路由到正确的团队，并设置解决优先级。" },
      { icon: "update", label: "状态更新", value: "每 48 小时", desc: "未关闭的工单定期收到状态更新直到解决。" },
      { icon: "resolve", label: "解决", value: "按 SLA", desc: "严重：当天。高：3 天。中：1 周。低：下个迭代。" }
    ],
    faqEyebrow: "常见问题",
    faqTitle: "在提交之前",
    faq: [
      { q: "如何重置 API Key？", a: "前往开发者工作台 → 项目 → API Keys → 轮换。旧 Key 立即撤销。" },
      { q: "为什么我的技能卡在审核中？", a: "审核需要 1-3 个工作日。在发布者工作台查看审核反馈和所需更改。" },
      { q: "付费技能能退款吗？", a: "付费市场处于预览阶段。开发者预览期间不会产生真实扣费。" },
      { q: "如何举报恶意技能？", a: "使用'报告问题'流程。选择'信任与安全'类别。包含技能 slug。" }
    ],
    ctaTitle: "还需要帮助？",
    ctaBody: "我们的团队在工作时间可用。大多数问题在 48 小时内解决。",
    ctaPrimary: "报告问题",
    ctaSecondary: "浏览市场"
  }
} as const;

const channelIcons = {
  report: ShieldAlert,
  security: ShieldCheck,
  docs: BookOpen,
  status: CheckCircle2
};

const expectIcons = {
  clock: Clock,
  triage: UserCheck,
  update: MessageSquare,
  resolve: CheckCircle2
};

export default async function SupportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];

  return (
    <AppShell active="support" locale={locale}>
      {/* ===== Hero ===== */}
      <section className="pt-[120px] pb-[96px]">
        <div className="section-inner text-center hero-glow">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center justify-center gap-2">
              <LifeBuoy size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </p>
            <h1 className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-[-0.04em] text-white mb-4">
              {labels.title}
            </h1>
            <p className="text-[18px] text-[#999] leading-[1.5] max-w-[580px] mx-auto mb-10">
              {labels.body}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a className="btn-primary btn-primary--large" href={localizedHref("/report", locale)}>
                <ShieldAlert size={18} aria-hidden="true" />
                <span>{labels.primary}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/security", locale)}>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>{labels.secondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Support channels (2x2 grid like homepage use cases) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="section-inner">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {labels.channelsEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {labels.channelsTitle}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {labels.channels.map((channel, i) => {
              const Icon = channelIcons[channel.icon as keyof typeof channelIcons];
              return (
                <Reveal key={channel.title} delay={i * 80}>
                  <a
                    href={localizedHref(channel.href, locale)}
                    className="block bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-[8px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4">
                      <Icon size={20} className="text-[#0075ff]" aria-hidden="true" />
                    </div>
                    <h3 className="text-[16px] font-medium text-white mb-2 group-hover:text-[#0075ff] transition-colors">
                      {channel.title}
                    </h3>
                    <p className="text-[14px] text-[#999] leading-[1.5] mb-4">{channel.desc}</p>
                    <span className="text-[13px] text-[#0075ff] font-medium inline-flex items-center gap-1">
                      {channel.action} <ArrowRight size={12} />
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Report guidelines (numbered steps like homepage "How it works") ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="section-inner">
          <div className="mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {labels.guidelinesEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {labels.guidelinesTitle}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {labels.guidelines.map((item, i) => (
              <Reveal key={item.num} delay={i * 80}>
                <div className="relative">
                  <span className="text-[48px] font-bold text-[rgba(255,255,255,0.04)] absolute top-0 left-0">
                    {item.num}
                  </span>
                  <div className="pt-12">
                    <h3 className="text-[16px] font-medium text-white mb-2">{item.title}</h3>
                    <p className="text-[14px] text-[#999] leading-[1.5]">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Response process (stat-card style like homepage metrics) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="section-inner">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {labels.expectEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {labels.expectTitle}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {labels.expectItems.map((item, i) => {
              const Icon = expectIcons[item.icon as keyof typeof expectIcons];
              return (
                <Reveal key={item.label} delay={i * 80}>
                  <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5">
                    <Icon size={18} className="text-[#0075ff] mb-3" aria-hidden="true" />
                    <span className="block text-[24px] font-bold text-white tracking-[-0.02em] mb-1">
                      {item.value}
                    </span>
                    <span className="block text-[13px] text-[#666] mb-2">{item.label}</span>
                    <p className="text-[13px] text-[#999] leading-[1.5]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ (accordion-style cards) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="section-inner">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {labels.faqEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {labels.faqTitle}
              </h2>
            </Reveal>
          </div>

          <div className="max-w-[720px] mx-auto flex flex-col gap-4">
            {labels.faq.map((item, i) => (
              <Reveal key={item.q} delay={i * 60}>
                <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5">
                  <h3 className="text-[15px] font-medium text-white mb-2">{item.q}</h3>
                  <p className="text-[14px] text-[#999] leading-[1.5]">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="py-[120px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[48px] font-bold text-white tracking-[-0.04em] leading-[1.1] mb-5">
              {labels.ctaTitle}
            </h2>
            <p className="text-[16px] text-[#999] leading-[1.5] mb-8">
              {labels.ctaBody}
            </p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/report", locale)}>
                <span>{labels.ctaPrimary}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/marketplace", locale)}>
                <span>{labels.ctaSecondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
