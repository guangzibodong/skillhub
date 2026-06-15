import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  KeyRound,
  Network,
  PlugZap,
  RadioTower,
  Route,
  ShieldCheck,
  Sparkles,
  Terminal,
  WalletCards
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { PUBLIC_PACKAGE_STATUS, publicRestSearchCommand } from "@/lib/public-package-status";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const cardIcons = [BrainCircuit, Route, ShieldCheck] as const;
const optionIcons = [PlugZap, RadioTower, Terminal] as const;
const governanceIcons = [KeyRound, ShieldCheck, Route, WalletCards] as const;

function snippets(apiUrl: string, labels: ReturnType<typeof getDictionary>["agentsPage"]["snippets"]) {
  const normalizedApiUrl = apiUrl.replace(/\/$/, "");

  return [
    {
      body: `{
  "mcpServers": {
    "skillhub": {
      "url": "${normalizedApiUrl}/mcp",
      "headers": {
        "Authorization": "Bearer \${SKILLHUB_PROJECT_API_KEY}"
      }
    }
  }
}`,
      file: "mcp.json",
      title: labels.mcpTitle
    },
    {
      body: `curl -X POST "${normalizedApiUrl}/v1/runtime/invoke" \\
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skillSlug":"browser-research","version":"1.0.0","input":{"query":"AI agent skill security","depth":"standard"}}'`,
      file: "runtime.sh",
      title: labels.restTitle
    },
    {
      body: PUBLIC_PACKAGE_STATUS.sdkPublished
        ? `# SDK package: ${PUBLIC_PACKAGE_STATUS.sdkPackageName}`
        : `SDK preview

The TypeScript SDK exists in the monorepo but is not published as a public package yet.
Use the public REST API for discovery and inspection:

${publicRestSearchCommand(normalizedApiUrl)}`,
      file: "agent.ts",
      title: labels.sdkTitle
    }
  ];
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const runtimeSnippets = snippets(apiUrl, dictionary.agentsPage.snippets);

  return (
    <AppShell active="agents" locale={locale}>
      {/* Hero */}
      <section className="section pt-32 pb-20 text-center">
        <div className="section-inner hero-glow flex flex-col items-center gap-6">
          <Reveal>
            <div className="eyebrow">
              <BrainCircuit size={16} aria-hidden="true" />
              <span>{dictionary.agentsPage.eyebrow}</span>
            </div>
            <h1 className="heading-xl">{dictionary.agentsPage.title}</h1>
            <p className="body-text max-w-[640px] text-[#999]">{dictionary.agentsPage.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <Network size={18} aria-hidden="true" />
                <span>{dictionary.agentsPage.ctaPrimary}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/developer", locale)}>
                <Terminal size={18} aria-hidden="true" />
                <span>{dictionary.agentsPage.ctaSecondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Feature cards */}
      <section className="section py-[96px] section-divider">
        <div className="section-inner grid grid-cols-1 md:grid-cols-3 gap-6">
          {dictionary.agentsPage.cards.map((item, index) => {
            const Icon = cardIcons[index];
            return (
              <article className="card p-6 flex flex-col gap-4" key={item.title}>
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center text-[#7fee64]" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <h2 className="heading-sm">{item.title}</h2>
                <p className="body-text-sm text-[#999]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Integration layout */}
      <section className="section py-[96px] section-divider" aria-labelledby="agent-integration-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="eyebrow">
                <PlugZap size={16} aria-hidden="true" />
                <span>{dictionary.agentsPage.integrationEyebrow}</span>
              </div>
              <h2 id="agent-integration-heading" className="heading-lg">{dictionary.agentsPage.integrationTitle}</h2>
              <p className="body-text text-[#999] max-w-[560px]">{dictionary.agentsPage.integrationBody}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dictionary.agentsPage.integrationOptions.map((option, index) => {
                const Icon = optionIcons[index];

                return (
                  <article className="card card--compact p-5 flex flex-col gap-3" key={option.title}>
                    <div className="flex items-center gap-2 text-white">
                      <Icon size={17} aria-hidden="true" />
                      <strong className="heading-sm text-sm">{option.title}</strong>
                    </div>
                    <p className="body-text-sm text-[#999]">{option.description}</p>
                    <code className="pill text-xs w-fit">{option.tag}</code>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="card p-6 flex flex-col gap-3 min-w-[240px]" aria-label={dictionary.agentsPage.integrationTitle}>
            {dictionary.agentsPage.timeline.map((step, index) => (
              <div className="flex items-center gap-3 text-white" key={step}>
                <span className="text-xs text-[#525252] font-mono">{String(index + 1).padStart(2, "0")}</span>
                <strong className="body-text-sm text-white">{step}</strong>
                {index < dictionary.agentsPage.timeline.length - 1 ? <ArrowRight size={15} className="text-[#525252]" aria-hidden="true" /> : null}
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* Flow / timeline */}
      <section className="section py-[96px] section-divider">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              <span>{dictionary.agentsPage.timelineTitle}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {dictionary.agentsPage.timeline.map((step, index) => (
              <div className="flex items-center gap-3" key={step}>
                <span className="text-xs text-[#525252] font-mono">{String(index + 1).padStart(2, "0")}</span>
                <strong className="body-text-sm text-white">{step}</strong>
                {index < dictionary.agentsPage.timeline.length - 1 && <ArrowRight size={16} className="text-[#525252]" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code snippets */}
      <section className="section py-[96px] section-divider" aria-labelledby="agent-snippets-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="eyebrow">
              <Code2 size={16} aria-hidden="true" />
              <span>{dictionary.agentsPage.snippetsTitle}</span>
            </div>
            <h2 id="agent-snippets-heading" className="heading-lg">{dictionary.agentsPage.sdkTitle}</h2>
            <p className="body-text text-[#999] max-w-[560px]">{dictionary.agentsPage.sdkBody}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {runtimeSnippets.map((snippet, i) => (
              <Reveal delay={i * 80} key={snippet.title}>
                <div className="card p-0 overflow-hidden flex flex-col" aria-label={snippet.title}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)] text-xs">
                    <span className="text-[#999] font-mono">{snippet.file}</span>
                    <span className="text-[#666]">{snippet.title}</span>
                  </div>
                  <pre className="code-block p-4 text-xs overflow-x-auto flex-1">
                    <code>{snippet.body}</code>
                  </pre>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="section py-[96px] section-divider" aria-labelledby="agent-governance-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{dictionary.agentsPage.governanceEyebrow}</span>
            </div>
            <h2 id="agent-governance-heading" className="heading-lg">{dictionary.agentsPage.governanceTitle}</h2>
            <p className="body-text text-[#999]">{dictionary.agentsPage.governanceBody}</p>
            <Reveal>
              <div className="flex flex-col gap-3 mt-2">
                {dictionary.agentsPage.governanceItems.map((item, index) => {
                  const Icon = governanceIcons[index];

                  return (
                    <div className="flex items-center gap-3 text-[#999]" key={item}>
                      <Icon size={15} className="text-[#7fee64]" aria-hidden="true" />
                      <span className="body-text-sm">{item}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>

          <Reveal>
            <aside className="card p-6 flex flex-col gap-4" aria-label={dictionary.agentsPage.checklistTitle}>
              <div className="eyebrow">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{dictionary.agentsPage.checklistTitle}</span>
              </div>
              <div className="flex flex-col gap-3">
                {dictionary.agentsPage.checklist.map((item, index) => (
                  <div className="flex items-center gap-3" key={item}>
                    <span className="text-xs text-[#525252] font-mono">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="body-text-sm text-white">{item}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{locale === "zh" ? "准备好接入了吗？" : "Ready to integrate?"}</h2>
            <p className="body-text max-w-[480px] mx-auto mb-8">{locale === "zh" ? "浏览市场中的技能或阅读完整 API 文档。" : "Browse skills in the marketplace or read the full API docs."}</p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "市场" : "Marketplace"}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                <span>{locale === "zh" ? "API 文档" : "API docs"}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
