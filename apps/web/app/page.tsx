import {
  ArrowRight,
  Search,
  FileJson,
  Zap,
  ShieldCheck,
  Eye,
  Activity,
  ChevronRight,
} from "lucide-react";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import { getSkills } from "@/lib/registry";
import { HomeNav } from "@/components/home/nav";
import { HomeFooter } from "@/components/home/footer";
import { SkillCard } from "@/components/home/skill-card";
import { CodeAnimation } from "@/components/home/code-animation";
import { Reveal } from "@/components/home/reveal";
import "./tailwind.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    badge: "Developer Preview",
    headline1: "Universal skills",
    headline2: "for AI agents",
    subline:
      "A governed registry where agents discover, inspect, and invoke verified skills. One manifest powers search, trust review, and secure runtime.",
    cta1: "Start building",
    cta2: "View documentation",
    stats: [
      { key: "publicSkills", label: "Skills" },
      { key: "verifiedSkills", label: "Verified" },
      { key: "publicPublishers", label: "Publishers" },
      { key: "recordedCalls", label: "API Calls" },
    ],
    integrations: "Works with your stack",
    agentLogos: ["Claude", "Cursor", "Windsurf", "ChatGPT", "MCP", "REST API"],
    features: [
      {
        icon: "search",
        title: "Discover",
        titleMuted: "the right skill instantly",
        desc: "Search by capability, runtime type, or permission profile. Semantic matching surfaces relevant skills in seconds.",
      },
      {
        icon: "manifest",
        title: "Inspect",
        titleMuted: "before you integrate",
        desc: "Review input/output schemas, permission scopes, version history, pricing, and trust signals — all from the manifest.",
      },
      {
        icon: "runtime",
        title: "Invoke",
        titleMuted: "with confidence",
        desc: "Call skills via REST or MCP with project-scoped API keys. Built-in rate limiting, retries, and structured error handling.",
      },
      {
        icon: "trust",
        title: "Govern",
        titleMuted: "every invocation",
        desc: "Automated security scanning, human review, audit trails, and per-project permission policies.",
      },
    ],
    skillsTitle: "Featured skills",
    skillsMuted: "Production-ready and verified",
    skillsCta: "View all skills",
    howTitle: "How it works",
    howMuted: "From discovery to production",
    howSteps: [
      { num: "01", title: "Discover", desc: "Browse the registry or search by task. Filter by runtime, permissions, and verification status." },
      { num: "02", title: "Inspect", desc: "Review the full manifest — schemas, permissions, changelog. Test in the sandbox." },
      { num: "03", title: "Connect", desc: "Create a project, configure scopes, generate a production API key." },
      { num: "04", title: "Invoke", desc: "Call via REST or MCP. Structured responses with built-in observability." },
      { num: "05", title: "Monitor", desc: "Real-time dashboards for volume, latency, error rates, and cost." },
    ],
    ctaTitle: "Ready to build",
    ctaMuted: "with verified skills?",
    ctaDesc: "Join developers shipping AI products with production-grade skill infrastructure.",
    ctaCta: "Get started free",
    ctaSecondary: "Book a demo",
  },
  zh: {
    badge: "开发者预览",
    headline1: "AI Agent 的",
    headline2: "统一技能平台",
    subline:
      "一个受治理的注册中心，让 Agent 发现、检查并调用已验证的技能。一份 manifest 驱动搜索、信任审核和安全运行。",
    cta1: "开始构建",
    cta2: "查看文档",
    stats: [
      { key: "publicSkills", label: "技能" },
      { key: "verifiedSkills", label: "已验证" },
      { key: "publicPublishers", label: "发布者" },
      { key: "recordedCalls", label: "API 调用" },
    ],
    integrations: "兼容你的技术栈",
    agentLogos: ["Claude", "Cursor", "Windsurf", "ChatGPT", "MCP", "REST API"],
    features: [
      {
        icon: "search",
        title: "发现",
        titleMuted: "即时找到合适的技能",
        desc: "按能力、运行时类型或权限配置搜索。语义匹配在几秒内找到相关技能。",
      },
      {
        icon: "manifest",
        title: "检查",
        titleMuted: "集成前充分了解",
        desc: "审查输入/输出 schema、权限范围、版本历史、定价和信任信号 — 全部来自 manifest。",
      },
      {
        icon: "runtime",
        title: "调用",
        titleMuted: "安全可靠地执行",
        desc: "通过项目级 API Key 以 REST 或 MCP 调用技能。内置限流、重试和结构化错误处理。",
      },
      {
        icon: "trust",
        title: "治理",
        titleMuted: "每次调用都可追溯",
        desc: "自动安全扫描、人工审核、审计追踪和项目级权限策略。",
      },
    ],
    skillsTitle: "精选技能",
    skillsMuted: "生产就绪，已验证",
    skillsCta: "查看全部技能",
    howTitle: "如何使用",
    howMuted: "从发现到生产",
    howSteps: [
      { num: "01", title: "发现", desc: "浏览注册表或按任务搜索。按运行时、权限和验证状态筛选。" },
      { num: "02", title: "检查", desc: "审查完整 manifest — schema、权限、变更日志。在沙箱中测试。" },
      { num: "03", title: "连接", desc: "创建项目，配置 scope，生成生产 API Key。" },
      { num: "04", title: "调用", desc: "通过 REST 或 MCP 调用。结构化响应，内置可观测性。" },
      { num: "05", title: "监控", desc: "实时仪表盘：调用量、延迟、错误率和成本。" },
    ],
    ctaTitle: "准备好",
    ctaMuted: "用已验证的技能构建了吗？",
    ctaDesc: "加入开发者行列，用生产级技能基础设施交付 AI 产品。",
    ctaCta: "免费开始",
    ctaSecondary: "预约演示",
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
    desc: "智能代码审查 — 安全漏洞、性能问题、最佳实践。",
    tags: ["代码", "审查", "安全"],
  },
  "data-pipeline-orchestrator": {
    desc: "数据管道编排 — ETL 调度、依赖管理、失败重试。",
    tags: ["数据", "ETL", "编排"],
  },
  "financial-report-analyzer": {
    desc: "财报分析 — 关键指标提取、趋势分析、异常检测。",
    tags: ["金融", "分析", "报告"],
  },
};

