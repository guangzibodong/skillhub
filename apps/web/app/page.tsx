import type { SkillSummary } from "@useskillhub/schema";
import {
  ArrowRight,
  Search,
  FileJson,
  Zap,
  ShieldCheck,
  Sparkles,
  Globe,
  Lock,
  Activity,
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
    badge: "Now in Public Beta",
    headline: "The skill registry\nfor AI agents",
    subline:
      "Discover, verify, and invoke production-ready skills through a governed API. One manifest powers search, trust review, and secure runtime execution.",
    cta1: "Explore Registry",
    cta2: "Read Documentation",
    trustedBy: "Powering the next generation of AI agents",
    stats: {
      skills: "Skills",
      verified: "Verified",
      publishers: "Publishers",
      calls: "API Calls/mo",
    },
    features: [
      {
        icon: "search",
        title: "Intelligent Discovery",
        desc: "Search skills by task, capability, permission profile, and runtime type. Find the right tool in seconds.",
      },
      {
        icon: "manifest",
        title: "Schema & Manifest",
        desc: "Inspect input/output schemas, permission requirements, version history, and runtime metadata before integration.",
      },
      {
        icon: "runtime",
        title: "Secure Invocation",
        desc: "Call skills via REST or MCP with project-scoped API keys. Built-in rate limiting, retries, and observability.",
      },
      {
        icon: "trust",
        title: "Trust & Governance",
        desc: "Automated security checks, human review, permission scoping, and full audit trails for every invocation.",
      },
    ],
    showcaseTitle: "Built for developers",
    showcaseDesc: "A complete platform from discovery to production",
    featuredTitle: "Featured Skills",
    featuredDesc: "Production-ready, verified, and battle-tested",
    featuredAction: "View all skills",
    howTitle: "How it works",
    howDesc: "From discovery to production in minutes",
    howSteps: [
      {
        step: "01",
        title: "Discover",
        desc: "Browse the registry or search by capability. Filter by runtime type, permission level, and verification status.",
      },
      {
        step: "02",
        title: "Inspect",
        desc: "Review the full manifest — schemas, permissions, pricing, and version history. Test in the playground.",
      },
      {
        step: "03",
        title: "Connect",
        desc: "Create a project, configure scopes, and generate a production API key in your developer console.",
      },
      {
        step: "04",
        title: "Invoke",
        desc: "Call the skill via REST API or MCP transport. Get structured responses with built-in error handling.",
      },
      {
        step: "05",
        title: "Monitor",
        desc: "Track invocations, latency percentiles, error rates, and costs in real-time dashboards.",
      },
    ],
    ctaTitle: "Ready to build with verified skills?",
    ctaDesc:
      "Join hundreds of developers building the next generation of AI-powered applications.",
    ctaCta: "Get Started Free",
    ctaSecondary: "Talk to Sales",
  },
  zh: {
    badge: "公开测试中",
    headline: "AI Agent 的\n技能注册中心",
    subline:
      "通过统一治理 API 发现、验证和调用生产级技能。一份 manifest 驱动搜索、信任审核和安全运行。",
    cta1: "探索注册表",
    cta2: "阅读文档",
    trustedBy: "驱动下一代 AI Agent",
    stats: {
      skills: "技能",
      verified: "已验证",
      publishers: "发布者",
      calls: "月 API 调用",
    },
    features: [
      {
        icon: "search",
        title: "智能发现",
        desc: "按任务、能力、权限配置和运行类型搜索技能。几秒内找到合适工具。",
      },
      {
        icon: "manifest",
        title: "Schema 与 Manifest",
        desc: "集成前检查输入/输出 schema、权限要求、版本历史和运行时元数据。",
      },
      {
        icon: "runtime",
        title: "安全调用",
        desc: "通过项目级 API Key 以 REST 或 MCP 调用技能。内置限流、重试和可观测性。",
      },
      {
        icon: "trust",
        title: "信任与治理",
        desc: "自动安全检查、人工审核、权限范围控制和每次调用的完整审计追踪。",
      },
    ],
    showcaseTitle: "为开发者而建",
    showcaseDesc: "从发现到生产的完整平台",
    featuredTitle: "精选 Skills",
    featuredDesc: "生产就绪，已验证，经过实战检验",
    featuredAction: "查看全部技能",
    howTitle: "如何使用",
    howDesc: "从发现到生产只需几分钟",
    howSteps: [
      {
        step: "01",
        title: "发现",
        desc: "浏览注册表或按能力搜索。按运行类型、权限级别和验证状态筛选。",
      },
      {
        step: "02",
        title: "检查",
        desc: "审查完整 manifest — schema、权限、定价和版本历史。在 Playground 测试。",
      },
      {
        step: "03",
        title: "连接",
        desc: "创建项目，配置 scope，在开发者控制台生成生产 API Key。",
      },
      {
        step: "04",
        title: "调用",
        desc: "通过 REST API 或 MCP 传输调用技能。获得结构化响应和内置错误处理。",
      },
      {
        step: "05",
        title: "监控",
        desc: "在实时仪表盘中追踪调用量、延迟百分位、错误率和成本。",
      },
    ],
    ctaTitle: "准备好用已验证的技能构建了吗？",
    ctaDesc: "加入数百位开发者，构建下一代 AI 驱动的应用。",
    ctaCta: "免费开始",
    ctaSecondary: "联系销售",
  },
} as const;

