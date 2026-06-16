import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
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

type PricingCopy = {
  boundaries: Array<[string, string]>;
  cta: {
    body: string;
    primary: string;
    secondary: string;
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
  notes: Array<{
    body: string;
    title: string;
  }>;
  plans: PricingPlan[];
  plansEyebrow: string;
  plansTitle: string;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/pricing",
    type: "website",
    en: {
      title: "SkillHub Pricing - Free Basics and Pro Access",
      description:
        "SkillHub pricing: free basic skills, $128 monthly Pro access to all skills, quarterly 10% discount, and annual 20% discount.",
    },
    zh: {
      title: "SkillHub 定价 - 免费基础技能与 Pro 全量套餐",
      description:
        "SkillHub 定价：免费基础技能、每月 128 美金的 Pro 全量技能套餐、季度 9 折、年度 8 折。",
    },
  });
}

const copy: Record<Locale, PricingCopy> = {
  en: {
    boundaries: [
      ["Free basics", "Basic operations and basic SEO discovery skills are available for evaluation and lightweight workflows."],
      ["Pro access", "$128 per month covers all listed skills for an onboarded workspace, subject to project policy and runtime limits."],
      ["Team governance", "Project Keys, version pinning, logs, permission review, and admin visibility stay part of every paid plan."],
    ],
    cta: {
      body:
        "Start with the marketplace to pick the first skills. During Launch Preview, Pro is enabled through team onboarding while provider checkout and payment capture are being connected.",
      primary: "Browse skills",
      secondary: "Open docs",
      title: "Use the free basics first, then move real work into Pro.",
    },
    faq: [
      ["What is free?", "Free is intentionally limited to basic SEO and basic operations skills. It is for evaluation, light workflow support, and understanding the platform."],
      ["What does Pro include?", "Pro includes access to all listed skills for one workspace, including SEO/GEO, UI/UX QA, content, data, sales/CRM, support, API, and security skills."],
      ["How do quarterly and annual discounts work?", "Quarterly billing is 10% off the monthly rate. Annual billing is 20% off the monthly rate."],
      ["Do third-party authors publish into this plan?", "Authors submit skills for review. Operators approve quality, permissions, support metadata, and commercial readiness before a skill becomes part of the paid catalog."],
    ],
    hero: {
      body:
        "SkillHub keeps pricing simple: free basics for evaluation, then one Pro access plan for all listed AI Agent Skills. Quarterly and annual billing reward teams that commit to ongoing use.",
      eyebrow: "Pricing",
      primary: "Compare skills",
      secondary: "Read installation docs",
      title: "One Pro plan for all skills, with free basics to start.",
    },
    notes: [
      {
        title: "Free is not the whole marketplace",
        body:
          "Free skills should stay basic: simple SEO checks, operations helpers, and low-risk public workflow support. Advanced skills belong in Pro.",
      },
      {
        title: "All paid skills stay governed",
        body:
          "A paid plan does not bypass project policy. Runtime still needs sign-in, Project Key scope, permission review, logs, and version visibility.",
      },
      {
        title: "Publisher quality protects the catalog",
        body:
          "Third-party skills need manifest quality, examples, support path, permission clarity, and maintenance ownership before operators approve them.",
      },
    ],
    plans: [
      {
        actionHref: "/marketplace?pricing=free",
        actionLabel: "View free basics",
        billingNote: "Evaluation and lightweight use",
        body: "For visitors and small teams testing the workflow before moving production work into a project.",
        bullets: ["Basic SEO helpers", "Basic operations helpers", "Public marketplace inspection", "Manifest and permission visibility"],
        name: "Free Basics",
        price: "$0",
      },
      {
        actionHref: "/login",
        actionLabel: "Request monthly onboarding",
        billingCycle: "monthly",
        billingNote: "Manual onboarding during Launch Preview",
        body: "For teams that want flexible access to the full catalog without a long commitment.",
        bullets: ["All listed skills", "Project Keys and runtime tests", "Version pinning and logs", "Publisher trust signals"],
        name: "Pro Monthly",
        price: "$128 / month",
      },
      {
        actionHref: "/login",
        actionLabel: "Request quarterly onboarding",
        badge: "10% off",
        billingCycle: "quarterly",
        billingNote: "$345.60 quarterly after onboarding",
        body: "For teams already using SkillHub in recurring operations and content workflows.",
        bullets: ["All Pro Monthly features", "Effective $115.20 / month", "Quarterly budget cadence", "Same governance controls"],
        name: "Pro Quarterly",
        price: "$345.60 / quarter",
      },
      {
        actionHref: "/login",
        actionLabel: "Request annual onboarding",
        badge: "20% off",
        billingCycle: "annual",
        billingNote: "$1,228.80 yearly after onboarding",
        body: "For teams standardizing SkillHub as their AI skill layer across projects.",
        bullets: ["All Pro Monthly features", "Effective $102.40 / month", "Annual procurement friendly", "Best value for production use"],
        name: "Pro Annual",
        price: "$1,228.80 / year",
      },
    ],
    plansEyebrow: "Plans",
    plansTitle: "Pick the billing cycle that matches how serious the workflow is.",
  },
  zh: {
    boundaries: [
      ["基础免费", "免费只覆盖基础运营和基础 SEO 类技能，用于试用、轻量流程和了解平台。"],
      ["Pro 全量", "每月 128 美金，开通后的工作区可使用全部已上架技能，但仍受项目策略和运行限制管理。"],
      ["团队治理", "Project Key、版本固定、日志、权限审核和后台可见性，会贯穿每一个付费套餐。"],
    ],
    cta: {
      body:
        "先在找技能页面选第一批要用的技能。公开预览期内，Pro 通过团队开通完成；支付渠道和自动扣款接入完成前，不展示成自助扣款流程。",
      primary: "开始找技能",
      secondary: "查看安装文档",
      title: "先用免费基础技能验证，再把真实业务放进 Pro。",
    },
    faq: [
      ["什么是免费？", "免费范围要保持克制，只包含基础 SEO、基础运营等低风险能力，用于试用、轻量流程和理解平台。"],
      ["Pro 包含什么？", "Pro 包含已上架的全部技能，包括 SEO/GEO、UI/UX 质检、内容文案、数据表格、销售 CRM、客服运营、API 开发、安全合规等。"],
      ["季度和年度折扣怎么算？", "季度按月付价格打 9 折，年度按月付价格打 8 折。"],
      ["第三方作者的技能怎么进入套餐？", "作者先提交技能进入审核，运营确认质量、权限、示例、支持路径和商业准备后，才能进入付费目录。"],
    ],
    hero: {
      body:
        "SkillHub 定价保持简单：免费基础技能用于试用；真正使用时，一个 Pro 套餐覆盖全部已上架 AI Agent Skills。季度和年度付款给持续使用的团队更低单价。",
      eyebrow: "定价",
      primary: "比较技能",
      secondary: "查看安装文档",
      title: "一个 Pro 套餐使用全部技能，免费基础能力先上手。",
    },
    notes: [
      {
        title: "免费不是整个市场",
        body:
          "免费技能应该只保留基础能力，例如基础 SEO 检查、运营辅助、低风险公开流程。高级技能进入 Pro。",
      },
      {
        title: "付费也不能绕过治理",
        body:
          "购买套餐不等于绕过项目策略。真实运行仍需要登录、Project Key、权限审核、日志和版本可见性。",
      },
      {
        title: "发布者质量决定目录可信度",
        body:
          "第三方技能需要 manifest 质量、示例、支持路径、权限边界和维护责任清楚，运营审核通过后再进入目录。",
      },
    ],
    plans: [
      {
        actionHref: "/marketplace?pricing=free",
        actionLabel: "查看免费基础技能",
        billingNote: "试用和轻量使用",
        body: "适合访客和小团队先验证流程，再把真实业务接入项目。",
        bullets: ["基础 SEO 辅助", "基础运营辅助", "公开市场查看", "Manifest 和权限可见"],
        name: "免费基础版",
        price: "$0",
      },
      {
        actionHref: "/login",
        actionLabel: "申请月付开通",
        billingCycle: "monthly",
        billingNote: "公开预览期人工开通",
        body: "适合希望灵活使用完整技能目录、暂时不做长期承诺的团队。",
        bullets: ["全部已上架技能", "Project Key 与运行测试", "版本固定和日志", "发布者信任信号"],
        name: "Pro 月付",
        price: "$128 / 月",
      },
      {
        actionHref: "/login",
        actionLabel: "申请季付开通",
        badge: "9 折",
        billingCycle: "quarterly",
        billingNote: "$345.60 / 季度，开通后生效",
        body: "适合已经把 SkillHub 用在持续运营、内容和研发流程里的团队。",
        bullets: ["包含月付全部能力", "折合 $115.20 / 月", "符合季度预算节奏", "同样的治理控制"],
        name: "Pro 季付",
        price: "$345.60 / 季",
      },
      {
        actionHref: "/login",
        actionLabel: "申请年付开通",
        badge: "8 折",
        billingCycle: "annual",
        billingNote: "$1,228.80 / 年，开通后生效",
        body: "适合把 SkillHub 标准化为多个项目 AI 技能层的团队。",
        bullets: ["包含月付全部能力", "折合 $102.40 / 月", "更适合年度采购", "生产使用最划算"],
        name: "Pro 年付",
        price: "$1,228.80 / 年",
      },
    ],
    plansEyebrow: "套餐",
    plansTitle: "按业务认真程度选择付款周期。",
  },
};

