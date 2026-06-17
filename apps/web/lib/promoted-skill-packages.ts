import type { Locale } from "@/lib/locale-routing";
import type { MarketplaceCategoryKey } from "@/lib/marketplace-data";

type LocalizedText = Record<Locale, string>;

export type PromotedSkillPackage = {
  categoryKey: MarketplaceCategoryKey;
  contactHref: string;
  key: "commerce" | "data" | "growth";
  marketplaceHref: string;
  copy: {
    body: LocalizedText;
    ctaPrimary: LocalizedText;
    ctaSecondary: LocalizedText;
    eyebrow: LocalizedText;
    fit: LocalizedText;
    outcomes: Record<Locale, readonly string[]>;
    path: LocalizedText;
    skills: Record<Locale, readonly string[]>;
    title: LocalizedText;
  };
};

export const promotedSkillPackageIntro = {
  en: {
    body:
      "For launch operations, do not ask buyers to browse hundreds of listings from scratch. Start them from three proven business jobs, then let the marketplace filters handle the long tail.",
    eyebrow: "Recommended first workflows",
    pricingBody:
      "Pro should feel concrete before payment. These packages are the first three paths a team can evaluate, adopt, and expand after onboarding.",
    pricingTitle: "Most teams should start Pro with one of these packages.",
    title: "Start from a business outcome, not a raw skill list.",
  },
  zh: {
    body:
      "上线运营时，不要让客户一上来就在几百个技能里乱找。先给他们三个最容易理解、最容易成交、也最容易交付结果的业务场景，再让市场筛选承接长尾需求。",
    eyebrow: "首推工作流",
    pricingBody:
      "Pro 不能只是一张价格表，客户要知道付费后先用哪一组技能。下面三组是最适合作为首批成交、试用和团队导入的路径。",
    pricingTitle: "Pro 首批建议从这三组技能包开始。",
    title: "先按业务结果选择，而不是直接丢给客户一堆技能。",
  },
} as const;

