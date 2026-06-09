import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  Star,
  Terminal,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { localizeText, marketplaceSkills } from "@/lib/marketplace-data";
import { formatCompactNumber, formatPercent } from "@/lib/ops-format";
import { getPublicPublisherProfile, publisherSlugFromName } from "@/lib/public-publishers";
import { getSkillInstallState } from "@/lib/skill-install-state";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    activePaid: "Paid preview inventory",
    back: "Back to marketplace",
    calls: "Calls",
    details: "Skill details",
    installs: "Adoptions",
    latest: "Latest",
    metricCalls: "Runtime calls",
    metricInstalls: "Adoption evidence",
    metricPublic: "Public skills",
    metricVerified: "Verified skills",
    payout: "Paid marketplace preview",
    profile: "Publisher profile",
    publicSkills: "Public skills",
    skillBody: "Skills are listed with verification, permission risk, pricing state, API inspect commands, and install eligibility so agent builders can compare before adopting.",
    status: "Profile status",
    success: "Avg success",
    trust: "Trust signals",
    trustBody: "Publisher trust is based on profile state, verified skill count, public listings, review status, runtime evidence, and install evidence. Paid-marketplace preview state is shown as prelaunch context only.",
    trustLevels: {
      active: "Public profile",
      blocked: "Blocked publisher",
      limited: "Limited publisher",
      verified: "Verified publisher"
    },
    billingModels: {
      free: "Free",
      per_call: "Per call",
      subscription: "Subscription"
    },
    payoutStatuses: {
      blocked: "Blocked",
      not_configured: "Prelaunch / not configured",
      verification_required: "Verification required",
      verified: "Verified"
    },
    permissionLevels: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk"
    },
    publisherStatuses: {
      active: "Active",
      pending: "Pending",
      restricted: "Restricted",
      suspended: "Suspended"
    },
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    }
  },
  zh: {
    activePaid: "付费预览库存",
    back: "返回市场",
    calls: "调用",
    details: "技能详情",
    installs: "采用",
    latest: "最新",
    metricCalls: "运行调用",
    metricInstalls: "采用证据",
    metricPublic: "公开技能",
    metricVerified: "已验证技能",
    payout: "付费市场预览",
    profile: "发布者档案",
    publicSkills: "公开技能",
    skillBody: "这里展示每个技能的验证状态、权限风险、价格状态、API 查看命令和安装资格，方便智能体开发者在采用前比较。",
    status: "资料状态",
    success: "平均成功率",
    trust: "信任信号",
    trustBody: "发布者信任由档案状态、已验证技能数量、公开上架、审核状态、运行证据和安装证据共同决定。付费市场预览状态只作为预发布上下文展示。",
    trustLevels: {
      active: "公开资料",
      blocked: "已阻断发布者",
      limited: "受限发布者",
      verified: "已验证发布者"
    },
    billingModels: {
      free: "免费",
      per_call: "按次调用",
      subscription: "订阅"
    },
    payoutStatuses: {
      blocked: "已阻断",
      not_configured: "预发布 / 未配置",
      verification_required: "需要验证",
      verified: "已验证"
    },
    permissionLevels: {
      high: "高风险",
      low: "低风险",
      medium: "中风险"
    },
    publisherStatuses: {
      active: "活跃",
      pending: "待完善",
      restricted: "受限",
      suspended: "已暂停"
    },
    verificationStatuses: {
      deprecated: "已弃用",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    }
  }
} as const;

export function generateStaticParams() {
  return Array.from(new Set(marketplaceSkills.map((skill) => publisherSlugFromName(skill.author)))).map((slug) => ({ slug }));
}

