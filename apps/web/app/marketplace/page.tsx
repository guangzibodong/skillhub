import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CircleDollarSign,
  ClipboardList,
  Code2,
  HandCoins,
  PackageSearch,
  ShieldCheck,
  Store,
  Terminal,
  WalletCards
} from "lucide-react";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { localizeText, marketplaceRequests, marketplaceSkills } from "@/lib/marketplace-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const pageCopy = {
  en: {
    eyebrow: "Agent skill marketplace",
    title: "Find, install, review, and monetize agent skills.",
    description:
      "SkillHub is becoming the operating layer for agent capabilities: searchable skills, explicit permissions, install commands, usage metering, review queues, pricing, and payout operations.",
    primary: "Browse catalog",
    secondary: "Publisher console",
    consoleTitle: "Live install path",
    consoleSubtitle: "Agents should install from a contract they can inspect.",
    proof: ["Searchable catalog", "Permission review", "Install command", "Billing-ready usage"],
    requests: "Requested skills",
    requestsBody: "Buyers can request missing skills. Publishers can claim specs, submit builds, and earn bounties or recurring revenue.",
    publishTitle: "Publisher operating flow",
    publishSteps: ["Draft manifest", "Runtime test", "Human review", "Pricing approval", "Public listing", "Usage ledger", "Payout review"],
    trustTitle: "Launch requirements",
    trustItems: [
      ["Manifest", "Typed input/output, runtime, permissions, version, author."],
      ["Security", "Permission classification, runtime checks, secret handling, data retention."],
      ["Money", "Versioned commission rule, immutable transaction split, payout audit trail."],
      ["Support", "Changelog, deprecation policy, issue channel, response expectations."]
    ],
    moneyTitle: "Commission and payout model",
    moneyRows: [
      ["Default split", "20% platform / 80% publisher"],
      ["Payout delay", "Funds mature after refund and fraud window"],
      ["Review threshold", "Manual review above configured amount"],
      ["Ledger rule", "Usage logs never pay out directly"]
    ],
    metrics: [
      ["Launch catalog", String(marketplaceSkills.length)],
      ["Install formats", "CLI / MCP / SDK"],
      ["Review gates", "Schema + Runtime + Human"],
      ["Money flow", "Ledger before payout"]
    ]
  },
  zh: {
    eyebrow: "智能体技能市场",
    title: "搜索、安装、审核并变现智能体技能。",
    description:
      "SkillHub 要成为智能体能力的运营层：可搜索技能、明确权限、安装命令、用量计量、审核队列、价格体系和提现运营。",
    primary: "浏览目录",
    secondary: "发布者控制台",
    consoleTitle: "实时安装路径",
    consoleSubtitle: "智能体应该从可检查的协议里安装技能。",
    proof: ["可搜索目录", "权限审核", "安装命令", "可计费用量"],
    requests: "技能需求池",
    requestsBody: "购买方可以发布缺失技能需求；发布者可以认领规格、提交构建，并获得赏金或持续收入。",
    publishTitle: "发布者运营流程",
    publishSteps: ["草稿 manifest", "运行测试", "人工审核", "价格批准", "公开上架", "用量账本", "提现审核"],
    trustTitle: "上线要求",
    trustItems: [
      ["Manifest", "类型化输入输出、运行时、权限、版本、作者。"],
      ["安全", "权限分类、运行检查、密钥处理、数据保留。"],
      ["资金", "版本化佣金规则、不可变分账交易、提现审计链路。"],
      ["支持", "更新记录、弃用政策、问题通道、响应预期。"]
    ],
    moneyTitle: "分佣和提现模型",
    moneyRows: [
      ["默认分账", "20% 平台 / 80% 发布者"],
      ["提现延迟", "资金经过退款和风控窗口后成熟"],
      ["审核阈值", "超过配置金额进入人工审核"],
      ["账本规则", "绝不直接从用量日志打款"]
    ],
    metrics: [
      ["首批目录", String(marketplaceSkills.length)],
      ["安装格式", "CLI / MCP / SDK"],
      ["审核关卡", "Schema / 运行时 / 人审"],
      ["资金流", "先入账本再提现"]
    ]
  }
} as const;

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = pageCopy[locale];

  return (
    <main className="product-shell">
      <SiteHeader active="marketplace" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/marketplace" />

      <section className="market-hero" aria-labelledby="marketplace-heading">
        <div className="market-hero__copy">
          <div className="eyebrow">
            <Store size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="marketplace-heading">{labels.title}</h1>
          <p>{labels.description}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href="#catalog">
              <PackageSearch size={18} aria-hidden="true" />
              <span>{labels.primary}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/dashboard", locale)}>
              <WalletCards size={18} aria-hidden="true" />
              <span>{labels.secondary}</span>
            </a>
          </div>
        </div>

        <aside className="install-console">
          <div className="install-console__bar">
            <Terminal size={16} aria-hidden="true" />
            <span>{labels.consoleTitle}</span>
          </div>
          <p>{labels.consoleSubtitle}</p>
          <pre>
            <code>{`skillhub search "browser research"
skillhub inspect browser-research-pro
skillhub install browser-research-pro`}</code>
          </pre>
          <div className="proof-grid">
            {labels.proof.map((item) => (
              <span key={item}>
                <BadgeCheck size={14} aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="marketplace-ops-strip" aria-label="Marketplace operating metrics">
        {labels.metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div id="catalog">
        <MarketplaceBrowser locale={locale} skills={marketplaceSkills} />
      </div>

      <section className="market-operations-layout">
        <article className="market-ops-panel">
          <div className="card-kicker">
            <ClipboardList size={16} aria-hidden="true" />
            <span>{labels.requests}</span>
          </div>
          <p>{labels.requestsBody}</p>
          <div className="request-board">
            {marketplaceRequests.map((request) => (
              <div className="request-row" key={localizeText(request.title, locale)}>
                <div>
                  <strong>{localizeText(request.title, locale)}</strong>
                  <span>{localizeText(request.status, locale)} · {localizeText(request.due, locale)}</span>
                </div>
                <b>{request.bounty}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="market-ops-panel">
          <div className="card-kicker">
            <BookOpenCheck size={16} aria-hidden="true" />
            <span>{labels.publishTitle}</span>
          </div>
          <div className="publish-flow-list">
            {labels.publishSteps.map((step, index) => (
              <div className="publish-flow-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
                {index < labels.publishSteps.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="market-operations-layout market-operations-layout--bottom">
        <article className="market-ops-panel">
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.trustTitle}</span>
          </div>
          <div className="trust-requirement-grid">
            {labels.trustItems.map(([title, detail]) => (
              <div className="trust-requirement" key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="market-ops-panel">
          <div className="card-kicker">
            <HandCoins size={16} aria-hidden="true" />
            <span>{labels.moneyTitle}</span>
          </div>
          <div className="commission-list">
            {labels.moneyRows.map(([label, value]) => (
              <div className="commission-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <a className="ghost-button ghost-button--inline" href={localizedHref("/docs", locale)}>
            <Code2 size={16} aria-hidden="true" />
            <span>{dictionary.nav.docs}</span>
          </a>
        </aside>
      </section>
    </main>
  );
}
