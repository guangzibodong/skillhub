import { ArrowRight } from "lucide-react";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getSkills } from "@/lib/registry";
import { HomeNav } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import { PlatformPreview } from "@/components/home/platform-preview";
import { SkillGridCard } from "@/components/home/skill-grid-card";
import { IntegrationSection } from "@/components/home/integration-section";
import { TeamSection } from "@/components/home/team-section";
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

      {/* ===== 1. HERO (matches Morphic: badge → eyebrow → headline → subline → 2 CTAs → 3 tabs → product preview) ===== */}
      <section className="pt-[120px] pb-0">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          {/* Announcement badge */}
          <a href={`/docs${langSuffix}`} className="badge-new inline-flex mb-6">
            <span>{t.badge}</span>
            {t.badgeText}
          </a>

          {/* Eyebrow */}
          <p className="text-[16px] font-medium text-[#999] tracking-[-0.01em] mb-2">
            {t.eyebrow}
          </p>

          {/* Headline (display) */}
          <h1 className="text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-[-0.04em] text-white mb-6">
            {t.headline}
          </h1>

          {/* Subline */}
          <p className="text-[18px] font-normal text-[#999] leading-[1.5] tracking-[-0.01em] max-w-[580px] mx-auto mb-10">
            {t.subline}
          </p>

          {/* 2 CTAs */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <a href={`/developer${langSuffix}`} className="btn-primary">
              {t.cta1}
            </a>
            <a href={`/support${langSuffix}`} className="btn-secondary">
              {t.cta2}
            </a>
          </div>

          {/* 3 Tabs (like Canvas / Copilot / Compose) */}
          <div className="flex justify-center gap-0 mb-10">
            {t.tabs.map((tab, i) => (
              <div
                key={i}
                className={`px-6 md:px-10 py-4 text-center border-b-2 ${
                  i === 0
                    ? "border-white"
                    : "border-transparent hover:border-[#333]"
                } cursor-pointer transition-colors`}
              >
                <p className="text-[14px] font-medium text-white mb-0.5">
                  {tab.title}
                </p>
                <p className="text-[12px] text-[#666]">
                  {tab.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Product preview — FULL WIDTH card (like Morphic's app frame) */}
        <div className="max-w-[1100px] mx-auto px-6">
          <PlatformPreview locale={locale} />
        </div>
      </section>

      {/* ===== 2. THREE FEATURE BULLETS (matches Morphic: 3-col grid, heading + description each) ===== */}
      <section className="py-[96px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {t.features.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <h3 className="text-[20px] font-semibold text-white tracking-[-0.02em] mb-3">
                  {f.title}
                </h3>
                <p className="text-[15px] text-[#999] leading-[1.6]">
                  {f.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. SKILLS / WORKFLOWS (matches Morphic: eyebrow + heading + "See more" link → horizontal card scroll) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header row */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
                {t.skillsEyebrow}
              </p>
              <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
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

          {/* Horizontal scroll cards */}
          <div className="scroll-x">
            {skills.map((skill) => (
              <SkillGridCard key={skill.slug} skill={skill} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. INTEGRATIONS / SEAMLESS WORKFLOWS (matches Morphic: eyebrow + heading → vertical tabs left, preview right) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-10">
            <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
              {t.integrationsEyebrow}
            </p>
            <h2 className="text-[40px] font-bold text-white tracking-[-0.04em]">
              {t.integrationsHeadline}
            </h2>
          </div>

          <IntegrationSection locale={locale} />
        </div>
      </section>

      {/* ===== 5. BUILT FOR TEAMS (matches Morphic: text left + visual right, 2 CTAs) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <TeamSection locale={locale} />
        </div>
      </section>

      {/* ===== 6. USE CASES / ACROSS INDUSTRIES (matches Morphic: eyebrow + tabs for different verticals) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
            {t.useCasesEyebrow}
          </p>
          <h2 className="text-[40px] font-bold text-white tracking-[-0.04em] mb-8">
            {t.useCasesHeadline}
          </h2>

          {/* Use case cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {t.useCases.map((uc, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="card-lg p-6">
                  <div className="w-10 h-10 rounded-[8px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4">
                    <span className="text-[18px]">{uc.icon}</span>
                  </div>
                  <h3 className="text-[16px] font-medium text-white mb-2">{uc.title}</h3>
                  <p className="text-[14px] text-[#999] leading-[1.5]">{uc.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. TESTIMONIAL QUOTE (matches Morphic: large centered quote) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <Reveal>
            <blockquote className="text-[32px] md:text-[40px] font-bold text-white tracking-[-0.03em] leading-[1.2] mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <p className="text-[14px] text-[#666]">
              {t.quoteAttr}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== 8. LOGOS / AS SEEN IN (matches Morphic: row of partner logos) ===== */}
      <section className="py-[48px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] text-[#666] text-center mb-6">
            {t.logosLabel}
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {t.logos.map((logo, i) => (
              <span
                key={i}
                className="text-[14px] font-medium text-[#444] tracking-[-0.01em]"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 9. SHOWCASE / ORIGINALS (matches Morphic: eyebrow + 2-line heading + 4 showcase cards) ===== */}
      <section className="py-[96px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-medium text-[#666] tracking-[0.05em] uppercase mb-2">
            {t.showcaseEyebrow}
          </p>
          <h2 className="text-[40px] font-bold tracking-[-0.04em] mb-1">
            <span className="text-white">{t.showcaseHeadline1}</span>
          </h2>
          <h2 className="text-[40px] font-bold tracking-[-0.04em] text-[#999] mb-10">
            {t.showcaseHeadline2}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.showcase.map((item, i) => (
              <a
                key={i}
                href={`/skills/${item.slug}`}
                className="skill-grid-card group"
              >
                <div className="skill-grid-card-image">
                  <div className="w-10 h-10 rounded-[8px] bg-[var(--color-surface-3)] flex items-center justify-center">
                    <span className="text-[18px]">{item.icon}</span>
                  </div>
                </div>
                <div className="skill-grid-card-body">
                  <h3 className="text-[14px] font-medium text-white mb-1 group-hover:text-[#0075ff] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[12px] text-[#666] line-clamp-2">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. FINAL CTA (matches Morphic: heading + paragraph + 2 CTAs, centered) ===== */}
      <section className="py-[120px] border-t border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-[48px] font-bold text-white tracking-[-0.04em] leading-[1.1] mb-5">
              {t.ctaHeadline}
            </h2>
            <p className="text-[16px] text-[#999] leading-[1.5] mb-8">
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

/* ===== COPY ===== */

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
  integrationsEyebrow: "Endless possibilities",
  integrationsHeadline: "Seamless connections",
  teamEyebrow: "Built for teams",
  teamHeadline: "Ship together",
  teamDesc: "Invite your team, share projects, manage API keys and budgets collaboratively. Role-based access keeps production safe.",
  teamCta1: "Start for free",
  teamCta2: "See pricing",
  useCasesEyebrow: "Use cases",
  useCasesHeadline: "Across industries",
  useCases: [
    { icon: "🔍", title: "Research & Analysis", desc: "Deep web research, document analysis, competitive intelligence — all through verified skills." },
    { icon: "💰", title: "Sales & Marketing", desc: "CRM enrichment, lead scoring, content generation with structured, auditable outputs." },
    { icon: "⚙️", title: "Engineering", desc: "Code review, data pipeline orchestration, infrastructure monitoring through governed APIs." },
  ],
  quote: "SkillHub is pioneering the missing infrastructure layer between AI agents and the real world.",
  quoteAttr: "— Early access developer",
  logosLabel: "Integrates with",
  logos: ["Claude", "Cursor", "Windsurf", "ChatGPT", "VS Code", "MCP Protocol"],
  showcaseEyebrow: "Showcase",
  showcaseHeadline1: "Made by the community",
  showcaseHeadline2: "Built to inspire you",
  showcase: [
    { icon: "🌐", name: "Browser Research Pro", desc: "Deep web research with structured output", slug: "browser-research-pro" },
    { icon: "📊", name: "CRM Enrichment", desc: "Auto-complete contact profiles from public data", slug: "crm-enrichment" },
    { icon: "🎯", name: "Support Triage", desc: "Classify tickets by priority and route", slug: "support-triage" },
    { icon: "🔒", name: "Code Review Assistant", desc: "Security, performance, and best practices", slug: "code-review-assistant" },
  ],
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
  integrationsEyebrow: "无限可能",
  integrationsHeadline: "无缝连接",
  teamEyebrow: "团队协作",
  teamHeadline: "一起交付",
  teamDesc: "邀请团队成员，共享项目，协作管理 API Key 和预算。基于角色的访问控制保护生产环境。",
  teamCta1: "免费开始",
  teamCta2: "查看定价",
  useCasesEyebrow: "使用场景",
  useCasesHeadline: "跨行业应用",
  useCases: [
    { icon: "🔍", title: "研究与分析", desc: "深度网络研究、文档分析、竞争情报 — 全部通过已验证的技能完成。" },
    { icon: "💰", title: "销售与营销", desc: "CRM 数据补全、线索评分、内容生成，结构化且可审计的输出。" },
    { icon: "⚙️", title: "工程", desc: "代码审查、数据管道编排、基础设施监控，通过受治理的 API 完成。" },
  ],
  quote: "SkillHub 正在构建 AI Agent 与现实世界之间缺失的基础设施层。",
  quoteAttr: "— 早期体验开发者",
  logosLabel: "集成平台",
  logos: ["Claude", "Cursor", "Windsurf", "ChatGPT", "VS Code", "MCP 协议"],
  showcaseEyebrow: "展示",
  showcaseHeadline1: "社区出品",
  showcaseHeadline2: "激发你的灵感",
  showcase: [
    { icon: "🌐", name: "Browser Research Pro", desc: "深度网络研究，结构化输出", slug: "browser-research-pro" },
    { icon: "📊", name: "CRM Enrichment", desc: "从公开数据自动补全联系人资料", slug: "crm-enrichment" },
    { icon: "🎯", name: "Support Triage", desc: "按优先级分类工单并路由到团队", slug: "support-triage" },
    { icon: "🔒", name: "Code Review Assistant", desc: "安全、性能和最佳实践审查", slug: "code-review-assistant" },
  ],
  ctaHeadline: "让你的 Agent 活起来",
  ctaDesc: "无 SDK 锁定。无供应商依赖。几分钟内开始调用已验证的技能。",
  ctaCta1: "开始使用",
  ctaCta2: "预约演示",
};
