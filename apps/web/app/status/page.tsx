import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  ExternalLink,
  Globe,
  LifeBuoy,
  Lock,
  Network,
  Server,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getPublicApiUrl, getServerApiUrl } from "@/lib/api-url";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/status",
    en: {
      title: "SkillHub Status - Platform Health",
      description:
        "Check public SkillHub web, API gateway, registry, runtime gateway, CDN, and authentication service health signals."
    },
    zh: {
      title: "SkillHub 状态 - 平台健康信号",
      description:
        "查看 SkillHub 公开网站、API 网关、技能 API、运行时网关、CDN 和认证服务的健康状态。"
    }
  });
}

const copy = {
  en: {
    eyebrow: "Status",
    title: "SkillHub status preview.",
    degradedTitle: "SkillHub status needs attention.",
    subtitle: "Public health signals",
    body: "This page reads live platform checks from the gateway, including database, migrations, payments, OAuth, email, and prompt model readiness.",
    api: "API health endpoint",
    support: "Get support",
    servicesEyebrow: "Services",
    servicesTitle: "Infrastructure status",
    checkedAt: "Checked at",
    degraded: "Degraded",
    operational: "Operational",
    metricsEyebrow: "Performance",
    metricsTitle: "Platform metrics",
    metrics: [
      { label: "API response time", value: "Health check", desc: "Public endpoint check is available on the API health route" },
      { label: "Registry queries", value: "Observed", desc: "Skill search and manifest inspection are covered by public availability monitoring" },
      { label: "Runtime gateway", value: "Signed-in", desc: "Runtime checks require authenticated project context" },
      { label: "Static assets", value: "CDN", desc: "Static asset delivery is part of deployment verification" }
    ],
    incidentsEyebrow: "Recent incidents",
    incidentsTitle: "Current incident notes",
    currentNote: "The status summary is generated from live readiness checks. Contact support if a degraded dependency blocks your workflow.",
    scopeEyebrow: "Monitoring scope",
    scopeTitle: "What's covered vs. gated",
    scopePublic: "Public monitoring",
    scopePublicItems: [
      "Web app availability and response time",
      "Public API health and search latency",
      "Registry discovery and inspection",
      "CDN and static asset delivery",
      "DNS resolution and TLS certificate status"
    ],
    scopeGated: "Authenticated (sign-in required)",
    scopeGatedItems: [
      "Runtime invocation latency and success rate",
      "Project-specific key validation",
      "Billing and payment processing",
      "Publisher review queue status",
      "Admin and operator dashboards"
    ],
    ctaTitle: "Need a live check?",
    ctaBody: "Open the marketplace, call the health endpoint, or contact support if a route is not responding.",
    ctaPrimary: "Marketplace",
    ctaSecondary: "Agent integration"
  },
  zh: {
    eyebrow: "状态",
    title: "SkillHub 状态。",
    degradedTitle: "SkillHub 状态需要处理。",
    subtitle: "公开健康信号",
    body: "本页从网关读取实时平台检查，包括数据库、迁移、支付、OAuth、邮件和提示词模型配置。",
    api: "API 健康端点",
    support: "获取支持",
    servicesEyebrow: "服务",
    servicesTitle: "基础设施状态",
    checkedAt: "检查时间",
    degraded: "需处理",
    operational: "正常",
    metricsEyebrow: "性能",
    metricsTitle: "平台指标",
    metrics: [
      { label: "API 响应时间", value: "健康检查", desc: "公开 API 健康端点可用于运行确认" },
      { label: "技能 API 查询", value: "已观测", desc: "技能搜索和 manifest 检查纳入公开可用性监控" },
      { label: "运行时网关", value: "需登录", desc: "运行时检查需要认证后的项目上下文" },
      { label: "静态资源", value: "CDN", desc: "静态资源交付纳入部署验证" }
    ],
    incidentsEyebrow: "近期事件",
    incidentsTitle: "当前事件说明",
    currentNote: "状态摘要来自实时 readiness 检查。如果某个依赖的异常阻塞业务，请联系支持。",
    scopeEyebrow: "监控范围",
    scopeTitle: "公开监控 vs. 认证后",
    scopePublic: "公开监控",
    scopePublicItems: [
      "Web 应用可用性和响应时间",
      "公开 API 健康和搜索延迟",
      "技能 API 发现和检查",
      "CDN 和静态资源分发",
      "DNS 解析和 TLS 证书状态"
    ],
    scopeGated: "认证后（需要登录）",
    scopeGatedItems: [
      "运行时调用延迟和成功率",
      "项目级 Key 验证",
      "账单和支付处理",
      "发布者审核队列状态",
      "管理员和运营仪表板"
    ],
    ctaTitle: "需要实时确认？",
    ctaBody: "可以打开市场、调用健康端点，或在路由无响应时联系支持。",
    ctaPrimary: "市场",
    ctaSecondary: "Agent 集成"
  }
} as const;

