import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileJson,
  KeyRound,
  PackageSearch,
  ShieldCheck,
  UsersRound,
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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/pricing",
    type: "website",
    en: {
      title: "SkillHub Pricing - Platform Access and Skill Marketplace Boundaries",
      description:
        "Understand SkillHub public discovery, developer workspace access, team evaluation, publisher preview, and paid marketplace boundaries during Launch Preview.",
    },
    zh: {
      title: "SkillHub 价格 - 平台访问与技能市场边界",
      description:
        "了解 SkillHub 的公开发现、开发者工作台、团队评估、发布者预览，以及公开预览阶段的付费市场边界。",
    },
  });
}

type Tier = {
  actionHref: string;
  actionLabel: string;
  body: string;
  bullets: string[];
  eyebrow: string;
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
  tiers: Tier[];
  valueTitle: string;
};

const copy: Record<Locale, PricingCopy> = {
  en: {
    boundaries: [
      ["Public discovery", "Browse marketplace listings, publishers, permissions, manifests, and review state before sign-in."],
      ["Project runtime", "Real invocation requires a signed-in workspace, project policy, and a scoped Project Key."],
      ["Paid marketplace", "Prices on skill cards describe intent; payment capture and automated payouts remain prelaunch."],
    ],
    cta: {
      body:
        "Start by comparing skills in the marketplace. For team evaluation, security review, or publisher onboarding, contact the SkillHub team before production rollout.",
      primary: "Browse marketplace",
      secondary: "Contact team",
      title: "Choose the right next step before production use.",
    },
    faq: [
      ["Can I buy a paid skill today?", "Not as an anonymous checkout. Paid marketplace money movement remains prelaunch until payment, payout, commission, and legal gates are complete."],
      ["Do free skills run without login?", "No. Public pages let you inspect the contract; runtime calls still require a signed-in project and Project Key."],
      ["What does team evaluation include?", "A guided review of use cases, permissions, Project Key boundaries, publisher trust, admin workflow, and launch readiness."],
    ],
    hero: {
      body:
        "SkillHub separates public discovery from project runtime. You can inspect skills publicly, but adoption, runtime tests, and commercial records belong inside a governed workspace.",
      eyebrow: "Pricing and access",
      primary: "Browse skills",
      secondary: "Talk to SkillHub",
      title: "Clear access tiers for discovering and operating AI Agent Skills.",
    },
    notes: [
      {
        title: "Platform access",
        body:
          "SkillHub pricing is not only a checkout page. It defines who can discover, who can run, who can publish, and which actions are still gated during Launch Preview.",
      },
      {
        title: "Skill pricing",
        body:
          "Individual skill listings may show free, per-call, or subscription intent. Those fields are visible for comparison and future commercial review; they do not bypass project policy.",
      },
      {
        title: "Operational review",
        body:
          "Before teams run high-risk skills, operators should review permissions, publisher trust, version pinning, runtime logs, and the fallback path if a skill is deprecated or suspended.",
      },
    ],
    tiers: [
      {
        actionHref: "/marketplace",
        actionLabel: "Browse skills",
        body: "For visitors evaluating whether SkillHub has useful skills before creating an account.",
        bullets: ["Marketplace search and categories", "Skill detail, manifest, permissions", "Publisher trust and review state"],
        eyebrow: "No sign-in",
        name: "Public discovery",
        price: "Free to inspect",
      },
      {
        actionHref: "/login",
        actionLabel: "Enter workspace",
        body: "For developers adopting verified skills into projects and testing runtime through the governed gateway.",
        bullets: ["Projects and Project Keys", "Policy approval and runtime tests", "Install state, logs, and usage evidence"],
        eyebrow: "Signed-in",
        name: "Developer workspace",
        price: "Workspace gated",
      },
      {
        actionHref: "/contact",
        actionLabel: "Discuss evaluation",
        body: "For organizations that need role setup, security review, admin workflow, and production launch readiness.",
        bullets: ["Team and role model", "Security and data-handling review", "Launch readiness and support path"],
        eyebrow: "Team",
        name: "Team evaluation",
        price: "Contact us",
      },
      {
        actionHref: "/publish",
        actionLabel: "Publish a skill",
        body: "For authors preparing a skill package, review evidence, support metadata, and future paid-marketplace readiness.",
        bullets: ["Draft manifest and preflight", "Version review and repair loop", "Pricing intent and payout readiness"],
        eyebrow: "Publisher",
        name: "Publisher preview",
        price: "Review gated",
      },
    ],
    valueTitle: "What each price signal actually means",
  },
  zh: {
    boundaries: [
      ["公开发现", "不登录也可以浏览技能市场、发布者、权限、manifest 和审核状态。"],
      ["项目运行", "真实调用需要登录工作台，通过项目策略，并使用有作用域的 Project Key。"],
      ["付费市场", "技能卡片上的价格表示商业意图；支付扣款和自动分账仍处于预发布阶段。"],
    ],
    cta: {
      body:
        "先在技能市场比较技能。团队评估、安全审核或发布者入驻，建议在生产上线前联系 SkillHub 团队确认边界。",
      primary: "浏览技能市场",
      secondary: "联系团队",
      title: "上线前先选对下一步。",
    },
    faq: [
      ["现在能直接购买付费技能吗？", "不能作为匿名公开结账。付费市场资金流要等支付、分账、佣金和法律条款等门槛完成后再开放。"],
      ["免费技能可以不登录直接运行吗？", "不能。公开页面用于检查合约；真实运行仍需要登录后的项目和 Project Key。"],
      ["团队评估会看什么？", "会一起检查使用场景、权限边界、Project Key、发布者信任、管理员流程和上线准备状态。"],
    ],
    hero: {
      body:
        "SkillHub 把公开发现和项目运行分开：公开页面用来检查技能是否可信，采用、运行测试和商业记录必须进入受治理的工作台。",
      eyebrow: "价格与访问权限",
      primary: "浏览技能",
      secondary: "联系 SkillHub",
      title: "清楚区分发现、运行、团队评估和发布者预览。",
    },
    notes: [
      {
        title: "平台访问",
        body:
          "SkillHub 的价格页不是单纯收银台，而是说明谁能浏览、谁能运行、谁能发布，以及公开预览阶段哪些动作还需要门槛。",
      },
      {
        title: "技能定价",
        body:
          "单个技能可以显示免费、按次或订阅意图。这些字段用于比较和未来商业审核，不会绕过项目策略。",
      },
      {
        title: "运营审核",
        body:
          "团队运行高风险技能前，运营侧应检查权限、发布者信任、版本固定、运行日志，以及技能被废弃或暂停后的替代路径。",
      },
    ],
    tiers: [
      {
        actionHref: "/marketplace",
        actionLabel: "浏览技能",
        body: "适合还没创建账号、先判断 SkillHub 是否有合适能力的访客。",
        bullets: ["技能市场搜索和分类", "技能详情、manifest、权限", "发布者信任和审核状态"],
        eyebrow: "无需登录",
        name: "公开发现",
        price: "免费查看",
      },
      {
        actionHref: "/login",
        actionLabel: "进入工作台",
        body: "适合开发者把已验证技能接入项目，并通过受治理网关做运行测试。",
        bullets: ["项目和 Project Key", "策略审批和运行测试", "安装状态、日志和使用证据"],
        eyebrow: "登录后",
        name: "开发者工作台",
        price: "工作台门槛",
      },
      {
        actionHref: "/contact",
        actionLabel: "讨论评估",
        body: "适合需要角色配置、安全审核、管理员流程和生产上线准备的组织。",
        bullets: ["团队和角色模型", "安全与数据处理审核", "上线准备和支持路径"],
        eyebrow: "团队",
        name: "团队评估",
        price: "联系确认",
      },
      {
        actionHref: "/publish",
        actionLabel: "发布技能",
        body: "适合作者准备技能包、审核证据、支持资料和未来付费市场准备。",
        bullets: ["草稿 manifest 和预检", "版本审核和修复闭环", "定价意图和收款准备"],
        eyebrow: "发布者",
        name: "发布者预览",
        price: "审核门槛",
      },
    ],
    valueTitle: "每一种价格信号到底代表什么",
  },
};

