import {
  ArrowRight,
  Search,
  FileJson,
  Zap,
  ShieldCheck,
  Eye,
  Activity,
} from "lucide-react";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import { getSkills } from "@/lib/registry";
import { HomeNav } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import { SkillCard } from "@/components/home/skill-card";
import { CodeAnimation } from "@/components/home/code-animation";
import { IntegrationTabsClient } from "@/components/home/integration-tabs";
import { Reveal } from "@/components/home/reveal";
import "./tailwind.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    badge: "New",
    badgeText: "MCP protocol support on all plans",
    eyebrow: "Trusted skill infrastructure",
    headline: "For every AI agent",
    subline:
      "Discover, verify, and invoke production-ready skills through a governed registry. One manifest powers search, trust governance, and secure runtime execution for any agent platform.",
    cta1: "Start for free",
    cta2: "Book a demo",
    tabs: [
      { title: "Browse the Registry", sub: "Where agents find skills" },
      { title: "Inspect the Manifest", sub: "Your contract before integration" },
      { title: "Invoke via Gateway", sub: "Secure runtime for every call" },
    ],
    features: [
      {
        title: "Anything from a query",
        desc: "Search skills by capability, runtime type, or permission profile. Semantic matching finds the right tool — whether it's web research, data enrichment, or code review.",
      },
      {
        title: "Inspect before you integrate",
        desc: "Review input/output schemas, permission scopes, version history, and trust signals. Every skill publishes a machine-readable manifest.",
      },
      {
        title: "Stay governed",
        desc: "Project-scoped API keys, per-call audit trails, automated security scanning, and human review. Every invocation is traceable.",
      },
    ],
    skillsEyebrow: "Skills",
    skillsHeadline: "Built for speed",
    skillsSeeMore: "See all skills",
    workflowsEyebrow: "Integrations",
    workflowsHeadline: "Seamless connections",
    workflowsTabs: ["Claude", "Cursor", "Windsurf", "ChatGPT", "Custom Agent"],
    workflowsDesc: "Connect SkillHub to any MCP-compatible agent with a single config block. REST API available for everything else.",
    teamEyebrow: "Built for teams",
    teamHeadline: "Ship together",
    teamDesc: "Invite your team, share projects, manage API keys and budgets collaboratively. Role-based access keeps production safe.",
    teamCta1: "Start for free",
    teamCta2: "See pricing",
    useCasesEyebrow: "Use cases",
    useCasesTabs: ["Research", "Sales", "Engineering", "Operations"],
    quote: "SkillHub is building the missing infrastructure layer between AI agents and the real world.",
    quoteAttr: "— Early access developer",
    showcaseEyebrow: "Showcase",
    showcaseSkills: [
      { name: "Browser Research Pro", desc: "Deep web research with structured output", slug: "browser-research-pro" },
      { name: "CRM Enrichment", desc: "Auto-complete contact profiles from public data", slug: "crm-enrichment" },
      { name: "Support Triage", desc: "Classify tickets by priority and route to teams", slug: "support-triage" },
      { name: "Code Review Assistant", desc: "Security, performance, and best practices", slug: "code-review-assistant" },
    ],
    ctaHeadline: "Bring your agents to life",
    ctaDesc: "No SDK lock-in. No vendor dependencies. Start invoking verified skills in minutes.",
    ctaCta1: "Get started",
    ctaCta2: "Book a demo",
  },
  zh: {
    badge: "新",
    badgeText: "所有方案均支持 MCP 协议",
    eyebrow: "可信赖的技能基础设施",
    headline: "为每一个 AI Agent",
    subline:
      "通过受治理的注册中心发现、验证和调用生产级技能。一份 manifest 驱动搜索、信任治理和安全运行，支持任何 Agent 平台。",
    cta1: "免费开始",
    cta2: "预约演示",
    tabs: [
      { title: "浏览注册表", sub: "Agent 发现技能的地方" },
      { title: "检查 Manifest", sub: "集成前的合约" },
      { title: "通过网关调用", sub: "每次调用的安全运行时" },
    ],
    features: [
      {
        title: "从查询到结果",
        desc: "按能力、运行时类型或权限配置搜索技能。语义匹配找到合适的工具 — 无论是网络研究、数据补全还是代码审查。",
      },
      {
        title: "集成前充分检查",
        desc: "审查输入/输出 schema、权限范围、版本历史和信任信号。每个技能发布机器可读的 manifest。",
      },
      {
        title: "全程治理",
        desc: "项目级 API Key、逐调用审计追踪、自动安全扫描和人工审核。每次调用都可追溯。",
      },
    ],
    skillsEyebrow: "技能",
    skillsHeadline: "为速度而建",
    skillsSeeMore: "查看全部技能",
    workflowsEyebrow: "集成",
    workflowsHeadline: "无缝连接",
    workflowsTabs: ["Claude", "Cursor", "Windsurf", "ChatGPT", "自定义 Agent"],
    workflowsDesc: "通过单个配置块将 SkillHub 连接到任何 MCP 兼容 Agent。REST API 覆盖所有其他场景。",
    teamEyebrow: "团队协作",
    teamHeadline: "一起交付",
    teamDesc: "邀请团队成员，共享项目，协作管理 API Key 和预算。基于角色的访问控制保护生产环境安全。",
    teamCta1: "免费开始",
    teamCta2: "查看定价",
    useCasesEyebrow: "使用场景",
    useCasesTabs: ["研究", "销售", "工程", "运营"],
    quote: "SkillHub 正在构建 AI Agent 与现实世界之间缺失的基础设施层。",
    quoteAttr: "— 早期体验开发者",
    showcaseEyebrow: "展示",
    showcaseSkills: [
      { name: "Browser Research Pro", desc: "深度网络研究，结构化输出", slug: "browser-research-pro" },
      { name: "CRM Enrichment", desc: "从公开数据自动补全联系人资料", slug: "crm-enrichment" },
      { name: "Support Triage", desc: "按优先级分类工单并路由到团队", slug: "support-triage" },
      { name: "Code Review Assistant", desc: "安全、性能和最佳实践审查", slug: "code-review-assistant" },
    ],
    ctaHeadline: "让你的 Agent 活起来",
    ctaDesc: "无 SDK 锁定。无供应商依赖。几分钟内开始调用已验证的技能。",
    ctaCta1: "开始使用",
    ctaCta2: "预约演示",
  },
} as const;