export default async function PublicPublisherPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const publisher = await getPublicPublisherProfile(slug);
  const labels = copy[locale];

  if (!publisher) {
    notFound();
  }

  const metricRows = [
    [labels.metricPublic, formatCompactNumber(publisher.metrics.publicSkillCount)],
    [labels.metricVerified, formatCompactNumber(publisher.metrics.verifiedSkillCount)],
    [labels.metricInstalls, formatCompactNumber(publisher.metrics.installCount)],
    [labels.metricCalls, formatCompactNumber(publisher.metrics.callCount)]
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="publishers" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname={`/publishers/${publisher.slug}`} />

      <section className="page-hero page-hero--compact publisher-public-hero">
        <div>
          <a className="breadcrumb-link" href={localizedHref("/marketplace", locale)}>
            {labels.back}
          </a>
          <div className="eyebrow">
            <Building2 size={16} aria-hidden="true" />
            <span>{labels.profile}</span>
          </div>
          <h1>{publisher.displayName}</h1>
          <p>{labels.trustBody}</p>
          <div className="publisher-public-badges">
            <span className={trustClass(publisher.trustLevel)}>
              <BadgeCheck size={14} aria-hidden="true" />
              {labels.trustLevels[publisher.trustLevel]}
            </span>
            <span className={publisher.status === "active" ? "status-chip" : "status-chip status-chip--warning"}>{labels.status}: {labels.publisherStatuses[publisher.status]}</span>
            <span className={publisher.payoutStatus === "verified" ? "status-chip" : "status-chip status-chip--neutral"}>{labels.payout}: {labels.payoutStatuses[publisher.payoutStatus]}</span>
          </div>
        </div>
      </section>

      <section className="console-board publisher-public-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {metricRows.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="publisher-public-layout">
        <div className="publisher-public-main">
          <article className="skill-detail-panel publisher-public-skills">
            <div className="card-kicker">
              <PackageCheck size={16} aria-hidden="true" />
              <span>{labels.publicSkills}</span>
            </div>
            <p>{labels.skillBody}</p>

            <div className="publisher-public-skill-list">
              {publisher.skills.map((skill) => {
                const installState = getSkillInstallState(skill.verificationStatus);

                return (
                <section className="publisher-public-skill" key={skill.slug}>
                  <header className="publisher-public-skill__head">
                    <div>
                      <strong>{localizeText(skill.displayName, locale)}</strong>
                      <span>{localizeText(skill.description, locale)}</span>
                    </div>
                    <span className={verificationClass(skill.verificationStatus)}>{labels.verificationStatuses[skill.verificationStatus]}</span>
                  </header>

                  <div className="publisher-public-skill__meta">
                    <span className={`risk-badge risk-badge--${skill.permissionLevel}`}>{labels.permissionLevels[skill.permissionLevel]}</span>
                    <span>{formatPublicSkillPrice(skill, labels, locale)}</span>
                    <span>{formatVersion(skill.version, labels.latest)}</span>
                  </div>

                  <div className="publisher-public-skill__signals">
                    <span>
                      <Star size={14} aria-hidden="true" />
                      {labels.installs}: {formatCompactNumber(skill.installCount)}
                    </span>
                    <span>
                      <WalletCards size={14} aria-hidden="true" />
                      {labels.calls}: {formatCompactNumber(skill.callCount)}
                    </span>
                    <span>
                      <ShieldCheck size={14} aria-hidden="true" />
                      {labels.success}: {formatPercent(skill.successRate)}
                    </span>
                  </div>

                  <div className="publisher-public-command">
                    <code>{publisherSkillAvailability(installState, locale)}</code>
                    <a className="secondary-button secondary-button--compact" href={localizedHref(`/skills/${skill.slug}`, locale)}>
                      <ShieldCheck size={15} aria-hidden="true" />
                      <span>{labels.details}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </section>
                );
              })}
            </div>
          </article>
        </div>

        <aside className="publisher-public-side">
          <section className="skill-detail-panel">
            <div className="card-kicker">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.trust}</span>
            </div>
            <div className="publisher-trust-list">
              <TrustRow icon={<BadgeCheck size={15} aria-hidden="true" />} label={labels.status} value={labels.publisherStatuses[publisher.status]} />
              <TrustRow icon={<CircleDollarSign size={15} aria-hidden="true" />} label={labels.payout} value={labels.payoutStatuses[publisher.payoutStatus]} />
              <TrustRow icon={<PackageCheck size={15} aria-hidden="true" />} label={labels.metricVerified} value={formatCompactNumber(publisher.metrics.verifiedSkillCount)} />
              <TrustRow icon={<Star size={15} aria-hidden="true" />} label={labels.success} value={formatPercent(publisher.metrics.avgSuccessRate)} />
              <TrustRow icon={<Terminal size={15} aria-hidden="true" />} label={labels.activePaid} value={formatCompactNumber(publisher.metrics.activePaidSkillCount)} />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function TrustRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="publisher-trust-row">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatPublicSkillPrice(
  skill: { billing: keyof (typeof copy)["en"]["billingModels"]; price: Record<string, string> },
  labels: (typeof copy)["en"] | (typeof copy)["zh"],
  locale: keyof typeof copy
) {
  const price = skill.price[locale];
  const model = labels.billingModels[skill.billing];

  return price.toLowerCase() === model.toLowerCase() ? price : `${price} / ${model}`;
}

function formatVersion(version: string | null | undefined, fallback: string) {
  if (!version) {
    return fallback;
  }

  return version.startsWith("v") ? version : `v${version}`;
}

function publisherSkillAvailability(installState: ReturnType<typeof getSkillInstallState>, locale: keyof typeof copy) {
  if (!installState.installable) {
    return installState.reason[locale];
  }

  return locale === "zh"
    ? "\u53ef\u516c\u5f00\u67e5\u770b\uff1b\u767b\u5f55\u540e\u901a\u8fc7\u9879\u76ee\u7b56\u7565\u68c0\u67e5\u518d\u91c7\u7528\u548c\u8fd0\u884c\u3002"
    : "Public inspection is available; sign in and pass project policy checks before adoption or runtime use.";
}

function trustClass(trustLevel: "verified" | "active" | "limited" | "blocked") {
  if (trustLevel === "verified") {
    return "status-chip";
  }

  if (trustLevel === "blocked") {
    return "status-chip status-chip--danger";
  }

  if (trustLevel === "limited") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function verificationClass(status: string) {
  if (status === "verified") {
    return "status-chip";
  }

  if (status === "rejected" || status === "suspended") {
    return "status-chip status-chip--danger";
  }

  if (status === "submitted" || status === "draft") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}