const tierIcons = [PackageSearch, KeyRound, UsersRound, FileJson] as const;
const noteIcons = [ShieldCheck, CircleDollarSign, BadgeCheck] as const;

export default async function PricingPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="marketplace" locale={locale}>
      <section className="section pt-32 pb-16" aria-labelledby="pricing-heading">
        <div className="section-inner hero-glow">
          <Reveal>
            <div className="max-w-[760px]">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{labels.hero.eyebrow}</span>
              </div>
              <h1 id="pricing-heading" className="heading-xl mt-4">
                {labels.hero.title}
              </h1>
              <p className="body-text text-[#999] mt-4 max-w-[680px]">
                {labels.hero.body}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                  <PackageSearch size={18} aria-hidden="true" />
                  <span>{labels.hero.primary}</span>
                </a>
                <a className="btn-secondary btn-secondary--large" href={localizedHref("/contact", locale)}>
                  <Building2 size={18} aria-hidden="true" />
                  <span>{labels.hero.secondary}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section pb-12" aria-label={locale === "zh" ? "当前边界" : "Current boundaries"}>
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

      <section className="section py-[96px]" aria-labelledby="pricing-tiers-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[720px]">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.valueTitle}</span>
            </div>
            <h2 id="pricing-tiers-heading" className="heading-lg mt-3">
              {labels.valueTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {labels.tiers.map((tier, index) => {
              const Icon = tierIcons[index] ?? ShieldCheck;

              return (
                <Reveal delay={index * 70} key={tier.name}>
                  <article className="card flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between gap-3">
                      <span className="pill pill--neutral">{tier.eyebrow}</span>
                      <Icon size={20} aria-hidden="true" className="text-[#7fee64]" />
                    </div>
                    <div>
                      <h3 className="heading-sm">{tier.name}</h3>
                      <strong className="text-white text-2xl block mt-2">{tier.price}</strong>
                    </div>
                    <p className="body-text-sm text-[#999]">{tier.body}</p>
                    <ul className="flex flex-col gap-2 mt-auto">
                      {tier.bullets.map((bullet) => (
                        <li className="flex items-start gap-2 text-sm text-[#999]" key={bullet}>
                          <CheckCircle2 size={15} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <a className="btn-secondary inline-flex items-center gap-2 justify-center mt-2" href={localizedHref(tier.actionHref, locale)}>
                      <span>{tier.actionLabel}</span>
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

      <section className="section py-[96px]" aria-label={locale === "zh" ? "价格说明" : "Pricing notes"}>
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="card flex flex-col gap-4">
            <div className="eyebrow">
              <WalletCards size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "商业边界" : "Commercial boundary"}</span>
            </div>
            <h2 className="heading-lg">
              {locale === "zh" ? "价格显示不等于已开放收银。" : "Displayed prices do not mean checkout is live."}
            </h2>
            <p className="body-text text-[#999]">
              {locale === "zh"
                ? "SkillHub 会把价格意图、项目运行和未来账本证据分开处理。这样客户能先比较技能，团队也能在真实支付前完成审核、条款、佣金、分账和风险治理。"
                : "SkillHub separates pricing intent, project runtime, and future ledger evidence. Buyers can compare skills while teams complete review, terms, commission, payout, and risk governance before real payment flow."}
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
              {locale === "zh" ? "常见价格问题" : "Common pricing questions"}
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
              <a className="btn-secondary" href={localizedHref("/contact", locale)}>
                <span>{labels.cta.secondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
