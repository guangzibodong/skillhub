import type { SkillSummary } from "@useskillhub/schema";
import {
  ArrowRight,
  Search,
  FileJson,
  Zap,
  ShieldCheck,
  Globe,
  Lock,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import { getSkills } from "@/lib/registry";
import { HomeNav } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import { SkillCard } from "@/components/home/skill-card";
import { CodeAnimation } from "@/components/home/code-animation";
import { ParticleField } from "@/components/home/particle-field";
import { BentoCard } from "@/components/home/bento-card";
import { Reveal } from "@/components/home/reveal";
import "./tailwind.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    badge: "Public Beta — Join the waitlist",
    headline: "The skill registry",
    headlineGradient: "for AI agents",
    subline:
      "Discover, verify, and invoke production-ready skills through a secure API. One manifest powers search, trust governance, and runtime execution.",
    cta1: "Explore Registry",
    cta2: "Documentation",
    trustedBy: "Powering the next generation of intelligent agents",
    stats: {
      skills: "Skills",
      verified: "Verified",
      publishers: "Publishers",
      calls: "API Calls",
    },
    features: [
      {
        icon: "search",
        title: "Intelligent Discovery",
        desc: "Search skills by task, capability, permission profile, and runtime type. Semantic matching surfaces the right tool instantly.",
      },
      {
        icon: "manifest",
        title: "Schema Inspection",
        desc: "Review input/output schemas, permission scopes, version history, and runtime metadata before you integrate.",
      },
      {
        icon: "runtime",
        title: "Secure Runtime",
        desc: "Invoke skills via REST or MCP with project-scoped keys. Built-in rate limiting, automatic retries, and full observability.",
      },
      {
        icon: "trust",
        title: "Trust & Governance",
        desc: "Automated security scanning, human review, granular permission scoping, and immutable audit trails.",
      },
    ],
    showcaseTitle: "Built for production",
    showcaseDesc: "Everything you need from discovery to deployment",
    featuredTitle: "Featured Skills",
    featuredDesc: "Verified, production-ready, and battle-tested",
    featuredAction: "View all skills",
    howTitle: "From discovery to production",
    howDesc: "Five steps to integrate any skill into your agent",
    howSteps: [
      {
        step: "01",
        title: "Discover",
        desc: "Browse the registry or search by capability. Filter by runtime, permissions, and trust level.",
      },
      {
        step: "02",
        title: "Inspect",
        desc: "Review the complete manifest — schemas, permissions, pricing, and changelog. Test in the playground.",
      },
      {
        step: "03",
        title: "Connect",
        desc: "Create a project, configure permission scopes, generate a production API key.",
      },
      {
        step: "04",
        title: "Invoke",
        desc: "Call the skill via REST or MCP. Structured responses with built-in error handling and retries.",
      },
      {
        step: "05",
        title: "Monitor",
        desc: "Real-time dashboards for invocation volume, latency percentiles, error rates, and cost tracking.",
      },
    ],
    ctaTitle: "Ready to build with verified skills?",
    ctaDesc:
      "Join hundreds of developers shipping AI-powered products with production-grade skill infrastructure.",
    ctaCta: "Get Started Free",
    ctaSecondary: "Talk to Us",
  },
  zh: {
    badge: "公测中 — 加入等待列表",
    headline: "AI Agent 的",
    headlineGradient: "技能注册中心",
    subline:
      "通过安全 API 发现、验证和调用生产级技能。一份 manifest 驱动搜索、信任治理和安全运行。",
    cta1: "探索注册表",
    cta2: "文档",
    trustedBy: "驱动下一代智能 Agent",
    stats: {
      skills: "技能",
      verified: "已验证",
      publishers: "发布者",
      calls: "API 调用",
    },
    features: [
      {
        icon: "search",
        title: "智能发现",
        desc: "按任务、能力、权限和运行时类型搜索技能。语义匹配即时找到最佳工具。",
      },
      {
        icon: "manifest",
        title: "Schema 检查",
        desc: "集成前审查输入/输出 schema、权限范围、版本历史和运行时元数据。",
      },
      {
        icon: "runtime",
        title: "安全运行时",
        desc: "通过项目级 Key 以 REST 或 MCP 调用技能。内置限流、自动重试和完整可观测性。",
      },
      {
        icon: "trust",
        title: "信任与治理",
        desc: "自动安全扫描、人工审核、细粒度权限范围和不可变审计追踪。",
      },
    ],
    showcaseTitle: "为生产而建",
    showcaseDesc: "从发现到部署的一切所需",
    featuredTitle: "精选 Skills",
    featuredDesc: "已验证，生产就绪，久经考验",
    featuredAction: "查看全部技能",
    howTitle: "从发现到生产",
    howDesc: "五步将任何技能集成到你的 Agent",
    howSteps: [
      {
        step: "01",
        title: "发现",
        desc: "浏览注册表或按能力搜索。按运行时、权限和信任等级筛选。",
      },
      {
        step: "02",
        title: "检查",
        desc: "审查完整 manifest — schema、权限、定价和变更日志。在 Playground 测试。",
      },
      {
        step: "03",
        title: "连接",
        desc: "创建项目，配置权限 scope，生成生产 API Key。",
      },
      {
        step: "04",
        title: "调用",
        desc: "通过 REST 或 MCP 调用技能。结构化响应，内置错误处理和自动重试。",
      },
      {
        step: "05",
        title: "监控",
        desc: "实时仪表盘：调用量、延迟百分位、错误率和成本追踪。",
      },
    ],
    ctaTitle: "准备好用已验证的技能构建了吗？",
    ctaDesc: "加入数百位开发者，用生产级技能基础设施交付 AI 驱动的产品。",
    ctaCta: "免费开始",
    ctaSecondary: "联系我们",
  },
} as const;

