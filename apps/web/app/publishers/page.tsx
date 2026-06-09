import {
  ArrowRight,
  BadgeCheck,
  Building2,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  WalletCards,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
} from "@/lib/i18n";
import { localizeText } from "@/lib/marketplace-data";
import { formatCompactNumber, formatPercent } from "@/lib/ops-format";
import {
  getPublicPublishers,
  type PublicPublisherProfile,
} from "@/lib/public-publishers";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    activePaid: "Paid preview",
    back: "Back to marketplace",
    calls: "Runtime calls",
    directory: "Public publishers",
    directoryBody:
      "Browse marketplace suppliers by trust level, verified listings, public review status, install evidence, runtime calls, support posture, and public skill inventory.",
    docs: "Review docs",
    eyebrow: "Publisher trust directory",
    installs: "Installs",
    marketplace: "Marketplace",
    metricInstalls: "Install evidence",
    metricPublic: "Public skills",
    metricPublishers: "Publishers",
    metricVerifiedPublishers: "Verified publishers",
    notAvailable: "n/a",
    payout: "Paid preview",
    profile: "View profile",
    publicSkills: "Public skills",
    sideBody:
      "The directory makes supplier quality visible before payment integration is connected. Publisher trust is based on profile state, verified skills, public listings, review status, runtime evidence, install evidence, support path, and issue history.",
    sideTitle: "How to read the directory",
    status: "Status",
    success: "Avg success",
    title: "Browse publishers before installing their skills.",
    topSkills: "Top public skills",
    trust: "Trust",
    verifiedSkills: "Verified skills",
    trustLevels: {
      active: "Active publisher",
      blocked: "Blocked publisher",
      limited: "Limited publisher",
      verified: "Verified publisher",
    },
    publisherStatuses: {
      active: "Active",
      pending: "Pending",
      restricted: "Restricted",
      suspended: "Suspended",
    },
    payoutStatuses: {
      blocked: "Blocked",
      not_configured: "Not configured",
      verification_required: "Verification required",
      verified: "Verified",
    },
    checks: [
      "Verified skills carry more ranking weight.",
      "Paid marketplace and payout readiness remain prelaunch.",
      "Runtime evidence shows real adoption.",
      "Skill-level pages expose API inspect commands, install eligibility, and permissions.",
    ],
  },
  zh: {
    activePaid: "\u4ed8\u8d39\u9884\u89c8",
    back: "返回市场",
    calls: "运行调用",
    directory: "公开发布者",
    directoryBody:
      "\u6309\u4fe1\u4efb\u7b49\u7ea7\u3001\u5df2\u9a8c\u8bc1\u4e0a\u67b6\u3001\u516c\u5f00\u5ba1\u6838\u72b6\u6001\u3001\u5b89\u88c5\u8bc1\u636e\u3001\u8fd0\u884c\u8c03\u7528\u3001\u652f\u6301\u72b6\u6001\u548c\u516c\u5f00\u6280\u80fd\u5e93\u5b58\u6d4f\u89c8\u5e02\u573a\u4f9b\u5e94\u65b9\u3002",
    docs: "审核文档",
    eyebrow: "发布者信任目录",
    installs: "安装",
    marketplace: "市场",
    metricInstalls: "安装证据",
    metricPublic: "公开技能",
    metricPublishers: "发布者",
    metricVerifiedPublishers: "已验证发布者",
    notAvailable: "暂无",
    payout: "\u4ed8\u8d39\u9884\u89c8",
    profile: "查看档案",
    publicSkills: "公开技能",
    sideBody:
      "\u76ee\u5f55\u4f1a\u5728\u6700\u7ec8\u652f\u4ed8\u63a5\u53e3\u63a5\u5165\u524d\u5148\u628a\u4f9b\u5e94\u65b9\u8d28\u91cf\u663e\u6027\u5316\u3002\u53d1\u5e03\u8005\u4fe1\u4efb\u4e3b\u8981\u57fa\u4e8e\u8d44\u6599\u72b6\u6001\u3001\u5df2\u9a8c\u8bc1\u6280\u80fd\u6570\u3001\u516c\u5f00\u4e0a\u67b6\u3001\u5ba1\u6838\u72b6\u6001\u3001\u8fd0\u884c\u8bc1\u636e\u3001\u5b89\u88c5\u8bc1\u636e\u3001\u652f\u6301\u8def\u5f84\u548c\u95ee\u9898\u8bb0\u5f55\u3002",
    sideTitle: "如何阅读目录",
    status: "状态",
    success: "平均成功率",
    title: "安装技能之前，先看清发布者。",
    topSkills: "代表技能",
    trust: "信任",
    verifiedSkills: "已验证技能",
    trustLevels: {
      active: "活跃发布者",
      blocked: "已阻断发布者",
      limited: "受限发布者",
      verified: "已验证发布者",
    },
    publisherStatuses: {
      active: "活跃",
      pending: "待完善",
      restricted: "受限",
      suspended: "已暂停",
    },
    payoutStatuses: {
      blocked: "已阻断",
      not_configured: "未配置",
      verification_required: "需要验证",
      verified: "已验证",
    },
    checks: [
      "已验证技能会获得更高排序权重。",
      "\u4ed8\u8d39\u5e02\u573a\u548c\u63d0\u73b0\u51c6\u5907\u4ecd\u5c5e\u4e8e\u9884\u53d1\u5e03\u80fd\u529b\u3002",
      "运行证据体现真实采用情况。",
      "技能详情页展示 API 查看命令、安装资格和权限。",
    ],
  },
} as const;

