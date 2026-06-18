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
  Route,
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
  outcomes: Record<Locale, string[]>;
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
    outcomes: {
      en: ["AI-search visibility audit", "Content brief generation", "Technical SEO repair queue"],
      zh: ["AI 搜索可见性诊断", "内容简报生成", "技术 SEO 修复队列"],
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
    outcomes: {
      en: ["Product-page quality fixes", "Review pain-point mining", "Launch QA checklist"],
      zh: ["商品页质量修复", "评论痛点挖掘", "上架前质检清单"],
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
    outcomes: {
      en: ["Ticket routing", "Grounded reply drafts", "Knowledge-base gap reports"],
      zh: ["工单分流", "有依据的回复草稿", "知识库缺口报告"],
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
    outcomes: {
      en: ["Account research", "CRM cleanup", "Call summary and next action"],
      zh: ["客户研究", "CRM 清洗", "通话总结和下一步动作"],
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
    outcomes: {
      en: ["Editorial calendar", "Brief-to-draft workflow", "Brand review checklist"],
      zh: ["选题日历", "从简报到初稿的流程", "品牌审稿清单"],
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
    outcomes: {
      en: ["Messy sheet cleanup", "Data dictionary handoff", "Report narrative generation"],
      zh: ["混乱表格清理", "数据字典交接", "报表解读生成"],
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
    outcomes: {
      en: ["Responsive layout QA", "Copy and hierarchy review", "Conversion friction notes"],
      zh: ["响应式排版质检", "文案和层级检查", "转化阻力提示"],
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
    outcomes: {
      en: ["API contract review", "Release risk checklist", "Security and permission notes"],
      zh: ["API 合约检查", "发布风险清单", "安全和权限备注"],
    },
    starter: { en: "Free: release notes and API checklist review.", zh: "免费起步：发布说明和 API 清单检查。" },
    pro: { en: "Pro: policy gates, runtime evidence, permission review, and incident handoff.", zh: "Pro 扩展：策略门禁、运行证据、权限审查和事故交接。" },
    skills: {
      en: ["API Contract Reviewer", "Release QA Assistant", "Permission Risk Scanner"],
      zh: ["API 合约审查", "发布质检助手", "权限风险扫描"],
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
  const solutionItems = items.flatMap((item) => {
    const track = solutionTrackConfigs[item.slug];
    return track ? [{ item, track }] : [];
  });
  const copy = solutionPageCopy[locale];

  return (
    <AppShell active={hub.active} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="growth-page solutions-page">
        <section className="growth-hero solutions-hero" aria-labelledby={`${hubKey}-heading`}>
          <div>
            <p className="eyebrow">{hub.eyebrow[locale]}</p>
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
          </div>
          <aside className="growth-hero-panel solutions-command-panel" aria-label={copy.summaryLabel}>
            <span>
              <Route size={16} aria-hidden="true" />
              {copy.summaryEyebrow}
            </span>
            <strong>{copy.summaryTitle}</strong>
            <p>{copy.summaryBody}</p>
            <div className="solutions-metrics" aria-label={copy.metricsLabel}>
              {copy.metrics.map((metric) => (
                <div className="solutions-metric" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="solutions-section" aria-labelledby="solutions-track-heading">
          <div className="solutions-section__heading">
            <p className="eyebrow">{copy.trackEyebrow}</p>
            <h2 id="solutions-track-heading">{copy.trackTitle}</h2>
            <p>{copy.trackBody}</p>
          </div>
          <div className="solutions-track-grid">
            {solutionItems.map(({ item, track }) => {
              const Icon = track.icon;
              return (
                <article className="solutions-track-card lift-card" key={item.path}>
                  <div className="solutions-track-card__top">
                    <span className="solutions-track-card__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span>{item.category[locale]}</span>
                  </div>
                  <h3>
                    <a href={localizedHref(item.path, locale)}>{item.content[locale].title}</a>
                  </h3>
                  <p className="solutions-track-card__intro">{item.content[locale].intro}</p>
                  <p className="solutions-track-card__fit">{track.fit[locale]}</p>
                  <div className="solutions-track-card__block">
                    <strong>{copy.outcomeLabel}</strong>
                    <ul>
                      {track.outcomes[locale].map((outcome) => (
                        <li key={outcome}>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="solutions-track-card__block">
                    <strong>{copy.skillLabel}</strong>
                    <p>{track.skills[locale].join(" / ")}</p>
                  </div>
                  <div className="solutions-track-card__path">
                    <span>{track.starter[locale]}</span>
                    <span>{track.pro[locale]}</span>
                  </div>
                  <div className="solutions-card-actions">
                    <a href={localizedHref(track.marketplaceHref, locale)}>
                      {copy.findSkills}
                      <ArrowRight size={15} aria-hidden="true" />
                    </a>
                    <a href={localizedHref(item.path, locale)}>{copy.viewPlan}</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="solutions-section solutions-section--split" aria-labelledby="solutions-adoption-heading">
          <div className="solutions-section__heading">
            <p className="eyebrow">{copy.pathEyebrow}</p>
            <h2 id="solutions-adoption-heading">{copy.pathTitle}</h2>
            <p>{copy.pathBody}</p>
          </div>
          <div className="solutions-path-grid">
            {copy.steps.map((step, index) => (
              <article className="solutions-step" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="solutions-section" aria-labelledby="solutions-decision-heading">
          <div className="solutions-section__heading">
            <p className="eyebrow">{copy.decisionEyebrow}</p>
            <h2 id="solutions-decision-heading">{copy.decisionTitle}</h2>
            <p>{copy.decisionBody}</p>
          </div>
          <div className="solutions-decision-grid">
            {copy.decisions.map((row) => (
              <article className="solutions-decision-row" key={row.team}>
                <strong>{row.team}</strong>
                <span>{row.start}</span>
                <span>{row.upgrade}</span>
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
    primaryCta: "Find Skills by solution",
    secondaryCta: "Read install docs",
    summaryLabel: "Solution summary",
    summaryEyebrow: "Operating map",
    summaryTitle: "Pick the workflow first, then adopt the right Skill bundle.",
    summaryBody:
      "This page is for buyers who do not know which Skill name to search. Start from the business pain, compare free starters and Pro paths, then inspect the marketplace listing before runtime adoption.",
    metricsLabel: "Solution coverage",
    metrics: [
      { value: "8", label: "business workflows" },
      { value: "Free", label: "starter path" },
      { value: "Pro", label: "team runtime" },
    ],
    trackEyebrow: "Solution library",
    trackTitle: "Choose by the work that is blocked today.",
    trackBody:
      "Every track connects the problem, the expected outcome, starter Skills, Pro adoption path, and a filtered marketplace entry.",
    outcomeLabel: "What it improves",
    skillLabel: "Typical Skills",
    findSkills: "Open filtered marketplace",
    viewPlan: "View solution plan",
    pathEyebrow: "Adoption path",
    pathTitle: "A simple route from discovery to governed use.",
    pathBody:
      "SkillHub should not feel like a pile of prompts. The buyer needs a safe path: inspect, try low-risk work, then connect project runtime when the team is ready.",
    steps: [
      { title: "Pick a workflow", body: "Start from SEO, e-commerce, support, sales, content, data, UI, or developer/security." },
      { title: "Inspect Skills", body: "Open the filtered marketplace, compare manifest, permissions, examples, publisher trust, and review state." },
      { title: "Try free basics", body: "Use low-risk checks first so teams see value before connecting private systems or paid workflows." },
      { title: "Adopt into Pro", body: "Move repeatable work into a signed-in project with policy gates, Project Keys, logs, and human review." },
    ],
    decisionEyebrow: "What to use first",
    decisionTitle: "Give each team an obvious starting point.",
    decisionBody: "The page should answer the first operator question: which workflow should my team open first?",
    decisions: [
      { team: "Marketing / SEO", start: "Start with SEO audit and content brief Skills.", upgrade: "Upgrade when weekly GEO monitoring and repair queues are needed." },
      { team: "E-commerce", start: "Start with listing QA and product title optimization.", upgrade: "Upgrade for batch SKU launches and Shopify handoffs." },
      { team: "Support / Ops", start: "Start with ticket summary and knowledge-gap checks.", upgrade: "Upgrade for approved replies, escalation summaries, and QA loops." },
      { team: "Product / Engineering", start: "Start with UI QA, release notes, and API contract checks.", upgrade: "Upgrade for policy gates, runtime evidence, and permission review." },
    ],
  },
  zh: {
    primaryCta: "按方案找技能",
    secondaryCta: "阅读安装文档",
    summaryLabel: "解决方案摘要",
    summaryEyebrow: "运营地图",
    summaryTitle: "先选业务工作流，再采用合适的技能组合。",
    summaryBody:
      "这个页面是给不知道该搜哪个技能名的客户看的。先从业务痛点开始，比较免费起步和 Pro 路径，再进入市场检查清单、权限、示例和发布者。",
    metricsLabel: "方案覆盖",
    metrics: [
      { value: "8", label: "个业务工作流" },
      { value: "免费", label: "低风险起步" },
      { value: "Pro", label: "团队运行路径" },
    ],
    trackEyebrow: "方案库",
    trackTitle: "按今天卡住的工作来选择。",
    trackBody:
      "每个方案都要讲清楚：解决什么问题、改善什么结果、先用哪些技能、什么时候升级 Pro，以及去市场哪里找。",
    outcomeLabel: "改善结果",
    skillLabel: "常用技能",
    findSkills: "打开筛选后的市场",
    viewPlan: "查看方案说明",
    pathEyebrow: "落地路径",
    pathTitle: "从发现到受控运行，客户要有清晰路线。",
    pathBody:
      "SkillHub 不能像一堆提示词。客户需要的是安全路径：先检查、先试低风险任务，团队准备好以后再接入项目运行。",
    steps: [
      { title: "选择工作流", body: "从 SEO、电商、客服、销售、内容、数据、UI 或开发/安全里选一个真实业务问题。" },
      { title: "检查技能", body: "进入筛选后的市场，比较 manifest、权限、示例、发布者信任和审核状态。" },
      { title: "先试免费基础项", body: "先跑低风险检查，让团队看到价值，再连接私有系统或付费工作流。" },
      { title: "进入 Pro 运行", body: "把可重复工作接入登录项目，用策略门禁、Project Key、日志和人工复核控制风险。" },
    ],
    decisionEyebrow: "先用什么",
    decisionTitle: "每个团队都要有一个明显的起点。",
    decisionBody: "这个页面要回答运营最关心的问题：我的团队现在应该先打开哪个工作流？",
    decisions: [
      { team: "市场 / SEO", start: "先用 SEO 审计和内容简报技能。", upgrade: "需要每周 GEO 监控和修复队列时升级。" },
      { team: "电商团队", start: "先用 Listing 质检和商品标题优化。", upgrade: "批量 SKU 上新、Shopify 交接时升级。" },
      { team: "客服 / 运营", start: "先用工单总结和知识缺口检查。", upgrade: "需要审核回复、升级总结和质检闭环时升级。" },
      { team: "产品 / 研发", start: "先用 UI 质检、发布说明和 API 合约检查。", upgrade: "需要策略门禁、运行证据和权限审查时升级。" },
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
