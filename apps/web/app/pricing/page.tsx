import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Code2,
  Compass,
  ShieldCheck,
  UploadCloud,
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
      title: "SkillHub Early Access Pricing - Free Discovery and Team Evaluation",
      description:
        "Browse public AI Agent Skills for free, request developer runtime access, evaluate team governance, or apply for publisher preview.",
    },
    zh: {
      title: "SkillHub Early Access 价格 - 免费发现与团队评估",
      description:
        "免费浏览公开 AI Agent Skills，申请开发者运行访问、团队治理评估或发布者预览。",
    },
  });
}

export default async function PricingPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="marketplace" locale={locale}>
      <section className="section pt-10 pb-14 md:pt-16 md:pb-20" aria-labelledby="pricing-heading">
        <div className="section-inner hero-glow grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-end">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="eyebrow">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>{labels.eyebrow}</span>
              </div>
              <div className="flex flex-col gap-4 max-w-[760px]">
                <h1 id="pricing-heading" className="heading-xl">{labels.title}</h1>
                <p className="body-text text-[#999]">{labels.body}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="btn-primary--large" href={localizedHref("/contact", locale)}>
                  <Building2 size={18} aria-hidden="true" />
                  <span>{labels.primary}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a className="btn-secondary--large" href={localizedHref("/marketplace", locale)}>
                  <Compass size={18} aria-hidden="true" />
                  <span>{labels.secondary}</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="card p-6 flex flex-col gap-4">
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.noteTitle}</span>
              </div>
              <p className="body-text-sm text-[#999]">{labels.noteBody}</p>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="section pb-16" aria-label={labels.plansLabel}>
        <div className="section-inner grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {labels.plans.map((plan, index) => {
            const Icon = planIcons[index] ?? ShieldCheck;
            const featured = plan.key === "team";

            return (
              <article
                className={`card p-6 flex flex-col gap-5 ${featured ? "border-[#7fee64]/50" : ""}`}
                key={plan.title}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[rgba(127,238,100,0.1)] text-[#7fee64]">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  {featured ? <span className="pill pill--success">{labels.recommended}</span> : null}
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="heading-sm">{plan.title}</h2>
                  <strong className="text-2xl text-white">{plan.price}</strong>
                  <p className="body-text-sm text-[#999]">{plan.forText}</p>
                </div>
                <ul className="flex flex-col gap-3 text-sm text-[#cbd5c0]">
                  {plan.includes.map((item) => (
                    <li className="flex items-start gap-2" key={item}>
                      <BadgeCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[#7fee64]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {featured ? (
                  <a className="btn-primary mt-auto w-fit" href={localizedHref("/contact", locale)}>
                    <span>{labels.primary}</span>
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

const planIcons = [Compass, Code2, Building2, UploadCloud] as const;

const copy = {
  en: {
    eyebrow: "Early Access Pricing",
    title: "Pricing for governed AI Agent Skills",
    body:
      "Start with free public discovery, then request runtime access, team governance, or publisher preview when your workflow is ready.",
    primary: "Contact for Team Evaluation",
    secondary: "Browse Skills",
    noteTitle: "Billing readiness",
    noteBody:
      "Public discovery and manifest inspection are available now. Commercial billing is enabled only for approved workspaces with configured provider flows.",
    plansLabel: "Pricing plans",
    recommended: "Recommended",
    plans: [
      {
        key: "free",
        title: "Free Discovery",
        price: "Free",
        forText: "For builders browsing and inspecting public skills.",
        includes: [
          "Public marketplace access",
          "Skill manifest inspection",
          "Public registry browsing",
          "Docs and examples",
        ],
      },
      {
        key: "developer",
        title: "Developer Access",
        price: "Invite only",
        forText: "For builders testing runtime access.",
        includes: [
          "Project Keys",
          "REST / MCP preview",
          "Runtime logs",
          "Limited skill invocation",
        ],
      },
      {
        key: "team",
        title: "Team Evaluation",
        price: "Contact us",
        forText: "For teams that need governance and approvals.",
        includes: [
          "Workspace governance",
          "Skill approval controls",
          "Audit logs",
          "Security review support",
          "Higher limits",
        ],
      },
      {
        key: "publisher",
        title: "Publisher Preview",
        price: "Invite only",
        forText: "For skill creators preparing public listings.",
        includes: [
          "Publisher profile",
          "Skill submission",
          "Review status",
          "Paid readiness metadata",
        ],
      },
    ],
  },
  zh: {
    eyebrow: "Early Access 价格",
    title: "受治理 AI Agent Skills 的价格方案",
    body:
      "先免费浏览公开技能；当工作流准备好后，再申请运行访问、团队治理或发布者预览。",
    primary: "联系团队评估",
    secondary: "浏览技能",
    noteTitle: "计费准备状态",
    noteBody:
      "公开发现和 manifest 检查现在可用。商业化计费只会在通过审核并完成服务商配置的工作区中启用。",
    plansLabel: "价格方案",
    recommended: "推荐",
    plans: [
      {
        key: "free",
        title: "Free Discovery",
        price: "免费",
        forText: "适合先浏览和检查公开技能的构建者。",
        includes: [
          "公开市场访问",
          "Skill manifest 检查",
          "公开注册表浏览",
          "文档与示例",
        ],
      },
      {
        key: "developer",
        title: "Developer Access",
        price: "邀请制",
        forText: "适合测试运行访问的开发者。",
        includes: [
          "Project Keys",
          "REST / MCP 预览",
          "运行日志",
          "有限技能调用",
        ],
      },
      {
        key: "team",
        title: "Team Evaluation",
        price: "联系我们",
        forText: "适合需要治理和审批的团队。",
        includes: [
          "工作区治理",
          "技能审批控制",
          "审计日志",
          "安全评审支持",
          "更高额度",
        ],
      },
      {
        key: "publisher",
        title: "Publisher Preview",
        price: "邀请制",
        forText: "适合准备公开上架的技能创建者。",
        includes: [
          "发布者档案",
          "技能提交",
          "审核状态",
          "商业化准备资料",
        ],
      },
    ],
  },
} satisfies Record<Locale, {
  body: string;
  eyebrow: string;
  noteBody: string;
  noteTitle: string;
  plansLabel: string;
  primary: string;
  recommended: string;
  secondary: string;
  title: string;
  plans: Array<{
    forText: string;
    includes: string[];
    key: string;
    price: string;
    title: string;
  }>;
}>;
