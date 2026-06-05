import { FileClock, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { AdminAuditLogRecord } from "@/lib/ops-data";

type AdminAuditLogPanelProps = {
  logs: AdminAuditLogRecord[];
  locale: Locale;
};

const copy = {
  en: {
    actor: "Actor",
    empty: "No audit log entries recorded yet.",
    entity: "Entity",
    metadata: "Metadata",
    reason: "Reason",
    system: "System",
    title: "Audit stream"
  },
  zh: {
    actor: "\u64cd\u4f5c\u4eba",
    empty: "\u8fd8\u6ca1\u6709\u5ba1\u8ba1\u65e5\u5fd7\u3002",
    entity: "\u5bf9\u8c61",
    metadata: "\u5143\u6570\u636e",
    reason: "\u539f\u56e0",
    system: "\u7cfb\u7edf",
    title: "\u5ba1\u8ba1\u6d41"
  }
} as const;

export function AdminAuditLogPanel({ logs, locale }: AdminAuditLogPanelProps) {
  const labels = copy[locale];

  return (
    <aside className="ops-panel admin-audit-panel">
      <div className="card-kicker">
        <FileClock size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="audit-list admin-audit-log-list">
        {logs.length > 0 ? (
          logs.map((log) => (
            <article className="audit-row admin-audit-log-row" key={log.id}>
              <ShieldCheck size={16} aria-hidden="true" />
              <div>
                <header>
                  <strong>{humanizeAction(log.action)}</strong>
                  <span>{formatDate(log.createdAt, locale)}</span>
                </header>
                <dl>
                  <div>
                    <dt>{labels.entity}</dt>
                    <dd>{log.entityType}{log.entityId ? ` / ${shortId(log.entityId)}` : ""}</dd>
                  </div>
                  <div>
                    <dt>{labels.actor}</dt>
                    <dd>{log.actorDisplayName ?? log.actorEmail ?? labels.system}</dd>
                  </div>
                  <div>
                    <dt>{labels.reason}</dt>
                    <dd>{log.reason ?? "n/a"}</dd>
                  </div>
                  <div>
                    <dt>{labels.metadata}</dt>
                    <dd>{metadataSummary(log.metadata)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-audit-empty">{labels.empty}</div>
        )}
      </div>
    </aside>
  );
}

function humanizeAction(action: string) {
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" / ");
}

function metadataSummary(metadata: Record<string, unknown>) {
  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 3);

  if (entries.length === 0) {
    return "n/a";
  }

  return entries.map(([key, value]) => `${key}: ${formatMetadataValue(value)}`).join(" / ");
}

function formatMetadataValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.slice(0, 3).map(formatMetadataValue).join(",");
  }

  if (typeof value === "object" && value !== null) {
    return "object";
  }

  return String(value);
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function formatDate(value: string, locale: Locale) {
  if (value === "demo") {
    return locale === "zh" ? "\u6f14\u793a\u65f6\u95f4" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
