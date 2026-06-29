"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileJson,
  KeyRound,
  Network,
  PackageCheck,
  SearchCode,
  ShieldCheck,
  Terminal,
  WalletCards,
} from "lucide-react";
import type { DocsCopy } from "@/app/docs/page";
import styles from "./docs-page-client.module.css";
import registryStyles from "./registry-v2.module.css";
import { localizedHref, type Locale } from "@/lib/i18n";

type DocsPageClientProps = {
  apiUrl: string;
  copy: DocsCopy;
  locale: Locale;
};

type DocsSectionId =
  | "overview"
  | "adoption"
  | "runtime"
  | "quickstart"
  | "vocabulary"
  | "troubleshooting";

type DocsSection = {
  id: DocsSectionId;
  label: string;
  summary: string;
  title: string;
};

type ScreenshotKind = "marketplace" | "registry" | "publish";

type ScreenshotCopy = {
  caption: string;
  kind: ScreenshotKind;
  title: string;
};

type PreviewData = {
  body: string;
  cards: readonly {
    body: string;
    tags: readonly string[];
    title: string;
  }[];
  contractPath: string;
  contractTitle: string;
  endpoints: readonly string[];
  eyebrow: string;
  path: string;
  rows: readonly (readonly [string, string])[];
  search: string;
  steps: readonly {
    body: string;
    title: string;
  }[];
  title: string;
};

const previewCopy: Record<Locale, Record<ScreenshotKind, PreviewData>> = {
  en: {
    marketplace: {
      body: "Compare public Skills before adoption. Look at task fit, publisher trust, runtime type, and review state.",
      cards: [
        {
          body: "Verified public contract with examples and MCP metadata.",
          tags: ["verified", "HTTP", "research"],
          title: "browser-research",
        },
        {
          body: "Checks CRM records before enrichment workflows run.",
          tags: ["verified", "REST", "sales"],
          title: "crm-enrichment",
        },
        {
          body: "Routes support tickets with project policy attached.",
          tags: ["reviewed", "MCP", "support"],
          title: "support-triage",
        },
      ],
      contractPath: "",
      contractTitle: "",
      endpoints: [],
      eyebrow: "Marketplace",
      path: "/marketplace",
      rows: [],
      search: "Search task, publisher, runtime, or risk profile",
      steps: [],
      title: "Find the right Skill first",
    },
    registry: {
      body: "Read the machine contract before any runtime key is created.",
      cards: [],
      contractPath: "skillhub.json",
      contractTitle: "browser-research · contract",
      endpoints: [
        "GET /v1/skills/:slug",
        "GET /mcp",
        "POST /v1/runtime/invoke",
      ],
      eyebrow: "Skill API",
      path: "/registry",
      rows: [
        ["Schema", "input/output"],
        ["Permission", "network:read"],
        ["Runtime", "REST / MCP"],
        ["Review", "verified"],
      ],
      search: "",
      steps: [],
      title: "Inspect the contract boundary",
    },
    publish: {
      body: "Publishing is a review workflow, not a blind upload form.",
      cards: [],
      contractPath: "",
      contractTitle: "",
      endpoints: [],
      eyebrow: "Publish",
      path: "/publish",
      rows: [],
      search: "",
      steps: [
        {
          body: "Prepare skillhub.json, examples, permissions, and support metadata.",
          title: "Draft package",
        },
        {
          body: "Submit one exact version with runtime evidence and review notes.",
          title: "Submit version",
        },
        {
          body: "Respond to reviewer findings before public adoption.",
          title: "Repair and verify",
        },
      ],
      title: "Move packages through review",
    },
  },
  zh: {
    marketplace: {
      body: "采用前先比较公开 Skill，确认任务匹配、发布者可信度、运行类型和审核状态。",
      cards: [
        {
          body: "带示例和 MCP metadata 的已验证公开合约。",
          tags: ["已验证", "HTTP", "研究"],
          title: "browser-research",
        },
        {
          body: "在 enrichment 流程运行前检查 CRM 记录。",
          tags: ["已验证", "REST", "销售"],
          title: "crm-enrichment",
        },
        {
          body: "在项目策略下分流支持工单。",
          tags: ["已审核", "MCP", "支持"],
          title: "support-triage",
        },
      ],
      contractPath: "",
      contractTitle: "",
      endpoints: [],
      eyebrow: "Marketplace",
      path: "/marketplace",
      rows: [],
      search: "搜索任务、发布者、运行时或风险画像",
      steps: [],
      title: "先找到合适的 Skill",
    },
    registry: {
      body: "创建任何运行 key 之前，先读取机器可读合约。",
      cards: [],
      contractPath: "skillhub.json",
      contractTitle: "browser-research · 合约",
      endpoints: [
        "GET /v1/skills/:slug",
        "GET /mcp",
        "POST /v1/runtime/invoke",
      ],
      eyebrow: "技能 API",
      path: "/registry",
      rows: [
        ["Schema", "输入/输出"],
        ["权限", "network:read"],
        ["运行时", "REST / MCP"],
        ["审核", "已验证"],
      ],
      search: "",
      steps: [],
      title: "检查合约边界",
    },
    publish: {
      body: "发布是审核流程，不是盲目上传表单。",
      cards: [],
      contractPath: "",
      contractTitle: "",
      endpoints: [],
      eyebrow: "发布技能",
      path: "/publish",
      rows: [],
      search: "",
      steps: [
        {
          body: "准备 skillhub.json、示例、权限和支持信息。",
          title: "准备草稿",
        },
        {
          body: "提交一个精确版本，并附上调用记录和审核说明。",
          title: "提交版本",
        },
        { body: "根据审核意见修正后，再进入公开采用。", title: "修正并验证" },
      ],
      title: "让技能包进入审核路径",
    },
  },
};

