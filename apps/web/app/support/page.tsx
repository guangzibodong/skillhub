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
    body: "Choose the right support path for integration questions, Pro onboarding, skill reports, or security issues. During Launch Preview, signed-in skill reports happen from skill detail pages and general support goes through email.",
    primary: "Report an issue",
    secondary: "Security contact",
    channelsEyebrow: "Support channels",
    channelsTitle: "Pick the path that fits your situation",
    channels: [
      { icon: "report", title: "Skill reports", desc: "Signed-in skill reports are submitted from the relevant skill detail page. Public visitors can use the report guide to choose the right path without exposing private data.", action: "Report guide", href: "/report" },
      { icon: "security", title: "Security disclosure", desc: "Discovered a vulnerability? Use the security contact path first and do not send API keys, passwords, OAuth tokens, or private user data.", action: "Security contact", href: "/security" },
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
    expectTitle: "Launch Preview response model",
    expectItems: [
      { icon: "clock", label: "General support", value: "Email", desc: "For account, login, docs, onboarding, and Pro questions, contact Support@useskillhub.com with the page URL and reproduction steps." },
      { icon: "triage", label: "Skill-specific reports", value: "Signed-in", desc: "Reports tied to a specific skill should be filed from that skill page after sign-in so the issue keeps skill and account context." },
      { icon: "update", label: "Security issues", value: "Private path", desc: "Start from the security contact path and request a secure disclosure channel before sharing exploit details or sensitive data." },
      { icon: "resolve", label: "Preview limitation", value: "No SLA", desc: "Developer Preview does not promise production SLA, automated refunds, or self-serve payment dispute handling yet." }
    ],
    faqEyebrow: "Common questions",
    faqTitle: "Before you write in",
    faq: [
      { q: "How do I reset my API key?", a: "Go to Developer Workspace → Project → API Keys → Rotate. The old key is revoked immediately." },
      { q: "Why is my skill stuck in review?", a: "Reviews take 1–3 business days. Check Publisher Workspace for reviewer feedback and required changes." },
      { q: "Can I get a refund on a paid skill?", a: "Paid marketplace is in preview. Provider checkout and real payment capture are not generally available yet." },
      { q: "How do I report a malicious skill?", a: "Open the skill detail page, sign in, and use the skill report path when available. For urgent safety concerns, contact support with the skill slug and page URL." }
    ],
    ctaTitle: "Still need help?",
    ctaBody: "Email Support@useskillhub.com with the page URL, account email, timestamp, screenshots, and steps to reproduce. Do not include secrets.",
    ctaPrimary: "Report an issue",
    ctaSecondary: "Browse marketplace"
  },
  zh: {
    eyebrow: "支持",
    title: "我们随时为你提供帮助。",
    subtitle: "选择适合你问题的路径",
    body: "请选择适合的支持路径：集成问题、Pro 开通、技能举报或安全问题。公开预览期内，技能级举报从登录后的技能详情页提交，通用支持走邮件。",
    primary: "报告问题",
    secondary: "安全联系",
    channelsEyebrow: "支持渠道",
    channelsTitle: "选择适合你情况的路径",
    channels: [
      { icon: "report", title: "技能举报", desc: "技能级举报应从登录后的对应技能详情页提交。公开访客可以先阅读举报指南，选择正确路径并避免暴露私密数据。", action: "举报指南", href: "/report" },
      { icon: "security", title: "安全披露", desc: "发现漏洞？请先走安全联系路径，不要发送 API Key、密码、OAuth token 或私人用户数据。", action: "安全联系", href: "/security" },
      { icon: "docs", title: "文档", desc: "大多数集成问题在我们的 API 文档、manifest 参考和入门指南中都有解答。", action: "阅读文档", href: "/docs" },
      { icon: "status", title: "平台状态", desc: "查看技能 API、公开 API 和运行时网关的实时健康状况。包含历史正常运行时间数据。", action: "查看状态", href: "/status" }
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
    expectTitle: "公开预览期响应方式",
    expectItems: [
      { icon: "clock", label: "通用支持", value: "邮件", desc: "账号、登录、文档、开通和 Pro 咨询，请发送页面 URL、复现步骤和截图到 Support@useskillhub.com。" },
      { icon: "triage", label: "技能级举报", value: "登录后", desc: "和具体技能相关的举报，应从登录后的技能页发起，这样能保留技能和账号上下文。" },
      { icon: "update", label: "安全问题", value: "私密通道", desc: "先走安全联系路径，并在分享漏洞细节或敏感数据前请求安全披露通道。" },
      { icon: "resolve", label: "预览限制", value: "无 SLA", desc: "开发者预览期暂不承诺生产 SLA、自动退款或自助支付争议处理。" }
    ],
    faqEyebrow: "常见问题",
    faqTitle: "在提交之前",
    faq: [
      { q: "如何重置 API Key？", a: "前往开发者工作台 → 项目 → API Keys → 轮换。旧 Key 立即撤销。" },
      { q: "为什么我的技能卡在审核中？", a: "审核需要 1-3 个工作日。在发布者工作台查看审核反馈和所需更改。" },
      { q: "付费技能能退款吗？", a: "付费市场处于预览阶段。支付渠道扣款和通用自助收银暂未开放。" },
      { q: "如何举报恶意技能？", a: "打开对应技能详情页，登录后使用技能举报路径。紧急安全问题请联系支持，并提供技能 slug 和页面 URL。" }
    ],
    ctaTitle: "还需要帮助？",
    ctaBody: "请把页面 URL、账号邮箱、时间、截图和复现步骤发到 Support@useskillhub.com。不要包含密钥。",
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
      <p className="visually-hidden">
        {locale === "zh"
          ? "开发者预览版支持 不要提交密钥 报告问题"
          : "Developer Preview support No secrets Report an issue"}
      </p>
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
                      <Icon size={20} className="text-[#7fee64]" aria-hidden="true" />
                    </div>
                    <h3 className="text-[16px] font-medium text-white mb-2 group-hover:text-[#7fee64] transition-colors">
                      {channel.title}
                    </h3>
                    <p className="text-[14px] text-[#999] leading-[1.5] mb-4">{channel.desc}</p>
                    <span className="text-[13px] text-[#7fee64] font-medium inline-flex items-center gap-1">
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
                    <Icon size={18} className="text-[#7fee64] mb-3" aria-hidden="true" />
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
