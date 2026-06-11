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
import { AppShell } from "@/components/app-shell";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { localizeText } from "@/lib/marketplace-data";
import { formatCompactNumber, formatPercent } from "@/lib/ops-format";
import { getPublicPublishers, type PublicPublisherProfile } from "@/lib/public-publishers";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const copy = {
  en: {
    activePaid: "Paid preview inventory",
    back: "Back to marketplace",
    calls: "Runtime calls",
    directory: "Public publishers",
    directoryBody: "Browse marketplace suppliers by trust level, verified listings, public review status, install evidence, runtime calls, support posture, and public skill inventory.",
    docs: "Review docs",
    eyebrow: "Publisher trust directory",
    installs: "Installs",
    marketplace: "Marketplace",
    metricInstalls: "Install evidence",
    metricPublic: "Public skills",
    metricPublishers: "Publishers",
    metricVerifiedPublishers: "Verified publishers",
    notAvailable: "n/a",
    payout: "Paid marketplace preview",
    profile: "View profile",
    publisherWorkspace: "Sign in for publisher workspace",
    publicSkills: "Public skills",
    sideBody: "The directory makes supplier quality visible before payment integration is connected. Publisher trust is based on profile state, verified skills, public listings, review status, runtime evidence, install evidence, support path, and issue history.",
    sideTitle: "How to read the directory",
    status: "Profile status",
    success: "Avg success",
    title: "Browse publishers before adopting their skills.",
    topSkills: "Top public skills",
    trust: "Trust",
    verifiedSkills: "Verified skills",
    trustLevels: { active: "Public profile", blocked: "Blocked publisher", limited: "Limited publisher", verified: "Verified publisher" },
    publisherStatuses: { active: "Active", pending: "Pending", restricted: "Restricted", suspended: "Suspended" },
    payoutStatuses: { blocked: "Blocked", not_configured: "Not configured", verification_required: "Verification required", verified: "Verified" },
    checks: ["Verified skills carry more ranking weight.", "Paid marketplace readiness remains prelaunch.", "Runtime evidence shows real adoption.", "Skill-level pages expose API inspect commands, availability, and permissions."],
  },
  zh: {
    activePaid: "付费预览库存",
    back: "返回市场",
    calls: "运行调用",
    directory: "公开发布者",
    directoryBody: "按信任等级、已验证上架、公开审核状态、安装证据、运行调用、支持状态和公开技能库存浏览市场供应方。",
    docs: "审核文档",
    eyebrow: "发布者信任目录",
    installs: "安装",
    marketplace: "市场",
    metricInstalls: "安装证据",
    metricPublic: "公开技能",
    metricPublishers: "发布者",
    metricVerifiedPublishers: "已验证发布者",
    notAvailable: "暂无",
    payout: "付费市场预览",
    profile: "查看档案",
    publisherWorkspace: "登录后进入发布者工作台",
    publicSkills: "公开技能",
    sideBody: "目录会在最终支付接口接入前先把供应方质量显性化。发布者信任主要基于资料状态、已验证技能数、公开上架、审核状态、运行证据、安装证据、支持路径和问题记录。",
    sideTitle: "如何阅读目录",
    status: "资料状态",
    success: "平均成功率",
    title: "采用技能之前，先浏览发布者。",
    topSkills: "代表技能",
    trust: "信任",
    verifiedSkills: "已验证技能",
    trustLevels: { active: "公开资料", blocked: "已阻断发布者", limited: "受限发布者", verified: "已验证发布者" },
    publisherStatuses: { active: "活跃", pending: "待完善", restricted: "受限", suspended: "已暂停" },
    payoutStatuses: { blocked: "已阻断", not_configured: "未配置", verification_required: "需要验证", verified: "已验证" },
    checks: ["已验证技能会获得更高排序权重。", "付费市场准备仍属于预发布能力。", "运行证据体现真实采用情况。", "技能详情页展示 API 查看命令、可用状态和权限。"],
  },
} as const;

const emptyDirectoryCopy = {
  en: { body: "Publisher profiles appear here after their public skills enter the marketplace review path.", title: "No public publishers are listed yet" },
  zh: { body: "发布者的公开技能进入市场审核路径后，发布者档案会出现在这里。", title: "暂时还没有公开发布者" },
} as const;