const iconMap: Record<string, React.ReactNode> = {
  search: <Search size={18} className="text-[var(--color-text-secondary)]" />,
  manifest: <FileJson size={18} className="text-[var(--color-text-secondary)]" />,
  runtime: <Zap size={18} className="text-[var(--color-text-secondary)]" />,
  trust: <ShieldCheck size={18} className="text-[var(--color-text-secondary)]" />,
};

// MCP config code for each agent platform
const agentConfigs: Record<string, string> = {
  Claude: `// claude_desktop_config.json
{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_live_..."
      }
    }
  }
}`,
  Cursor: `// .cursor/mcp.json
{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_live_..."
      }
    }
  }
}`,
  Windsurf: `// ~/.windsurf/mcp_config.json
{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@useskillhub/mcp-server"],
      "env": {
        "SKILLHUB_API_KEY": "sk_live_..."
      }
    }
  }
}`,
  ChatGPT: `// REST API — any HTTP client
const response = await fetch(
  "https://api.useskillhub.com/v1/invoke",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk_live_...",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      skill: "browser-research-pro",
      input: { query: "..." }
    })
  }
);`,
  "Custom Agent": `import { SkillHub } from "@useskillhub/sdk";

const hub = new SkillHub({
  apiKey: process.env.SKILLHUB_KEY
});

const result = await hub.invoke({
  skill: "browser-research-pro",
  input: { query: "AI frameworks 2026" }
});

console.log(result.output);`,
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const langSuffix = locale === "zh" ? "?lang=zh" : "";
  const t = copy[locale];

  const [stats, allSkills] = await Promise.all([
    getPublicPlatformStats(),
    getSkills(),
  ]);
  const skills = allSkills.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      <HomeNav locale={locale} />

      {/* === HERO === */}
      <section className="max-w-[1280px] mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Announcement badge */}
        <Reveal>
          <div className="flex justify-center mb-8">
            <a
              href={`/docs${langSuffix}`}
              className="pill hover:border-[var(--color-border-hover)] transition-colors"
            >
              <span className="badge-accent">{t.badge}</span>
              <span>{t.badgeText}</span>
            </a>
          </div>
        </Reveal>

        {/* Hero text — centered */}
        <Reveal delay={100}>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-body-lg text-[var(--color-text-secondary)] mb-3">
              {t.eyebrow}
            </p>
            <h1 className="text-display text-[var(--color-text-primary)] mb-6">
              {t.headline}
            </h1>
            <p className="text-body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10">
              {t.subline}
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3">
              <a href={`/developer${langSuffix}`} className="btn-primary">
                {t.cta1}
              </a>
              <a href={`/support${langSuffix}`} className="btn-secondary">
                {t.cta2}
              </a>
            </div>
          </div>
        </Reveal>

        {/* Three tabs below hero */}
        <Reveal delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            {t.tabs.map((tab, i) => (
              <div
                key={i}
                className="text-center py-4 px-3"
              >
                <p className="text-body-sm text-[var(--color-text-primary)] mb-1">
                  {tab.title}
                </p>
                <p className="text-caption text-[var(--color-text-muted)]">
                  {tab.sub}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Product preview — Code Animation as the "screenshot" */}
        <Reveal delay={300}>
          <div className="mt-12 max-w-4xl mx-auto">
            <CodeAnimation />
          </div>
        </Reveal>
      </section>

      {/* === FEATURES (3 bullets) === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {t.features.map((feature, i) => (
              <Reveal key={i} delay={i * 100}>
                <div>
                  <h3 className="text-heading-sm text-[var(--color-text-primary)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body text-[var(--color-text-secondary)]">
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === SKILLS GALLERY === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Two-tone header */}
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-label text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                  {t.skillsEyebrow}
                </p>
                <h2 className="text-heading text-[var(--color-text-primary)]">
                  {t.skillsHeadline}
                </h2>
              </div>
              <a
                href={`/marketplace${langSuffix}`}
                className="text-body-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1"
              >
                {t.skillsSeeMore}
                <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>

          {/* Skills grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, i) => (
              <Reveal key={skill.slug} delay={i * 60}>
                <SkillCard
                  skill={skill}
                  locale={locale}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === INTEGRATIONS (Agent configs) === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <Reveal>
            <div className="mb-10">
              <p className="text-label text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                {t.workflowsEyebrow}
              </p>
              <h2 className="text-heading text-[var(--color-text-primary)]">
                {t.workflowsHeadline}
              </h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <IntegrationTabs
              tabs={t.workflowsTabs as unknown as string[]}
              configs={agentConfigs}
              desc={t.workflowsDesc}
            />
          </Reveal>
        </div>
      </section>

      {/* === TEAM SECTION === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <Reveal>
            <div className="max-w-xl">
              <p className="text-label text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
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
                <a href={`/docs${langSuffix}`} className="btn-outline">
                  {t.teamCta2}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === SOCIAL PROOF QUOTE === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <Reveal>
            <blockquote className="text-heading text-[var(--color-text-primary)] max-w-3xl mx-auto mb-4">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <p className="text-body text-[var(--color-text-muted)]">
              {t.quoteAttr}
            </p>
          </Reveal>
        </div>
      </section>

      {/* === SHOWCASE === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <Reveal>
            <p className="text-label text-[var(--color-text-muted)] mb-6 uppercase tracking-wider">
              {t.showcaseEyebrow}
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.showcaseSkills.map((item, i) => (
              <Reveal key={item.slug} delay={i * 80}>
                <a
                  href={`/skills/${item.slug}${langSuffix}`}
                  className="card-lg group block"
                >
                  {/* Visual area */}
                  <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] aspect-[4/3] mb-3 flex items-center justify-center">
                    <Zap size={28} className="text-[var(--color-text-icon)] group-hover:text-[var(--color-text-muted)] transition-colors" />
                  </div>
                  <h3 className="text-body-sm text-[var(--color-text-primary)] mb-1">
                    {item.name}
                  </h3>
                  <p className="text-caption text-[var(--color-text-muted)]">
                    {item.desc}
                  </p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
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

/* === Integration Tabs (Client Component) === */
function IntegrationTabs({
  tabs,
  configs,
  desc,
}: {
  tabs: string[];
  configs: Record<string, string>;
  desc: string;
}) {
  return <IntegrationTabsClient tabs={tabs} configs={configs} desc={desc} />;
}