export const promotedSkillPackages = [
  {
    categoryKey: "seo",
    contactHref: "/contact?intent=pro&track=growth",
    key: "growth",
    marketplaceHref: "/marketplace?category=seo",
    copy: {
      body: {
        en: "Audit AI-search visibility, turn findings into briefs, and build a repair queue that marketing, content, and dev teams can execute.",
        zh: "诊断 SEO/GEO 与 AI 搜索曝光，把问题变成内容简报、页面修复清单和团队可执行的增长任务。",
      },
      ctaPrimary: { en: "View growth skills", zh: "查看增长技能" },
      ctaSecondary: { en: "Talk to Pro", zh: "咨询 Pro 开通" },
      eyebrow: { en: "SEO / GEO growth", zh: "SEO / GEO 增长" },
      fit: {
        en: "Best for founders, SEO teams, content operators, and agencies that need visible growth work every week.",
        zh: "适合创始人、SEO 团队、内容运营和需要每周交付增长动作的服务商。",
      },
      outcomes: {
        en: ["AI-answer visibility audit", "Content brief generation", "Page repair priorities"],
        zh: ["AI 答案曝光诊断", "内容简报生成", "页面修复优先级"],
      },
      path: {
        en: "Start with free SEO checks, then move recurring audits, briefs, and page repair into Pro.",
        zh: "先用免费 SEO 检查起步，再把周期诊断、内容简报和页面修复放进 Pro。",
      },
      skills: {
        en: ["GEO Answer Auditor", "SEO Page Auditor", "Content Brief Builder"],
        zh: ["GEO 答案曝光诊断", "SEO 页面审计", "内容简报生成器"],
      },
      title: { en: "Search and answer-engine growth pack", zh: "搜索与 AI 答案曝光技能包" },
    },
  },
  {
    categoryKey: "ecommerce",
    contactHref: "/contact?intent=pro&track=ecommerce",
    key: "commerce",
    marketplaceHref: "/marketplace?category=ecommerce",
    copy: {
      body: {
        en: "Improve product titles, PDP quality, listing readiness, review mining, and SKU launch checks before paid traffic arrives.",
        zh: "在流量进来之前，先优化商品标题、详情页质量、Listing 准备度、评论痛点和 SKU 上架检查。",
      },
      ctaPrimary: { en: "View commerce skills", zh: "查看电商技能" },
      ctaSecondary: { en: "Request setup", zh: "申请配置" },
      eyebrow: { en: "E-commerce operations", zh: "电商商品运营" },
      fit: {
        en: "Best for Shopify stores, Amazon sellers, DTC teams, and agencies preparing campaigns or batch SKU launches.",
        zh: "适合 Shopify 店铺、Amazon 卖家、DTC 团队和准备投流或批量上架 SKU 的服务商。",
      },
      outcomes: {
        en: ["Product-page quality fixes", "Review pain-point mining", "Launch checklist readiness"],
        zh: ["商品页质量修复", "评论痛点挖掘", "上架检查清单"],
      },
      path: {
        en: "Run free listing checks for basics, then use Pro for batch SKU optimization and launch QA.",
        zh: "先用免费 Listing 检查做基础诊断，再用 Pro 做批量 SKU 优化和上架质检。",
      },
      skills: {
        en: ["Product Title Optimizer", "Shopify PDP Auditor", "Listing QA Checklist"],
        zh: ["商品标题优化器", "Shopify 商品页审计", "Listing 上架质检清单"],
      },
      title: { en: "E-commerce product operations pack", zh: "电商商品运营技能包" },
    },
  },
  {
    categoryKey: "data",
    contactHref: "/contact?intent=pro&track=data",
    key: "data",
    marketplaceHref: "/marketplace?category=data",
    copy: {
      body: {
        en: "Clean messy spreadsheets, standardize imports, explain metrics, and turn weekly reports into repeatable operator workflows.",
        zh: "清洗混乱表格、规范导入字段、解释指标变化，把周报和数据交接变成可重复的运营流程。",
      },
      ctaPrimary: { en: "View data skills", zh: "查看数据技能" },
      ctaSecondary: { en: "Plan onboarding", zh: "规划导入" },
      eyebrow: { en: "Data / spreadsheet automation", zh: "数据 / 表格自动化" },
      fit: {
        en: "Best for operators, finance assistants, growth analysts, and teams that still move work through CSVs and spreadsheets.",
        zh: "适合运营、财务助理、增长分析和仍然依赖 CSV/表格流转工作的团队。",
      },
      outcomes: {
        en: ["Messy sheet cleanup", "Data dictionary handoff", "Report narrative generation"],
        zh: ["混乱表格清理", "数据字典交接", "报表解读生成"],
      },
      path: {
        en: "Start with free cleanup, then use Pro for recurring reporting, imports, and operator-ready summaries.",
        zh: "先用免费清理能力试跑，再用 Pro 做周期报表、字段导入和面向运营的总结。",
      },
      skills: {
        en: ["Spreadsheet Cleaner", "CSV Cleaner", "Data Dictionary Builder"],
        zh: ["表格清理器", "CSV 清洗器", "数据字典生成器"],
      },
      title: { en: "Data and spreadsheet automation pack", zh: "数据与表格自动化技能包" },
    },
  },
] as const satisfies readonly PromotedSkillPackage[];

export function getPromotedSkillPackages(locale: Locale) {
  return promotedSkillPackages.map((item) => ({
    categoryKey: item.categoryKey,
    contactHref: item.contactHref,
    key: item.key,
    marketplaceHref: item.marketplaceHref,
    body: item.copy.body[locale],
    ctaPrimary: item.copy.ctaPrimary[locale],
    ctaSecondary: item.copy.ctaSecondary[locale],
    eyebrow: item.copy.eyebrow[locale],
    fit: item.copy.fit[locale],
    outcomes: item.copy.outcomes[locale],
    path: item.copy.path[locale],
    skills: item.copy.skills[locale],
    title: item.copy.title[locale],
  }));
}
