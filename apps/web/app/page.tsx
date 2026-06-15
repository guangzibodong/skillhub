import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Braces,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  PackageSearch,
  ShieldCheck,
  Terminal,
  UploadCloud,
  Users,
  Workflow,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import {
  getPublicMarketplaceSkills,
} from "@/lib/public-marketplace";
import {
  localizeText,
  marketplaceSkills,
  type MarketplaceSkill,
} from "@/lib/marketplace-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub - AI Agent Skills 治理型市场"
    : "SkillHub - The governed marketplace for AI Agent Skills";
  const description = isZh
    ? "发现、检查、批准并通过 REST 或 MCP 安全运行可复用 AI Agent Skills。"
    : "Discover, inspect, approve, and run reusable skills for your AI agents safely through REST or MCP.";
  const url = `https://useskillhub.com/?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/?lang=en",
        "zh-CN": "https://useskillhub.com/?lang=zh",
        "x-default": "https://useskillhub.com/",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "SkillHub",
    },
  };
}

const copy = {
  en: {
    early: "Early Access",
    heroTitle: "The governed marketplace for AI Agent Skills",
    heroBody:
      "Discover, inspect, approve, and run reusable skills for your AI agents safely through REST or MCP.",
    browse: "Browse Skills",
    publish: "Publish a Skill",
    entrancesTitle: "Choose your starting point",
    entrances: [
      {
        title: "Agent Builders",
        body: "Find reusable skills, inspect permissions, and connect them to your agent runtime.",
        cta: "Browse Skills",
        href: "/marketplace",
      },
      {
        title: "Skill Publishers",
        body: "Publish versioned skills with manifests, examples, review status, and pricing readiness.",
        cta: "Start Publishing",
        href: "/publish",
      },
      {
        title: "Teams",
        body: "Govern which skills your agents can call with Project Keys, permissions, logs, and approvals.",
        cta: "View Security Model",
        href: "/security",
      },
    ],
    workflowTitle: "From discovery to governed runtime",
    workflow: [
      ["Discover", "Browse reusable skills for your agent workflows."],
      ["Inspect", "Review manifests, permissions, schemas, and publisher trust."],
      ["Approve", "Control access with scoped Project Keys."],
      ["Run", "Invoke skills through REST or MCP."],
      ["Monitor", "Track usage, logs, and runtime outcomes."],
    ],
    featuredTitle: "Featured Skills",
    featuredBody: "These listings use the same catalog data as Marketplace and Skill Detail.",
    viewSkill: "View Skill",
    governanceTitle: "Governance and security are part of the product path",
    governance: [
      ["Permission review", "Inspect network, browser, filesystem, and secret requirements before adoption."],
      ["Project Keys", "Scope which skills a project can call, then rotate or revoke access when needed."],
      ["Audit logs", "Keep runtime events reviewable for team governance and incident response."],
    ],
    previewTitle: "Product workflow",
    previewBody: "A realistic view of how teams inspect a skill before allowing runtime use.",
    finalTitle: "Start with a skill your agent can inspect",
    finalBody: "Browse the public catalog, inspect a manifest, then create a governed runtime path when your workspace is ready.",
    docs: "Read Docs",
    by: "by",
    category: "Category",
    status: "Status",
    runtime: "Runtime",
    risk: "Risk",
    permissions: "Permissions",
    projectKey: "Project Key",
    runtimeLog: "Runtime log",
  },
  zh: {
    early: "Early Access",
    heroTitle: "面向 AI Agent Skills 的治理型市场",
    heroBody:
      "发现、检查、批准并通过 REST 或 MCP 安全运行可复用的 AI Agent Skills。",
    browse: "浏览技能",
    publish: "发布技能",
    entrancesTitle: "选择你的入口",
    entrances: [
      {
        title: "Agent 构建者",
        body: "查找可复用技能，检查权限，并接入你的智能体运行时。",
        cta: "浏览技能",
        href: "/marketplace",
      },
      {
        title: "技能发布者",
        body: "发布带版本的技能，提供 manifest、示例、审核状态和商业化准备信息。",
        cta: "开始发布",
        href: "/publish",
      },
      {
        title: "团队",
        body: "通过 Project Key、权限、日志和审批治理智能体可以调用哪些技能。",
        cta: "查看安全模型",
        href: "/security",
      },
    ],
    workflowTitle: "从发现到受治理运行",
    workflow: [
      ["Discover", "浏览适合智能体工作流的可复用技能。"],
      ["Inspect", "检查 manifest、权限、schema 和发布者信任。"],
      ["Approve", "使用有范围的 Project Key 控制访问。"],
      ["Run", "通过 REST 或 MCP 调用技能。"],
      ["Monitor", "追踪用量、日志和运行结果。"],
    ],
    featuredTitle: "精选技能",
    featuredBody: "这些列表使用与 Marketplace 和 Skill Detail 相同的目录数据。",
    viewSkill: "查看技能",
    governanceTitle: "治理和安全要进入产品路径，而不是事后补丁",
    governance: [
      ["权限检查", "采用前检查网络、浏览器、文件系统和密钥请求。"],
      ["Project Key", "限制项目可以调用哪些技能，并在需要时轮换或吊销访问。"],
      ["审计日志", "让运行事件可复核，支持团队治理和事故响应。"],
    ],
    previewTitle: "产品界面预览",
    previewBody: "展示团队在允许运行前如何检查一个技能。",
    finalTitle: "从一个可检查的技能开始",
    finalBody: "先浏览公开目录，检查 manifest，再在工作台准备好后创建受治理的运行路径。",
    docs: "阅读文档",
    by: "来自",
    category: "类别",
    status: "状态",
    runtime: "运行时",
    risk: "风险",
    permissions: "权限",
    projectKey: "Project Key",
    runtimeLog: "运行日志",
  },
} as const;

const entranceIcons = [Terminal, UploadCloud, Users] as const;
const workflowIcons = [PackageSearch, Braces, KeyRound, Workflow, LayoutDashboard] as const;
const governanceIcons = [ShieldCheck, KeyRound, BookOpenCheck] as const;

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const skills = await getPublicMarketplaceSkills({ limit: 4 });
  const featuredSkills = (skills.length > 0 ? skills : marketplaceSkills).slice(0, 4);
  const leadSkill = featuredSkills[0] ?? marketplaceSkills[0];

  return (
    <AppShell active="home" locale={locale}>
      <section className="section" aria-labelledby="home-heading">
        <div className="section-inner hero-glow grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-10 items-center pt-10 pb-16 md:pt-16 md:pb-20">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="eyebrow">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>{labels.early}</span>
              </div>
              <div className="flex flex-col gap-4 max-w-[780px]">
                <h1 id="home-heading" className="heading-xl">{labels.heroTitle}</h1>
                <p className="body-text text-[#999]">{labels.heroBody}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a className="btn-primary--large" href={localizedHref("/marketplace", locale)}>
                  <PackageSearch size={18} aria-hidden="true" />
                  <span>{labels.browse}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a className="btn-secondary--large" href={localizedHref("/publish", locale)}>
                  <UploadCloud size={18} aria-hidden="true" />
                  <span>{labels.publish}</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ProductPreviewCard labels={labels} locale={locale} skill={leadSkill} />
          </Reveal>
        </div>
      </section>

      <section className="section py-10" aria-labelledby="home-entrances-heading">
        <div className="section-inner flex flex-col gap-6">
          <h2 id="home-entrances-heading" className="heading-lg">{labels.entrancesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {labels.entrances.map((item, index) => {
              const Icon = entranceIcons[index];

              return (
                <article className="card p-6 flex flex-col gap-4" key={item.title}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(127,238,100,0.1)] text-[#7fee64]">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="heading-sm">{item.title}</h3>
                    <p className="body-text-sm text-[#999]">{item.body}</p>
                  </div>
                  <a className="btn-text mt-auto" href={localizedHref(item.href, locale)}>
                    <span>{item.cta}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section py-14" aria-labelledby="home-workflow-heading">
        <div className="section-inner flex flex-col gap-8">
          <h2 id="home-workflow-heading" className="heading-lg">{labels.workflowTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {labels.workflow.map(([title, body], index) => {
              const Icon = workflowIcons[index];

              return (
                <article className="card--compact p-4 flex flex-col gap-3" key={title}>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.06)] text-[#7fee64]">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <small className="text-xs text-[#525252]">{String(index + 1).padStart(2, "0")}</small>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="body-text-sm text-[#777]">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section py-14" aria-labelledby="home-featured-heading">
        <div className="section-inner flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h2 id="home-featured-heading" className="heading-lg">{labels.featuredTitle}</h2>
              <p className="body-text-sm text-[#999] max-w-[620px]">{labels.featuredBody}</p>
            </div>
            <a className="btn-text" href={localizedHref("/marketplace", locale)}>
              <span>{labels.browse}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.slug} labels={labels} locale={locale} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      <section className="section py-14" aria-labelledby="home-governance-heading">
        <div className="section-inner flex flex-col gap-6">
          <h2 id="home-governance-heading" className="heading-lg max-w-[780px]">{labels.governanceTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {labels.governance.map(([title, body], index) => {
              const Icon = governanceIcons[index];

              return (
                <article className="card p-6 flex flex-col gap-4" key={title}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.06)] text-[#7fee64]">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <h3 className="heading-sm">{title}</h3>
                  <p className="body-text-sm text-[#999]">{body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section py-14" aria-labelledby="home-preview-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
          <div className="flex flex-col gap-3">
            <div className="eyebrow">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>{labels.previewTitle}</span>
            </div>
            <h2 id="home-preview-heading" className="heading-lg">{labels.previewTitle}</h2>
            <p className="body-text text-[#999]">{labels.previewBody}</p>
          </div>
          <ProductPreviewWide labels={labels} locale={locale} skill={leadSkill} />
        </div>
      </section>

      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{labels.finalTitle}</h2>
            <p className="body-text max-w-[560px] mx-auto mb-8">{labels.finalBody}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{labels.browse}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                <span>{labels.docs}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}

function ProductPreviewCard({
  labels,
  locale,
  skill,
}: {
  labels: (typeof copy)[Locale];
  locale: Locale;
  skill: MarketplaceSkill;
}) {
  return (
    <aside className="card p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs text-[#7fee64]">{localizeText(skill.category, locale)}</span>
          <h2 className="heading-sm mt-1">{localizeText(skill.name, locale)}</h2>
          <p className="body-text-sm text-[#999] mt-2">{localizeText(skill.summary, locale)}</p>
        </div>
        <span className={`pill ${skill.verification.en === "Verified" ? "pill--success" : "pill--warning"}`}>
          {localizeText(skill.verification, locale)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <PreviewMetric label={labels.runtime} value={skill.runtime} />
        <PreviewMetric label={labels.risk} value={riskLabel(skill.risk, locale)} />
        <PreviewMetric label={labels.projectKey} value={locale === "zh" ? "需要" : "Required"} />
        <PreviewMetric label={labels.permissions} value={skill.permissions.length.toString()} />
      </div>
      <div className="code-block">
        <pre className="p-4 text-xs overflow-x-auto">
          <code>{`{
  "skill": "${skill.slug}",
  "runtime": "${skill.runtime.toLowerCase()}",
  "status": "${skill.verification.en.toLowerCase()}"
}`}</code>
        </pre>
      </div>
    </aside>
  );
}

function ProductPreviewWide({
  labels,
  locale,
  skill,
}: {
  labels: (typeof copy)[Locale];
  locale: Locale;
  skill: MarketplaceSkill;
}) {
  return (
    <article className="card p-6 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5">
      <div className="flex flex-col gap-4">
        <div className="eyebrow">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.permissions}</span>
        </div>
        {skill.permissions.map((permission) => (
          <div className="flex items-start gap-3 rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-black/40 p-3" key={permission.key}>
            <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 text-[#7fee64]" />
            <div>
              <strong className="block text-sm text-white">{localizeText(permission.label, locale)}</strong>
              <span className="text-xs text-[#999]">{localizeText(permission.value, locale)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="eyebrow">
          <Terminal size={16} aria-hidden="true" />
          <span>{labels.runtimeLog}</span>
        </div>
        <div className="code-block min-h-full">
          <pre className="p-4 text-xs overflow-x-auto">
            <code>{`POST /v1/skills/${skill.slug}/invoke
