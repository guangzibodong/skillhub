import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  PackageSearch,
  ShieldCheck,
  Store,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  getPublicMarketplaceSkills,
  type PublicMarketplaceSearchOptions,
} from "@/lib/public-marketplace";
import { getPublicPublishers } from "@/lib/public-publishers";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SearchParamRecord = Record<string, string | string[] | undefined>;

type MarketplaceInitialFilterState = {
  category?: string;
  pricing?: string;
  query?: string;
  risk?: string;
  runtime?: string;
  sort?: string;
  verification?: string;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub Skills - AI Agent Skills 市场"
    : "SkillHub Skills - Governed AI Agent Skills";
  const description = isZh
    ? "搜索可复用 AI Agent Skills，比较发布者、权限、运行时、风险和审核状态，并进入详情页检查 manifest。"
    : "Search reusable AI Agent Skills, compare publisher, permission, runtime, risk, and review status, then inspect the skill manifest.";
  const url = `https://useskillhub.com/marketplace?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/marketplace?lang=en",
        "zh-CN": "https://useskillhub.com/marketplace?lang=zh",
        "x-default": "https://useskillhub.com/marketplace",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "SkillHub",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const pageCopy = {
  en: {
    eyebrow: "Skill marketplace",
    title: "Find governed AI Agent Skills.",
    description:
      "Search reusable skills, compare publisher and permission metadata, then open the detail page to inspect manifests, examples, and review status before adoption.",
    primary: "Browse Skills",
    secondary: "Publish a Skill",
    proof: ["Manifest inspection", "Permission review", "REST / MCP runtime", "Publisher status"],
    noteTitle: "Marketplace scope",
    noteBody:
      "This page is only for discovery and comparison. Runtime setup, billing, operator controls, and review operations live in Docs, Publish, Security, or the signed-in workspace.",
    publishTitle: "Building a missing skill?",
    publishBody:
      "Submit a versioned manifest with examples, permissions, and review notes so teams can inspect it before runtime use.",
    publishCta: "Start Publishing",
  },
  zh: {
    eyebrow: "技能市场",
    title: "查找受治理的 AI Agent Skills。",
    description:
      "搜索可复用技能，比较发布者、权限、运行时和审核状态，再进入详情页检查 manifest、示例和审查信息。",
    primary: "浏览技能",
    secondary: "发布技能",
    proof: ["Manifest 检查", "权限审核", "REST / MCP 运行时", "发布者状态"],
    noteTitle: "市场页职责",
    noteBody:
      "这个页面只负责发现和比较。运行接入、计费、运营控制和审核操作分别放在 Docs、Publish、Security 或登录后的工作台里。",
    publishTitle: "正在构建缺失的技能？",
    publishBody:
      "提交带版本的 manifest、示例、权限和审核说明，让团队在运行前可以先检查。",
    publishCta: "开始发布",
  },
} as const;

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = pageCopy[locale];
  const initialFilters: MarketplaceInitialFilterState = {
    category: firstSearchParam(params, "category"),
    pricing: firstSearchParam(params, "pricing") ?? firstSearchParam(params, "billingModel"),
    query: firstSearchParam(params, "q") ?? firstSearchParam(params, "query"),
    risk: firstSearchParam(params, "permissionLevel") ?? firstSearchParam(params, "risk"),
    runtime: firstSearchParam(params, "runtime"),
    sort: firstSearchParam(params, "sort"),
    verification: firstSearchParam(params, "verification") ?? firstSearchParam(params, "verificationStatus"),
  };
  const marketplaceSearchOptions = toPublicMarketplaceSearchOptions(initialFilters);
  const [skills, publishers] = await Promise.all([
    getPublicMarketplaceSkills(marketplaceSearchOptions),
    getPublicPublishers(),
  ]);

  return (
    <AppShell active="marketplace" locale={locale}>
      <section className="section" aria-labelledby="marketplace-heading">
        <div className="section-inner hero-glow grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-end pt-10 pb-14 md:pt-16 md:pb-20">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="eyebrow">
                <Store size={16} aria-hidden="true" />
                <span>{labels.eyebrow}</span>
              </div>
              <div className="flex flex-col gap-4 max-w-[760px]">
                <h1 id="marketplace-heading" className="heading-xl">{labels.title}</h1>
                <p className="body-text text-[#999]">{labels.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a className="btn-primary--large" href="#catalog">
                  <PackageSearch size={18} aria-hidden="true" />
                  <span>{labels.primary}</span>
                </a>
                <a className="btn-secondary--large" href={localizedHref("/publish", locale)}>
                  <UploadCloud size={18} aria-hidden="true" />
                  <span>{labels.secondary}</span>
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                {labels.proof.map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-[#10b981]">
                    <BadgeCheck size={14} aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="card p-6 flex flex-col gap-3">
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.noteTitle}</span>
              </div>
              <p className="body-text-sm text-[#999]">{labels.noteBody}</p>
            </aside>
          </Reveal>
        </div>
      </section>

      <div className="section-divider" />

      <div id="catalog">
        <MarketplaceBrowser
          initialFilters={initialFilters}
          locale={locale}
          publisherProfiles={publishers}
          skills={skills}
        />
      </div>

      <section className="section py-12">
        <div className="section-inner">
          <article className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="eyebrow">
                <UploadCloud size={16} aria-hidden="true" />
                <span>{labels.publishTitle}</span>
              </div>
              <p className="body-text-sm text-[#999] max-w-[640px]">{labels.publishBody}</p>
            </div>
            <a className="btn-secondary flex items-center gap-2 whitespace-nowrap" href={localizedHref("/publish", locale)}>
              <span>{labels.publishCta}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

function firstSearchParam(params: SearchParamRecord, key: string) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toPublicMarketplaceSearchOptions(
  filters: MarketplaceInitialFilterState,
): PublicMarketplaceSearchOptions {
  return {
    category: parseMarketplaceCategory(filters.category),
    limit: 50,
    permissionLevel: parseMarketplaceRisk(filters.risk),
    query: parseMarketplaceQuery(filters.query),
    runtimeType: parseMarketplaceRuntime(filters.runtime),
    verificationStatus: parseMarketplaceVerification(filters.verification),
  };
}

function parseMarketplaceQuery(value: string | undefined) {
  const query = String(value ?? "").trim().slice(0, 120);
  return query.length > 0 ? query : undefined;
}

function parseMarketplaceCategory(
  value: string | undefined,
): PublicMarketplaceSearchOptions["category"] {
  if (
    value === "code" ||
    value === "data" ||
    value === "docs" ||
    value === "research" ||
    value === "support"
  ) {
    return value;
  }

  return undefined;
}

function parseMarketplaceRisk(
  value: string | undefined,
): PublicMarketplaceSearchOptions["permissionLevel"] {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function parseMarketplaceRuntime(
  value: string | undefined,
): PublicMarketplaceSearchOptions["runtimeType"] {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "http" || normalized === "rest") {
    return "http";
  }

  if (normalized === "mcp" || normalized === "local") {
    return normalized;
  }

  return undefined;
}

function parseMarketplaceVerification(
  value: string | undefined,
): PublicMarketplaceSearchOptions["verificationStatus"] {
  if (value === "verified" || value === "submitted" || value === "deprecated") {
    return value;
  }

  if (value === "review") {
    return "submitted";
  }

  return undefined;
}