const serviceIconMap: Record<string, React.FC<{ size: number; className?: string }>> = {
  globe: Globe,
  server: Server,
  database: Database,
  network: Network,
  cloud: Cloud,
  shield: ShieldCheck
};

export default async function StatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const apiUrl = getPublicApiUrl();
  const status = await getLiveStatus(locale);
  const overallOperational = status.overall === "operational";

  return (
    <AppShell active="status" locale={locale}>
      {/* Hero */}
      <section className="pt-32 pb-[96px]">
        <div className="section-inner text-center hero-glow">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center justify-center gap-2">
              <Activity size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </p>
            <h1 className="heading-xl mb-3">{overallOperational ? labels.title : labels.degradedTitle}</h1>
            <p className="text-[18px] text-[#999] mb-6">{labels.subtitle}</p>
            <p className="body-text max-w-[640px] mx-auto mb-10">{labels.body}</p>

            {/* Live status badge */}
            <div className={`inline-flex items-center gap-2 ${overallOperational ? "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]" : "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.25)]"} border rounded-full px-4 py-2 mb-10`}>
              <span className="pulse-dot" aria-hidden="true" />
              <span className={`text-[13px] ${overallOperational ? "text-[#10b981]" : "text-[#f59e0b]"} font-medium`}>
                {overallOperational ? labels.operational : labels.degraded}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a className="btn-primary btn-primary--large" href={`${apiUrl}/health`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} aria-hidden="true" />
                <span>{labels.api}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/support", locale)}>
                <LifeBuoy size={18} aria-hidden="true" />
                <span>{labels.support}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-[96px] section-divider">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <Server size={16} aria-hidden="true" />
              <span>{labels.servicesEyebrow}</span>
            </p>
            <h2 className="heading-lg mb-10">{labels.servicesTitle}</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {status.services.map((service, i) => {
              const Icon = serviceIconMap[service.key] || Activity;
              const isOperational = service.status === "operational";
              return (
                <Reveal key={service.name} delay={i * 60}>
                  <article className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-[10px] ${isOperational ? "bg-[rgba(16,185,129,0.08)]" : "bg-[rgba(245,158,11,0.08)]"} flex items-center justify-center`}>
                        <Icon size={20} className={isOperational ? "text-[#10b981]" : "text-[#f59e0b]"} aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="pulse-dot" aria-hidden="true" />
                        <span className={`text-[12px] ${isOperational ? "text-[#10b981]" : "text-[#f59e0b]"} font-medium`}>
                          {isOperational ? labels.operational : labels.degraded}
                        </span>
                      </div>
                    </div>
                    <h3 className="heading-sm mb-2">{service.name}</h3>
                    <p className="body-text-sm mb-3">{service.desc}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[12px] text-[#666]">
                        {labels.checkedAt}:
                      </span>
                      <span className="text-[12px] font-medium text-[#10b981]">{formatCheckedAt(status.checkedAt, locale)}</span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent incidents */}
      <section className="py-[96px] section-divider">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <Clock size={16} aria-hidden="true" />
              <span>{labels.incidentsEyebrow}</span>
            </p>
            <h2 className="heading-lg mb-8">{labels.incidentsTitle}</h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="card">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className={overallOperational ? "text-[#10b981]" : "text-[#f59e0b]"} aria-hidden="true" />
                <div>
                  <p className="text-[14px] font-medium text-white">{formatCheckedAt(status.checkedAt, locale)}</p>
                  <p className="text-[13px] text-[#999]">{labels.currentNote}</p>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Monitoring scope */}
      <section className="py-[96px] section-divider">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <Wifi size={16} aria-hidden="true" />
              <span>{labels.scopeEyebrow}</span>
            </p>
            <h2 className="heading-lg mb-10">{labels.scopeTitle}</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <div className="card h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-[#7fee64]" aria-hidden="true" />
                  <h3 className="heading-sm">{labels.scopePublic}</h3>
                </div>
                <ul className="space-y-3">
                  {labels.scopePublicItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#10b981] mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="body-text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="card h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={18} className="text-[#f59e0b]" aria-hidden="true" />
                  <h3 className="heading-sm">{labels.scopeGated}</h3>
                </div>
                <ul className="space-y-3">
                  {labels.scopeGatedItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Lock size={14} className="text-[#525252] mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="body-text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{labels.ctaTitle}</h2>
            <p className="body-text max-w-[480px] mx-auto mb-8">{labels.ctaBody}</p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{labels.ctaPrimary}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/prompts", locale)}>
                <span>{labels.ctaSecondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}

type LiveStatus = {
  checkedAt: string;
  overall: "degraded" | "operational";
  services: Array<{
    desc: string;
    key: string;
    name: string;
    status: "degraded" | "operational";
  }>;
};

async function getLiveStatus(locale: "en" | "zh"): Promise<LiveStatus> {
  try {
    const response = await fetch(`${getServerApiUrl()}/v1/status`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      status?: {
        checkedAt?: string;
        overall?: "degraded" | "operational";
        services?: Array<{
          description?: string;
          key?: string;
          status?: "degraded" | "operational";
          title?: string;
        }>;
      };
    };

    return {
      checkedAt: payload.status?.checkedAt ?? new Date().toISOString(),
      overall: payload.status?.overall ?? "degraded",
      services: (payload.status?.services ?? []).map((service) => ({
        desc: localizeServiceDescription(service.description, locale),
        key: service.key ?? "server",
        name: localizeServiceName(service.title, locale),
        status: service.status ?? "degraded",
      })),
    };
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      overall: "degraded",
      services: [
        {
          desc: error instanceof Error ? error.message : "Status API is unavailable.",
          key: "server",
          name: locale === "zh" ? "状态 API" : "Status API",
          status: "degraded",
        },
      ],
    };
  }
}

function localizeServiceName(value: string | undefined, locale: "en" | "zh") {
  if (locale === "en") {
    return value ?? "Service";
  }

  const labels: Record<string, string> = {
    Database: "数据库",
    "Database migrations": "数据库迁移",
    "Email delivery": "邮件投递",
    "OAuth login": "OAuth 登录",
    "Payment providers": "支付供应商",
    "Prompt models": "提示词模型",
    "Public web": "公开网站",
  };

  return value ? (labels[value] ?? value) : "服务";
}

function localizeServiceDescription(value: string | undefined, locale: "en" | "zh") {
  if (locale === "en") {
    return value ?? "No status detail returned.";
  }

  if (!value) {
    return "没有返回状态详情。";
  }

  return value
    .replace("Public web routes are served by the web deployment.", "公开页面由 Web 部署提供服务。")
    .replace("Gateway can query the primary Postgres database.", "网关可以查询主 Postgres 数据库。")
    .replace("Required platform configuration migrations are present.", "必需的平台配置迁移已存在。")
    .replace("No active payment provider is configured.", "没有启用的支付供应商。")
    .replace("OAuth login providers are not active.", "OAuth 登录供应商未启用。")
    .replace("Email provider is not active.", "邮件供应商未启用。")
    .replace("No active prompt model is configured.", "没有启用的提示词模型。");
}

function formatCheckedAt(value: string, locale: "en" | "zh") {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}
