import type { Locale } from "@/lib/i18n";

export type DataStatus =
  | "connected_has_data"
  | "connected_no_data"
  | "not_connected"
  | "partial"
  | "error"
  | "delayed"
  | "unknown_scope";

export type StatusSeverity = "healthy" | "info" | "warning" | "critical" | "muted";

export type DataStatusTone = "amber" | "blue" | "gray" | "green" | "purple" | "red";

export interface DataSourceState {
  errorMessage?: string | null;
  href?: string;
  id: string;
  impact?: string;
  label: string;
  lastUpdated?: string | null;
  nextAction?: string;
  severity: StatusSeverity;
  source?: string;
  status: DataStatus;
}

export interface OpsMetric {
  description?: string;
  displayValue: string;
  href?: string;
  id: string;
  impact?: string;
  label: string;
  lastUpdated?: string | null;
  nextAction?: string;
  severity: StatusSeverity;
  source: string;
  status: DataStatus;
  trend?: {
    direction: "down" | "flat" | "unknown" | "up";
    label: string;
    percentage?: number | null;
  };
  unit?: string;
  value: number | string | null;
}

export interface ReadinessCheck {
  blocking: boolean;
  href?: string;
  id: string;
  impact: string;
  label: string;
  maxScore: number;
  nextAction: string;
  owner?: string;
  score: number;
  status: "fail" | "not_configured" | "pass" | "warning";
}

export interface FunnelStep {
  confidence: "high" | "low" | "medium" | "none";
  conversionFromPrevious: number | null;
  conversionFromStart: number | null;
  dropoffFromPrevious: number | null;
  href?: string;
  id: string;
  label: string;
  nextAction?: string;
  order: number;
  source: string;
  status: DataStatus;
  unit: "events" | "orders" | "sessions" | "usd" | "users";
  value: number | null;
}

export type BusinessHealthStatus = "critical" | "healthy" | "prelaunch" | "warning";

export interface BusinessHealthInput {
  apiHealthy: boolean;
  cloudflareStatus: DataStatus;
  hasCriticalAlerts: boolean;
  paymentMode: "disabled" | "prelaunch" | "production" | "test";
  paymentWebhookStatus: DataStatus;
  projectKeyEventStatus: DataStatus;
  skillViewEventStatus: DataStatus;
  webhookStatus: DataStatus;
}

export interface BusinessHealthResult {
  blockers: string[];
  impacts: string[];
  status: BusinessHealthStatus;
  summary: string;
  title: string;
  warnings: string[];
}

const DATA_STATUS_LABELS: Record<DataStatus, Record<Locale, string>> = {
  connected_has_data: { en: "Connected", zh: "已接入" },
  connected_no_data: { en: "Connected, no events", zh: "已接入，无事件" },
  delayed: { en: "Delayed", zh: "数据延迟" },
  error: { en: "Integration error", zh: "接入异常" },
  not_connected: { en: "Pending", zh: "未接入" },
  partial: { en: "Partial", zh: "部分接入" },
  unknown_scope: { en: "Scope pending", zh: "口径待确认" }
};

const DATA_STATUS_TONES: Record<DataStatus, DataStatusTone> = {
  connected_has_data: "green",
  connected_no_data: "gray",
  delayed: "amber",
  error: "red",
  not_connected: "amber",
  partial: "amber",
  unknown_scope: "blue"
};

export function getDataStatusLabel(status: DataStatus, locale: Locale = "en") {
  return DATA_STATUS_LABELS[status][locale];
}

export function getDataStatusTone(status: DataStatus): DataStatusTone {
  return DATA_STATUS_TONES[status];
}

export function isMetricActionable(metric: OpsMetric) {
  return metric.status === "error" || metric.status === "not_connected" || metric.status === "partial" || metric.severity === "critical";
}

export function calculateReadinessScore(checks: ReadinessCheck[]): number {
  const score = checks.reduce((sum, check) => sum + check.score, 0);
  const max = checks.reduce((sum, check) => sum + check.maxScore, 0);

  if (max <= 0) {
    return 0;
  }

  return Math.round((score / max) * 100);
}

export function deriveLaunchRecommendation(checks: ReadinessCheck[], locale: Locale) {
  const blockingFails = checks.filter(
    (check) => check.blocking && (check.status === "fail" || check.status === "not_configured")
  );

  if (blockingFails.length > 0) {
    return locale === "zh" ? "不建议正式放量" : "Do not scale launch yet";
  }

  const warnings = checks.filter((check) => check.status === "warning");

  if (warnings.length > 0) {
    return locale === "zh" ? "可小流量观察，不建议大规模推广" : "Small traffic only; do not scale broadly";
  }

  return locale === "zh" ? "可进入正式放量" : "Ready for scaled launch";
}