const zhSkillMeta: Record<string, { desc: string; tags: string[] }> = {
  "browser-research-pro": {
    desc: "深度网络研究 — 多源抓取、结构化摘要、事实核查一体化。",
    tags: ["研究", "浏览器", "摘要"],
  },
  "crm-enrichment": {
    desc: "自动补全 CRM 联系人数据 — 社交主页、公司信息、职位验证。",
    tags: ["CRM", "数据", "销售"],
  },
  "support-triage": {
    desc: "AI 工单分类 — 自动识别优先级、分配团队、提取关键信息。",
    tags: ["支持", "分类", "工单"],
  },
  "code-review-assistant": {
    desc: "智能代码审查 — 安全漏洞检测、性能建议、代码风格统一。",
    tags: ["代码", "审查", "安全"],
  },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const featureIcons: Record<string, typeof Search> = {
  search: Search,
  manifest: FileJson,
  runtime: Zap,
  trust: ShieldCheck,
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-x-hidden">
      <HomeNav locale={locale} />

      {/* === HERO === */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background effects */}
        <div className="hero-glow" />
        <div className="grid-pattern absolute inset-0 pointer-events-none" />
        <ParticleField />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-green)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-green)]" />
              </span>
              <span className="text-sm text-[var(--color-text-secondary)]">{t.badge}</span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 whitespace-pre-line gradient-text-hero">
              {t.headline}
            </h1>
          </Reveal>

          {/* Subline */}
          <Reveal delay={200}>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
              {t.subline}
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/registry${langSuffix}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-indigo)] text-white font-medium text-[15px] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-0.5"
              >
                {t.cta1}
                <ArrowRight size={16} />
              </a>
              <a
                href={`/docs${langSuffix}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-medium text-[15px] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[rgba(255,255,255,0.03)] transition-all"
              >
                {t.cta2}
              </a>
            </div>
          </Reveal>

          {/* Hero Code Block */}
          <Reveal delay={500}>
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="rotating-border">
                <CodeAnimation />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-text-muted)] animate-bounce-slow">
          <div className="w-5 h-8 rounded-full border border-[var(--color-border-default)] flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-[var(--color-accent-purple)] animate-pulse" />
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="relative py-20 border-y border-[var(--color-border-default)]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <p className="text-center text-sm text-[var(--color-text-muted)] mb-10 uppercase tracking-widest">
              {t.trustedBy}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: stats.publicSkills, label: t.stats.skills },
              { value: stats.verifiedSkills, label: t.stats.verified },
              { value: stats.publicPublishers, label: t.stats.publishers },
              { value: stats.recordedCalls, label: t.stats.calls },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES BENTO === */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.showcaseTitle}</h2>
              <p className="text-[var(--color-text-secondary)] text-lg">{t.showcaseDesc}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {t.features.map((feature, i) => {
              const Icon = featureIcons[feature.icon];
              return (
                <Reveal key={feature.title} delay={i * 100}>
                  <BentoCard
                    title={feature.title}
                    description={feature.desc}
                    icon={<Icon size={20} className="text-[var(--color-accent-purple)]" />}
                    className="h-full min-h-[180px]"
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* === FEATURED SKILLS === */}
      <section className="py-24 sm:py-32 bg-[var(--color-bg-elevated)]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">{t.featuredTitle}</h2>
                <p className="text-[var(--color-text-secondary)]">{t.featuredDesc}</p>
              </div>
              <a
                href={`/registry${langSuffix}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[var(--color-accent-purple)] hover:text-[var(--color-accent-cyan)] transition-colors font-medium"
              >
                {t.featuredAction}
                <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.slice(0, 6).map((skill: SkillSummary, i: number) => (
              <Reveal key={skill.slug} delay={i * 80}>
                <SkillCard
                  skill={skill}
                  locale={locale}
                  zhDescription={zhSkillMeta[skill.slug]?.desc}
                  zhTags={zhSkillMeta[skill.slug]?.tags}
                />
              </Reveal>
            ))}
          </div>

          {/* Mobile link */}
          <div className="sm:hidden mt-8 text-center">
            <a
              href={`/registry${langSuffix}`}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent-purple)] font-medium"
            >
              {t.featuredAction}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.howTitle}</h2>
              <p className="text-[var(--color-text-secondary)] text-lg">{t.howDesc}</p>
            </div>
          </Reveal>

          <div className="flow-line relative pl-10">
            {t.howSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 100}>
                <div className="relative pb-10 last:pb-0">
                  {/* Step number circle */}
                  <div className="absolute -left-10 top-0 w-[30px] h-[30px] rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] flex items-center justify-center z-10">
                    <span className="text-xs font-mono font-bold text-[var(--color-accent-purple)]">
                      {step.step}
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5">
                      {step.title}
                    </h3>
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

      {/* === FINAL CTA === */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-[var(--color-accent-purple)]" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              {t.ctaTitle}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto">
              {t.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/developer${langSuffix}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-indigo)] text-white font-medium text-[15px] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-0.5"
              >
                {t.ctaCta}
                <ArrowRight size={16} />
              </a>
              <a
                href={`/support${langSuffix}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-secondary)] font-medium text-[15px] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all"
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
