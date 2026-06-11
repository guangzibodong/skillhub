import { ArrowRight } from "lucide-react";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getSkills } from "@/lib/registry";
import { HomeNav } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import { PlatformPreview } from "@/components/home/platform-preview";
import { SkillGridCard } from "@/components/home/skill-grid-card";
import { IntegrationSection } from "@/components/home/integration-section";
import { Reveal } from "@/components/home/reveal";
import "./tailwind.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const skills = await getSkills();
  const langSuffix = locale === "zh" ? "?lang=zh" : "";
  const t = locale === "zh" ? zh : en;

  return (
    <div className="min-h-screen">
      <HomeNav locale={locale} />

      {/* ========== HERO ========== */}
      <section className="pt-[140px] pb-[80px]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          {/* Announcement pill */}
          <a href={`/docs${langSuffix}`} className="badge-new inline-flex mb-8">
            <span>{t.badge}</span>
            {t.badgeText}
          </a>

          {/* Eyebrow */}
          <p className="text-body-lg text-[var(--color-text-secondary)] mb-3">
            {t.eyebrow}
          </p>

          {/* Headline */}
          <h1 className="text-display text-[var(--color-text-primary)] mb-6">
            {t.headline}
          </h1>

          {/* Subline */}
          <p className="text-body-lg text-[var(--color-text-secondary)] max-w-[640px] mx-auto mb-10">
            {t.subline}
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <a href={`/developer${langSuffix}`} className="btn-primary">
              {t.cta1}
            </a>
            <a href={`/support${langSuffix}`} className="btn-text">
              {t.cta2}
            </a>
          </div>

          {/* Three tabs (like Canvas / Copilot / Compose) */}
          <div className="flex justify-center gap-8 md:gap-16 mb-10">
            {t.tabs.map((tab, i) => (
              <div key={i} className="text-center">
                <p className="text-body-sm text-[var(--color-text-primary)] mb-1">
                  {tab.title}
                </p>
                <p className="text-caption text-[var(--color-text-muted)]">
                  {tab.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Preview (large product mockup - this is the visual weight) */}
        <div className="max-w-[1100px] mx-auto px-6">
          <PlatformPreview locale={locale} />
        </div>
      </section>

      {/* ========== FEATURE BULLETS (3 items) ========== */}
      <section className="section-gap">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {t.features.map((f, i) => (
              <Reveal key={i} delay={i * 100}>
                <h3 className="text-heading-sm text-[var(--color-text-primary)] mb-3">
                  {f.title}
                </h3>
                <p className="text-body text-[var(--color-text-secondary)]">
                  {f.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SKILLS (Workflows equivalent) ========== */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-label text-[var(--color-text-muted)] mb-2">
                {t.skillsEyebrow}
              </p>
              <h2 className="text-heading text-[var(--color-text-primary)]">
                {t.skillsHeadline}
              </h2>
            </div>
            <a
              href={`/marketplace${langSuffix}`}
              className="btn-text hidden md:inline-flex"
            >
              {t.skillsSeeMore} <ArrowRight size={14} />
            </a>
          </div>

          {/* Horizontal scroll of skill cards */}
          <div className="scroll-x">
            {skills.map((skill) => (
              <SkillGridCard
                key={skill.slug}
                skill={skill}
                locale={locale}
              />
            ))}
          </div>

          <a
            href={`/marketplace${langSuffix}`}
            className="btn-text md:hidden mt-6 inline-flex"
          >
            {t.skillsSeeMore} <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ========== INTEGRATIONS (Seamless Workflows equivalent) ========== */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-label text-[var(--color-text-muted)] mb-2">
                {t.integrationsEyebrow}
              </p>
              <h2 className="text-heading text-[var(--color-text-primary)]">
                {t.integrationsHeadline}
              </h2>
            </div>
          </div>

          <IntegrationSection locale={locale} />
        </div>
      </section>

      {/* ========== BUILT FOR TEAMS ========== */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-label text-[var(--color-text-muted)] mb-2">
                {t.teamEyebrow}
              </p>
              <h2 className="text-heading text-[var(--color-text-primary)] mb-4">
                {t.teamHeadline}
              </h2>
              <p className="text-body-lg text-[var(--color-text-secondary)] mb-8">
                {t.teamDesc}
              </p>
              <div className="flex items-center gap-3">
                <a href={`/developer${langSuffix}`} className="btn-primary">
                  {t.teamCta1}
                </a>
                <a href={`/docs${langSuffix}`} className="btn-text">
                  {t.teamCta2}
                </a>
              </div>
            </div>
            {/* Team visual — mock of dashboard */}
            <div className="card-lg p-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
                {/* Avatar stack */}
                <div className="flex -space-x-2">
                  {["K", "M", "J"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-[var(--color-surface-3)] border-2 border-[var(--color-surface-1)] flex items-center justify-center"
                    >
                      <span className="text-caption text-[var(--color-text-secondary)]">{letter}</span>
                    </div>
                  ))}
                </div>
                <span className="text-body-sm text-[var(--color-text-muted)]">3 members</span>
              </div>
              {/* Mock project rows */}
              {[
                { name: "Research Agent", calls: "12.4k", status: "active" },
                { name: "Sales Bot", calls: "8.2k", status: "active" },
                { name: "Internal Tools", calls: "3.1k", status: "paused" },
              ].map((proj, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <p className="text-body-sm text-[var(--color-text-primary)]">{proj.name}</p>
                    <p className="text-caption text-[var(--color-text-muted)]">{proj.calls} calls this month</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${proj.status === "active" ? "bg-[var(--color-verified)]" : "bg-[var(--color-text-icon)]"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF QUOTE ========== */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <Reveal>
            <blockquote className="text-heading text-[var(--color-text-primary)] mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <p className="text-body text-[var(--color-text-muted)]">
              {t.quoteAttr}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-heading text-[var(--color-text-primary)] mb-4">
              {t.ctaHeadline}
            </h2>
            <p className="text-body-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8">
              {t.ctaDesc}
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href={`/developer${langSuffix}`} className="btn-primary">
                {t.ctaCta1}
              </a>
              <a href={`/support${langSuffix}`} className="btn-secondary">
                {t.ctaCta2}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <HomeFooter locale={locale} />
    </div>
  );
}

/* ===== Copy ===== */

const en = {
  badge: "New",
  badgeText: "MCP protocol support on all plans",
  eyebrow: "Trusted skill infrastructure",
  headline: "For every AI agent",
  subline: "Discover, verify, and invoke production-ready skills through a governed registry. One manifest powers search, trust governance, and secure runtime execution.",
  cta1: "Start for free",
  cta2: "Book a demo",
  tabs: [
    { title: "Browse the Registry", sub: "Where agents find skills" },
    { title: "Inspect the Manifest", sub: "Your contract before integration" },
    { title: "Invoke via Gateway", sub: "Secure runtime for every call" },
  ],
  features: [
    { title: "Anything from a query", desc: "Search skills by capability, runtime type, or permission profile. Semantic matching finds the right tool — whether it's web research, data enrichment, or code review." },
    { title: "Inspect before you integrate", desc: "Review input/output schemas, permission scopes, version history, and trust signals. Every skill publishes a machine-readable manifest agents can parse." },
    { title: "Stay governed", desc: "Project-scoped API keys, per-call audit trails, automated security scanning, and human review. Every invocation is traceable and reversible." },
  ],
  skillsEyebrow: "Skills",
  skillsHeadline: "Built for speed",
  skillsSeeMore: "See more",
  integrationsEyebrow: "Integrations",
  integrationsHeadline: "Seamless connections",
  teamEyebrow: "Built for teams",
  teamHeadline: "Ship together",
  teamDesc: "Invite your team, share projects, manage API keys and budgets collaboratively. Role-based access keeps production safe.",
  teamCta1: "Start for free",
  teamCta2: "See pricing",
  quote: "SkillHub is building the missing infrastructure layer between AI agents and the real world.",
  quoteAttr: "— Early access developer",
  ctaHeadline: "Bring your agents to life",
  ctaDesc: "No SDK lock-in. No vendor dependencies. Start invoking verified skills in minutes.",
  ctaCta1: "Get started",
  ctaCta2: "Book a demo",
};

const zh = {
  badge: "新",
  badgeText: "所有方案均支持 MCP 协议",
  eyebrow: "可信赖的技能基础设施",
  headline: "为每一个 AI Agent",
  subline: "通过受治理的注册中心发现、验证和调用生产级技能。一份 manifest 驱动搜索、信任治理和安全运行。",
  cta1: "免费开始",
  cta2: "预约演示",
  tabs: [
    { title: "浏览注册表", sub: "Agent 发现技能的地方" },
    { title: "检查 Manifest", sub: "集成前的合约" },
    { title: "通过网关调用", sub: "每次调用的安全运行时" },
  ],
  features: [
    { title: "从查询到结果", desc: "按能力、运行时类型或权限配置搜索技能。语义匹配找到合适的工具 — 无论是网络研究、数据补全还是代码审查。" },
    { title: "集成前充分检查", desc: "审查输入/输出 schema、权限范围、版本历史和信任信号。每个技能发布 Agent 可解析的机器可读 manifest。" },
    { title: "全程治理", desc: "项目级 API Key、逐调用审计追踪、自动安全扫描和人工审核。每次调用可追溯、可回滚。" },
  ],
  skillsEyebrow: "技能",
  skillsHeadline: "为速度而建",
  skillsSeeMore: "查看更多",
  integrationsEyebrow: "集成",
  integrationsHeadline: "无缝连接",
  teamEyebrow: "团队协作",
  teamHeadline: "一起交付",
  teamDesc: "邀请团队成员，共享项目，协作管理 API Key 和预算。基于角色的访问控制保护生产环境。",
  teamCta1: "免费开始",
  teamCta2: "查看定价",
  quote: "SkillHub 正在构建 AI Agent 与现实世界之间缺失的基础设施层。",
  quoteAttr: "— 早期体验开发者",
  ctaHeadline: "让你的 Agent 活起来",
  ctaDesc: "无 SDK 锁定。无供应商依赖。几分钟内开始调用已验证的技能。",
  ctaCta1: "开始使用",
  ctaCta2: "预约演示",
};