const docsNavLabels = {
  en: {
    sideNav: "Docs navigation",
  },
  zh: {
    sideNav: "文档导航",
  },
} as const;

const tutorialCopy = {
  en: {
    overview: {
      beforeTitle: "Use this page as an operating sequence.",
      beforeBody:
        "Start with the public listing, move to the contract, then create project state only when the Skill is worth adopting. That order keeps agents, developers, and operators aligned.",
      pathLabel: "Recommended path",
      outcomes: [
        "You know which surface answers the current question.",
        "You can explain what is public inspection and what is project-gated runtime.",
        "You have a stable next step before copying any token or key.",
      ],
    },
    screenshots: {
      marketplace: {
        kind: "marketplace",
        caption:
          "Use Marketplace for human discovery: search, compare publisher trust, and open the public detail before any install.",
        title: "Discovery starts in Marketplace",
      },
      registry: {
        kind: "registry",
        caption:
          "Use Registry when you need the machine-readable contract, endpoint list, permissions, and review state.",
        title: "Contracts live in Registry",
      },
      publish: {
        kind: "publish",
        caption:
          "Use Publish when the issue is packaging, review evidence, exact versions, or publisher readiness.",
        title: "Publisher work has its own path",
      },
    },
    adoptionMeta: [
      {
        input: "A task, category, tag, or known Skill name.",
        output:
          "A short list of candidate Skills with publisher and risk signals.",
        done: "You can name the Skill slug and why it is worth inspecting.",
      },
      {
        input: "The candidate Skill slug or public detail page.",
        output:
          "Schemas, permissions, runtime type, examples, review state, and public MCP metadata.",
        done: "You can describe what the Skill can do and what it must not access.",
      },
      {
        input: "A signed-in project and a verified Skill version.",
        output: "A project install record with a pinned version.",
        done: "The project can create scoped runtime credentials for that installed version.",
      },
      {
        input: "An installed Skill, policy, budget, and Project Key.",
        output: "A REST or MCP runtime call with logs and governance attached.",
        done: "The agent can invoke the Skill without using a human session token.",
      },
    ],
    labels: {
      input: "Input",
      output: "Output",
      done: "Done when",
      beforeYouRun: "Before you run the commands",
      afterSuccess: "After a successful call",
      seenIn: "Seen in",
      avoid: "Do not confuse it with",
      checkOrder: "Check in this order",
    },
    quickstart: {
      before: [
        "Pick a real Skill slug from Marketplace or Registry before copying the sample commands.",
        "Use a signed-in session token only for project setup, not for agent runtime.",
        "Replace PROJECT_SLUG and PROJECT_KEY with values created inside the target project.",
      ],
      after: [
        "Store the Project Key in the agent runtime environment, never in public page copy.",
        "Record the installed version so the agent does not drift to an unreviewed release.",
        "Use logs and rate limits to confirm the invocation is attached to the right project.",
      ],
    },
    runtimeNotes: [
      "Public endpoints are safe to link from docs because they only expose inspection data.",
      "Workspace endpoints change project state and should always be tied to a signed-in member.",
      "Runtime endpoints belong to server-side agents, MCP clients, or backend workflows with scoped Project Keys.",
    ],
    vocabularyMeta: [
      [
        "Marketplace listings, Registry rows, publisher submissions.",
        "A prompt template or a one-off script.",
      ],
      ["Registry, docs, agent contract checks.", "The marketplace search UI."],
      [
        "skillhub.json, Registry contract views, publisher preflight.",
        "Marketing copy or an unversioned README.",
      ],
      [
        "Workspace install, Project Keys, policy, runtime logs.",
        "A public organization profile.",
      ],
      [
        "Runtime invocation, MCP clients, backend agents.",
        "A human login session token.",
      ],
      [
        "REST invoke, MCP tool calls, logs, policy enforcement.",
        "Public MCP metadata.",
      ],
    ],
    troubleshootingMeta: [
      [
        "Confirm the request uses a Project Key.",
        "Check the key has runtime scope.",
        "Confirm the Skill is installed in that project.",
      ],
      [
        "Open public metadata to verify the tool exists.",
        "Check project install and version pin.",
        "Run through the governed runtime endpoint.",
      ],
      [
        "Confirm the Skill review state is verified.",
        "Check membership on the target project.",
        "Reinstall the pinned version if permissions changed.",
      ],
      [
        "Check the submitted version is exact.",
        "Review manifest, examples, permissions, and support fields.",
        "Add runtime evidence before resubmitting.",
      ],
      [
        "Check the deployed git hash.",
        "Rebuild the web app.",
        "Restart the process behind the domain and clear stale caches.",
      ],
    ],
  },
  zh: {
    overview: {
      beforeTitle: "把这页当成一条操作顺序。",
      beforeBody:
        "先看公开列表，再读合约；只有确认值得采用后，才进入项目安装和运行。这个顺序能让 Agent、开发者和运营看到同一条边界。",
      pathLabel: "推荐路径",
      outcomes: [
        "你知道当前问题应该去哪个页面解决。",
        "你能说清公开检查和项目内运行的区别。",
        "在复制任何 token 或 key 前，已经有明确下一步。",
      ],
    },
    screenshots: {
      marketplace: {
        kind: "marketplace",
        caption:
          "Marketplace 用来给人做发现：搜索任务、比较发布者可信度，并在安装前打开公开详情。",
        title: "发现从 Marketplace 开始",
      },
      registry: {
        kind: "registry",
        caption:
          "Registry 用来读取机器可读合约、endpoint、权限、运行时类型和审核状态。",
        title: "合约在 Registry 中检查",
      },
      publish: {
        kind: "publish",
        caption:
          "Publish 负责处理打包、审核证据、精确版本和发布者准备度，不和运行调试混在一起。",
        title: "发布者流程单独处理",
      },
    },
    adoptionMeta: [
      {
        input: "一个任务、分类、标签，或已知的 Skill 名称。",
        output: "一组候选 Skill，以及发布者、风险、可用性等公开信号。",
        done: "你能说出 Skill slug，并说明为什么值得继续检查。",
      },
      {
        input: "候选 Skill slug 或公开详情页。",
        output: "schema、权限、运行时类型、示例、审核状态和公开 MCP metadata。",
        done: "你能描述 Skill 能做什么，以及不应该访问什么。",
      },
      {
        input: "已登录项目，以及一个已验证的 Skill 版本。",
        output: "项目内安装记录，并固定具体版本。",
        done: "项目可以为该版本创建作用域运行凭证。",
      },
      {
        input: "已安装 Skill、策略、预算和 Project Key。",
        output: "带日志和权限边界的 REST 或 MCP 调用。",
        done: "Agent 可以运行 Skill，且不需要使用人的登录 session token。",
      },
    ],
    labels: {
      input: "输入",
      output: "输出",
      done: "完成标准",
      beforeYouRun: "运行命令前",
      afterSuccess: "调用成功后",
      seenIn: "会出现在哪里",
      avoid: "不要混淆为",
      checkOrder: "按这个顺序检查",
    },
    quickstart: {
      before: [
        "先从 Marketplace 或 Registry 选择真实 Skill slug，再复制示例命令。",
        "登录 session token 只用于项目设置，不用于 Agent 运行。",
        "把 PROJECT_SLUG 和 PROJECT_KEY 替换成目标项目内创建的值。",
      ],
      after: [
        "把 Project Key 放进 Agent 运行环境，不要写进公开页面文案。",
        "记录已安装版本，避免 Agent 漂移到未审核版本。",
        "用日志和限流确认调用绑定到了正确项目。",
      ],
    },
    runtimeNotes: [
      "公开 endpoint 可以放进文档，因为它们只暴露检查数据。",
      "工作台 endpoint 会改变项目状态，必须绑定已登录成员。",
      "运行 endpoint 属于服务端 Agent、MCP 客户端或后端流程，并使用作用域 Project Key。",
    ],
    vocabularyMeta: [
      [
        "Marketplace 列表、Registry 行、发布者提交。",
        "prompt 模板或一次性脚本。",
      ],
      ["Registry、文档、Agent 合约检查。", "Marketplace 搜索界面。"],
      [
        "skillhub.json、Registry 合约视图、发布预检。",
        "营销文案或未版本化 README。",
      ],
      ["工作台安装、Project Key、策略、运行日志。", "公开组织主页。"],
      ["运行调用、MCP 客户端、后端 Agent。", "人的登录 session token。"],
      ["REST invoke、MCP tool call、日志、策略执行。", "公开 MCP metadata。"],
    ],
    troubleshootingMeta: [
      [
        "确认请求使用的是 Project Key。",
        "检查 key 是否有 runtime 作用域。",
        "确认 Skill 已安装到该项目。",
      ],
      [
        "先打开公开 metadata，确认工具存在。",
        "检查项目安装和版本固定。",
        "通过受治理运行 endpoint 调用。",
      ],
      [
        "确认 Skill 审核状态是 verified。",
        "检查当前用户是否属于目标项目。",
        "如果权限变更，重新安装固定版本。",
      ],
      [
        "检查提交的是精确版本。",
        "补齐 manifest、示例、权限和支持字段。",
        "补充调用记录后再提交审核。",
      ],
      [
        "确认部署环境的 git hash。",
        "重新构建 web app。",
        "重启域名背后的进程并清理旧缓存。",
      ],
    ],
  },
} as const;