const zhSkillMeta: Record<string, { desc: string; tags: string[] }> = {
  "browser-research-pro": {
    desc: "深度网络研究 — 多源抓取、结构化摘要、事实核查。",
    tags: ["研究", "浏览器", "摘要"],
  },
  "crm-enrichment": {
    desc: "自动补全 CRM 数据 — 社交主页、公司信息、职位验证。",
    tags: ["CRM", "数据", "销售"],
  },
  "support-triage": {
    desc: "AI 工单分类 — 优先级识别、团队分配、关键信息提取。",
    tags: ["支持", "分类", "工单"],
  },
  "code-review-assistant": {
    desc: "智能代码审查 — 安全漏洞检测、性能建议、最佳实践。",
    tags: ["代码", "审查", "安全"],
  },
  "data-pipeline-monitor": {
    desc: "数据管道监控 — 异常检测、自动告警、根因分析。",
    tags: ["数据", "监控", "告警"],
  },
  "content-generator": {
    desc: "AI 内容生成 — SEO 优化文章、社交媒体文案、多语言翻译。",
    tags: ["内容", "生成", "SEO"],
  },
};

function formatStatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return String(num);
}

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

  const featureIcons: Record<string, React.ReactNode> = {
    search: <Search size={22} className="text-[var(--color-accent-cyan)]" />,
    manifest: <FileJson size={22} className="text-[var(--color-accent-purple)]" />,
    runtime: <Zap size={22} className="text-[var(--color-accent-green)]" />,
    trust: <ShieldCheck size={22} className="text-[var(--color-accent-pink)]" />,
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden">
      <HomeNav locale={locale} />

      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-16">
        {/* Ambient glow orbs */}
        <div className="ambient-glow">
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="glow-orb glow-orb-3" />
        </div>

        {/* Particle network */}
        <ParticleField />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] mb-8">
              <Sparkles size={14} className="text-[var(--color-accent-purple)]" />
              <span className="text-xs text-[var(--color-text-secondary)] font-medium tracking-wide">
                {t.badge}
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
              <span className="block text-[var(--color-text-primary)]">{t.headline}</span>
              <span className="block gradient-text-hero">{t.headlineGradient}</span>
            </h1>
          </Reveal>

          {/* Subline */}
          <Reveal delay={200}>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12">
              {t.subline}
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/registry${langSuffix}`}
                className="glow-button inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-medium text-[15px]"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {t.cta1}
                  <ArrowRight size={16} />
                </span>
              </a>
              <a
                href={`/docs${langSuffix}`}
                className="ghost-button inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[var(--color-text-secondary)] font-medium text-[15px] hover:text-[var(--color-text-primary)]"
              >
                {t.cta2}
                <ChevronRight size={15} />
              </a>
            </div>
          </Reveal>
        </div>

        {/* Stats bar at bottom of hero */}
        <Reveal delay={500} className="relative z-10 mt-auto pt-20 w-full">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-8 font-medium">
              {t.trustedBy}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: stats.publicSkills, label: t.stats.skills },
                { value: stats.verifiedSkills, label: t.stats.verified },
                { value: stats.publicPublishers, label: t.stats.publishers },
                { value: stats.recordedCalls, label: t.stats.calls },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text mb-1">
                    {formatStatNumber(stat.value)}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================
          PRODUCT SHOWCASE (Code Demo)
          ========================================= */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t.showcaseTitle}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
                {t.showcaseDesc}
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} direction="scale">
            <div className="rotating-border rounded-2xl">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-card-solid)]">
                {/* Top bar mockup */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-xs text-[var(--color-text-muted)]">
                      <Lock size={10} />
                      api.useskillhub.com/v1/invoke
                    </div>
                  </div>
                  <div className="w-16" />
                </div>
                <CodeAnimation />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================
          BENTO GRID FEATURES
          ========================================= */}
      <section className="relative py-24 sm:py-32">
        {/* Subtle section glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {t.features.map((feature, i) => (
              <Reveal key={feature.icon} delay={i * 100}>
                <BentoCard
                  title={feature.title}
                  description={feature.desc}
                  icon={featureIcons[feature.icon]}
                  className="h-full min-h-[200px]"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          HOW IT WORKS — TIMELINE
          ========================================= */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t.howTitle}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg">
                {t.howDesc}
              </p>
            </div>
          </Reveal>

          <div className="relative flow-line pl-10">
            {t.howSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 80}>
                <div className="relative pb-10 last:pb-0">
                  {/* Node dot */}
                  <div className="absolute left-[-25px] top-1 w-[11px] h-[11px] rounded-full border-2 border-[var(--color-accent-purple)] bg-[var(--color-bg-primary)]" />
                  <div className="glass-card glass-card-hover rounded-xl p-5 ml-2 transition-all duration-300 cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-[var(--color-accent-cyan)] bg-[rgba(6,182,212,0.1)] px-2 py-0.5 rounded">
                        {step.step}
                      </span>
                      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURED SKILLS
          ========================================= */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                  {t.featuredTitle}
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {t.featuredDesc}
                </p>
              </div>
              <a
                href={`/registry${langSuffix}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm text-[var(--color-accent-purple)] hover:text-[var(--color-accent-cyan)] transition-colors font-medium"
              >
                {t.featuredAction}
                <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill: SkillSummary, i: number) => {
              const meta = zhSkillMeta[skill.slug];
              return (
                <Reveal key={skill.id} delay={i * 80}>
                  <SkillCard
                    skill={skill}
                    locale={locale}
                    zhDescription={meta?.desc}
                    zhTags={meta?.tags}
                  />
                </Reveal>
              );
            })}
          </div>

          {/* Mobile link */}
          <div className="sm:hidden mt-8 text-center">
            <a
              href={`/registry${langSuffix}`}
              className="inline-flex items-center gap-1 text-sm text-[var(--color-accent-purple)] font-medium"
            >
              {t.featuredAction}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================
          FINAL CTA
          ========================================= */}
      <section className="relative py-28 sm:py-36">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.1)_0%,rgba(99,102,241,0.05)_40%,transparent_70%)]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t.ctaTitle}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed">
              {t.ctaDesc}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/developer${langSuffix}`}
                className="glow-button inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-medium text-[15px]"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {t.ctaCta}
                  <ArrowRight size={16} />
                </span>
              </a>
              <a
                href={`/support${langSuffix}`}
                className="ghost-button inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[var(--color-text-secondary)] font-medium text-[15px] hover:text-[var(--color-text-primary)]"
              >
                {t.ctaSecondary}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <HomeFooter locale={locale} />
    </div>
  );
}
