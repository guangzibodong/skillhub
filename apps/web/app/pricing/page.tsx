import type { Metadata } from "next";
import styles from "./pricing.module.css";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  FileJson,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";
import {
  getPromotedSkillPackages,
  promotedSkillPackageIntro,
} from "@/lib/promoted-skill-packages";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type PricingPlan = {
  actionHref: string;
  actionLabel: string;
  badge?: string;
  billingCycle?: "annual" | "monthly" | "quarterly";
  billingNote: string;
  body: string;
  bullets: string[];
  name: string;
  price: string;
};

type PricingComparisonGroup = {
  rows: Array<{
    feature: string;
    values: string[];
  }>;
  title: string;
};

type PricingCopy = {
  compare: {
    body: string;
    eyebrow: string;
    groups: PricingComparisonGroup[];
    title: string;
  };
  faq: Array<[string, string]>;
  hero: {
    body: string;
    eyebrow: string;
    primary: string;
    secondary: string;
    title: string;
  };
  plans: PricingPlan[];
  plansEyebrow: string;
  plansTitle: string;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/pricing",
    type: "website",
    en: {
      title: "SkillHub Pricing - Free Basics and Pro Access",
      description:
        "SkillHub pricing: free basic skills and Pro access opened through team onboarding during Launch Preview. Monthly Pro is $128, quarterly is 10% off, and annual is 20% off.",
    },
    zh: {
      title: "SkillHub 定价 - 免费基础技能与 Pro 全量套餐",
      description:
        "SkillHub 定价：免费基础技能，以及 Launch Preview 期间通过团队入驻人工开通的 Pro。月付 128 美金，季度 9 折，年度 8 折。",
    },
  });
}

