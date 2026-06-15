import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Braces,
  Building2,
  CheckCircle2,
  FileJson,
  History,
  KeyRound,
  MessageSquareText,
  PackageCheck,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import {
  getLocaleFromSearchParams,
  localizedHref,
  localizedHrefWithReturnTo,
  type Locale,
} from "@/lib/i18n";
import {
  localizeText,
  type MarketplaceSkill,
} from "@/lib/marketplace-data";
import {
  getPublicPublisherProfile,
  publisherSlugFromName,
} from "@/lib/public-publishers";
import { getPublicMarketplaceSkill } from "@/lib/public-marketplace";
import { getSkillFeedback } from "@/lib/skill-feedback";
import { isVerifiedSkillStatus } from "@/lib/skill-install-state";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const skill = await getPublicMarketplaceSkill(slug);

  if (!skill) {
    return buildLocalizedMetadata({
      locale,
      path: `/skills/${slug}`,
      noIndex: true,
      en: {
        title: "Skill not found - SkillHub",
        description: "This SkillHub skill listing is not currently available.",
      },
      zh: {
        title: "技能不存在 - SkillHub",
        description: "当前 SkillHub 技能详情暂不可用。",
      },
    });
  }

  const name = localizeText(skill.name, locale);
  const summary = localizeText(skill.summary, locale);

  return buildLocalizedMetadata({
    locale,
    path: `/skills/${skill.slug}`,
    en: {
      title: `${skill.name.en} - SkillHub Skill`,
      description: skill.summary.en,
    },
    zh: {
      title: `${name} - SkillHub 技能`,
      description: summary,
    },
    type: "article",
  });
}

const copy = {
  en: {
    addToProject: "Add to Project",
    back: "Back to Skills",
    category: "Category",
    changelog: "Changelog",
    examples: "Examples",
    input: "Input",
    inspectManifest: "Inspect Manifest",
    lastReviewed: "Last reviewed",
    manifest: "Manifest",
    metadata: "Metadata",
    overview: "Overview",
    permissions: "Permissions",
    pricing: "Pricing",
    publisher: "Publisher",
    requestAccess: "Request Access",
    reviews: "Reviews",
    risk: "Risk",
    runtime: "Runtime",
    status: "Status",
    tabs: ["Overview", "Manifest", "Permissions", "Examples", "Reviews", "Changelog", "Publisher"],
    output: "Output",
    useCases: "Use cases",
    version: "Version",
    noReviews: "No published user reviews yet.",
    reviewSummary: "Published reviews appear after moderated signed-in evaluations.",
    publisherFallback: "Publisher profile is not public yet. Review the listing metadata before adoption.",
    callable: "Callable with approved project access",
    inspectionOnly: "Inspection only until review approval",
  },
  zh: {
    addToProject: "添加到项目",
    back: "返回技能",
    category: "类别",
    changelog: "更新日志",
    examples: "示例",
    input: "输入",
    inspectManifest: "检查 Manifest",
    lastReviewed: "最近审核",
    manifest: "Manifest",
    metadata: "元数据",
    overview: "概览",
    permissions: "权限",
    pricing: "价格",
    publisher: "发布者",
    requestAccess: "申请访问",
    reviews: "评价",
    risk: "风险",
    runtime: "运行时",
    status: "状态",
    tabs: ["概览", "Manifest", "权限", "示例", "评价", "更新日志", "发布者"],
    output: "输出",
    useCases: "使用场景",
    version: "版本",
    noReviews: "暂无公开用户评价。",
    reviewSummary: "公开评价来自经过审核的登录评估。",
    publisherFallback: "发布者档案暂未公开。采用前请先检查列表元数据。",
    callable: "通过项目权限后可调用",
    inspectionOnly: "审核通过前仅可查看",
  },
} as const;

const tabIds = [
  "overview",
  "manifest",
  "permissions",
  "examples",
  "reviews",
  "changelog",
  "publisher",
] as const;