Authorization: Bearer PROJECT_KEY

policy.check = passed
runtime = ${skill.runtime}
audit = enabled`}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="text-xs text-[#777]">{label}</span>
      <strong className="text-sm text-white">{value}</strong>
    </div>
  );
}

function SkillCard({
  labels,
  locale,
  skill,
}: {
  labels: (typeof copy)[Locale];
  locale: Locale;
  skill: MarketplaceSkill;
}) {
  return (
    <article className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs text-[#7fee64]">{localizeText(skill.category, locale)}</span>
          <h3 className="heading-sm mt-1">{localizeText(skill.name, locale)}</h3>
          <span className="text-xs text-[#777]">{labels.by} {skill.author}</span>
        </div>
        <span className={`pill ${skill.verification.en === "Verified" ? "pill--success" : "pill--warning"}`}>
          {localizeText(skill.verification, locale)}
        </span>
      </div>
      <p className="body-text-sm text-[#999]">{localizeText(skill.summary, locale)}</p>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-[#666]">{labels.runtime}</dt>
          <dd className="text-sm text-white">{skill.runtime}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#666]">{labels.risk}</dt>
          <dd className="text-sm text-white">{riskLabel(skill.risk, locale)}</dd>
        </div>
      </dl>
      <a className="btn-secondary mt-auto w-fit" href={localizedHref(`/skills/${skill.slug}`, locale)}>
        <span>{labels.viewSkill}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

function riskLabel(risk: MarketplaceSkill["risk"], locale: Locale) {
  const labels = {
    en: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk",
    },
    zh: {
      high: "高风险",
      low: "低风险",
      medium: "中风险",
    },
  } satisfies Record<Locale, Record<MarketplaceSkill["risk"], string>>;

  return labels[locale][risk];
}