const copy: Record<Locale, PricingCopy> = {
  en: {
    compare: {
      body: "Every plan keeps the same public inspection model. Paid access expands the catalog and keeps project policy, runtime logs, and publisher trust visible before teams move work into production.",
      eyebrow: "Detailed comparison",
      groups: [
        {
          title: "Access",
          rows: [
            {
              feature: "Skill access",
              values: [
                "Basic SEO and operations helpers",
                "All listed skills",
                "All listed skills",
                "All listed skills",
              ],
            },
            {
              feature: "Best fit",
              values: [
                "Evaluation and lightweight workflows",
                "Flexible team adoption",
                "Recurring operating workflows",
                "Standardized production use",
              ],
            },
            {
              feature: "Opening path",
              values: [
                "Public marketplace inspection",
                "Manual team onboarding",
                "Manual team onboarding",
                "Manual team onboarding",
              ],
            },
          ],
        },
        {
          title: "Governance",
          rows: [
            {
              feature: "Project Keys",
              values: ["Inspect only", "Included", "Included", "Included"],
            },
            {
              feature: "Runtime tests and logs",
              values: [
                "Limited public inspection",
                "Included",
                "Included",
                "Included",
              ],
            },
            {
              feature: "Version pinning",
              values: [
                "Manifest visibility",
                "Included",
                "Included",
                "Included",
              ],
            },
            {
              feature: "Permission review",
              values: [
                "Visible before adoption",
                "Visible before adoption",
                "Visible before adoption",
                "Visible before adoption",
              ],
            },
          ],
        },
        {
          title: "Catalog trust",
          rows: [
            {
              feature: "Publisher trust signals",
              values: [
                "Public listing signals",
                "Included",
                "Included",
                "Included",
              ],
            },
            {
              feature: "Advanced workflow packs",
              values: ["Not included", "Included", "Included", "Included"],
            },
            {
              feature: "Billing value",
              values: [
                "Free",
                "$128 monthly",
                "10% off monthly rate",
                "20% off monthly rate",
              ],
            },
          ],
        },
      ],
      title: "Compare what each plan unlocks.",
    },
    faq: [
      [
        "What is free?",
        "Free is intentionally limited to basic SEO and basic operations skills. It is for evaluation, light workflow support, and understanding the platform.",
      ],
      [
        "What does Pro include?",
        "Pro includes access to all listed skills for one workspace, including SEO/GEO, UI/UX QA, content, data, sales/CRM, support, API, and security skills.",
      ],
      [
        "How do quarterly and annual discounts work?",
        "Quarterly billing is 10% off the monthly rate. Annual billing is 20% off the monthly rate.",
      ],
      [
        "Do third-party authors publish into this plan?",
        "Authors submit skills for review. Operators approve quality, permissions, support metadata, and commercial readiness before a skill becomes part of the paid catalog.",
      ],
    ],
    hero: {
      body: "SkillHub keeps pricing simple: free basics for evaluation, then Pro access for all listed AI Agent Skills. During Launch Preview, Pro is opened through team onboarding and contact review; there is no public self-service checkout yet.",
      eyebrow: "Pricing",
      primary: "Request Pro access",
      secondary: "Read installation docs",
      title: "Free basics first. Pro access opens through onboarding.",
    },
    plans: [
      {
        actionHref: "/marketplace?pricing=free",
        actionLabel: "View free basics",
        billingNote: "Evaluation and lightweight use",
        body: "For visitors and small teams testing the workflow before moving production work into a project.",
        bullets: [
          "Basic SEO helpers",
          "Basic operations helpers",
          "Public marketplace inspection",
          "Manifest and permission visibility",
        ],
        name: "Free Basics",
        price: "$0",
      },
      {
        actionHref: "/contact?intent=pro&cycle=monthly",
        actionLabel: "Contact sales for monthly",
        billingCycle: "monthly",
        billingNote: "Manual onboarding, no self-service checkout yet",
        body: "For teams that want flexible access to the full catalog without a long commitment.",
        bullets: [
          "All listed skills",
          "Project Keys and runtime tests",
          "Version pinning and logs",
          "Publisher trust signals",
        ],
        name: "Pro Monthly",
        price: "$128 / month",
      },
      {
        actionHref: "/contact?intent=pro&cycle=quarterly",
        actionLabel: "Contact sales for quarterly",
        badge: "10% off",
        billingCycle: "quarterly",
        billingNote: "$345.60 quarterly after manual onboarding",
        body: "For teams already using SkillHub in recurring operations and content workflows.",
        bullets: [
          "All Pro Monthly features",
          "Effective $115.20 / month",
          "Quarterly budget cadence",
          "Same governance controls",
        ],
        name: "Pro Quarterly",
        price: "$345.60 / quarter",
      },
      {
        actionHref: "/contact?intent=pro&cycle=annual",
        actionLabel: "Contact sales for annual",
        badge: "20% off",
        billingCycle: "annual",
        billingNote: "$1,228.80 yearly after manual onboarding",
        body: "For teams standardizing SkillHub as their AI skill layer across projects.",
        bullets: [
          "All Pro Monthly features",
          "Effective $102.40 / month",
          "Annual procurement friendly",
          "Best value for production use",
        ],
        name: "Pro Annual",
        price: "$1,228.80 / year",
      },
    ],
    plansEyebrow: "Plans",
    plansTitle:
      "Pick the billing cycle that matches how serious the workflow is.",
  },
  zh: {
    compare: {
      body: "每个套餐都保留公开查看和权限透明的基础逻辑。付费套餐扩展技能目录，并在团队把工作放进生产流程前继续展示项目策略、运行日志和发布者可信信号。",
      eyebrow: "详细对比",
      groups: [
        {
          title: "访问范围",
          rows: [
            {
              feature: "技能访问",
              values: [
                "基础 SEO 和运营辅助",
                "全部已上架技能",
                "全部已上架技能",
                "全部已上架技能",
              ],
            },
            {
              feature: "适合场景",
              values: [
                "试用和轻量流程",
                "灵活团队导入",
                "持续运营工作流",
                "标准化生产使用",
              ],
            },
            {
              feature: "开通方式",
              values: [
                "公开市场查看",
                "人工团队开通",
                "人工团队开通",
                "人工团队开通",
              ],
            },
          ],
        },
        {
          title: "治理能力",
          rows: [
            {
              feature: "Project Key",
              values: ["仅查看", "包含", "包含", "包含"],
            },
            {
              feature: "运行测试和日志",
              values: ["有限公开查看", "包含", "包含", "包含"],
            },
            {
              feature: "版本固定",
              values: ["Manifest 可见", "包含", "包含", "包含"],
            },
            {
              feature: "权限审核",
              values: ["采用前可见", "采用前可见", "采用前可见", "采用前可见"],
            },
          ],
        },
        {
          title: "目录可信度",
          rows: [
            {
              feature: "发布者信任信号",
              values: ["公开列表信号", "包含", "包含", "包含"],
            },
            {
              feature: "高级工作流包",
              values: ["不包含", "包含", "包含", "包含"],
            },
            {
              feature: "计费价值",
              values: [
                "免费",
                "$128 / 月",
                "按月付价格 9 折",
                "按月付价格 8 折",
              ],
            },
          ],
        },
      ],
      title: "对比每个套餐真正解锁的能力。",
    },
    faq: [
      [
        "什么是免费？",
        "免费范围要保持克制，只包含基础 SEO、基础运营等低风险能力，用于试用、轻量流程和理解平台。",
      ],
      [
        "Pro 包含什么？",
        "Pro 包含已上架的全部技能，包括 SEO/GEO、UI/UX 质检、内容文案、数据表格、销售 CRM、客服运营、API 开发、安全合规等。",
      ],
      [
        "季度和年度折扣怎么算？",
        "季度按月付价格打 9 折，年度按月付价格打 8 折。",
      ],
      [
        "第三方作者的技能怎么进入套餐？",
        "作者先提交技能进入审核，运营确认质量、权限、示例、支持路径和商业准备后，才能进入付费目录。",
      ],
    ],
    hero: {
      body: "SkillHub 定价保持简单：免费基础技能用于试用；真正使用时，Pro 覆盖全部已上架 AI Agent Skills。Launch Preview 期间，Pro 通过团队入驻和联系确认人工开通，暂不展示成公开自助扣款流程。",
      eyebrow: "定价",
      primary: "申请 Pro 开通",
      secondary: "查看安装文档",
      title: "先用免费基础技能验证，再人工开通 Pro。",
    },
    plans: [
      {
        actionHref: "/marketplace?pricing=free",
        actionLabel: "查看免费基础技能",
        billingNote: "试用和轻量使用",
        body: "适合访客和小团队先验证流程，再把真实业务接入项目。",
        bullets: [
          "基础 SEO 辅助",
          "基础运营辅助",
          "公开市场查看",
          "Manifest 和权限可见",
        ],
        name: "免费基础版",
        price: "$0",
      },
      {
        actionHref: "/contact?intent=pro&cycle=monthly",
        actionLabel: "联系开通月付",
        billingCycle: "monthly",
        billingNote: "人工开通，暂不自助扣款",
        body: "适合希望灵活使用完整技能目录、暂时不做长期承诺的团队。",
        bullets: [
          "全部已上架技能",
          "Project Key 与运行测试",
          "版本固定和日志",
          "发布者信任信号",
        ],
        name: "Pro 月付",
        price: "$128 / 月",
      },
      {
        actionHref: "/contact?intent=pro&cycle=quarterly",
        actionLabel: "联系开通季付",
        badge: "9 折",
        billingCycle: "quarterly",
        billingNote: "$345.60 / 季度，人工开通后生效",
        body: "适合已经把 SkillHub 用在持续运营、内容和研发流程里的团队。",
        bullets: [
          "包含月付全部能力",
          "折合 $115.20 / 月",
          "符合季度预算节奏",
          "同样的治理控制",
        ],
        name: "Pro 季付",
        price: "$345.60 / 季",
      },
      {
        actionHref: "/contact?intent=pro&cycle=annual",
        actionLabel: "联系开通年付",
        badge: "8 折",
        billingCycle: "annual",
        billingNote: "$1,228.80 / 年，人工开通后生效",
        body: "适合把 SkillHub 标准化为多个项目 AI 技能层的团队。",
        bullets: [
          "包含月付全部能力",
          "折合 $102.40 / 月",
          "更适合年度采购",
          "生产使用最划算",
        ],
        name: "Pro 年付",
        price: "$1,228.80 / 年",
      },
    ],
    plansEyebrow: "套餐",
    plansTitle: "按业务认真程度选择访问周期。",
  },
};

