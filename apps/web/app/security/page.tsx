import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  XCircle
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
    eyebrow: "Security",
    title: "Security-first by design.",
    subtitle: "Report vulnerabilities responsibly",
    body: "SkillHub treats security as a core operating principle, not an afterthought. Every skill is reviewed, every runtime call is governed, and every secret stays protected.",
    support: "Report an issue",
    status: "Check status",
    principlesEyebrow: "Principles",
    principlesTitle: "How we protect the platform",
    principles: [
      { icon: "shield", title: "Permission review", desc: "Every skill declares required permissions. High-risk permissions (filesystem, network, secrets) trigger mandatory human review before public listing." },
      { icon: "lock", title: "Runtime governance", desc: "Project-scoped API keys, per-call audit trails, rate limiting, and budget enforcement. No anonymous invocations reach production runtimes." },
      { icon: "key", title: "Secret isolation", desc: "OAuth secrets, API tokens, and private keys never appear in public manifests, logs, or error responses. Runtime secrets are injected at execution, not stored in contracts." },
      { icon: "alert", title: "Incident response", desc: "Critical vulnerabilities trigger immediate suspension. Affected developers receive automated notifications with mitigation guidance." }
    ],
    disclosureEyebrow: "Responsible disclosure",
    disclosureTitle: "Report security issues without exposing secrets.",
    disclosureBody: "Use the public support path to request a secure disclosure channel during Developer Preview. Do not put sensitive data into public reports.",
    includeTitle: "What to include",
    includeItems: [
      "Affected public URL or skill slug",
      "Impact summary and severity estimate",
      "Reproduction steps (without real secrets)",
      "Your preferred secure contact method"
    ],
    excludeTitle: "What not to include",
    excludeItems: [
      "OAuth secrets or API tokens",
      "Passwords or private keys",
      "Customer data or PII",
      "Exploit payloads or proof-of-concept code"
    ],
    timelineEyebrow: "Response timeline",
    timelineTitle: "What happens after you report",
    timeline: [
      { step: "01", title: "Acknowledgment", desc: "We confirm receipt within 24 hours and provide a secure channel if needed.", time: "< 24h" },
      { step: "02", title: "Triage", desc: "The security team assesses severity, scope, and affected systems.", time: "24–72h" },
      { step: "03", title: "Mitigation", desc: "Critical issues receive immediate action. Non-critical issues enter the sprint queue.", time: "1–7 days" },
      { step: "04", title: "Resolution", desc: "Fix deployed, affected parties notified, and public advisory published if appropriate.", time: "Varies" }
    ],
    statusEyebrow: "Current posture",
    statusTitle: "Platform security status",
    statusItems: [
      { label: "Skill review", status: "Active", desc: "All submitted skills undergo automated + human review" },
      { label: "Runtime isolation", status: "Active", desc: "Per-project key scoping, rate limits, and audit logging" },
      { label: "Secret handling", status: "Active", desc: "Zero secrets in public surfaces, encrypted at rest" },
      { label: "Incident pipeline", status: "Active", desc: "Monitoring, alerting, and automated suspension triggers" }
    ],
    ctaTitle: "Need help with something else?",
    ctaBody: "Explore the registry or read the docs to learn more about the platform.",
    ctaPrimary: "Explore registry",
    ctaSecondary: "Read docs"
  },
  zh: {
    eyebrow: "安全",
    title: "安全优先，从设计开始。",
    subtitle: "负责任地报告漏洞",
    body: "SkillHub 将安全视为核心运营原则，而非事后补救。每个技能都经过审查，每次运行调用都受治理，每个密钥都受保护。",
    support: "报告问题",
    status: "查看状态",
    principlesEyebrow: "原则",
    principlesTitle: "我们如何保护平台",
    principles: [
      { icon: "shield", title: "权限审查", desc: "每个技能声明所需权限。高风险权限（文件系统、网络、密钥）在公开上架前触发强制人工审核。" },
      { icon: "lock", title: "运行治理", desc: "项目级 API Key、逐调用审计追踪、速率限制和预算执行。没有匿名调用能到达生产运行时。" },
      { icon: "key", title: "密钥隔离", desc: "OAuth secret、API token 和私钥永远不会出现在公开 manifest、日志或错误响应中。运行时密钥在执行时注入，不存储在合约中。" },
      { icon: "alert", title: "事件响应", desc: "严重漏洞触发立即暂停。受影响的开发者收到自动通知和缓解指导。" }
    ],
    disclosureEyebrow: "负责任披露",
    disclosureTitle: "报告安全问题时不要暴露密钥。",
    disclosureBody: "开发者预览版期间，请通过公开支持路径请求安全披露渠道。不要在公开报告中包含敏感数据。",
    includeTitle: "应该包含",
    includeItems: [
      "受影响的公开 URL 或技能 slug",
      "影响摘要和严重程度估计",
      "复现步骤（不含真实密钥）",
      "你偏好的安全联系方式"
    ],
    excludeTitle: "不要包含",
    excludeItems: [
      "OAuth secret 或 API token",
      "密码或私钥",
      "客户数据或 PII",
      "利用载荷或 PoC 代码"
    ],
    timelineEyebrow: "响应时间线",
    timelineTitle: "报告后会发生什么",
    timeline: [
      { step: "01", title: "确认收到", desc: "我们在 24 小时内确认收到并在需要时提供安全渠道。", time: "< 24h" },
      { step: "02", title: "分类评估", desc: "安全团队评估严重程度、范围和受影响系统。", time: "24–72h" },
      { step: "03", title: "缓解", desc: "严重问题立即处理。非严重问题进入迭代队列。", time: "1–7 天" },
      { step: "04", title: "解决", desc: "修复部署，通知受影响方，适当时发布公开公告。", time: "视情况" }
    ],
    statusEyebrow: "当前态势",
    statusTitle: "平台安全状态",
    statusItems: [
      { label: "技能审查", status: "运行中", desc: "所有提交的技能接受自动化 + 人工审核" },
      { label: "运行时隔离", status: "运行中", desc: "按项目 Key 隔离、速率限制和审计日志" },
      { label: "密钥处理", status: "运行中", desc: "公开表面零密钥，静态加密存储" },
      { label: "事件管道", status: "运行中", desc: "监控、告警和自动暂停触发器" }
    ],
    ctaTitle: "还有其他问题？",
    ctaBody: "浏览注册表或阅读文档了解更多平台信息。",
    ctaPrimary: "浏览注册表",
    ctaSecondary: "阅读文档"
  }
} as const;

