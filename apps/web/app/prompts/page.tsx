import type { Metadata } from "next";
import {
  BrainCircuit,
  CheckCircle2,
  FileText,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { AgentPromptAssistant } from "@/components/agent-prompt-assistant";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import { getPublicAgentModels } from "@/lib/ops-data";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    actions: {
      docs: "Prompt guide",
      marketplace: "Find Skills",
    },
    cards: [
      {
        body: "Paste rough notes, goals, requirements, or source material and turn them into structured prompts.",
        title: "From notes to prompts",
      },
      {
        body: "Use only active models configured by administrators, with generation history tied to signed-in users.",
        title: "Configured models only",
      },
      {
        body: "Copy the result into your AI tool, then keep SkillHub Skills for real callable runtime capabilities.",
        title: "Clear boundary",
      },
    ],
    eyebrow: "Prompt workspace",
    helpTitle: "When to use this page",
    helpItems: [
      "Draft prompts for marketing, coding, support, research, or operations.",
      "Turn scattered requirements into reusable prompt options.",
      "Use Marketplace and Skill API pages when you need callable Skills, runtime logs, MCP, or Project Keys.",
    ],
    title: "Turn rough input into production-ready prompts.",
    body: "This page is for prompt generation. It does not replace Skill runtime, MCP integration, or project API keys.",
  },
  zh: {
    actions: {
      docs: "提示词指南",
      marketplace: "查找技能",
    },
    cards: [
      {
        body: "粘贴粗略想法、目标、需求或素材，整理成结构清晰、可复制使用的提示词。",
        title: "从素材到提示词",
      },
      {
        body: "只使用后台管理员启用的模型，生成记录会绑定到已登录用户，便于审计。",
        title: "只使用已配置模型",
      },
      {
        body: "生成结果用于复制到 AI 工具；真正可调用的运行能力仍然通过 Skill、项目和网关完成。",
        title: "边界清楚",
      },
    ],
    eyebrow: "提示词工作台",
    helpTitle: "什么时候使用这里",
    helpItems: [
      "为营销、代码、客服、研究、运营等场景起草提示词。",
      "把零散需求整理成可复用的提示词选项。",
      "如果需要可调用 Skill、运行日志、MCP 或 Project Key，请使用市场、Skill API 或开发者工作台。",
    ],
    title: "把粗略输入变成可直接使用的提示词。",
    body: "这个页面只用于生成提示词，不替代 Skill 运行、MCP 接入或项目 API Key。",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/prompts",
    en: {
      title: "Prompt Assistant - SkillHub",
      description:
        "Generate practical AI prompt suggestions from rough content using administrator-configured models.",
    },
    zh: {
      title: "提示词助手 - SkillHub",
      description:
        "使用后台配置的模型，把粗略内容生成可直接使用的 AI 提示词建议。",
    },
  });
}

export default async function PromptsPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];
  const promptModels = await getPublicAgentModels();

  return (
    <AppShell active="prompts" locale={locale}>
      <section className="section prompt-workspace-section">
        <div className="section-inner prompt-workspace-shell">
          <Reveal>
            <header className="prompt-workspace-header">
              <div className="eyebrow">
                <MessageSquareText size={16} aria-hidden="true" />
                <span>{labels.eyebrow}</span>
              </div>
              <div className="prompt-workspace-header__main">
                <div>
                  <h1 className="heading-xl">{labels.title}</h1>
                  <p className="body-text text-[#999]">{labels.body}</p>
                </div>
                <div className="prompt-workspace-actions">
                  <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                    <SearchCheck size={16} aria-hidden="true" />
                    <span>{labels.actions.marketplace}</span>
                  </a>
                  <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                    <FileText size={16} aria-hidden="true" />
                    <span>{labels.actions.docs}</span>
                  </a>
                </div>
              </div>
            </header>
          </Reveal>

          <AgentPromptAssistant locale={locale} models={promptModels} />

          <section className="prompt-workspace-grid" aria-label={labels.helpTitle}>
            {labels.cards.map((card, index) => {
              const Icon = index === 0 ? BrainCircuit : index === 1 ? ShieldCheck : CheckCircle2;
              return (
                <article className="prompt-workspace-card" key={card.title}>
                  <Icon size={18} aria-hidden="true" />
                  <div>
                    <h2>{card.title}</h2>
                    <p>{card.body}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="prompt-workspace-help">
            <strong>{labels.helpTitle}</strong>
            <ul>
              {labels.helpItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
