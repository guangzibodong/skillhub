import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Braces,
  Code2,
  KeyRound,
  Network,
  PackageSearch,
  ShieldCheck,
  Terminal,
  Webhook,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DocsCodeBlock } from "@/components/docs-code-block";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub Docs - AI Agent Skills 开发者文档"
    : "SkillHub Docs - AI Agent Skills Developer Docs";
  const description = isZh
    ? "通过 Quickstart、REST API、MCP、Manifest、Project Keys、Webhooks 和示例快速接入 SkillHub。"
    : "Use Quickstart, REST API, MCP, Manifest, Project Keys, Webhooks, and examples to integrate SkillHub.";
  const url = `https://useskillhub.com/docs?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/docs?lang=en",
        "zh-CN": "https://useskillhub.com/docs?lang=zh",
        "x-default": "https://useskillhub.com/docs",
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "SkillHub",
    },
  };
}

const copy = {
  en: {
    eyebrow: "Developer docs",
    title: "Build with governed AI Agent Skills",
    body:
      "Start from public discovery, inspect a manifest, create a scoped Project Key, then invoke approved skills through REST or MCP.",
    primary: "Start Quickstart",
    secondary: "Browse Skills",
    toc: "Docs",
    sections: [
      ["quickstart", "Quickstart"],
      ["rest", "REST API"],
      ["mcp", "MCP Setup"],
      ["manifest", "Manifest Schema"],
      ["project-keys", "Project Keys"],
      ["webhooks", "Webhooks"],
      ["examples", "Examples"],
      ["errors", "Error Handling"],
    ],
    quickstartSteps: [
      ["Search skills", "Find a reusable capability in the public catalog."],
      ["Inspect manifest", "Review schema, permissions, runtime, publisher, and review status."],
      ["Create Project Key", "Generate a scoped key inside a signed-in project."],
      ["Invoke via REST", "Call the approved skill with typed input."],
      ["Configure MCP", "Connect SkillHub to an MCP-compatible workbench."],
      ["Review logs", "Track usage, policy decisions, and runtime outcomes."],
    ],
    note: "Example configuration. Availability depends on current workspace access.",
    copyLabels: {
      rest: "REST request",
      mcp: "MCP config",
      manifest: "Manifest",
      webhook: "Webhook payload",
      example: "Example payload",
    },
  },
  zh: {
    eyebrow: "开发者文档",
    title: "接入受治理的 AI Agent Skills",
    body:
      "从公开发现开始，检查 manifest，创建有范围的 Project Key，然后通过 REST 或 MCP 调用已批准的技能。",
    primary: "开始 Quickstart",
    secondary: "浏览技能",
    toc: "文档目录",
    sections: [
      ["quickstart", "快速开始"],
      ["rest", "REST API"],
      ["mcp", "MCP 设置"],
      ["manifest", "Manifest Schema"],
      ["project-keys", "Project Key"],
      ["webhooks", "Webhooks"],
      ["examples", "示例"],
      ["errors", "错误处理"],
    ],
    quickstartSteps: [
      ["搜索技能", "在公开目录中查找可复用能力。"],
      ["检查 manifest", "查看 schema、权限、运行时、发布者和审核状态。"],
      ["创建 Project Key", "在登录后的项目里生成有范围的密钥。"],
      ["通过 REST 调用", "用类型化输入调用已批准技能。"],
      ["配置 MCP", "把 SkillHub 接入兼容 MCP 的工作台。"],
      ["查看日志", "追踪用量、策略判断和运行结果。"],
    ],
    note: "示例配置。可用性取决于当前工作区访问权限。",
    copyLabels: {
      rest: "REST 请求",
      mcp: "MCP 配置",
      manifest: "Manifest",
      webhook: "Webhook 载荷",
      example: "示例载荷",
    },
  },
} as const;

const sectionIcons = [PackageSearch, Network, Terminal, Braces, KeyRound, Webhook, Code2, ShieldCheck] as const;

export default async function DocsPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="docs" locale={locale}>
      <section className="section pt-8 pb-14 md:pt-12 md:pb-16" aria-labelledby="docs-heading">
        <div className="section-inner hero-glow grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          <aside className="card p-4 lg:sticky lg:top-24" aria-label={labels.toc}>
            <div className="eyebrow">
              <BookOpen size={16} aria-hidden="true" />
              <span>{labels.toc}</span>
            </div>
            <nav className="mt-4 flex flex-col gap-1">
              {labels.sections.map(([id, title]) => (
                <a className="filter-button justify-start" href={`#${id}`} key={id}>
                  {title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-8">
            <Reveal>
              <header className="flex flex-col gap-5">
                <div className="eyebrow">
                  <BookOpen size={16} aria-hidden="true" />
                  <span>{labels.eyebrow}</span>
                </div>
                <div className="flex flex-col gap-4 max-w-[780px]">
                  <h1 id="docs-heading" className="heading-xl">{labels.title}</h1>
                  <p className="body-text text-[#999]">{labels.body}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a className="btn-primary--large" href="#quickstart">
                    <Terminal size={18} aria-hidden="true" />
                    <span>{labels.primary}</span>
                  </a>
                  <a className="btn-secondary--large" href={localizedHref("/marketplace", locale)}>
                    <PackageSearch size={18} aria-hidden="true" />
                    <span>{labels.secondary}</span>
                  </a>
                </div>
              </header>
            </Reveal>

            <DocSection icon={PackageSearch} id="quickstart" title={labels.sections[0][1]}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labels.quickstartSteps.map(([title, body], index) => (
                  <article className="card--compact p-4 flex flex-col gap-2" key={title}>
                    <span className="text-xs text-[#525252]">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="text-sm text-white">{title}</strong>
                    <p className="body-text-sm text-[#999]">{body}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection icon={Network} id="rest" title={labels.sections[1][1]}>
              <CodeBlock label={labels.copyLabels.rest} locale={locale} value={`curl -X POST https://api.useskillhub.com/v1/skills/browser-research/invoke \\
  -H "Authorization: Bearer YOUR_PROJECT_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "Find recent references about AI agent skill security",
    "depth": "standard"
  }'`} />
            </DocSection>

            <DocSection icon={Terminal} id="mcp" title={labels.sections[2][1]}>
              <p className="body-text-sm text-[#999] mb-4">{labels.note}</p>
              <CodeBlock label={labels.copyLabels.mcp} locale={locale} value={`{
  "mcpServers": {
    "skillhub": {
      "command": "npx",
      "args": ["@skillhub/mcp-server"],
      "env": {
        "SKILLHUB_PROJECT_KEY": "YOUR_PROJECT_KEY"
      }
    }
  }
}`} />
            </DocSection>

            <DocSection icon={Braces} id="manifest" title={labels.sections[3][1]}>
              <CodeBlock label={labels.copyLabels.manifest} locale={locale} value={`{
  "name": "browser-research",
  "displayName": "Browser Research",
  "version": "1.0.0",
  "runtime": { "type": "http", "entrypoint": "https://api.example.com/invoke" },
  "permissions": {
    "network": true,
    "browser": true,
    "filesystem": "none",
    "secrets": []
  }
}`} />
            </DocSection>

            <DocSection icon={KeyRound} id="project-keys" title={labels.sections[4][1]}>
              <div className="card--compact p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Project", "Growth Agent"],
                  ["Key name", "production-mcp"],
                  ["Scope", "browser-research, docs-qa"],
                  ["Rate limit", "60 requests / min"],
                  ["Last used", "2 minutes ago"],
                  ["Status", "Active"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="block text-xs text-[#666]">{label}</span>
                    <strong className="text-sm text-white">{value}</strong>
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection icon={Webhook} id="webhooks" title={labels.sections[5][1]}>
              <CodeBlock label={labels.copyLabels.webhook} locale={locale} value={`POST https://your-app.example.com/skillhub/webhooks
{
  "type": "skill.review.updated",
  "skill": "browser-research",
  "status": "verified"
}`} />
            </DocSection>

            <DocSection icon={Code2} id="examples" title={labels.sections[6][1]}>
              <CodeBlock label={labels.copyLabels.example} locale={locale} value={`{
  "use_case": "Dataset Summarizer",
  "input": {
    "rows": [
      { "country": "US", "sales": 1200, "refunds": 32 },
      { "country": "UK", "sales": 860, "refunds": 18 }
    ]
  },
  "required_permissions": ["uploaded_data:read"],
  "safety_notes": ["Avoid sending secrets or customer identifiers in sample rows."]
}`} />
            </DocSection>

            <DocSection icon={ShieldCheck} id="errors" title={labels.sections[7][1]}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["401", "Missing or invalid Project Key"],
                  ["403", "Skill is not approved for this project"],
                  ["404", "Skill or version was not found"],
                  ["422", "Input does not match the manifest schema"],
                  ["429", "Rate limit exceeded"],
                  ["500", "Runtime provider failed"],
                ].map(([code, body]) => (
                  <article className="card--compact p-4" key={code}>
                    <strong className="text-sm text-white">{code}</strong>
                    <p className="body-text-sm text-[#999] mt-1">{body}</p>
                  </article>
                ))}
              </div>
            </DocSection>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function DocSection({
  children,
  icon: Icon,
  id,
  title,
}: {
  children: ReactNode;
  icon: (typeof sectionIcons)[number];
  id: string;
  title: string;
}) {
  return (
    <article className="card p-6 scroll-mt-24" id={id}>
      <div className="eyebrow">
        <Icon size={16} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function CodeBlock({
  label,
  locale,
  value,
}: {
  label: string;
  locale: Locale;
  value: string;
}) {
  return <DocsCodeBlock label={label} locale={locale} value={value} />;
}