export default async function SkillDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const [skill, feedbackData] = await Promise.all([
    getPublicMarketplaceSkill(slug),
    getSkillFeedback(slug),
  ]);
  const labels = copy[locale];

  if (!skill) {
    notFound();
  }

  const publisherProfile = await getPublicPublisherProfile(publisherSlugFromName(skill.author));
  const isCallable = isVerifiedSkillStatus(skill.verification.en);
  const version = skill.changelog[0]?.version ?? "1.0.0";
  const actionHref = isCallable
    ? localizedHrefWithReturnTo("/login", locale, "/developer")
    : localizedHref("/contact", locale);
  const actionLabel = isCallable ? labels.addToProject : labels.requestAccess;
  const manifestJson = buildManifestPreview(skill, version);
  const metadataRows = [
    [labels.runtime, skill.runtime],
    [labels.risk, riskLabel(skill.risk, locale)],
    [labels.permissions, String(skill.permissions.length)],
    [labels.version, version],
    [labels.pricing, skill.price[locale]],
    [labels.lastReviewed, formatDate(skill.lastReviewed, locale)],
  ];

  return (
    <AppShell active="skills" locale={locale}>
      <Reveal>
        <section className="section pt-8 pb-10 md:pt-12" aria-labelledby="skill-heading">
          <div className="section-inner flex flex-col gap-6">
            <a className="btn-text text-[#999] hover:text-white text-sm w-fit" href={localizedHref("/marketplace", locale)}>
              {labels.back}
            </a>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              <div className="flex flex-col gap-5">
                <div className="eyebrow">
                  <PackageCheck size={16} aria-hidden="true" />
                  <span>{localizeText(skill.category, locale)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h1 id="skill-heading" className="heading-xl">{localizeText(skill.name, locale)}</h1>
                  <p className="body-text text-[#999] max-w-[760px]">{localizeText(skill.summary, locale)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#999]">
                  <span>{labels.publisher}: <strong className="text-white">{skill.author}</strong></span>
                  <span>{labels.category}: <strong className="text-white">{localizeText(skill.category, locale)}</strong></span>
                  <span className={`pill ${isCallable ? "pill--success" : "pill--warning"}`}>
                    {localizeText(skill.verification, locale)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a className="btn-primary--large" href={actionHref}>
                    <KeyRound size={18} aria-hidden="true" />
                    <span>{actionLabel}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                  <a className="btn-secondary--large" href="#manifest">
                    <FileJson size={18} aria-hidden="true" />
                    <span>{labels.inspectManifest}</span>
                  </a>
                </div>
              </div>

              <aside className="card p-5 flex flex-col gap-4">
                <div className="eyebrow">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{labels.status}</span>
                </div>
                <strong className="text-white">{isCallable ? labels.callable : labels.inspectionOnly}</strong>
                <p className="body-text-sm text-[#999]">{localizeText(skill.verification, locale)}</p>
              </aside>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="section pb-10" aria-label={labels.metadata}>
        <div className="section-inner grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metadataRows.map(([label, value]) => (
            <div className="stat-card" key={label}>
              <span className="text-xs text-[#777]">{label}</span>
              <strong className="text-sm text-white">{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section pb-4">
        <div className="section-inner">
          <nav className="card p-2 flex gap-2 overflow-x-auto" aria-label="Skill detail sections">
            {tabIds.map((id, index) => (
              <a className="filter-button whitespace-nowrap" href={`#${id}`} key={id}>
                {labels.tabs[index]}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="section py-10">
        <div className="section-inner flex flex-col gap-6">
          <DetailSection icon={BookOpenCheck} id="overview" title={labels.overview}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skill.useCases.map((item) => (
                <div className="card--compact p-4 flex items-start gap-3" key={localizeText(item, locale)}>
                  <CheckCircle2 size={17} aria-hidden="true" className="text-[#7fee64] mt-0.5" />
                  <p className="body-text-sm text-[#999]">{localizeText(item, locale)}</p>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection icon={Braces} id="manifest" title={labels.manifest}>
            <div className="code-block">
              <pre className="p-4 text-sm overflow-x-auto">
                <code>{JSON.stringify(manifestJson, null, 2)}</code>
              </pre>
            </div>
          </DetailSection>

          <DetailSection icon={ShieldCheck} id="permissions" title={labels.permissions}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skill.permissions.map((permission) => (
                <article className="card--compact p-4 flex flex-col gap-1" key={permission.key}>
                  <strong className="text-sm text-white">{localizeText(permission.label, locale)}</strong>
                  <span className="text-sm text-[#999]">{localizeText(permission.value, locale)}</span>
                </article>
              ))}
            </div>
          </DetailSection>

          <DetailSection icon={Terminal} id="examples" title={labels.examples}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CodeExample label={labels.input} value={skill.inputExample} />
              <CodeExample label={labels.output} value={skill.outputExample} />
            </div>
          </DetailSection>

          <DetailSection icon={MessageSquareText} id="reviews" title={labels.reviews}>
            <p className="body-text-sm text-[#999]">{labels.reviewSummary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {feedbackData.feedback.length > 0 ? (
                feedbackData.feedback.map((feedback) => (
                  <article className="card--compact p-4 flex flex-col gap-2" key={feedback.id}>
                    <strong className="text-sm text-white">{feedback.title}</strong>
                    <span className="text-xs text-[#777]">{feedback.rating}/5</span>
                    <p className="body-text-sm text-[#999]">{feedback.body}</p>
                  </article>
                ))
              ) : (
                <p className="body-text-sm text-[#777]">{labels.noReviews}</p>
              )}
            </div>
          </DetailSection>

          <DetailSection icon={History} id="changelog" title={labels.changelog}>
            <div className="flex flex-col gap-3">
              {skill.changelog.map((item) => (
                <article className="card--compact p-4 flex flex-col gap-1" key={item.version}>
                  <strong className="text-sm text-white">{item.version}</strong>
                  <span className="text-sm text-[#999]">{localizeText(item.note, locale)}</span>
                </article>
              ))}
            </div>
          </DetailSection>

          <DetailSection icon={Building2} id="publisher" title={labels.publisher}>
            <div className="card--compact p-4 flex flex-col gap-3">
              <div>
                <strong className="text-white">{publisherProfile?.displayName ?? skill.author}</strong>
                <span className="block text-xs text-[#777]">{skill.author}</span>
              </div>
              {publisherProfile ? (
                <a className="btn-text w-fit" href={localizedHref(`/publishers/${publisherProfile.slug}`, locale)}>
                  <span>{publisherProfile.displayName}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              ) : (
                <p className="body-text-sm text-[#999]">{labels.publisherFallback}</p>
              )}
            </div>
          </DetailSection>
        </div>
      </section>
    </AppShell>
  );
}

function DetailSection({
  children,
  icon: Icon,
  id,
  title,
}: {
  children: ReactNode;
  icon: typeof BookOpenCheck;
  id: string;
  title: string;
}) {
  return (
    <article className="card p-6 scroll-mt-24" id={id}>
      <div className="eyebrow">
        <Icon size={16} aria-hidden="true" />
        <span>{title}</span>
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function CodeExample({ label, value }: { label: string; value: string }) {
  return (
    <div className="code-block">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)]">
        <span className="text-xs text-[#999]">{label}</span>
        <span className="text-xs text-[#525252]">JSON</span>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function buildManifestPreview(skill: MarketplaceSkill, version: string) {
  return {
    name: skill.slug,
    displayName: skill.name.en,
    version,
    publisher: skill.author,
    category: skill.category.en,
    status: skill.verification.en,
    runtime: skill.runtime,
    risk: skill.risk,
    permissions: skill.permissions.map((permission) => permission.key),
  };
}

function riskLabel(risk: MarketplaceSkill["risk"], locale: Locale) {
  const labels = {
    en: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk",
    },
    zh: {
      high: "高风险",
      low: "低风险",
      medium: "中风险",
    },
  } satisfies Record<Locale, Record<MarketplaceSkill["risk"], string>>;

  return labels[locale][risk];
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