export function calculateStepConversion(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous <= 0) {
    return null;
  }

  return current / previous;
}

export function calculateDropoff(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous <= 0) {
    return null;
  }

  return Math.max(0, previous - current);
}

export function formatPercent(value: number | null, locale: Locale) {
  if (value == null || Number.isNaN(value)) {
    return locale === "zh" ? "无法计算" : "Not computable";
  }

  return `${(value * 100).toFixed(2)}%`;
}

export function deriveBusinessHealth(input: BusinessHealthInput, locale: Locale): BusinessHealthResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const impacts: string[] = [];

  if (!input.apiHealthy) {
    blockers.push(locale === "zh" ? "API 不健康" : "API is unhealthy");
    impacts.push(locale === "zh" ? "登录、数据读取和后台操作可能受影响" : "Sign-in, data reads, and admin actions may be affected");
  }

  if (input.paymentMode !== "production") {
    warnings.push(locale === "zh" ? "支付仍处于预发布或未配置" : "Payments are still prelaunch or unconfigured");
    impacts.push(locale === "zh" ? "GMV、订单和分账数据不可作为完整经营判断" : "GMV, orders, and revenue splits are not fully reliable");
  }

  if (input.cloudflareStatus !== "connected_has_data") {
    warnings.push(locale === "zh" ? "Cloudflare 国家/地区和边缘数据未完整接入" : "Cloudflare country and edge analytics are not fully available");
    impacts.push(locale === "zh" ? "地区、缓存、WAF 和安全事件分析不完整" : "Country, cache, WAF, and edge security analysis is incomplete");
  }

  if (input.webhookStatus === "not_connected") {
    warnings.push(locale === "zh" ? "Webhook 未连接" : "Webhook is not connected");
    impacts.push(locale === "zh" ? "订单状态、支付回调和自动化处理可能不完整" : "Order state, payment callback, and automation may be incomplete");
  }

  if (input.projectKeyEventStatus === "not_connected") {
    blockers.push(locale === "zh" ? "Project Key 事件未接入" : "Project Key events are not connected");
    impacts.push(locale === "zh" ? "无法判断注册后的开发者激活率" : "Cannot judge developer activation after registration");
  }

  if (input.skillViewEventStatus === "not_connected") {
    blockers.push(locale === "zh" ? "技能浏览事件未接入" : "Skill browsing events are not connected");
    impacts.push(locale === "zh" ? "无法判断找技能到安装的转化" : "Cannot judge Find Skills view-to-install conversion");
  }

  if (input.paymentWebhookStatus === "not_connected") {
    blockers.push(locale === "zh" ? "支付回调未连接" : "Payment callback is not connected");
    impacts.push(locale === "zh" ? "GMV、订单状态、退款和分账口径不可完全信任" : "GMV, order state, refunds, and splits are not fully trustworthy");
  }

  if (input.hasCriticalAlerts) {
    blockers.push(locale === "zh" ? "存在严重告警" : "Critical alerts are active");
  }

  if (!input.apiHealthy || input.hasCriticalAlerts) {
    return {
      blockers,
      impacts: uniqueStrings(impacts),
      status: "critical",
      summary: locale === "zh" ? "存在影响后台操作或生产可用性的严重问题。" : "A production or admin-operability critical issue is active.",
      title: locale === "zh" ? "今日经营状态：严重预警" : "Business status: Critical",
      warnings
    };
  }

  if (input.paymentMode === "prelaunch" || blockers.length > 0 || warnings.length > 0) {
    return {
      blockers,
      impacts: uniqueStrings(impacts),
      status: "prelaunch",
      summary: locale === "zh" ? "核心访问数据可观察，但仍有配置或事件接入未完成。" : "Core traffic is observable, but several integrations or events are still pending.",
      title: locale === "zh" ? "今日经营状态：Prelaunch 预警" : "Business status: Prelaunch warning",
      warnings
    };
  }

  return {
    blockers,
    impacts: uniqueStrings(impacts),
    status: "healthy",
    summary: locale === "zh" ? "核心数据源已接入，当前未发现阻塞风险。" : "Core data sources are connected and no blockers are visible.",
    title: locale === "zh" ? "今日经营状态：正常" : "Business status: Healthy",
    warnings
  };
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items));
}
