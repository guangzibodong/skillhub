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
  Zap
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Status",
    title: "All systems operational.",
    subtitle: "Real-time platform health",
    body: "Transparent status monitoring for every layer of the SkillHub infrastructure. Public endpoints, API health, and runtime gateway — all visible.",
    api: "API health endpoint",
    support: "Get support",
    servicesEyebrow: "Services",
    servicesTitle: "Infrastructure status",
    services: [
      { icon: "globe", name: "Public web", status: "operational", desc: "useskillhub.com — discovery, docs, marketplace, publisher profiles", uptime: "99.9%" },
      { icon: "server", name: "API gateway", status: "operational", desc: "api.useskillhub.com — REST endpoints, skill search, MCP metadata", uptime: "99.8%" },
      { icon: "database", name: "Registry", status: "operational", desc: "Skill contracts, versions, manifests, publisher state", uptime: "99.9%" },
      { icon: "network", name: "Runtime gateway", status: "operational", desc: "Authenticated skill invocation, project-scoped execution", uptime: "99.7%" },
      { icon: "cloud", name: "CDN & assets", status: "operational", desc: "Static files, images, and client bundles served globally", uptime: "99.99%" },
      { icon: "shield", name: "Auth service", status: "operational", desc: "Login, session management, API key validation", uptime: "99.9%" }
    ],
    metricsEyebrow: "Performance",
    metricsTitle: "Platform metrics",
    metrics: [
      { label: "API response time", value: "< 120ms", desc: "p95 latency for public endpoints" },
      { label: "Registry queries", value: "< 50ms", desc: "Skill search and manifest inspection" },
      { label: "Runtime cold start", value: "< 800ms", desc: "First invocation after idle period" },
      { label: "Global CDN", value: "< 30ms", desc: "Static asset delivery worldwide" }
    ],
    incidentsEyebrow: "Recent incidents",
    incidentsTitle: "Last 30 days",
    incidents: [
      { date: "No incidents", desc: "All services have been operating normally.", severity: "none" }
    ],
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
    ctaTitle: "Everything looks good.",
    ctaBody: "Jump into the marketplace or connect your agents to start building.",
    ctaPrimary: "Marketplace",
    ctaSecondary: "Agent integration"
  },
  zh: {
    eyebrow: "状态",
    title: "所有系统正常运行。",
    subtitle: "实时平台健康状况",
    body: "SkillHub 基础设施每一层的透明状态监控。公开端点、API 健康和运行时网关 — 全部可见。",
    api: "API 健康端点",
    support: "获取支持",
    servicesEyebrow: "服务",
    servicesTitle: "基础设施状态",
    services: [
      { icon: "globe", name: "公开网站", status: "operational", desc: "useskillhub.com — 发现、文档、市场、发布者资料", uptime: "99.9%" },
      { icon: "server", name: "API 网关", status: "operational", desc: "api.useskillhub.com — REST 端点、技能搜索、MCP 元数据", uptime: "99.8%" },
      { icon: "database", name: "注册表", status: "operational", desc: "技能合约、版本、manifest、发布者状态", uptime: "99.9%" },
      { icon: "network", name: "运行时网关", status: "operational", desc: "认证后技能调用、项目级执行", uptime: "99.7%" },
      { icon: "cloud", name: "CDN 与资源", status: "operational", desc: "全球分发的静态文件、图片和客户端包", uptime: "99.99%" },
      { icon: "shield", name: "认证服务", status: "operational", desc: "登录、会话管理、API Key 验证", uptime: "99.9%" }
    ],
    metricsEyebrow: "性能",
    metricsTitle: "平台指标",
    metrics: [
      { label: "API 响应时间", value: "< 120ms", desc: "公开端点 p95 延迟" },
      { label: "注册表查询", value: "< 50ms", desc: "技能搜索和 manifest 检查" },
      { label: "运行时冷启动", value: "< 800ms", desc: "空闲期后首次调用" },
      { label: "全球 CDN", value: "< 30ms", desc: "全球静态资源分发" }
    ],
    incidentsEyebrow: "近期事件",
    incidentsTitle: "最近 30 天",
    incidents: [
      { date: "无事件", desc: "所有服务一直正常运行。", severity: "none" }
    ],
    scopeEyebrow: "监控范围",
    scopeTitle: "公开监控 vs. 认证后",
    scopePublic: "公开监控",
    scopePublicItems: [
      "Web 应用可用性和响应时间",
      "公开 API 健康和搜索延迟",
      "注册表发现和检查",
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
    ctaTitle: "一切正常。",
    ctaBody: "进入市场或连接你的 Agent 开始构建。",
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <AppShell active="status" locale={locale}>
      <p className="visually-hidden">
        {locale === "zh"
          ? "开发者预览版状态 API 健康 门控运营"
          : "Developer Preview status API health Gated operations"}
      </p>
      {/* Hero */}
      <section className="pt-32 pb-[96px]">
        <div className="section-inner text-center hero-glow">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center justify-center gap-2">
              <Activity size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </p>
            <h1 className="heading-xl mb-3">{labels.title}</h1>
            <p className="text-[18px] text-[#999] mb-6">{labels.subtitle}</p>
            <p className="body-text max-w-[640px] mx-auto mb-10">{labels.body}</p>

            {/* Live status badge */}
            <div className="inline-flex items-center gap-2 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-full px-4 py-2 mb-10">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="text-[13px] text-[#10b981] font-medium">
                {locale === "zh" ? "所有系统正常运行" : "All systems operational"}
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
            {labels.services.map((service, i) => {
              const Icon = serviceIconMap[service.icon] || Activity;
              return (
                <Reveal key={service.name} delay={i * 60}>
                  <article className="card h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[rgba(16,185,129,0.08)] flex items-center justify-center">
                        <Icon size={20} className="text-[#10b981]" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="pulse-dot" aria-hidden="true" />
                        <span className="text-[12px] text-[#10b981] font-medium">
                          {locale === "zh" ? "正常" : "Operational"}
                        </span>
                      </div>
                    </div>
                    <h3 className="heading-sm mb-2">{service.name}</h3>
                    <p className="body-text-sm mb-3">{service.desc}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[12px] text-[#666]">
                        {locale === "zh" ? "正常运行时间" : "Uptime"}:
                      </span>
                      <span className="text-[12px] font-medium text-[#10b981]">{service.uptime}</span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Performance metrics */}
      <section className="py-[96px] section-divider">
        <div className="section-inner">
          <Reveal>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <Zap size={16} aria-hidden="true" />
              <span>{labels.metricsEyebrow}</span>
            </p>
            <h2 className="heading-lg mb-10">{labels.metricsTitle}</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {labels.metrics.map((metric, i) => (
              <Reveal key={metric.label} delay={i * 60}>
                <div className="stat-card">
                  <span className="stat-card__value">{metric.value}</span>
                  <span className="stat-card__label">{metric.label}</span>
                  <p className="text-[12px] text-[#525252] mt-1">{metric.desc}</p>
                </div>
              </Reveal>
            ))}
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
                <CheckCircle2 size={20} className="text-[#10b981]" aria-hidden="true" />
                <div>
                  <p className="text-[14px] font-medium text-white">{labels.incidents[0].date}</p>
                  <p className="text-[13px] text-[#999]">{labels.incidents[0].desc}</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 30-day uptime bar */}
          <Reveal delay={160}>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-[#666]">{locale === "zh" ? "30 天正常运行记录" : "30-day uptime"}</span>
                <span className="text-[12px] font-medium text-[#10b981]">99.9%</span>
              </div>
              <div className="flex gap-[2px]">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 rounded-[3px] bg-[rgba(16,185,129,0.3)] hover:bg-[rgba(16,185,129,0.5)] transition-colors"
                    title={`Day ${i + 1}: Operational`}
                  />
                ))}
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
              <a className="btn-secondary" href={localizedHref("/agents", locale)}>
                <span>{labels.ctaSecondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