export default async function PublisherDirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = copy[locale];
  const emptyLabels = emptyDirectoryCopy[locale];
  const publishers = await getPublicPublishers();
  const publicStats = await getPublicPlatformStats({ publishers });
  const rankedPublishers = [...publishers].sort((a, b) => publisherScore(b) - publisherScore(a));
  const metrics = [
    [labels.metricPublishers, formatCompactNumber(publicStats.publicPublishers)],
    [labels.metricVerifiedPublishers, formatCompactNumber(publicStats.verifiedPublishers)],
    [labels.metricPublic, formatCompactNumber(publicStats.publicSkills)],
    [labels.metricInstalls, formatCompactNumber(publicStats.installEvidence)],
  ];

  return (
    <AppShell active="publishers" locale={locale}>
      <section className="section pt-20 pb-12" aria-labelledby="publisher-directory-heading">
        <div className="section-inner flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <a className="btn-text text-sm mb-4 inline-block" href={localizedHref("/marketplace", locale)}>{labels.back}</a>
            <div className="eyebrow mb-3">
              <Building2 size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1 id="publisher-directory-heading" className="heading-xl mb-4">{labels.title}</h1>
            <p className="body-text text-[#999] mb-6 max-w-[600px]">{labels.directoryBody}</p>
            <div className="flex flex-wrap gap-3">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <PackageCheck size={18} aria-hidden="true" />
                <span>{labels.marketplace}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/login", locale)}>
                <WalletCards size={18} aria-hidden="true" />
                <span>{labels.publisherWorkspace}</span>
              </a>
            </div>
          </div>
          <aside className="card w-full lg:w-[360px] flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-[#999] mb-3">
              <ShieldCheck size={16} aria-hidden="true" />
              <span className="font-medium text-white">{labels.sideTitle}</span>
            </div>
            <p className="body-text-sm text-[#999] mb-4">{labels.sideBody}</p>
            <div className="flex flex-col gap-2">
              {labels.checks.map((check) => (
                <span key={check} className="flex items-start gap-2 text-sm text-[#999]">
                  <BadgeCheck size={14} aria-hidden="true" className="mt-0.5 text-[#10b981] flex-shrink-0" />
                  {check}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section py-8">
        <div className="section-inner">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(([label, value]) => (
              <div className="stat-card" key={label}>
                <span className="text-sm text-[#999]">{label}</span>
                <strong className="text-xl text-white">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-8">
        <div className="section-inner flex flex-col lg:flex-row gap-8">
          <article className="card flex-1">
            <div className="flex items-center gap-2 text-sm text-[#999] mb-4">
              <Sparkles size={16} aria-hidden="true" />
              <span className="font-medium text-white">{labels.directory}</span>
            </div>
            {rankedPublishers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rankedPublishers.map((publisher) => (
                  <article className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 flex flex-col gap-4" key={publisher.slug}>
                    <header className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs text-[#666]">{labels.trust}</span>
                        <h2 className="heading-sm">{publisher.displayName}</h2>
                      </div>
                      <span className={trustClass(publisher.trustLevel)}>{labels.trustLevels[publisher.trustLevel]}</span>
                    </header>
                    <div className="flex flex-wrap gap-2">
                      <span className={publisherStatusClass(publisher.status)}>{labels.status}: {labels.publisherStatuses[publisher.status]}</span>
                      <span className={payoutClass(publisher.payoutStatus)}>{labels.payout}: {labels.payoutStatuses[publisher.payoutStatus]}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Metric label={labels.publicSkills} value={formatCompactNumber(publisher.metrics.publicSkillCount)} />
                      <Metric label={labels.verifiedSkills} value={formatCompactNumber(publisher.metrics.verifiedSkillCount)} />
                      <Metric label={labels.installs} value={formatCompactNumber(publisher.metrics.installCount)} />
                      <Metric label={labels.calls} value={formatCompactNumber(publisher.metrics.callCount)} />
                      <Metric label={labels.activePaid} value={formatCompactNumber(publisher.metrics.activePaidSkillCount)} />
                      <Metric label={labels.success} value={publisher.metrics.avgSuccessRate === null ? labels.notAvailable : formatPercent(publisher.metrics.avgSuccessRate)} />
                    </div>
                    <div className="flex flex-wrap gap-2" aria-label={labels.topSkills}>
                      {publisher.skills.slice(0, 4).map((skill) => (
                        <a href={localizedHref(`/skills/${skill.slug}`, locale)} key={skill.slug} className="pill flex items-center gap-1.5">
                          <Star size={13} aria-hidden="true" />
                          <span>{localizeText(skill.displayName, locale)}</span>
                        </a>
                      ))}
                    </div>
                    <footer className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(255,255,255,0.08)]">
                      <span className="text-xs text-[#666]">{labels.topSkills}: {formatCompactNumber(Math.min(publisher.skills.length, 4))}</span>
                      <a className="btn-secondary" href={localizedHref(`/publishers/${publisher.slug}`, locale)}>
                        <ShieldCheck size={15} aria-hidden="true" />
                        <span>{labels.profile}</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </a>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                <PackageCheck size={24} aria-hidden="true" className="text-[#525252]" />
                <strong className="text-white">{emptyLabels.title}</strong>
                <p className="body-text-sm text-[#999] max-w-[400px]">{emptyLabels.body}</p>
                <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                  <ShieldCheck size={15} aria-hidden="true" />
                  <span>{labels.docs}</span>
                </a>
              </div>
            )}
          </article>
          <aside className="w-full lg:w-[320px] flex-shrink-0">
            <section className="card">
              <div className="flex items-center gap-2 text-sm text-[#999] mb-3">
                <Terminal size={16} aria-hidden="true" />
                <span className="font-medium text-white">{labels.sideTitle}</span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {labels.checks.map((check) => (
                  <span key={check} className="flex items-start gap-2 text-sm text-[#999]">
                    <BadgeCheck size={14} aria-hidden="true" className="mt-0.5 text-[#10b981] flex-shrink-0" />
                    {check}
                  </span>
                ))}
              </div>
              <a className="btn-text text-sm" href={localizedHref("/docs", locale)}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.docs}</span>
              </a>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#666]">{label}</span>
      <strong className="text-sm text-white">{value}</strong>
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
  if (trustLevel === "verified") return "pill pill--success";
  if (trustLevel === "blocked") return "pill pill--warning";
  if (trustLevel === "limited") return "pill pill--warning";
  return "pill pill--neutral";
}

function publisherStatusClass(status: PublicPublisherProfile["status"]) {
  if (status === "active") return "pill pill--success";
  if (status === "suspended") return "pill pill--warning";
  if (status === "restricted") return "pill pill--warning";
  return "pill pill--neutral";
}

function payoutClass(status: PublicPublisherProfile["payoutStatus"]) {
  if (status === "verified") return "pill pill--success";
  if (status === "blocked") return "pill pill--warning";
  if (status === "verification_required") return "pill pill--warning";
  return "pill pill--neutral";
}