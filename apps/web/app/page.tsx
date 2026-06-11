import type { SkillSummary } from "@useskillhub/schema";
import {
  ArrowRight,
  Search,
  FileJson,
  Zap,
  ShieldCheck,
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
    headline: "The skill registry for AI agents",
    subline: "Discover, inspect, and invoke reusable skills through a governed API. One manifest powers search, trust review, and runtime execution.",
    cta1: "Browse Skills",
    cta2: "Read Docs",
    stats: { skills: "Skills", verified: "Verified", publishers: "Publishers", calls: "API Calls" },
    features: [
      { icon: "search", title: "Public Discovery", desc: "Search skills by task, tags, permission profile, and runtime type." },
      { icon: "manifest", title: "Manifest Inspection", desc: "View schema, permissions, runtime metadata, and version history." },
      { icon: "runtime", title: "Runtime Invocation", desc: "Call skills over REST or MCP with project-scoped API keys." },
      { icon: "trust", title: "Trust & Governance", desc: "Automated checks, human review, permission scopes, and audit trails." },
    ],
    featuredTitle: "Featured Skills",
    featuredAction: "View all",
    howTitle: "How it works",
    howSteps: [
      { step: "01", title: "Discover", desc: "Find the right skill for your agent's task." },
      { step: "02", title: "Inspect", desc: "Review manifest, permissions, and runtime details." },
      { step: "03", title: "Connect", desc: "Create a project, generate an API key." },
      { step: "04", title: "Invoke", desc: "Call the skill via REST API or MCP protocol." },
      { step: "05", title: "Monitor", desc: "Track usage, latency, and audit logs." },
    ],
    ctaTitle: "Start building with verified skills",
    ctaDesc: "Explore the registry or publish your own skill.",
    ctaCta: "Get Started",
  },
  zh: {
    badge: "开发者预览",
    headline: "AI Agent 的技能注册中心",
    subline: "通过统一 API 发现、检查和调用可复用技能。一份 manifest 驱动搜索、信任审核和运行执行。",
    cta1: "浏览 Skills",
    cta2: "阅读文档",
    stats: { skills: "技能", verified: "已验证", publishers: "发布者", calls: "API 调用" },
    features: [
      { icon: "search", title: "公开发现", desc: "按任务、标签、权限和运行时类型搜索技能。" },
      { icon: "manifest", title: "Manifest 检查", desc: "查看 schema、权限、运行元数据和版本历史。" },
      { icon: "runtime", title: "运行调用", desc: "通过项目级 API Key 以 REST 或 MCP 调用技能。" },
      { icon: "trust", title: "信任与治理", desc: "自动检查、人工审核、权限范围和审计追踪。" },
    ],
    featuredTitle: "精选 Skills",
    featuredAction: "查看全部",
    howTitle: "如何使用",
    howSteps: [
      { step: "01", title: "发现", desc: "为你的 Agent 找到合适的技能。" },
      { step: "02", title: "检查", desc: "查看 manifest、权限和运行细节。" },
      { step: "03", title: "连接", desc: "创建项目，生成 API Key。" },
      { step: "04", title: "调用", desc: "通过 REST API 或 MCP 调用技能。" },
      { step: "05", title: "监控", desc: "追踪用量、延迟和审计日志。" },
    ],
    ctaTitle: "用已验证的技能开始构建",
    ctaDesc: "探索注册表或发布你自己的技能。",
    ctaCta: "开始使用",
  },
} as const;

const skillZhCopy: Record<string, { description: string; tags: string[] }> = {
  "browser-research-pro": { description: "搜索网页并返回带来源链接的结构化洞察。", tags: ["研究", "浏览器", "引用"] },
  "dataset-summarizer": { description: "汇总大型数据集并生成关键洞察。", tags: ["数据", "分析", "摘要"] },
  "code-runner": { description: "在隔离环境中安全执行代码并返回结果。", tags: ["开发", "代码", "执行"] },
  "doc-qa": { description: "基于文档和知识源回答问题。", tags: ["文档", "问答"] },
};