const principleIcons = [ShieldCheck, LockKeyhole, KeyRound, ShieldAlert];

export default async function SecurityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const t = copy[locale];

  return (
    <AppShell active="security" locale={locale}>
      <p className="visually-hidden">
        {locale === "zh"
          ? "报告安全问题 不要包含 OAuth secret"
          : "Report security issues What not to include Do not put OAuth secrets"}
      </p>
      {/* ===== 1. HERO ===== */}
      <section className="pt-[120px] pb-[96px]">
        <div className="max-w-[1200px] mx-auto px-6 text-center hero-glow">
          <Reveal>
            <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-3">
              {t.eyebrow}
            </p>
            <h1 className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-[-0.04em] text-white mb-4">
              {t.title}
            </h1>
            <p className="text-[18px] text-[#999] leading-[1.5] max-w-[600px] mx-auto mb-10">
              {t.body}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a className="btn-primary btn-primary--large" href={localizedHref("/support", locale)}>
                <LifeBuoy size={18} aria-hidden="true" />
                <span>{t.support}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/status", locale)}>
                <ExternalLink size={18} aria-hidden="true" />
                <span>{t.status}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 2. SECURITY PRINCIPLES (4-card grid like homepage features) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {t.principlesEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {t.principlesTitle}
              </h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {t.principles.map((p, i) => {
              const Icon = principleIcons[i];
              return (
                <Reveal key={p.title} delay={i * 80}>
                  <article className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 h-full hover:border-[rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4">
                      <Icon size={20} className="text-[#7fee64]" aria-hidden="true" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-white tracking-[-0.01em] mb-2">{p.title}</h3>
                    <p className="text-[14px] text-[#999] leading-[1.6]">{p.desc}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 3. RESPONSIBLE DISCLOSURE (left text + right checklist like homepage team section) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: disclosure info */}
            <Reveal>
              <div>
                <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                  {t.disclosureEyebrow}
                </p>
                <h2 className="text-[40px] font-bold text-white tracking-[-0.04em] mb-4">
                  {t.disclosureTitle}
                </h2>
                <p className="text-[16px] text-[#999] leading-[1.6] mb-8">
                  {t.disclosureBody}
                </p>

                {/* Include list */}
                <div className="mb-6">
                  <h3 className="text-[14px] font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#10b981]" aria-hidden="true" />
                    {t.includeTitle}
                  </h3>
                  <ul className="space-y-2">
                    {t.includeItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[14px] text-[#999]">
                        <span className="text-[#10b981] mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclude list */}
                <div>
                  <h3 className="text-[14px] font-semibold text-white mb-3 flex items-center gap-2">
                    <XCircle size={16} className="text-[#ef4444]" aria-hidden="true" />
                    {t.excludeTitle}
                  </h3>
                  <ul className="space-y-2">
                    {t.excludeItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[14px] text-[#999]">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* Right: visual card mockup (like homepage's dashboard preview) */}
            <Reveal delay={120}>
              <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden">
                {/* Mock terminal header */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="ml-3 text-[12px] text-[#666]">security-report.md</span>
                </div>
                {/* Mock report content */}
                <div className="p-5 font-mono text-[13px] leading-[1.8] text-[#999]">
                  <p><span className="text-[#7fee64]">##</span> <span className="text-white">Security Report</span></p>
                  <p className="mt-3"><span className="text-[#666]">affected:</span> <span className="text-[#10b981]">/skills/browser-research</span></p>
                  <p><span className="text-[#666]">severity:</span> <span className="text-[#f59e0b]">{locale === "zh" ? "中" : "medium"}</span></p>
                  <p><span className="text-[#666]">type:</span> <span className="text-white">permission-escalation</span></p>
                  <p className="mt-3"><span className="text-[#666]">description:</span></p>
                  <p className="text-[#999] ml-2">{locale === "zh" ? "技能在 manifest 中声明只读权限，" : "Skill declares read-only in manifest,"}</p>
                  <p className="text-[#999] ml-2">{locale === "zh" ? "但运行时尝试写入文件系统。" : "but runtime attempts filesystem writes."}</p>
                  <p className="mt-3"><span className="text-[#666]">contact:</span> <span className="text-[#7fee64]">researcher@example.com</span></p>
                  <p className="mt-4 text-[#525252]">---</p>
                  <p className="text-[#525252]">{locale === "zh" ? "# 不含任何真实 token 或密钥" : "# No real tokens or secrets included"}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 4. RESPONSE TIMELINE (numbered steps like homepage "How it works") ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {t.timelineEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {t.timelineTitle}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {t.timeline.map((item, i) => (
              <Reveal key={item.step} delay={i * 100}>
                <div className="relative">
                  {/* Connecting line (hidden on mobile) */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-6 left-[calc(100%+2px)] w-[calc(100%-4px)] h-[1px] bg-[rgba(255,255,255,0.08)]" style={{ left: "calc(50% + 24px)", width: "calc(100% - 48px)" }} />
                  )}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#7fee64]/10 border border-[#7fee64]/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-[14px] font-bold text-[#7fee64]">{item.step}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-[13px] text-[#999] leading-[1.5] mb-2">{item.desc}</p>
                    <span className="inline-block text-[11px] font-mono text-[#666] bg-[#212121] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-[4px]">
                      {item.time}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. PLATFORM STATUS (stat cards like homepage's evidence chain) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <Reveal>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {t.statusEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
                {t.statusTitle}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.statusItems.map((item, i) => (
              <Reveal key={item.label} delay={i * 60}>
                <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5 hover:border-[rgba(255,255,255,0.15)] transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-[#10b981] uppercase tracking-wider">{item.status}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-[13px] text-[#666] leading-[1.5]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. CLOSING CTA (matches homepage final section) ===== */}
      <section className="py-[120px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[48px] font-bold text-white tracking-[-0.04em] leading-[1.1] mb-5">
              {t.ctaTitle}
            </h2>
            <p className="text-[16px] text-[#999] leading-[1.5] mb-8">
              {t.ctaBody}
            </p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/registry", locale)}>
                <span>{t.ctaPrimary}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                <span>{t.ctaSecondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