const emptyDirectoryCopy = {
  en: {
    body: "Publisher profiles appear here after their public skills enter the marketplace review path.",
    title: "No public publishers are listed yet",
  },
  zh: {
    body: "发布者的公开技能进入市场审核路径后，发布者档案会出现在这里。",
    title: "暂时还没有公开发布者",
  },
} as const;

export default async function PublisherDirectoryPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = copy[locale];
  const emptyLabels = emptyDirectoryCopy[locale];
  const publishers = await getPublicPublishers();
  const publicStats = await getPublicPlatformStats({ publishers });
  const rankedPublishers = [...publishers].sort(
    (a, b) => publisherScore(b) - publisherScore(a),
  );
  const metrics = [
    [labels.metricPublishers, formatCompactNumber(publicStats.publicPublishers)],
    [
      labels.metricVerifiedPublishers,
      formatCompactNumber(publicStats.verifiedPublishers),
    ],
    [
      labels.metricPublic,
      formatCompactNumber(publicStats.publicSkills),
    ],
    [
      labels.metricInstalls,
      formatCompactNumber(publicStats.installEvidence),
    ],
  ];

  return (
    <main className="product-shell">
      <SiteHeader
        active="publishers"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/publishers"
      />

      <section
        className="page-hero page-hero--compact publisher-directory-hero"
        aria-labelledby="publisher-directory-heading"
      >
        <div>
          <a
            className="breadcrumb-link"
            href={localizedHref("/marketplace", locale)}
          >
            {labels.back}
          </a>
          <div className="eyebrow">
            <Building2 size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="publisher-directory-heading">{labels.title}</h1>
          <p>{labels.directoryBody}</p>
          <div className="hero-actions">
            <a
              className="primary-button primary-button--large"
              href={localizedHref("/marketplace", locale)}
            >
              <PackageCheck size={18} aria-hidden="true" />
              <span>{labels.marketplace}</span>
            </a>
            <a
              className="secondary-button secondary-button--large"
              href={localizedHref("/publisher", locale)}
            >
              <WalletCards size={18} aria-hidden="true" />
              <span>{dictionary.nav.publisher}</span>
            </a>
          </div>
        </div>

        <aside className="publisher-directory-hero-card">
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.sideTitle}</span>
          </div>
          <p>{labels.sideBody}</p>
          <div className="publisher-directory-signal-list">
            {labels.checks.map((check) => (
              <span key={check}>
                <BadgeCheck size={14} aria-hidden="true" />
                {check}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="console-board publisher-directory-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {metrics.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="publisher-directory-layout">
        <article className="publisher-directory-main skill-detail-panel">
          <div className="card-kicker">
            <Sparkles size={16} aria-hidden="true" />
            <span>{labels.directory}</span>
          </div>

          {rankedPublishers.length > 0 ? (
            <div className="publisher-directory-card-grid">
              {rankedPublishers.map((publisher) => (
                <article
                  className="publisher-directory-card"
                  key={publisher.slug}
                >
                  <header className="publisher-directory-card__top">
                    <div>
                      <span>{labels.trust}</span>
                      <h2>{publisher.displayName}</h2>
                    </div>
                    <span className={trustClass(publisher.trustLevel)}>
                      {labels.trustLevels[publisher.trustLevel]}
                    </span>
                  </header>

                  <div className="publisher-directory-badges">
                    <span className={publisherStatusClass(publisher.status)}>
                      {labels.status}:{" "}
                      {labels.publisherStatuses[publisher.status]}
                    </span>
                    <span className={payoutClass(publisher.payoutStatus)}>
                      {labels.payout}:{" "}
                      {labels.payoutStatuses[publisher.payoutStatus]}
                    </span>
                  </div>

                  <div className="publisher-directory-metrics">
                    <Metric
                      label={labels.publicSkills}
                      value={formatCompactNumber(
                        publisher.metrics.publicSkillCount,
                      )}
                    />
                    <Metric
                      label={labels.verifiedSkills}
                      value={formatCompactNumber(
                        publisher.metrics.verifiedSkillCount,
                      )}
                    />
                    <Metric
                      label={labels.installs}
                      value={formatCompactNumber(
                        publisher.metrics.installCount,
                      )}
                    />
                    <Metric
                      label={labels.calls}
                      value={formatCompactNumber(publisher.metrics.callCount)}
                    />
                    <Metric
                      label={labels.activePaid}
                      value={formatCompactNumber(
                        publisher.metrics.activePaidSkillCount,
                      )}
                    />
                    <Metric
                      label={labels.success}
                      value={
                        publisher.metrics.avgSuccessRate === null
                          ? labels.notAvailable
                          : formatPercent(publisher.metrics.avgSuccessRate)
                      }
                    />
                  </div>

                  <div
                    className="publisher-directory-skills"
                    aria-label={labels.topSkills}
                  >
                    {publisher.skills.slice(0, 4).map((skill) => (
                      <a
                        href={localizedHref(`/skills/${skill.slug}`, locale)}
                        key={skill.slug}
                      >
                        <Star size={13} aria-hidden="true" />
                        <span>{localizeText(skill.displayName, locale)}</span>
                      </a>
                    ))}
                  </div>

                  <footer className="publisher-directory-card__foot">
                    <span>
                      {labels.topSkills}:{" "}
                      {formatCompactNumber(
                        Math.min(publisher.skills.length, 4),
                      )}
                    </span>
                    <a
                      className="secondary-button secondary-button--compact"
                      href={localizedHref(
                        `/publishers/${publisher.slug}`,
                        locale,
                      )}
                    >
                      <ShieldCheck size={15} aria-hidden="true" />
                      <span>{labels.profile}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="publisher-directory-empty">
              <PackageCheck size={24} aria-hidden="true" />
              <strong>{emptyLabels.title}</strong>
              <p>{emptyLabels.body}</p>
              <a
                className="secondary-button secondary-button--compact"
                href={localizedHref("/docs", locale)}
              >
                <ShieldCheck size={15} aria-hidden="true" />
                <span>{labels.docs}</span>
              </a>
            </div>
          )}
        </article>

        <aside className="publisher-directory-side">
          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Terminal size={16} aria-hidden="true" />
              <span>{labels.sideTitle}</span>
            </div>
            <div className="publisher-directory-checklist">
              {labels.checks.map((check) => (
                <span key={check}>
                  <BadgeCheck size={14} aria-hidden="true" />
                  {check}
                </span>
              ))}
            </div>
            <a
              className="ghost-button ghost-button--inline"
              href={localizedHref("/docs", locale)}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.docs}</span>
            </a>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="publisher-directory-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function publisherScore(profile: PublicPublisherProfile) {
  const trustBoost =
    profile.trustLevel === "verified"
      ? 500_000
      : profile.trustLevel === "active"
        ? 150_000
        : 0;
  return (
    trustBoost +
    profile.metrics.verifiedSkillCount * 100_000 +
    profile.metrics.installCount * 10 +
    profile.metrics.callCount
  );
}

function trustClass(trustLevel: PublicPublisherProfile["trustLevel"]) {
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

function publisherStatusClass(status: PublicPublisherProfile["status"]) {
  if (status === "active") {
    return "status-chip";
  }

  if (status === "suspended") {
    return "status-chip status-chip--danger";
  }

  if (status === "restricted") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function payoutClass(status: PublicPublisherProfile["payoutStatus"]) {
  if (status === "verified") {
    return "status-chip";
  }

  if (status === "blocked") {
    return "status-chip status-chip--danger";
  }

  if (status === "verification_required") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}