const planIcons = [PackageSearch, Sparkles, WalletCards, BadgeCheck] as const;

export default async function PricingPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];
  const workflowIntro = promotedSkillPackageIntro[locale];
  const promotedPackages = getPromotedSkillPackages(locale);

  return (
    <AppShell active="pricing" locale={locale}>
      <main className={`pricing-page-shell ${styles.pageStyles}`}>
        <section
          className="section pricing-hero-section"
          aria-labelledby="pricing-heading"
        >
          <div className="section-inner pricing-hero__inner hero-glow">
            <Reveal>
              <div className="pricing-hero__copy">
                <div className="eyebrow">
                  <WalletCards size={16} aria-hidden="true" />
                  <span>{labels.hero.eyebrow}</span>
                </div>
                <h1 id="pricing-heading" className="heading-xl mt-4">
                  {labels.hero.title}
                </h1>
                <p className="body-text text-[#999] mt-4">{labels.hero.body}</p>
                <div className="pricing-hero__actions">
                  <a
                    className="btn-primary btn-primary--large"
                    href={localizedHref(
                      "/contact?intent=pro&cycle=monthly",
                      locale,
                    )}
                  >
                    <PackageSearch size={18} aria-hidden="true" />
                    <span>{labels.hero.primary}</span>
                  </a>
                  <a
                    className="btn-secondary btn-secondary--large"
                    href={localizedHref("/docs", locale)}
                  >
                    <FileJson size={18} aria-hidden="true" />
                    <span>{labels.hero.secondary}</span>
                  </a>
                </div>
              </div>
            </Reveal>

            <div className="pricing-plans-intro">
              <div className="pricing-plans__head">
                <div>
                  <div className="eyebrow">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>{labels.plansEyebrow}</span>
                  </div>
                  <div className="pricing-plans-title-row">
                    <h2 id="pricing-plans-heading" className="heading-lg mt-3">
                      {labels.plansTitle}
                    </h2>
                    <div className="pricing-workflow-help">
                      <button
                        className="pricing-workflow-help__trigger"
                        type="button"
                        aria-describedby="pricing-workflow-panel"
                        aria-label={
                          locale === "zh"
                            ? "查看首推工作流"
                            : "View recommended first workflows"
                        }
                      >
                        <CircleHelp size={18} aria-hidden="true" />
                      </button>
                      <div
                        className="pricing-workflow-help__panel"
                        id="pricing-workflow-panel"
                        role="tooltip"
                      >
                        <div className="pricing-workflow-help__intro">
                          <span>{workflowIntro.eyebrow}</span>
                          <strong>{workflowIntro.pricingTitle}</strong>
                          <p>{workflowIntro.pricingBody}</p>
                        </div>
                        <div className="pricing-workflow-help__grid">
                          {promotedPackages.map((item) => (
                            <article
                              className="pricing-workflow-help__card"
                              key={item.key}
                            >
                              <span>{item.eyebrow}</span>
                              <h3>{item.title}</h3>
                              <p>{item.body}</p>
                              <ul>
                                {item.outcomes.map((outcome) => (
                                  <li key={outcome}>
                                    <CheckCircle2
                                      size={14}
                                      aria-hidden="true"
                                    />
                                    <span>{outcome}</span>
                                  </li>
                                ))}
                              </ul>
                              <a href={localizedHref(item.contactHref, locale)}>
                                <span>{item.ctaSecondary}</span>
                                <ArrowRight size={14} aria-hidden="true" />
                              </a>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="pricing-plan-grid"
              aria-labelledby="pricing-plans-heading"
            >
              {labels.plans.map((plan, index) => {
                const Icon = planIcons[index] ?? WalletCards;

                return (
                  <Reveal delay={index * 70} key={plan.name}>
                    <article className="pricing-plan-card">
                      <div className="pricing-plan-card__top">
                        <span className="pricing-plan-card__icon">
                          <Icon size={21} aria-hidden="true" />
                        </span>
                        {plan.badge ? (
                          <span className="pricing-plan-card__badge">
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="pricing-plan-card__price">
                        <h3>{plan.name}</h3>
                        <strong>{plan.price}</strong>
                        <span>{plan.billingNote}</span>
                      </div>
                      <p>{plan.body}</p>
                      <ul>
                        {plan.bullets.map((bullet) => (
                          <li key={bullet}>
                            <CheckCircle2 size={15} aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        className="btn-secondary pricing-plan-card__cta"
                        href={pricingPlanHref(plan, locale)}
                      >
                        <span>{plan.actionLabel}</span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section
          className="section pricing-compare-section"
          aria-labelledby="pricing-compare-heading"
        >
          <div className="section-inner pricing-compare__inner">
            <div className="pricing-section-head">
              <div className="eyebrow">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>{labels.compare.eyebrow}</span>
              </div>
              <h2 id="pricing-compare-heading" className="heading-lg">
                {labels.compare.title}
              </h2>
              <p className="body-text text-[#999]">{labels.compare.body}</p>
            </div>

            <div className="pricing-compare-table-wrap">
              <table className="pricing-compare-table">
                <thead>
                  <tr>
                    <th scope="col">
                      {locale === "zh" ? "能力" : "Capability"}
                    </th>
                    {labels.plans.map((plan) => (
                      <th scope="col" key={plan.name}>
                        <span>{plan.name}</span>
                        <strong>{plan.price}</strong>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.compare.groups.map((group) => (
                    <PricingComparisonRows
                      group={group}
                      planCount={labels.plans.length}
                      plans={labels.plans}
                      key={group.title}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section
          className="section pricing-faq-section"
          aria-labelledby="pricing-faq-heading"
        >
          <div className="section-inner pricing-faq__inner">
            <div className="pricing-section-head pricing-section-head--compact">
              <div className="eyebrow">FAQ</div>
              <h2 id="pricing-faq-heading" className="heading-lg">
                {locale === "zh" ? "常见定价问题" : "Common pricing questions"}
              </h2>
            </div>
            <div className="pricing-faq-list">
              {labels.faq.map(([question, answer]) => (
                <details className="pricing-faq-item" key={question}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

type PricingComparisonRowsProps = {
  group: PricingComparisonGroup;
  planCount: number;
  plans: PricingPlan[];
};

function PricingComparisonRows({
  group,
  planCount,
  plans,
}: PricingComparisonRowsProps) {
  return (
    <>
      <tr className="pricing-compare-table__group">
        <th scope="rowgroup" colSpan={planCount + 1}>
          {group.title}
        </th>
      </tr>
      {group.rows.map((row) => (
        <tr key={group.title + "-" + row.feature}>
          <th scope="row">{row.feature}</th>
          {row.values.map((value, index) => (
            <td key={row.feature + "-" + (plans[index]?.name ?? index)}>
              {value}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function pricingPlanHref(plan: PricingPlan, locale: Locale) {
  return localizedHref(plan.actionHref, locale);
}