const fallbackSkills: SkillSummary[] = [
  { id: "browser-research", slug: "browser-research-pro", displayName: "Browser Research", description: "Search the web and extract structured insights with source links.", tags: ["research", "browser", "citations"], version: "1.2.0", verificationStatus: "verified", permissionLevel: "medium", runtimeType: "http", updatedAt: "2026-06-01T00:00:00.000Z" },
  { id: "dataset-summarizer", slug: "dataset-summarizer", displayName: "Dataset Summarizer", description: "Summarize large datasets and generate key insights.", tags: ["data", "analysis", "summary"], version: "0.9.4", verificationStatus: "verified", permissionLevel: "low", runtimeType: "http", updatedAt: "2026-06-01T00:00:00.000Z" },
  { id: "code-runner", slug: "code-runner", displayName: "Code Runner", description: "Execute code securely in isolated environments and return results.", tags: ["dev", "code", "execute"], version: "0.8.1", verificationStatus: "verified", permissionLevel: "high", runtimeType: "mcp", updatedAt: "2026-06-01T00:00:00.000Z" },
  { id: "doc-qa", slug: "doc-qa", displayName: "Doc Q&A", description: "Answer questions based on documentation and knowledge sources.", tags: ["docs", "qa"], version: "0.7.2", verificationStatus: "submitted", permissionLevel: "low", runtimeType: "mcp", updatedAt: "2026-06-01T00:00:00.000Z" },
];

function getFeatureIcon(icon: string) {
  const cls = "text-[var(--color-accent)]";
  switch (icon) {
    case "search": return <Search size={20} className={cls} />;
    case "manifest": return <FileJson size={20} className={cls} />;
    case "runtime": return <Zap size={20} className={cls} />;
    case "trust": return <ShieldCheck size={20} className={cls} />;
    default: return <Search size={20} className={cls} />;
  }
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const skills = await getSkills();
  const stats = await getPublicPlatformStats({ skills });
  const t = copy[locale];
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  const seenSlugs = new Set<string>();
  const featuredSkills = [...skills, ...fallbackSkills]
    .filter((s) => {
      if (seenSlugs.has(s.slug)) return false;
      seenSlugs.add(s.slug);
      return true;
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <HomeNav locale={locale} />

      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                {t.badge}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                {t.headline}
              </h1>

              <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mb-8 leading-relaxed">
                {t.subline}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`/registry${langSuffix}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-black font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  {t.cta1}
                  <ArrowRight size={16} />
                </a>
                <a
                  href={`/docs${langSuffix}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--color-border-default)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {t.cta2}
                </a>
              </div>
            </div>

            {/* Right: Code animation */}
            <div className="animate-fade-in-up animate-delay-200 hidden lg:block">
              <CodeAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <Reveal>
        <section className="border-y border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.publicSkills}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.stats.skills}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.verifiedSkills}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.stats.verified}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.publicPublishers}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.stats.publishers}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.recordedCalls}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.stats.calls}</div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 100}>
                <div className="glow-card rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-6 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center mb-4">
                    {getFeatureIcon(feat.icon)}
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{t.featuredTitle}</h2>
              <a
                href={`/registry${langSuffix}`}
                className="text-sm text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                {t.featuredAction}
                <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSkills.map((skill, i) => (
              <Reveal key={skill.slug} delay={i * 80}>
                <SkillCard
                  skill={skill}
                  locale={locale}
                  zhDescription={skillZhCopy[skill.slug]?.description}
                  zhTags={skillZhCopy[skill.slug]?.tags}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-[var(--color-bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-bold text-center mb-12">{t.howTitle}</h2>
          </Reveal>
          <div className="space-y-0">
            {t.howSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 80}>
                <div className="flex items-start gap-4 py-5 border-b border-[var(--color-border-default)] last:border-b-0">
                  <span className="text-sm font-mono text-[var(--color-accent)] shrink-0 w-8">{step.step}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{step.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.ctaTitle}</h2>
            <p className="text-[var(--color-text-secondary)] mb-8">{t.ctaDesc}</p>
            <a
              href={`/registry${langSuffix}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent)] text-black font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {t.ctaCta}
              <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <HomeFooter locale={locale} />
    </div>
  );
}