const featureIcons: Record<string, typeof Search> = {
  search: Search,
  manifest: FileJson,
  runtime: Zap,
  trust: ShieldCheck,
};

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const locale = getLocaleFromSearchParams(resolvedParams);
  const langSuffix = locale === "zh" ? "?lang=zh" : "";
  const t = copy[locale];

  const [stats, allSkills] = await Promise.all([
    getPublicPlatformStats(),
    getSkills(),
  ]);
  const skills = allSkills.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--color-surface-0)]">
      <HomeNav locale={locale} />

      {/* === HERO === */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Two-column hero like Morphic */}
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left: headline */}
            <div>
              {/* Badge */}
              <div className="mb-8">
                <span className="badge-accent">
                  {t.badge}
                </span>
              </div>

              {/* Two-tone headline */}
              <h1 className="text-display mb-6">
                <span className="heading-primary block">{t.headline1}</span>
                <span className="heading-secondary block">{t.headline2}</span>
              </h1>

              {/* Subline */}
              <p className="text-body-lg text-[var(--color-text-secondary)] max-w-md mb-8">
                {t.subline}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <a href={`/developer${langSuffix}`} className="btn-primary">
                  {t.cta1}
                  <ArrowRight size={14} />
                </a>
                <a href={`/docs${langSuffix}`} className="btn-secondary">
                  {t.cta2}
                </a>
              </div>
            </div>

            {/* Right: code demo */}
            <div className="hidden md:block">
              <CodeAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="py-12 border-y border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.map((stat) => {
              const value = stats[stat.key as keyof typeof stats];
              const numValue = typeof value === "number" ? value : 0;
              return (
                <div key={stat.key}>
                  <div className="text-heading heading-primary mb-1">
                    {numValue.toLocaleString()}
                  </div>
                  <div className="text-body-sm text-[var(--color-text-secondary)]">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === INTEGRATIONS / LOGO BAR === */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-body-sm text-[var(--color-text-muted)] mb-8 text-center">
            {t.integrations}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {t.agentLogos.map((name) => (
              <div
                key={name}
                className="px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-body-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-all"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES (Bento-style 2x2) === */}
      <section className="section-gap">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4">
            {t.features.map((feature) => {
              const Icon = featureIcons[feature.icon];
              return (
                <Reveal key={feature.title}>
                  <div className="card-lg p-8 h-full">
                    <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] flex items-center justify-center mb-5">
                      <Icon size={18} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <h3 className="text-heading-sm mb-1">
                      <span className="text-[var(--color-text-primary)]">{feature.title}</span>
                      <span className="text-[var(--color-text-secondary)]"> {feature.titleMuted}</span>
                    </h3>
                    <p className="text-body text-[var(--color-text-secondary)] mt-3">
                      {feature.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* === FEATURED SKILLS === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section header: two-tone */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-heading">
                <span className="heading-primary block">{t.skillsTitle}</span>
                <span className="heading-secondary block">{t.skillsMuted}</span>
              </h2>
            </div>
            <a
              href={`/marketplace${langSuffix}`}
              className="hidden md:inline-flex items-center gap-1 text-body-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {t.skillsCta}
              <ChevronRight size={14} />
            </a>
          </div>

          {/* Skills grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const zhMeta = zhSkillMeta[skill.slug];
              return (
                <Reveal key={skill.id} delay={0}>
                  <SkillCard
                    skill={skill}
                    locale={locale}
                    zhDescription={zhMeta?.desc}
                    zhTags={zhMeta?.tags}
                  />
                </Reveal>
              );
            })}
          </div>

          {/* Mobile CTA */}
          <div className="mt-8 md:hidden text-center">
            <a
              href={`/marketplace${langSuffix}`}
              className="btn-outline"
            >
              {t.skillsCta}
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-heading">
              <span className="heading-primary block">{t.howTitle}</span>
              <span className="heading-secondary block">{t.howMuted}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {t.howSteps.map((step) => (
              <Reveal key={step.num}>
                <div className="card p-5 h-full">
                  <span className="text-label text-[var(--color-accent)] block mb-3">
                    {step.num}
                  </span>
                  <h3 className="text-body-sm text-[var(--color-text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-[var(--color-text-muted)]">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="section-gap border-t border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-heading mb-4">
            <span className="heading-primary">{t.ctaTitle}</span>
            <br />
            <span className="heading-secondary">{t.ctaMuted}</span>
          </h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] max-w-lg mx-auto mb-8">
            {t.ctaDesc}
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href={`/developer${langSuffix}`} className="btn-primary">
              {t.ctaCta}
              <ArrowRight size={14} />
            </a>
            <a href={`/support${langSuffix}`} className="btn-outline">
              {t.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <HomeFooter locale={locale} />
    </div>
  );
}
