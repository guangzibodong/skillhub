import { AlertTriangle, CheckCircle2, Clock3, Rocket, ShieldAlert } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { LaunchReadinessItem, LaunchReadinessReport, LaunchReadinessStatus } from "@/lib/ops-data";

type AdminLaunchReadinessPanelProps = {
  locale: Locale;
  readiness: LaunchReadinessReport;
};

const copy = {
  en: {
    checked: "Checked",
    empty: "Launch readiness data is unavailable.",
    environment: "Environment",
    title: "Launch readiness",
    statusLabels: {
      blocker: "Blocker",
      deferred: "Deferred",
      ready: "Ready",
      warning: "Warning"
    },
    summaryLabels: {
      blocker: "Blockers",
      deferred: "Deferred",
      ready: "Ready",
      warning: "Warnings"
    }
  },
  zh: {
    checked: "\u68c0\u67e5\u65f6\u95f4",
    empty: "\u6682\u65e0\u4e0a\u7ebf\u5c31\u7eea\u6570\u636e\u3002",
    environment: "\u73af\u5883",
    title: "\u4e0a\u7ebf\u5c31\u7eea\u5ea6",
    statusLabels: {
      blocker: "\u963b\u65ad",
      deferred: "\u5ef6\u540e",
      ready: "\u5c31\u7eea",
      warning: "\u63d0\u9192"
    },
    summaryLabels: {
      blocker: "\u963b\u65ad",
      deferred: "\u5ef6\u540e",
      ready: "\u5c31\u7eea",
      warning: "\u63d0\u9192"
    }
  }
} as const;

export function AdminLaunchReadinessPanel({ locale, readiness }: AdminLaunchReadinessPanelProps) {
  const labels = copy[locale];
  const visibleSections = readiness.sections.filter((section) => section.items.length > 0);
  const checkedAt = formatDate(readiness.checkedAt, locale);

  return (
    <article className="ops-panel launch-readiness-panel">
      <header className="launch-readiness-head">
        <div>
          <div className="card-kicker">
            <Rocket size={16} aria-hidden="true" />
            <span>{labels.title}</span>
          </div>
          <div className="launch-readiness-env">
            <span>{labels.environment}: {readiness.environment.runtime}</span>
            <span>{readiness.environment.appUrl ?? "app:n/a"}</span>
            <span>{labels.checked}: {checkedAt}</span>
          </div>
        </div>
        <span className={statusClass(readiness.summary.status)}>{labels.statusLabels[readiness.summary.status]}</span>
      </header>

      <div className="launch-readiness-summary">
        <SummaryItem label={labels.summaryLabels.blocker} status="blocker" value={readiness.summary.blocker} />
        <SummaryItem label={labels.summaryLabels.warning} status="warning" value={readiness.summary.warning} />
        <SummaryItem label={labels.summaryLabels.ready} status="ready" value={readiness.summary.ready} />
        <SummaryItem label={labels.summaryLabels.deferred} status="deferred" value={readiness.summary.deferred} />
      </div>

      {visibleSections.length > 0 ? (
        <div className="launch-readiness-sections">
          {visibleSections.map((section) => (
            <section className="launch-readiness-section" key={section.key}>
              <div className="launch-readiness-section__head">
                <strong>{section.title}</strong>
                <span className={statusClass(section.status)}>{labels.statusLabels[section.status]}</span>
              </div>

              <div className="launch-readiness-items">
                {section.items.map((item) => (
                  <ReadinessItem item={item} key={item.key} labels={labels} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="launch-readiness-empty">{labels.empty}</div>
      )}
    </article>
  );
}

function SummaryItem({ label, status, value }: { label: string; status: LaunchReadinessStatus; value: number }) {
  const Icon = statusIcon(status);

  return (
    <div className={`launch-readiness-summary__item launch-readiness-summary__item--${status}`}>
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReadinessItem({
  item,
  labels
}: {
  item: LaunchReadinessItem;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
}) {
  const Icon = statusIcon(item.status);

  return (
    <div className={`launch-readiness-item launch-readiness-item--${item.status}`}>
      <Icon size={16} aria-hidden="true" />
      <div>
        <div className="launch-readiness-item__title">
          <strong>{item.label}</strong>
          <span className={statusClass(item.status)}>{labels.statusLabels[item.status]}</span>
        </div>
        <p>{item.description}</p>
        <span>{item.detail}</span>
        <em>{item.action}</em>
      </div>
    </div>
  );
}

function statusIcon(status: LaunchReadinessStatus) {
  if (status === "ready") {
    return CheckCircle2;
  }

  if (status === "blocker") {
    return ShieldAlert;
  }

  if (status === "deferred") {
    return Clock3;
  }

  return AlertTriangle;
}

function statusClass(status: LaunchReadinessStatus) {
  if (status === "ready") {
    return "status-chip status-chip--success";
  }

  if (status === "blocker") {
    return "status-chip status-chip--danger";
  }

  if (status === "deferred") {
    return "status-chip status-chip--neutral";
  }

  return "status-chip status-chip--warning";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

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