const planIcons = [PackageSearch, Sparkles, WalletCards, BadgeCheck] as const;
const noteIcons = [ShieldCheck, CheckCircle2, FileJson] as const;

export default async function PricingPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="pricing" locale={locale}>
      <section className="section pt-32 pb-16" aria-labelledby="pricing-heading">
        <div className="section-inner hero-glow">
          <Reveal>
            <div className="max-w-[780px]">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{labels.hero.eyebrow}</span>
              </div>
              <h1 id="pricing-heading" className="heading-xl mt-4">
                {labels.hero.title}
              </h1>
              <p className="body-text text-[#999] mt-4 max-w-[700px]">
                {labels.hero.body}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                  <PackageSearch size={18} aria-hidden="true" />
                  <span>{labels.hero.primary}</span>
                </a>
                <a className="btn-secondary btn-secondary--large" href={localizedHref("/docs", locale)}>
                  <FileJson size={18} aria-hidden="true" />
                  <span>{labels.hero.secondary}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section pb-12" aria-label={locale === "zh" ? "定价边界" : "Pricing boundaries"}>
        <div className="section-inner grid grid-cols-1 md:grid-cols-3 gap-4">
          {labels.boundaries.map(([title, body], index) => (
            <Reveal delay={index * 60} key={title}>
              <article className="card flex flex-col gap-2 h-full">
                <CheckCircle2 size={18} aria-hidden="true" className="text-[#7fee64]" />
                <h2 className="heading-sm">{title}</h2>
                <p className="body-text-sm text-[#999]">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="pricing-plans-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[760px]">
            <div className="eyebrow">
              <WalletCards size={16} aria-hidden="true" />
              <span>{labels.plansEyebrow}</span>
            </div>
            <h2 id="pricing-plans-heading" className="heading-lg mt-3">
              {labels.plansTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {labels.plans.map((plan, index) => {
              const Icon = planIcons[index] ?? WalletCards;

              return (
                <Reveal delay={index * 70} key={plan.name}>
                  <article className="card flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between gap-3">
                      <Icon size={22} aria-hidden="true" className="text-[#7fee64]" />
                      {plan.badge ? <span className="pill pill--success">{plan.badge}</span> : null}
                    </div>
                    <div>
                      <h3 className="heading-sm">{plan.name}</h3>
                      <strong className="text-white text-2xl block mt-2">{plan.price}</strong>
                      <span className="body-text-sm text-[#7fee64] block mt-1">{plan.billingNote}</span>
                    </div>
                    <p className="body-text-sm text-[#999]">{plan.body}</p>
                    <ul className="flex flex-col gap-2 mt-auto">
                      {plan.bullets.map((bullet) => (
                        <li className="flex items-start gap-2 text-sm text-[#999]" key={bullet}>
                          <CheckCircle2 size={15} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <a className="btn-secondary inline-flex items-center gap-2 justify-center mt-2" href={pricingPlanHref(plan, locale)}>
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

      <section className="section py-[96px]" aria-label={locale === "zh" ? "运营说明" : "Operating notes"}>
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="card flex flex-col gap-4">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "上线口径" : "Launch positioning"}</span>
            </div>
            <h2 className="heading-lg">
              {locale === "zh" ? "价格、权限和审核要说同一套话。" : "Pricing, permissions, and review need one shared story."}
            </h2>
            <p className="body-text text-[#999]">
              {locale === "zh"
                ? "客户看到的是套餐，开发者操作的是项目和 Project Key，第三方作者进入的是审核和维护流程，运营后台看到的是质量、权限、财务和风险状态。四个视角必须一致。"
                : "Customers see plans, developers operate projects and Project Keys, publishers enter review and maintenance, and operators watch quality, permission, finance, and risk state. Those four views must stay aligned."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {labels.notes.map((note, index) => {
              const Icon = noteIcons[index] ?? ShieldCheck;

              return (
                <article className="card flex flex-col gap-3" key={note.title}>
                  <Icon size={19} aria-hidden="true" className="text-[#7fee64]" />
                  <h3 className="heading-sm">{note.title}</h3>
                  <p className="body-text-sm text-[#999]">{note.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="pricing-faq-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 id="pricing-faq-heading" className="heading-lg mt-3">
              {locale === "zh" ? "常见定价问题" : "Common pricing questions"}
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {labels.faq.map(([question, answer]) => (
              <article className="card" key={question}>
                <h3 className="heading-sm">{question}</h3>
                <p className="body-text-sm text-[#999] mt-2">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{labels.cta.title}</h2>
            <p className="body-text max-w-[620px] mx-auto mb-8">{labels.cta.body}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{labels.cta.primary}</span>
              </a>
              <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                <Building2 size={16} aria-hidden="true" />
                <span>{labels.cta.secondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}

function pricingPlanHref(plan: PricingPlan, locale: Locale) {
  if (!plan.billingCycle) {
    return localizedHref(plan.actionHref, locale);
  }

  return localizedHref(`/contact?intent=pro&cycle=${plan.billingCycle}`, locale);
}
