import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FileText,
  Headphones,
  Layers3,
  MonitorCheck,
  PlugZap,
  Search,
  ShieldCheck,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { GrowthContentItem, GrowthHub, GrowthHubKey } from "@/lib/growth-content";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { localizedUrl, siteName } from "@/lib/seo";

type GrowthHubPageProps = {
  hub: GrowthHub;
  hubKey: GrowthHubKey;
  items: GrowthContentItem[];
  locale: Locale;
};

type GrowthDetailPageProps = {
  item: GrowthContentItem;
  locale: Locale;
  relatedItems: GrowthContentItem[];
};

export function GrowthHubPage({ hub, hubKey, items, locale }: GrowthHubPageProps) {
  const itemNoun = locale === "zh" ? "内容" : "resources";
  const guide = hub.guide;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.title[locale],
    description: hub.intro[locale],
    url: localizedUrl(hub.path, locale),
    publisher: { "@type": "Organization", name: siteName, url: "https://useskillhub.com" },
  };

  if (hubKey === "solutions") {
    return <SolutionsHubPage hub={hub} hubKey={hubKey} items={items} jsonLd={jsonLd} locale={locale} />;
  }

  return (
    <AppShell active={hub.active} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="growth-page">
        <section className="growth-hero" aria-labelledby={`${hubKey}-heading`}>
          <div>
            <p className="eyebrow">{hub.eyebrow[locale]}</p>
            <h1 id={`${hubKey}-heading`}>{hub.title[locale]}</h1>
            <p>{hub.intro[locale]}</p>
            <div className="growth-actions">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "浏览技能市场" : "Browse marketplace"}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/docs", locale)}>
                <span>{locale === "zh" ? "阅读文档" : "Read docs"}</span>
              </a>
            </div>
          </div>
          <aside className="growth-hero-panel" aria-label={locale === "zh" ? "页面摘要" : "Page summary"}>
            <span><Layers3 size={16} aria-hidden="true" /> {items.length} {itemNoun}</span>
            <strong>{locale === "zh" ? "从业务问题开始，而不是从工具名开始。" : "Start from the business problem, not the tool name."}</strong>
            <p>{locale === "zh" ? "每个页面都会连接到技能市场、文档、发布路径和联系入口。" : "Every page connects discovery, docs, publishing paths, and contact routes."}</p>
          </aside>
        </section>

        {guide ? (
          <section className="growth-guide" aria-labelledby={`${hubKey}-guide-heading`}>
            <div className="growth-guide__heading">
              <p className="eyebrow">{guide.eyebrow[locale]}</p>
              <h2 id={`${hubKey}-guide-heading`}>{guide.title[locale]}</h2>
              <p>{guide.intro[locale]}</p>
            </div>
            <div className="growth-guide-grid">
              {guide.cards.map((card) => (
                <article className="growth-guide-card lift-card" key={card.title[locale]}>
                  <h3>{card.title[locale]}</h3>
                  <p>{card.body[locale]}</p>
                  {card.bullets ? (
                    <ul>
                      {card.bullets[locale].map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="growth-card-grid" aria-label={hub.title[locale]}>
          {items.map((item) => (
            <article className="growth-card lift-card" key={item.path}>
              <span>{item.category[locale]}</span>
              <h2>
                <a href={localizedHref(item.path, locale)}>{item.content[locale].title}</a>
              </h2>
              <p>{item.content[locale].intro}</p>
              <a className="growth-card__link" href={localizedHref(item.path, locale)}>
                {locale === "zh" ? "查看详情" : "Open guide"}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

type SolutionTrack = {
  icon: LucideIcon;
  marketplaceHref: string;
  contactHref: string;
  fit: Record<Locale, string>;
  pains: Record<Locale, string[]>;
  outcomes: Record<Locale, string[]>;
  deliverables: Record<Locale, string[]>;
  starter: Record<Locale, string>;
  pro: Record<Locale, string>;
  skills: Record<Locale, string[]>;
};

const solutionTrackConfigs: Record<string, SolutionTrack> = {
  "seo-geo": {
    icon: Search,
    marketplaceHref: "/marketplace?category=seo",
    contactHref: "/contact?intent=solution&track=seo",
    fit: {
      en: "For founders, SEO teams, content operators, and agencies that need weekly growth actions.",
      zh: "适合创始人、SEO 团队、内容运营和需要每周交付增长动作的服务商。",
    },
    pains: {
      en: ["Traffic is flat but the team does not know which pages to repair", "AI answers do not mention the brand or cite the right sources"],
      zh: ["流量没有增长，但团队不知道先修哪些页面", "AI 答案不提品牌，也没有引用正确来源"],
    },
    outcomes: {
      en: ["AI-search visibility audit", "Content brief generation", "Technical SEO repair queue"],
      zh: ["AI 搜索可见性诊断", "内容简报生成", "技术 SEO 修复队列"],
    },
    deliverables: {
      en: ["Visibility report", "Content brief", "Repair priority list"],
      zh: ["可见性诊断报告", "内容简报", "修复优先级清单"],
    },
    starter: { en: "Free: page SEO checks and basic brief generation.", zh: "免费起步：页面 SEO 检查和基础内容简报。" },
    pro: { en: "Pro: recurring GEO audits, citation gaps, and team repair workflow.", zh: "Pro 扩展：周期 GEO 审计、引用缺口和团队修复流程。" },
    skills: {
      en: ["GEO Answer Auditor", "SEO Page Auditor", "Content Brief Builder"],
      zh: ["GEO 答案曝光诊断", "SEO 页面审计", "内容简报生成器"],
    },
  },
  ecommerce: {
    icon: ShoppingBag,
    marketplaceHref: "/marketplace?category=ecommerce",
    contactHref: "/contact?intent=solution&track=ecommerce",
    fit: {
      en: "For Shopify stores, Amazon sellers, DTC teams, and agencies preparing campaign launches.",
      zh: "适合 Shopify 店铺、Amazon 卖家、DTC 团队和准备投放/上新的服务商。",
    },
    pains: {
      en: ["Product pages are live but titles, claims, and reviews are not converted into selling points", "Batch SKU launches are slow and easy to miss QA details"],
      zh: ["商品页上线了，但标题、卖点和评论没有转成成交表达", "批量 SKU 上新慢，而且容易漏掉质检细节"],
    },
    outcomes: {
      en: ["Product-page quality fixes", "Review pain-point mining", "Launch QA checklist"],
      zh: ["商品页质量修复", "评论痛点挖掘", "上架前质检清单"],
    },
    deliverables: {
      en: ["Listing QA report", "Review insight summary", "Launch checklist"],
      zh: ["Listing 质检报告", "评论洞察总结", "上架检查清单"],
    },
    starter: { en: "Free: listing quality check and title improvement.", zh: "免费起步：Listing 质量检查和标题优化。" },
    pro: { en: "Pro: batch SKU optimization, review mining, Shopify handoff, and launch QA.", zh: "Pro 扩展：批量 SKU 优化、评论挖掘、Shopify 交接和上架质检。" },
    skills: {
      en: ["Product Title Optimizer", "Shopify PDP Auditor", "Listing QA Checklist"],
      zh: ["商品标题优化器", "Shopify 商品页审计", "Listing 上架质检"],
    },
  },
  support: {
    icon: Headphones,
    marketplaceHref: "/marketplace?category=ops",
    contactHref: "/contact?intent=solution&track=support",
    fit: {
      en: "For support teams that need faster replies without losing human approval on sensitive issues.",
      zh: "适合想提升响应速度、但敏感问题仍需要人工把关的客服和运营团队。",
    },
    pains: {
      en: ["Support replies are slow because agents keep searching old articles", "Repeated tickets reveal knowledge-base gaps but nobody turns them into fixes"],
      zh: ["客服回复慢，因为每次都要翻旧文档", "重复工单暴露知识库缺口，但没人整理成修复动作"],
    },
    outcomes: {
      en: ["Ticket routing", "Grounded reply drafts", "Knowledge-base gap reports"],
      zh: ["工单分流", "有依据的回复草稿", "知识库缺口报告"],
    },
    deliverables: {
      en: ["Reply draft", "Escalation summary", "Knowledge-base gap list"],
      zh: ["回复草稿", "升级问题总结", "知识库缺口清单"],
    },
    starter: { en: "Free: summarize tickets and detect missing knowledge.", zh: "免费起步：工单总结和知识缺口识别。" },
    pro: { en: "Pro: approved knowledge replies, escalation summaries, and support QA loops.", zh: "Pro 扩展：基于已审知识的回复、升级总结和客服质检闭环。" },
    skills: {
      en: ["Support Reply Drafter", "Ticket Triage Assistant", "Knowledge Gap Reporter"],
      zh: ["客服回复起草", "工单分流助手", "知识缺口报告"],
    },
  },
  "sales-crm": {
    icon: UsersRound,
    marketplaceHref: "/marketplace?category=sales",
    contactHref: "/contact?intent=solution&track=sales",
    fit: {
      en: "For sales, customer success, and founders who need account research and cleaner CRM follow-up.",
      zh: "适合销售、客户成功和需要客户研究、CRM 跟进更清晰的创始团队。",
    },
    pains: {
      en: ["CRM notes are messy, so next steps depend on memory", "Outbound messages are generic and account research takes too long"],
      zh: ["CRM 记录混乱，下一步跟进靠记忆", "外联内容太泛，客户研究耗时太长"],
    },
    outcomes: {
      en: ["Account research", "CRM cleanup", "Call summary and next action"],
      zh: ["客户研究", "CRM 清洗", "通话总结和下一步动作"],
    },
    deliverables: {
      en: ["Account brief", "CRM cleanup notes", "Next-step recommendation"],
      zh: ["客户研究简报", "CRM 清洗备注", "下一步建议"],
    },
    starter: { en: "Free: basic lead research and meeting summary.", zh: "免费起步：基础线索研究和会议总结。" },
    pro: { en: "Pro: pipeline hygiene, outbound personalization, objection handling, and renewal risk signals.", zh: "Pro 扩展：销售管道清理、外联个性化、异议处理和续约风险识别。" },
    skills: {
      en: ["Account Researcher", "CRM Cleanup Assistant", "Sales Call Summarizer"],
      zh: ["客户研究助手", "CRM 清洗助手", "销售通话总结"],
    },
  },
  "content-ops": {
    icon: FileText,
    marketplaceHref: "/marketplace?category=content",
    contactHref: "/contact?intent=solution&track=content",
    fit: {
      en: "For content, social, and brand teams that need repeatable briefs, calendars, and review handoffs.",
      zh: "适合内容、社媒和品牌团队，把选题、日历、审稿和交付变成可复用流程。",
    },
    pains: {
      en: ["Content ideas are scattered and every campaign starts from a blank page", "Drafts move across channels without a clear review standard"],
      zh: ["内容选题分散，每次活动都从空白开始", "草稿跨渠道流转，但缺少清晰审稿标准"],
    },
    outcomes: {
      en: ["Editorial calendar", "Brief-to-draft workflow", "Brand review checklist"],
      zh: ["选题日历", "从简报到初稿的流程", "品牌审稿清单"],
    },
    deliverables: {
      en: ["Topic map", "Campaign brief", "Review checklist"],
      zh: ["选题地图", "活动简报", "审稿清单"],
    },
    starter: { en: "Free: topic clustering and first-draft outlines.", zh: "免费起步：选题聚类和初稿大纲。" },
    pro: { en: "Pro: multi-channel calendars, evidence-backed drafts, and approval handoff.", zh: "Pro 扩展：多渠道内容日历、有依据的草稿和审批交接。" },
    skills: {
      en: ["Content Calendar Builder", "Campaign Brief Builder", "Brand QA Reviewer"],
      zh: ["内容日历生成器", "活动简报生成器", "品牌质检审稿"],
    },
  },
  "data-automation": {
    icon: Database,
    marketplaceHref: "/marketplace?category=data",
    contactHref: "/contact?intent=solution&track=data",
    fit: {
      en: "For operations, finance assistants, analysts, and teams still moving work through spreadsheets.",
      zh: "适合运营、财务助理、分析师，以及仍然依赖表格流转工作的团队。",
    },
    pains: {
      en: ["CSV exports and reports need manual cleanup before anyone can trust them", "Metric changes are visible but the reason and next action are unclear"],
      zh: ["CSV 导出和报表每次都要人工清洗，才敢使用", "指标变化看得见，但原因和下一步动作不清楚"],
    },
    outcomes: {
      en: ["Messy sheet cleanup", "Data dictionary handoff", "Report narrative generation"],
      zh: ["混乱表格清理", "数据字典交接", "报表解读生成"],
    },
    deliverables: {
      en: ["Cleaned table", "Data dictionary", "Operator summary"],
      zh: ["清洗后的表格", "数据字典", "运营解读总结"],
    },
    starter: { en: "Free: CSV cleanup and duplicate checks.", zh: "免费起步：CSV 清洗和重复项检查。" },
    pro: { en: "Pro: recurring imports, report explanations, anomaly notes, and operator-ready summaries.", zh: "Pro 扩展：周期导入、报表解释、异常备注和面向运营的总结。" },
    skills: {
      en: ["Spreadsheet Cleaner", "CSV Cleaner", "Metric Explainer"],
      zh: ["表格清理器", "CSV 清洗器", "指标解释器"],
    },
  },
  "ui-ux-qa": {
    icon: MonitorCheck,
    marketplaceHref: "/marketplace?category=ui",
    contactHref: "/contact?intent=solution&track=ui",
    fit: {
      en: "For product, design, and frontend teams that want to catch layout issues before users see them.",
      zh: "适合产品、设计和前端团队，在用户看到之前发现排版、移动端和转化问题。",
    },
    pains: {
      en: ["Pages look acceptable on desktop but break on mobile or in real content states", "Buttons, copy, empty states, and layout hierarchy do not guide users clearly"],
      zh: ["桌面端看着还行，但移动端或真实内容状态容易崩", "按钮、文案、空状态和层级没有把用户引导清楚"],
    },
    outcomes: {
      en: ["Responsive layout QA", "Copy and hierarchy review", "Conversion friction notes"],
      zh: ["响应式排版质检", "文案和层级检查", "转化阻力提示"],
    },
    deliverables: {
      en: ["Screenshot evidence", "Issue list", "Polish recommendations"],
      zh: ["截图证据", "问题清单", "优化建议"],
    },
    starter: { en: "Free: single-page layout and copy QA.", zh: "免费起步：单页排版和文案质检。" },
    pro: { en: "Pro: release screenshots, browser QA, issue evidence, and design-system review.", zh: "Pro 扩展：发布截图、浏览器质检、问题证据和设计系统检查。" },
    skills: {
      en: ["UI Layout Reviewer", "Mobile QA Checklist", "Landing Page Polish"],
      zh: ["UI 排版审查", "移动端质检清单", "落地页优化"],
    },
  },
  "developer-security": {
    icon: ShieldCheck,
    marketplaceHref: "/marketplace?category=dev",
    contactHref: "/contact?intent=solution&track=dev",
    fit: {
      en: "For developer, security, and platform teams adopting AI-generated code or workflow automation.",
      zh: "适合开发、安全和平台团队，在采用 AI 生成代码或自动化流程前加一层发布把关。",
    },
    pains: {
      en: ["AI-generated changes move fast but review evidence is not consistent", "API, permission, and release risks are discovered too late"],
      zh: ["AI 生成变更很快，但审查证据不稳定", "API、权限和发布风险经常发现得太晚"],
    },
    outcomes: {
      en: ["API contract review", "Release risk checklist", "Security and permission notes"],
      zh: ["API 合约检查", "发布风险清单", "安全和权限备注"],
    },
    deliverables: {
      en: ["Contract review notes", "Permission risk summary", "Release gate checklist"],
      zh: ["合约审查备注", "权限风险总结", "发布门禁清单"],
    },
    starter: { en: "Free: release notes and API checklist review.", zh: "免费起步：发布说明和 API 清单检查。" },
    pro: { en: "Pro: policy gates, runtime evidence, permission review, and incident handoff.", zh: "Pro 扩展：策略门禁、运行证据、权限审查和事故交接。" },
    skills: {
      en: ["API Contract Reviewer", "Release QA Assistant", "Permission Risk Scanner"],
      zh: ["API 合约审查", "发布质检助手", "权限风险扫描"],
    },
  },
};

type CommerceSolutionTrack = {
  icon: LucideIcon;
  marketplaceHref: string;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  tags: Record<Locale, string[]>;
};

const commerceSolutionTrackOrder = ["seo-geo", "ecommerce", "data-automation", "support", "developer-security"];

const commerceSolutionTrackConfigs: Record<string, CommerceSolutionTrack> = {
  "seo-geo": {
    icon: Search,
    marketplaceHref: "/marketplace?category=seo",
    label: { en: "01 / Traffic growth", zh: "01 / 流量增长" },
    title: { en: "SEO / GEO and content growth", zh: "SEO / GEO 与内容增长" },
    body: {
      en: "Diagnose search and answer-engine visibility, then turn keywords, citation gaps, content briefs, and technical repairs into an execution queue.",
      zh: "诊断搜索和 AI 答案可见度，把关键词、引用缺口、内容简报和技术修复排成可执行队列。",
    },
    tags: {
      en: ["GEO audit", "SEO repair", "Content brief"],
      zh: ["GEO 诊断", "SEO 修复", "内容简报"],
    },
  },
  ecommerce: {
    icon: ShoppingBag,
    marketplaceHref: "/marketplace?category=ecommerce",
    label: { en: "02 / Product operations", zh: "02 / 商品运营" },
    title: { en: "Product page and listing QA", zh: "商品页与 Listing 质检" },
    body: {
      en: "Check titles, selling points, review insights, pricing notes, SKU fields, and launch blockers before paid traffic reaches the page.",
      zh: "检查标题、卖点、评论洞察、价格备注、SKU 字段和上架阻塞项，减少投放前的运营遗漏。",
    },
    tags: {
      en: ["Shopify", "Amazon", "Review mining"],
      zh: ["Shopify", "Amazon", "评论洞察"],
    },
  },
  "data-automation": {
    icon: Database,
    marketplaceHref: "/marketplace?category=data",
    label: { en: "03 / Store operations", zh: "03 / 店铺运营" },
    title: { en: "Sheets, inventory, and operating data", zh: "表格、库存与运营数据" },
    body: {
      en: "Clean exports, normalize fields, explain metric changes, and turn store reports into repeatable Agent workflows.",
      zh: "清洗导出表、规范字段、解释指标变化，把运营报表变成可复用的 Agent 工作流。",
    },
    tags: {
      en: ["CSV cleanup", "Inventory check", "Metric notes"],
      zh: ["CSV 清洗", "库存检查", "指标解读"],
    },
  },
  support: {
    icon: Headphones,
    marketplaceHref: "/marketplace?category=ops",
    label: { en: "04 / Support conversion", zh: "04 / 客服转化" },
    title: { en: "Support, after-sales, and knowledge base", zh: "客服、售后与知识库" },
    body: {
      en: "Summarize tickets, draft replies, identify knowledge gaps, and keep human review around sensitive customer outcomes.",
      zh: "总结工单、生成回复草稿、发现知识库缺口，敏感客户结果保留人工审核。",
    },
    tags: {
      en: ["Ticket routing", "Reply draft", "Knowledge gap"],
      zh: ["工单分流", "回复草稿", "知识缺口"],
    },
  },
  "developer-security": {
    icon: ShieldCheck,
    marketplaceHref: "/marketplace?category=dev",
    label: { en: "05 / Technical delivery", zh: "05 / 技术交付" },
    title: { en: "Software development and automated release", zh: "软件开发与自动化发布" },
    body: {
      en: "Review API contracts, release notes, permission scope, and agent-generated code risk so commerce systems can ship safely.",
      zh: "面向开发团队检查 API 合约、发布说明、权限范围和 Agent 生成代码风险，支撑电商系统稳定迭代。",
    },
    tags: {
      en: ["API contract", "Release QA", "Permission risk"],
      zh: ["API 合约", "发布 QA", "权限风险"],
    },
  },
};

function SolutionsHubPage({
  hub,
  hubKey,
  items,
  jsonLd,
  locale,
}: GrowthHubPageProps & { jsonLd: Record<string, unknown> }) {
  const solutionItems = commerceSolutionTrackOrder.flatMap((slug) => {
    const item = items.find((candidate) => candidate.slug === slug);
    const track = commerceSolutionTrackConfigs[slug];
    return item && track ? [{ item, track }] : [];
  });
  const copy = solutionPageCopy[locale];

  return (
    <AppShell active={hub.active} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="growth-page solutions-page">
        <section className="growth-hero solutions-hero" aria-labelledby={`${hubKey}-heading`}>
          <div className="solutions-hero__copy">
            <p className="solutions-kicker">{copy.heroEyebrow}</p>
            <h1 id={`${hubKey}-heading`}>{hub.title[locale]}</h1>
            <p>{hub.intro[locale]}</p>
            <div className="growth-actions">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <span>{copy.primaryCta}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/docs", locale)}>
                <span>{copy.secondaryCta}</span>
              </a>
            </div>
            <div className="solutions-proof-row" aria-label={copy.metricsLabel}>
              {copy.metrics.map((metric) => (
                <div className="solutions-proof" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="solutions-command-panel" aria-label={copy.summaryLabel}>
            <div className="solutions-command-panel__bar">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <strong>{copy.consoleTitle}</strong>
            </div>
            <div className="solutions-command-panel__body">
              <div className="solutions-task-card">
                <span>{copy.currentTaskLabel}</span>
                <strong>{copy.currentTask}</strong>
              </div>
              <div className="solutions-agent-flow">
                {copy.consoleNodes.map((node, index) => (
                  <div className="solutions-agent-node" key={node.title}>
                    <b>{index + 1}</b>
                    <small>{node.label}</small>
                    <strong>{node.title}</strong>
                  </div>
                ))}
              </div>
              <div className="solutions-code-panel" aria-label={copy.codeLabel}>
                {copy.codeLines.map((line) => (
                  <code key={line}>{line}</code>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="solutions-section solutions-workflow-section" aria-labelledby="solutions-track-heading">
          <div className="solutions-section__heading solutions-section__heading--split">
            <h2 id="solutions-track-heading">{copy.trackTitle}</h2>
            <p>{copy.trackBody}</p>
          </div>
          <div className="solutions-workflow-layout">
            <div className="solutions-lane-stack">
            {solutionItems.map(({ item, track }) => {
              const Icon = track.icon;
              return (
                <article className="solutions-lane-card" key={item.path}>
                  <div className="solutions-lane-card__title">
                    <small>{track.label[locale]}</small>
                    <span className="solutions-lane-card__icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <h3>
                      <a href={localizedHref(item.path, locale)}>{track.title[locale]}</a>
                    </h3>
                  </div>
                  <p>{track.body[locale]}</p>
                  <div className="solutions-lane-card__tags">
                    {track.tags[locale].map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <a className="solutions-lane-card__link" href={localizedHref(track.marketplaceHref, locale)}>
                    {copy.findSkills}
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
            </div>

            <aside className="solutions-side-brief" aria-labelledby="solutions-definition-heading">
              <div>
                <p className="solutions-kicker">{copy.definitionEyebrow}</p>
                <h2 id="solutions-definition-heading">{copy.definitionTitle}</h2>
                <p>{copy.definitionBody}</p>
              </div>
              <div className="solutions-adoption-matrix" aria-label={copy.matrixLabel}>
                {copy.matrix.map((row) => (
                  <div className="solutions-adoption-row" key={row.stage}>
                    <strong>{row.stage}</strong>
                    <span>{row.scope}</span>
                    <span>{row.control}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="solutions-section solutions-adoption-section" aria-labelledby="solutions-adoption-heading">
          <div className="solutions-section__heading solutions-section__heading--split">
            <h2 id="solutions-adoption-heading">{copy.pathTitle}</h2>
            <p>{copy.pathBody}</p>
          </div>
          <div className="solutions-path-grid">
            {copy.steps.map((step, index) => (
              <article className="solutions-step" key={step.title}>
                <span>{String(index + 1)}.</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

const solutionPageCopy = {
  en: {
    heroEyebrow: "Cross-border commerce / Agent Skill workflows",
    primaryCta: "Find Skills by business problem",
    secondaryCta: "View integration path",
    summaryLabel: "Agent workflow preview",
    consoleTitle: "commerce.agent.run",
    currentTaskLabel: "Current business task",
    currentTask:
      "A new product is preparing for paid traffic, so product-page conversion and AI-search visibility need to be checked first.",
    consoleNodes: [
      { label: "Input", title: "Product page, reviews, keywords, SKU sheet" },
      { label: "Select Skill", title: "Listing QA / GEO Auditor / Review Mining" },
      { label: "Run", title: "Execute with permissions, schema, and project policy" },
      { label: "Output", title: "Repair list, content brief, human review items" },
    ],
    codeLabel: "Agent invocation example",
    codeLines: [
      'agent.selectSkill({ category: "ecommerce", task: "launch QA" })',
      'run.withPolicy({ projectKey, permissions: ["read:pdp", "read:reviews"] })',
      'return ["title fixes", "trust gaps", "GEO citation ideas", "launch blockers"]',
    ],
    metricsLabel: "Solution proof points",
    metrics: [
      { value: "5 tracks", label: "commerce operating lanes" },
      { value: "Agent", label: "calls only authorized Skills" },
      { value: "Pro", label: "logs, policies, and review" },
    ],
    definitionEyebrow: "Core idea",
    definitionTitle: "SkillHub is not a prompt-writing service. It is the governed business capability layer for Agents.",
    definitionBody:
      "Each solution explains the business input, which Skills an Agent should call, the expected outputs, permission boundaries, and where human review stays in the loop.",
    matrixLabel: "Adoption control matrix",
    matrix: [
      { stage: "Free start", scope: "Public pages, basic SEO, one listing", control: "Validate low-risk value" },
      { stage: "Pro runtime", scope: "Project Keys, logs, policy gates", control: "Reusable team workflow" },
      { stage: "Human review", scope: "Writeback, customer promises, sensitive data", control: "Control business risk" },
    ],
    trackTitle: "Do not start from a tool name. Start from the commerce workflow blocked today.",
    trackBody:
      "The page is organized around the real operating chain of cross-border teams so operations, growth, support, and engineering can each find the right entry point.",
    findSkills: "Open Skills",
    pathTitle: "Move from one low-risk check to a team-operated Skill workflow.",
    pathBody:
      "Use this path before entering the marketplace so buyers understand how discovery, contract inspection, and project runtime connect.",
    steps: [
      {
        title: "Choose the business problem",
        body: "Pick a real task from SEO/GEO, product pages, SKU launches, support tickets, operating reports, or release work.",
      },
      {
        title: "Inspect the Skill contract",
        body: "Open the filtered marketplace and review manifest, inputs, outputs, permissions, examples, publisher profile, and review state.",
      },
      {
        title: "Connect project runtime",
        body: "After value is clear, use Project Keys, team policy, runtime logs, and human review to make the Skill part of daily operations.",
      },
    ],
  },
  zh: {
    heroEyebrow: "跨境电商 / Agent Skill 工作流",
    primaryCta: "按业务问题找技能",
    secondaryCta: "查看接入路径",
    summaryLabel: "Agent 工作流预览",
    consoleTitle: "commerce.agent.run",
    currentTaskLabel: "当前业务任务",
    currentTask: "新款产品准备投放，商品页转化和 AI 搜索曝光都要先检查。",
    consoleNodes: [
      { label: "输入", title: "商品页、评论、关键词、SKU 表" },
      { label: "选择 Skill", title: "Listing QA / GEO Auditor / Review Mining" },
      { label: "运行", title: "按权限、输入 schema 和项目策略执行" },
      { label: "输出", title: "修复清单、内容简报、人工复核项" },
    ],
    codeLabel: "Agent 调用示例",
    codeLines: [
      'agent.selectSkill({ category: "ecommerce", task: "launch QA" })',
      'run.withPolicy({ projectKey, permissions: ["read:pdp", "read:reviews"] })',
      'return ["标题优化", "信任缺口", "GEO 引用建议", "上线阻塞项"]',
    ],
    metricsLabel: "解决方案要点",
    metrics: [
      { value: "5 条", label: "跨境业务主线" },
      { value: "Agent", label: "只调用已授权 Skill" },
      { value: "Pro", label: "日志、策略与人工复核" },
    ],
    definitionEyebrow: "页面核心信息",
    definitionTitle: "SkillHub 不是替团队“写提示词”，而是给 Agent 提供可治理的业务能力层。",
    definitionBody:
      "每个解决方案都说明业务输入、适合调用的 Skill、典型输出、权限边界和什么时候需要人工复核。",
    matrixLabel: "采用控制矩阵",
    matrix: [
      { stage: "免费起步", scope: "公开页面、基础 SEO、单个 Listing", control: "验证低风险价值" },
      { stage: "Pro 运行", scope: "Project Key、日志、策略门禁", control: "团队长期复用" },
      { stage: "人工复核", scope: "写回、客户承诺、敏感数据", control: "控制业务风险" },
    ],
    trackTitle: "不要从工具名开始，从今天卡住的业务环节开始。",
    trackBody: "页面主体按跨境团队真实工作链路组织，让运营、增长、客服和研发都能快速找到自己的入口。",
    findSkills: "打开技能",
    pathTitle: "从一次低风险检查，走到团队可运营的 Skill 工作流。",
    pathBody: "这个区域帮助用户在进入市场前理解采用路线，减少不知道点哪里的犹豫。",
    steps: [
      {
        title: "选择业务问题",
        body: "从 SEO/GEO、商品页、SKU 上新、客服工单、运营报表或开发发布里选一个真实任务。",
      },
      {
        title: "检查 Skill 合约",
        body: "进入筛选后的市场，查看 manifest、输入输出、权限、示例、发布者和审核状态。",
      },
      {
        title: "接入项目运行",
        body: "确认价值后再使用 Project Key、团队策略、运行日志和人工复核，把 Skill 纳入日常流程。",
      },
    ],
  },
} as const;


export function GrowthDetailPage({ item, locale, relatedItems }: GrowthDetailPageProps) {
  const copy = item.content[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.intro,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    url: localizedUrl(item.path, locale),
    publisher: { "@type": "Organization", name: siteName, url: "https://useskillhub.com" },
  };

  return (
    <AppShell active={item.hub} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="growth-page growth-article">
        <section className="growth-hero growth-hero--article">
          <div>
            <p className="eyebrow">{item.category[locale]}</p>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className="growth-actions">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "去找相关技能" : "Find related Skills"}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/contact", locale)}>
                <span>{locale === "zh" ? "咨询定制工作流" : "Request custom workflow"}</span>
              </a>
            </div>
          </div>
          <aside className="growth-hero-panel">
            <span><BookOpenCheck size={16} aria-hidden="true" /> {locale === "zh" ? "采用检查清单" : "Adoption checklist"}</span>
            <ul>
              {copy.checklist.map((item) => (
                <li key={item}><CheckCircle2 size={14} aria-hidden="true" /> {item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <div className="growth-article-layout">
          <div className="growth-article-body">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
          <aside className="growth-side-panel">
            <span><PlugZap size={15} aria-hidden="true" /> {locale === "zh" ? "下一步" : "Next steps"}</span>
            <a href={localizedHref("/marketplace", locale)}>{locale === "zh" ? "按分类筛选技能" : "Filter Skills by category"}</a>
            <a href={localizedHref("/docs", locale)}>{locale === "zh" ? "查看安装路径" : "Read install path"}</a>
            <a href={localizedHref("/publish", locale)}>{locale === "zh" ? "发布自己的技能" : "Publish a Skill"}</a>
          </aside>
        </div>

        {relatedItems.length > 0 ? (
          <section className="growth-related" aria-labelledby="growth-related-heading">
            <p className="eyebrow">{locale === "zh" ? "继续阅读" : "Keep reading"}</p>
            <h2 id="growth-related-heading">{locale === "zh" ? "相关页面" : "Related pages"}</h2>
            <div className="growth-card-grid growth-card-grid--compact">
              {relatedItems.map((related) => (
                <article className="growth-card lift-card" key={related.path}>
                  <span>{related.category[locale]}</span>
                  <h3><a href={localizedHref(related.path, locale)}>{related.content[locale].title}</a></h3>
                  <p>{related.content[locale].intro}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}