const sectionHashMap: Record<string, DocsSectionId> = {
  "#api": "runtime",
  "#docs-adoption": "adoption",
  "#docs-map": "overview",
  "#docs-troubleshooting": "troubleshooting",
  "#docs-vocabulary": "vocabulary",
  "#quickstart": "quickstart",
};

export function DocsPageClient({ apiUrl, copy, locale }: DocsPageClientProps) {
  const navLabels = docsNavLabels[locale];
  const articleRef = useRef<HTMLElement | null>(null);
  const sections = useMemo(() => getDocsSections(copy), [copy]);
  const [activeSection, setActiveSection] = useState<DocsSectionId>("overview");

  useEffect(() => {
    const hash = window.location.hash;
    const nextSection = sectionHashMap[hash] ?? sectionFromHash(hash);

    if (nextSection) {
      setActiveSection(nextSection);
    }
  }, []);

  function chooseSection(sectionId: DocsSectionId) {
    setActiveSection(sectionId);
    window.history.replaceState(null, "", "#docs-" + sectionId);
    window.requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  }

  return (
    <div
      className={`registry-v2 docs-v2 docs-page ${registryStyles.registryStyles} ${styles.pageStyles}`}
    >
      <div className="docs-page-layout docs-page-layout--interactive docs-page-layout--two-column">
        <aside className="docs-page-sidebar" aria-label={navLabels.sideNav}>
          <nav>
            <div className="docs-page-sidebar__home" aria-hidden="true">
              <BookOpen size={16} />
              <span>{copy.heroEyebrow}</span>
            </div>
            <div className="docs-page-section-switcher">
              {sections.map((section) => (
                <button
                  aria-current={
                    activeSection === section.id ? "page" : undefined
                  }
                  className={
                    activeSection === section.id
                      ? "docs-page-section-tab docs-page-section-tab--active"
                      : "docs-page-section-tab"
                  }
                  key={section.id}
                  onClick={() => chooseSection(section.id)}
                  type="button"
                >
                  <span>{section.label}</span>
                  <small>{section.summary}</small>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <article
          className="docs-page-article docs-page-article--interactive"
          ref={articleRef}
          aria-labelledby={activeSection + "-heading"}
        >
          {activeSection === "overview" ? (
            <OverviewSection
              copy={copy}
              locale={locale}
              onSelectSection={chooseSection}
            />
          ) : null}
          {activeSection === "adoption" ? (
            <AdoptionSection copy={copy} locale={locale} />
          ) : null}
          {activeSection === "runtime" ? (
            <RuntimeSection copy={copy} locale={locale} />
          ) : null}
          {activeSection === "quickstart" ? (
            <QuickstartSection apiUrl={apiUrl} copy={copy} locale={locale} />
          ) : null}
          {activeSection === "vocabulary" ? (
            <VocabularySection copy={copy} locale={locale} />
          ) : null}
          {activeSection === "troubleshooting" ? (
            <TroubleshootingSection copy={copy} locale={locale} />
          ) : null}
        </article>
      </div>
    </div>
  );
}

function OverviewSection({
  copy,
  locale,
  onSelectSection,
}: {
  copy: DocsCopy;
  locale: Locale;
  onSelectSection: (sectionId: DocsSectionId) => void;
}) {
  const tutorial = tutorialCopy[locale];

  return (
    <>
      <section
        className="docs-page-section docs-page-section--first docs-page-intro"
        id="overview-start"
        aria-labelledby="overview-heading"
      >
        <span className="registry-v2-eyebrow">
          <span aria-hidden="true" />
          {copy.heroEyebrow}
        </span>
        <h1 id="overview-heading">
          {copy.heroTitle.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p>{copy.heroBody}</p>
        <div className="registry-v2-actions docs-page-actions">
          <a
            className="registry-v2-button registry-v2-button--primary"
            href={localizedHref("/marketplace", locale)}
          >
            <SearchCode size={16} aria-hidden="true" />
            <span>{copy.actions.marketplace}</span>
          </a>
          <button
            className="registry-v2-button"
            onClick={() => onSelectSection("quickstart")}
            type="button"
          >
            <Terminal size={16} aria-hidden="true" />
            <span>{copy.actions.docs}</span>
          </button>
          <a
            className="registry-v2-button registry-v2-button--quiet"
            href={localizedHref("/publish", locale)}
          >
            <FileJson size={16} aria-hidden="true" />
            <span>{copy.actions.publish}</span>
          </a>
        </div>
        <details
          className="docs-page-note-strip docs-page-note-strip--compact"
          aria-label={copy.console.signalTitle}
        >
          <summary>{copy.console.signalTitle}</summary>
          {copy.heroProof.map(([title, body]) => (
            <div key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
            </div>
          ))}
        </details>
      </section>

      <section
        className="docs-page-section"
        id="overview-path"
        aria-labelledby="overview-path-heading"
      >
        <SectionHeading
          body={tutorial.overview.beforeBody}
          eyebrow={tutorial.overview.pathLabel}
          id="overview-path-heading"
          title={tutorial.overview.beforeTitle}
        />
        <div className="docs-page-doc-list docs-page-tutorial-list">
          {copy.map.cards.map((card, index) => {
            const Icon =
              [SearchCode, FileJson, KeyRound, PackageCheck][index] ?? BookOpen;

            return (
              <article
                className="docs-page-doc-row docs-page-operation-step"
                key={card.title}
              >
                <span className="registry-v2-card__icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <ul className="docs-v2-check-list">
                    {card.items.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={14} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  className="docs-v2-inline-link"
                  href={localizedHref(card.href, locale)}
                >
                  <span>{card.action}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
        <ul className="docs-page-check-list docs-page-check-list--compact">
          {tutorial.overview.outcomes.map((item) => (
            <li key={item}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <ScreenshotFrame
          image={tutorial.screenshots.marketplace}
          locale={locale}
        />
      </section>
    </>
  );
}

function AdoptionSection({ copy, locale }: { copy: DocsCopy; locale: Locale }) {
  const tutorial = tutorialCopy[locale];

  return (
    <>
      <section
        className="docs-page-section docs-page-section--first"
        id="adoption-start"
        aria-labelledby="adoption-heading"
      >
        <SectionHeading
          body={copy.adoption.body}
          eyebrow={copy.adoption.eyebrow}
          id="adoption-heading"
          title={copy.adoption.title}
        />
        <div className="docs-page-step-list docs-page-tutorial-list">
          {copy.adoption.steps.map(([title, body], index) => {
            const meta = tutorial.adoptionMeta[index];

            return (
              <article
                className="docs-page-step docs-page-operation-step"
                key={title}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <dl className="docs-page-step-meta">
                    <div>
                      <dt>{tutorial.labels.input}</dt>
                      <dd>{meta.input}</dd>
                    </div>
                    <div>
                      <dt>{tutorial.labels.output}</dt>
                      <dd>{meta.output}</dd>
                    </div>
                    <div>
                      <dt>{tutorial.labels.done}</dt>
                      <dd>{meta.done}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section
        className="docs-page-section"
        id="adoption-boundary"
        aria-labelledby="adoption-boundary-heading"
      >
        <h2 id="adoption-boundary-heading">{copy.guardrails.title}</h2>
        <p>{copy.guardrails.body}</p>
        <ul className="docs-page-check-list">
          {copy.guardrails.items.slice(0, 4).map((item) => (
            <li key={item}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function RuntimeSection({ copy, locale }: { copy: DocsCopy; locale: Locale }) {
  const tutorial = tutorialCopy[locale];

  return (
    <>
      <section
        className="docs-page-section docs-page-section--first"
        id="runtime-boundary"
        aria-labelledby="runtime-heading"
      >
        <SectionHeading
          body={copy.api.body}
          eyebrow={copy.api.eyebrow}
          id="runtime-heading"
          title={copy.api.title}
        />
        <div className="docs-page-reference-list docs-page-tutorial-list">
          {copy.api.groups.map((group) => (
            <article
              className="docs-page-reference-row docs-page-operation-step"
              key={group.title}
            >
              <div>
                <Network size={17} aria-hidden="true" />
                <h3>{group.title}</h3>
                <p>{group.body}</p>
              </div>
              <div className="docs-v2-endpoint-list">
                {group.endpoints.map((endpoint) => (
                  <code key={endpoint}>{endpoint}</code>
                ))}
              </div>
            </article>
          ))}
        </div>
        <details className="docs-page-note-strip docs-page-note-strip--stacked docs-page-note-strip--compact">
          <summary>{copy.console.boundaryTitle}</summary>
          {tutorial.runtimeNotes.map((note) => (
            <div key={note}>
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>{note}</span>
            </div>
          ))}
        </details>
        <ScreenshotFrame
          image={tutorial.screenshots.registry}
          locale={locale}
        />
      </section>
      <section
        className="docs-page-section"
        id="runtime-public"
        aria-labelledby="runtime-public-heading"
      >
        <h2 id="runtime-public-heading">{copy.console.boundaryTitle}</h2>
        <p>{copy.console.boundaryBody}</p>
        <div className="docs-page-note docs-page-note--wide">
          <strong>{copy.console.commercialTitle}</strong>
          <p>{copy.console.commercialBody}</p>
        </div>
      </section>
    </>
  );
}

function QuickstartSection({
  apiUrl,
  copy,
  locale,
}: {
  apiUrl: string;
  copy: DocsCopy;
  locale: Locale;
}) {
  const tutorial = tutorialCopy[locale];

  return (
    <section
      className="docs-page-section docs-page-section--first"
      id="quickstart-start"
      aria-labelledby="quickstart-heading"
    >
      <div className="registry-v2-quickstart docs-v2-quickstart docs-page-quickstart-panel">
        <article className="registry-v2-card registry-v2-quickstart__copy">
          <span className="registry-v2-eyebrow">
            <span aria-hidden="true" />
            {copy.quickstart.eyebrow}
          </span>
          <h2 id="quickstart-heading">{copy.quickstart.title}</h2>
          <p>{copy.quickstart.body}</p>
          <div className="registry-v2-tags">
            {copy.quickstart.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <ChecklistBlock
            title={tutorial.labels.beforeYouRun}
            items={tutorial.quickstart.before}
          />
        </article>
        <article className="registry-v2-terminal docs-v2-terminal">
          <div className="registry-v2-terminal__head">
            <span>{copy.quickstart.terminal}</span>
            <span>{copy.quickstart.endpoints}</span>
          </div>
          <pre>
            <code>{getQuickstartSnippet(apiUrl, copy)}</code>
          </pre>
        </article>
      </div>
      <ChecklistBlock
        title={tutorial.labels.afterSuccess}
        items={tutorial.quickstart.after}
      />
    </section>
  );
}

function VocabularySection({
  copy,
  locale,
}: {
  copy: DocsCopy;
  locale: Locale;
}) {
  const tutorial = tutorialCopy[locale];

  return (
    <>
      <section
        className="docs-page-section docs-page-section--first"
        id="vocabulary-terms"
        aria-labelledby="vocabulary-heading"
      >
        <SectionHeading
          body={copy.vocabulary.body}
          eyebrow={copy.vocabulary.eyebrow}
          id="vocabulary-heading"
          title={copy.vocabulary.title}
        />
        <dl className="docs-page-definition-list docs-page-definition-list--tutorial">
          {copy.vocabulary.terms.map(([term, definition], index) => {
            const [seenIn, avoid] = tutorial.vocabularyMeta[index];

            return (
              <div key={term}>
                <dt>{term}</dt>
                <dd>
                  <p>{definition}</p>
                  <div className="docs-page-term-meta">
                    <span>
                      <strong>{tutorial.labels.seenIn}</strong>
                      {seenIn}
                    </span>
                    <span>
                      <strong>{tutorial.labels.avoid}</strong>
                      {avoid}
                    </span>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section
        className="docs-page-section"
        id="vocabulary-guardrails"
        aria-labelledby="vocabulary-guardrails-heading"
      >
        <h2 id="vocabulary-guardrails-heading">{copy.guardrails.title}</h2>
        <p>{copy.guardrails.body}</p>
        <ul className="docs-page-check-list">
          {copy.guardrails.items.map((item) => (
            <li key={item}>
              <Braces size={15} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function TroubleshootingSection({
  copy,
  locale,
}: {
  copy: DocsCopy;
  locale: Locale;
}) {
  const tutorial = tutorialCopy[locale];

  return (
    <>
      <section
        className="docs-page-section docs-page-section--first"
        id="troubleshooting-common"
        aria-labelledby="troubleshooting-heading"
      >
        <SectionHeading
          body={copy.troubleshooting.body}
          eyebrow={copy.troubleshooting.eyebrow}
          id="troubleshooting-heading"
          title={copy.troubleshooting.title}
        />
        <div className="docs-page-reference-list docs-page-tutorial-list">
          {copy.troubleshooting.items.map(([problem, fix], index) => (
            <article
              className="docs-page-reference-row docs-page-operation-step"
              key={problem}
            >
              <div>
                <ClipboardCheck size={17} aria-hidden="true" />
                <h3>{problem}</h3>
                <p>{fix}</p>
              </div>
              <ChecklistBlock
                title={tutorial.labels.checkOrder}
                items={tutorial.troubleshootingMeta[index]}
                compact
              />
            </article>
          ))}
        </div>
        <ScreenshotFrame image={tutorial.screenshots.publish} locale={locale} />
      </section>
      <footer
        className="registry-v2-closing docs-page-closing"
        id="troubleshooting-next"
      >
        <div className="registry-v2-shell">
          <h2>{copy.closing.title}</h2>
          <p>{copy.closing.body}</p>
          <div className="registry-v2-actions registry-v2-actions--center">
            <a
              className="registry-v2-button registry-v2-button--primary"
              href={localizedHref("/registry", locale)}
            >
              <Code2 size={16} aria-hidden="true" />
              <span>{copy.actions.api}</span>
            </a>
            <a
              className="registry-v2-button"
              href={localizedHref("/login", locale)}
            >
              <KeyRound size={16} aria-hidden="true" />
              <span>{copy.actions.workspace}</span>
            </a>
            <a
              className="registry-v2-button registry-v2-button--quiet"
              href={localizedHref("/pricing", locale)}
            >
              <WalletCards size={16} aria-hidden="true" />
              <span>Pro</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({
  body,
  eyebrow,
  id,
  title,
}: {
  body: string;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <div className="registry-v2-section-heading">
      <div>
        <span className="registry-v2-eyebrow">
          <span aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 id={id}>{title}</h2>
      </div>
      <p>{body}</p>
    </div>
  );
}

function ChecklistBlock({
  compact = false,
  items,
  title,
}: {
  compact?: boolean;
  items: readonly string[];
  title: string;
}) {
  return (
    <div
      className={
        compact
          ? "docs-page-mini-checklist docs-page-mini-checklist--compact"
          : "docs-page-mini-checklist"
      }
    >
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreenshotFrame({
  image,
  locale,
}: {
  image: ScreenshotCopy;
  locale: Locale;
}) {
  const preview = previewCopy[locale][image.kind];

  return (
    <figure
      className="docs-page-screenshot docs-page-preview"
      aria-label={image.title}
    >
      <div className="docs-page-preview-window">
        <div className="docs-page-preview-window__bar" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>{preview.path}</strong>
        </div>
        {image.kind === "marketplace" ? (
          <MarketplacePreview preview={preview} />
        ) : null}
        {image.kind === "registry" ? (
          <RegistryPreview preview={preview} />
        ) : null}
        {image.kind === "publish" ? <PublishPreview preview={preview} /> : null}
      </div>
      <figcaption>
        <strong>{image.title}</strong>
        <span>{image.caption}</span>
      </figcaption>
    </figure>
  );
}

function MarketplacePreview({ preview }: { preview: PreviewData }) {
  return (
    <div className="docs-page-preview-body docs-page-preview-body--marketplace">
      <header>
        <span>{preview.eyebrow}</span>
        <h3>{preview.title}</h3>
        <p>{preview.body}</p>
      </header>
      <div className="docs-page-preview-search">{preview.search}</div>
      <div className="docs-page-preview-grid">
        {preview.cards.map((card) => (
          <article key={card.title}>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
            <div>
              {card.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RegistryPreview({ preview }: { preview: PreviewData }) {
  return (
    <div className="docs-page-preview-body docs-page-preview-body--registry">
      <header>
        <span>{preview.eyebrow}</span>
        <h3>{preview.title}</h3>
        <p>{preview.body}</p>
      </header>
      <div className="docs-page-preview-contract">
        <div>
          <strong>{preview.contractTitle}</strong>
          <code>{preview.contractPath}</code>
        </div>
        <ul>
          {preview.rows.map((row) => (
            <li key={row[0]}>
              <span>{row[0]}</span>
              <strong>{row[1]}</strong>
            </li>
          ))}
        </ul>
      </div>
      <div className="docs-page-preview-endpoints">
        {preview.endpoints.map((endpoint) => (
          <code key={endpoint}>{endpoint}</code>
        ))}
      </div>
    </div>
  );
}

function PublishPreview({ preview }: { preview: PreviewData }) {
  return (
    <div className="docs-page-preview-body docs-page-preview-body--publish">
      <header>
        <span>{preview.eyebrow}</span>
        <h3>{preview.title}</h3>
        <p>{preview.body}</p>
      </header>
      <ol className="docs-page-preview-flow">
        {preview.steps.map((step, index) => (
          <li key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function getDocsSections(copy: DocsCopy): DocsSection[] {
  return [
    {
      id: "overview",
      label: copy.map.eyebrow,
      summary: copy.console.signalTitle,
      title: copy.map.title,
    },
    {
      id: "adoption",
      label: copy.adoption.eyebrow,
      summary: copy.console.meterInstall,
      title: copy.adoption.title,
    },
    {
      id: "runtime",
      label: copy.api.eyebrow,
      summary: copy.console.meterRuntime,
      title: copy.api.title,
    },
    {
      id: "quickstart",
      label: copy.quickstart.eyebrow,
      summary: copy.quickstart.endpoints,
      title: copy.quickstart.title,
    },
    {
      id: "vocabulary",
      label: copy.vocabulary.eyebrow,
      summary: copy.console.meterManifest,
      title: copy.vocabulary.title,
    },
    {
      id: "troubleshooting",
      label: copy.troubleshooting.eyebrow,
      summary: copy.actions.workspace,
      title: copy.troubleshooting.title,
    },
  ];
}

function sectionFromHash(hash: string): DocsSectionId | null {
  if (!hash) {
    return null;
  }

  if (hash.includes("adoption")) return "adoption";
  if (hash.includes("api") || hash.includes("runtime")) return "runtime";
  if (hash.includes("quickstart")) return "quickstart";
  if (hash.includes("vocabulary")) return "vocabulary";
  if (hash.includes("troubleshooting")) return "troubleshooting";
  if (hash.includes("overview") || hash.includes("docs-map")) return "overview";

  return null;
}

function getQuickstartSnippet(apiUrl: string, copy: DocsCopy) {
  return [
    "# Search public Skills",
    'curl "' + apiUrl + '/v1/skills/search?tag=research"',
    "",
    "# Inspect the public Skill contract",
    'curl "' + apiUrl + '/v1/skills/browser-research"',
    "",
    "# Read public MCP metadata. This is inspection, not anonymous runtime.",
    'curl "' + apiUrl + '/mcp"',
    "",
    "# " + copy.quickstart.comment,
    "# " + copy.quickstart.flow,
    "",
    'curl -X POST "' +
      apiUrl +
      '/v1/projects/$PROJECT_SLUG/installed-skills" \\\\',
    '  -H "Authorization: Bearer $SESSION_TOKEN" \\\\',
    '  -H "Content-Type: application/json" \\\\',
    '  -d \'{"skillSlug":"browser-research","version":"1.4.2"}\'',
    "",
    'curl -X POST "' + apiUrl + '/v1/projects/$PROJECT_SLUG/api-keys" \\\\',
    '  -H "Authorization: Bearer $SESSION_TOKEN" \\\\',
    '  -H "Content-Type: application/json" \\\\',
    '  -d \'{"name":"agent-runtime","scopes":["runtime:invoke"]}\'',
    "",
    'curl -X POST "' + apiUrl + '/v1/runtime/invoke" \\\\',
    '  -H "Authorization: Bearer $PROJECT_KEY" \\\\',
    '  -H "Content-Type: application/json" \\\\',
    '  -d \'{"skill":"browser-research","input":{"query":"cross-border SEO gap"}}\'',
  ].join("\n");
}
