"use client";

import { useActionState, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  ListFilter,
  Save,
  ServerCog,
  ShieldAlert,
  Tags,
  UserRound,
  XCircle
} from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import type { AdminReviewRecord } from "@/lib/ops-data";
import { decideAdminReviewAction, type AdminReviewActionState } from "@/lib/admin-review-actions";

type AdminReviewManagerProps = {
  locale: Locale;
  reviews: AdminReviewRecord[];
};

type ReviewFilter = "all" | "blockers" | "high_risk" | "sla" | "warnings";
type ReviewSort = "due_first" | "oldest" | "priority" | "risk";
type ReviewPriorityTone = "danger" | "neutral" | "ready" | "warning";

type PrioritizedReview = {
  index: number;
  priority: {
    detail: string;
    label: string;
    reasons: string[];
    score: number;
    tone: ReviewPriorityTone;
  };
  review: AdminReviewRecord;
};

const copy = {
  en: {
    approve: "Approve",
    block: "Block",
    checks: "Automated checks",
    checkLabels: {
      example: "Example",
      manifest: "Manifest",
      runtime: "Runtime",
      security: "Security"
    },
    checkStatusLabels: {
      failed: "Failed",
      passed: "Passed",
      queued: "Queued",
      running: "Running",
      warning: "Warning"
    },
    blocking: "Blocking",
    advisory: "Reviewer note",
    nextAction: "Next action",
    targetField: "Target",
    created: "Submitted",
    decision: "Decision",
    decisionHelp:
      "Choose deliberately. Approval can make the version eligible for public listing; rejection or blocking returns work to the publisher.",
    chooseDecision: "Choose decision",
    confirmDecision: {
      approved: "Approve {skill}? This can make the version eligible for public marketplace listing after launch checks.",
      blocked: "Block {skill}? The publisher will need to repair the listed evidence before review can continue.",
      rejected: "Reject {skill}? The version will return to the publisher as not approved."
    },
    decisionButtons: {
      approved: "Approve and record",
      blocked: "Block review",
      rejected: "Reject version"
    },
    empty: "No skill reviews need operator action.",
    emptyFiltered: "No reviews match this queue view.",
    filters: {
      all: "All",
      blockers: "Blocking checks",
      high_risk: "High risk",
      sla: "SLA pressure",
      warnings: "Warnings"
    },
    filterLabel: "Queue view",
    notes: "Reviewer notes",
    priority: {
      detail: {
        danger: "Handle before normal queue work; this review is already late or blocked by evidence.",
        neutral: "Keep in normal queue order unless the publisher asks for follow-up.",
        ready: "Automated evidence is clean enough for a reviewer decision.",
        warning: "Needs focused reviewer judgment before it can become trusted supply."
      },
      labels: {
        blocking: "Blocked by checks",
        decided: "Already decided",
        dueSoon: "Due soon",
        highRisk: "High-risk review",
        missingChecks: "Missing evidence",
        overdue: "Overdue",
        ready: "Ready to decide",
        waiting: "Normal queue",
        warning: "Warning review"
      },
      reasons: {
        blockedStatus: "Blocked review state",
        blocking: "Blocking automated check",
        dueSoon: "SLA due within 24h",
        highRisk: "High-risk permission profile",
        missingChecks: "No automated check evidence",
        old: "Aging in queue",
        openChecks: "Check still queued or running",
        overdue: "SLA breached",
        warning: "Warning needs reviewer notes"
      },
      score: "Priority"
    },
    priorityLabel: "Recommended priority",
    queueAge: "Queue age",
    reject: "Reject",
    resultCount: "Showing",
    risk: "Risk",
    save: "Record decision",
    saving: "Saving",
    sla: "Review SLA",
    slaStatuses: {
      decided: "Decided",
      due_soon: "Due soon",
      not_submitted: "Not submitted",
      on_track: "On track",
      overdue: "Overdue"
    },
    sort: {
      due_first: "SLA due first",
      oldest: "Oldest submitted",
      priority: "Recommended priority",
      risk: "Highest risk"
    },
    sortLabel: "Sort",
    status: "Status",
    summary: {
      blockers: "blocking",
      highRisk: "high risk",
      ready: "ready",
      sla: "SLA pressure",
      total: "reviews",
      warnings: "warnings"
    },
    title: "Skill review queue",
    version: "Version",
    viewSkill: "Open listing"
  },
  zh: {
    approve: "批准",
    block: "阻断",
    checks: "自动检查",
    checkLabels: {
      example: "示例",
      manifest: "清单",
      runtime: "运行时",
      security: "安全"
    },
    checkStatusLabels: {
      failed: "失败",
      passed: "通过",
      queued: "排队",
      running: "运行中",
      warning: "警告"
    },
    blocking: "阻塞",
    advisory: "人工确认",
    nextAction: "下一步",
    targetField: "字段",
    created: "提交时间",
    decision: "审核决定",
    empty: "当前没有需要处理的技能审核。",
    emptyFiltered: "当前筛选下没有匹配的审核。",
    filters: {
      all: "全部",
      blockers: "阻塞检查",
      high_risk: "高风险",
      sla: "SLA 压力",
      warnings: "警告"
    },
    filterLabel: "队列视图",
    notes: "审核备注",
    priority: {
      detail: {
        danger: "先于普通队列处理；这条审核已经超时或被证据阻塞。",
        neutral: "保持正常队列顺序，除非发布者主动跟进。",
        ready: "自动证据已经足够干净，可以进入人工决定。",
        warning: "需要审核员集中判断，才能成为可信供给。"
      },
      labels: {
        blocking: "检查阻塞",
        decided: "已决定",
        dueSoon: "即将到期",
        highRisk: "高风险审核",
        missingChecks: "缺少证据",
        overdue: "已超期",
        ready: "可做决定",
        waiting: "正常排队",
        warning: "警告审核"
      },
      reasons: {
        blockedStatus: "审核已阻断",
        blocking: "自动检查阻塞",
        dueSoon: "24 小时内到期",
        highRisk: "高风险权限画像",
        missingChecks: "没有自动检查证据",
        old: "排队时间较长",
        openChecks: "检查仍在排队或运行",
        overdue: "SLA 已超期",
        warning: "警告需要审核备注"
      },
      score: "优先级"
    },
    priorityLabel: "推荐优先级",
    queueAge: "排队时长",
    reject: "拒绝",
    resultCount: "显示",
    risk: "风险",
    save: "记录决定",
    saving: "保存中",
    sla: "审核 SLA",
    slaStatuses: {
      decided: "已决定",
      due_soon: "即将到期",
      not_submitted: "未提交",
      on_track: "正常",
      overdue: "已超期"
    },
    sort: {
      due_first: "SLA 最早到期",
      oldest: "最早提交",
      priority: "推荐优先级",
      risk: "最高风险"
    },
    sortLabel: "排序",
    status: "状态",
    summary: {
      blockers: "阻塞",
      highRisk: "高风险",
      ready: "可决定",
      sla: "SLA 压力",
      total: "审核",
      warnings: "警告"
    },
    title: "技能审核队列",
    version: "版本",
    viewSkill: "打开列表"
  }
} as const;

const reviewEvidenceCopy = {
  en: {
    author: "Author",
    browser: "Browser",
    disabled: "off",
    enabled: "on",
    fields: "fields",
    filesystem: "Files",
    input: "Input",
    manifest: "Manifest",
    network: "Network",
    noEvidence: "No manifest evidence was returned.",
    organization: "Org",
    output: "Output",
    payout: "Payout",
    permissions: "Permissions",
    publisher: "Publisher",
    publisherMissing: "No publisher profile",
    required: "required",
    runtime: "Runtime",
    schema: "Schemas",
    secrets: "Secrets",
    status: "Status",
    tags: "Tags",
    target: "Target",
    title: "Review evidence",
    unknown: "Unknown",
    version: "Version"
  },
  zh: {
    author: "\u4f5c\u8005",
    browser: "\u6d4f\u89c8\u5668",
    disabled: "\u5173",
    enabled: "\u5f00",
    fields: "\u5b57\u6bb5",
    filesystem: "\u6587\u4ef6",
    input: "\u8f93\u5165",
    manifest: "Manifest",
    network: "\u7f51\u7edc",
    noEvidence: "\u6ca1\u6709\u8fd4\u56de manifest \u5ba1\u6838\u6750\u6599\u3002",
    organization: "\u7ec4\u7ec7",
    output: "\u8f93\u51fa",
    payout: "\u63d0\u73b0",
    permissions: "\u6743\u9650",
    publisher: "\u53d1\u5e03\u8005",
    publisherMissing: "\u672a\u914d\u7f6e\u53d1\u5e03\u8005",
    required: "\u5fc5\u586b",
    runtime: "\u8fd0\u884c\u65f6",
    schema: "Schema",
    secrets: "Secret",
    status: "\u72b6\u6001",
    tags: "\u6807\u7b7e",
    target: "\u76ee\u6807",
    title: "\u5ba1\u6838\u8bc1\u636e",
    unknown: "\u672a\u77e5",
    version: "\u7248\u672c"
  }
} as const;

type ReviewEvidenceLabels = (typeof reviewEvidenceCopy)["en" | "zh"];

const initialState: AdminReviewActionState = {
  message: "",
  status: "idle"
};

export function AdminReviewManager({ locale, reviews }: AdminReviewManagerProps) {
  const labels = copy[locale];
  const evidenceLabels = reviewEvidenceCopy[locale];
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [sort, setSort] = useState<ReviewSort>("priority");
  const [state, action, isPending] = useActionState(decideAdminReviewAction.bind(null, locale), initialState);

  const metrics = useMemo(() => buildReviewMetrics(reviews), [reviews]);
  const prioritizedReviews = useMemo(
    () => reviews.map((review, index) => ({ index, priority: buildReviewPriority(review, labels), review })),
    [labels, reviews]
  );
  const visibleReviews = useMemo(
    () =>
      prioritizedReviews
        .filter((item) => matchesFilter(item.review, filter))
        .sort((first, second) => comparePrioritizedReviews(first, second, sort)),
    [filter, prioritizedReviews, sort]
  );
  const filterOptions: Array<{ count: number; key: ReviewFilter; label: string }> = [
    { count: metrics.total, key: "all", label: labels.filters.all },
    { count: metrics.sla, key: "sla", label: labels.filters.sla },
    { count: metrics.blockers, key: "blockers", label: labels.filters.blockers },
    { count: metrics.highRisk, key: "high_risk", label: labels.filters.high_risk },
    { count: metrics.warnings, key: "warnings", label: labels.filters.warnings }
  ];

  return (
    <article className="ops-panel admin-review-manager">
      <div className="admin-review-manager__head">
        <div className="card-kicker">
          <ClipboardCheck size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className="status-chip status-chip--neutral">{reviews.length}</span>
      </div>

      <div className="admin-review-summary" aria-label={labels.priorityLabel}>
        <SummaryItem label={labels.summary.total} value={metrics.total} />
        <SummaryItem label={labels.summary.sla} value={metrics.sla} tone={metrics.sla > 0 ? "warning" : "neutral"} />
        <SummaryItem label={labels.summary.blockers} value={metrics.blockers} tone={metrics.blockers > 0 ? "danger" : "neutral"} />
        <SummaryItem label={labels.summary.highRisk} value={metrics.highRisk} tone={metrics.highRisk > 0 ? "warning" : "neutral"} />
        <SummaryItem label={labels.summary.warnings} value={metrics.warnings} tone={metrics.warnings > 0 ? "warning" : "neutral"} />
        <SummaryItem label={labels.summary.ready} value={metrics.ready} tone={metrics.ready > 0 ? "ready" : "neutral"} />
      </div>

      <div className="admin-review-toolbar">
        <div className="admin-review-filter-list" role="group" aria-label={labels.filterLabel}>
          <span className="admin-review-toolbar__label">
            <ListFilter size={14} aria-hidden="true" />
            {labels.filterLabel}
          </span>
          {filterOptions.map((option) => (
            <button
              aria-pressed={filter === option.key}
              className={filter === option.key ? "admin-review-filter is-active" : "admin-review-filter"}
              key={option.key}
              onClick={() => setFilter(option.key)}
              type="button"
            >
              <span>{option.label}</span>
              <em>{option.count}</em>
            </button>
          ))}
        </div>

        <label className="admin-review-sort">
          <span>
            <ArrowDownWideNarrow size={14} aria-hidden="true" />
            {labels.sortLabel}
          </span>
          <select onChange={(event) => setSort(event.target.value as ReviewSort)} value={sort}>
            {Object.entries(labels.sort).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-review-result-count">
        {labels.resultCount} {visibleReviews.length} / {reviews.length}
      </div>

      <div className="admin-review-list">
        {visibleReviews.length > 0 ? (
          visibleReviews.map(({ priority, review }) => {
            const rowState = state.reviewId === review.id ? state : null;

            return (
              <section className="admin-review-card" key={review.id}>
                <header className="admin-review-card__head">
                  <div>
                    <strong>{review.displayName}</strong>
                    <span>{review.skillSlug}</span>
                  </div>
                  <span className={riskClass(review.riskLevel)}>{formatRiskLevel(review.riskLevel, locale)}</span>
                </header>

                <div className={priorityClass(priority.tone)}>
                  <div className="admin-review-priority__head">
                    <AlertTriangle size={15} aria-hidden="true" />
                    <strong>{priority.label}</strong>
                    <span>
                      {labels.priority.score} {priority.score}
                    </span>
                  </div>
                  <p>{priority.detail}</p>
                  {priority.reasons.length > 0 ? (
                    <div className="admin-review-priority__reasons">
                      {priority.reasons.map((reason) => (
                        <span key={reason}>{reason}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="admin-review-meta">
                  <span>
                    <strong>{labels.version}</strong>
                    {review.version ?? formatReviewStatus("draft", locale)}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    <em className={statusClass(review.status)}>{formatReviewStatus(review.status, locale)}</em>
                  </span>
                  <span>
                    <strong>{labels.created}</strong>
                    {formatDate(review.reviewSubmittedAt ?? review.createdAt, locale)}
                  </span>
                  <span>
                    <strong>{labels.queueAge}</strong>
                    {formatQueueAge(review.reviewQueueAgeHours, locale)}
                  </span>
                  <span>
                    <strong>{labels.sla}</strong>
                    <em className={reviewSlaClass(review.reviewSlaStatus)}>
                      <Clock3 size={12} aria-hidden="true" />
                      {formatReviewSlaStatus(review.reviewSlaStatus, labels)}
                      {review.reviewSlaDueAt ? ` / ${formatDate(review.reviewSlaDueAt, locale)}` : ""}
                    </em>
                  </span>
                  <span>
                    <strong>{labels.risk}</strong>
                    {formatRiskLevel(review.riskLevel, locale)}
                  </span>
                </div>

                {review.notes ? (
                  <div className="admin-review-notes">
                    <FileText size={15} aria-hidden="true" />
                    <span>{review.notes}</span>
                  </div>
                ) : null}

                {review.reviewEvidence ? <ReviewEvidence evidence={review.reviewEvidence} labels={evidenceLabels} locale={locale} /> : null}

                {review.runtimeChecks?.length ? (
                  <div className="admin-review-checks" aria-label={labels.checks}>
                    {review.runtimeChecks.map((check) => (
                      <div className="admin-review-check" key={`${review.id}-${check.checkType}`}>
                        <span className={checkStatusClass(check.status)}>{formatCheckStatus(check.status, labels)}</span>
                        <strong>{formatCheckType(check.checkType, labels)}</strong>
                        {typeof check.isBlocking === "boolean" ? (
                          <em className={check.isBlocking ? "quality-chip quality-chip--critical" : "quality-chip quality-chip--attention"}>
                            {check.isBlocking ? labels.blocking : labels.advisory}
                          </em>
                        ) : null}
                        <small>{check.message ?? formatCheckStatus(check.status, labels)}</small>
                        {check.nextAction ? (
                          <small>
                            <b>{labels.nextAction}</b>
                            {check.nextAction}
                          </small>
                        ) : null}
                        {check.targetField ? (
                          <small>
                            <b>{labels.targetField}</b>
                            <code>{check.targetField}</code>
                          </small>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <ReviewDecisionForm
                  action={action}
                  isPending={isPending}
                  labels={labels}
                  locale={locale}
                  review={review}
                  rowState={rowState}
                />

                {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
              </section>
            );
          })
        ) : (
          <div className="admin-review-empty">{reviews.length > 0 ? labels.emptyFiltered : labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function SummaryItem({ label, tone = "neutral", value }: { label: string; tone?: "danger" | "neutral" | "ready" | "warning"; value: number }) {
  return (
    <div className={`admin-review-summary__item admin-review-summary__item--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ActionMessage({ state }: { state: AdminReviewActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

type ReviewDecision = "approved" | "blocked" | "rejected";

function ReviewDecisionForm({
  action,
  isPending,
  labels,
  locale,
  review,
  rowState
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  review: AdminReviewRecord;
  rowState: AdminReviewActionState | null;
}) {
  const [decision, setDecision] = useState<ReviewDecision | "">("");
  const decisionCopy = getReviewDecisionCopy(locale);
  const buttonLabel = decision ? decisionCopy.buttons[decision] : labels.save;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!decision) {
      event.preventDefault();
      return;
    }

    if (!window.confirm(decisionCopy.confirm[decision].replace("{skill}", review.displayName))) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className="admin-review-action-form" onSubmit={handleSubmit}>
      <input name="reviewId" type="hidden" value={review.id} />
      <input name="skillSlug" type="hidden" value={review.skillSlug} />
      <label>
        <span>{labels.decision}</span>
        <select
          name="status"
          onChange={(event) => setDecision(event.target.value as ReviewDecision | "")}
          required
          value={decision}
        >
          <option value="">{decisionCopy.choose}</option>
          <option value="approved">{labels.approve}</option>
          <option value="rejected">{labels.reject}</option>
          <option value="blocked">{labels.block}</option>
        </select>
        <small>{decisionCopy.help}</small>
      </label>
      <label className="admin-review-action-form__notes">
        <span>{labels.notes}</span>
        <textarea defaultValue={review.notes ?? ""} name="notes" required />
      </label>
      <div className="admin-review-actions">
        <a className="ghost-button" href={localizedHref(`/skills/${review.skillSlug}`, locale)}>
          <ShieldAlert size={15} aria-hidden="true" />
          <span>{labels.viewSkill}</span>
        </a>
        <button className="secondary-button secondary-button--compact" disabled={isPending || !decision} type="submit">
          <Save size={15} aria-hidden="true" />
          <span>{isPending && rowState ? labels.saving : buttonLabel}</span>
        </button>
      </div>
    </form>
  );
}

function getReviewDecisionCopy(locale: Locale) {
  if (locale === "zh") {
    return {
      buttons: {
        approved: "批准并记录",
        blocked: "阻断审核",
        rejected: "拒绝版本"
      },
      choose: "请选择审核决定",
      confirm: {
        approved: "确认批准 {skill}？该版本可能在上线检查通过后进入公开市场上架路径。",
        blocked: "确认阻断 {skill}？发布者需要先修复当前证据问题，审核才能继续。",
        rejected: "确认拒绝 {skill}？该版本会作为未通过审核返回给发布者。"
      },
      help: "请明确选择动作。批准可能进入公开上架路径；拒绝或阻断会把修复任务返回给发布者。"
    };
  }

  return {
    buttons: {
      approved: "Approve and record",
      blocked: "Block review",
      rejected: "Reject version"
    },
    choose: "Choose decision",
    confirm: {
      approved: "Approve {skill}? This can make the version eligible for public marketplace listing after launch checks.",
      blocked: "Block {skill}? The publisher will need to repair the listed evidence before review can continue.",
      rejected: "Reject {skill}? The version will return to the publisher as not approved."
    },
    help: "Choose deliberately. Approval can make the version eligible for public listing; rejection or blocking returns work to the publisher."
  };
}

function ReviewEvidence({
  evidence,
  labels,
  locale
}: {
  evidence: NonNullable<AdminReviewRecord["reviewEvidence"]>;
  labels: ReviewEvidenceLabels;
  locale: Locale;
}) {
  const manifest = evidence.manifestSummary;
  const publisher = evidence.publisher;

  return (
    <div className="admin-review-evidence" aria-label={labels.title}>
      <div className="admin-review-evidence__head">
        <ClipboardCheck size={14} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="admin-review-evidence__grid">
        <EvidenceItem icon={<UserRound size={14} aria-hidden="true" />} label={labels.publisher} title={publisher.displayName ?? labels.publisherMissing}>
          <small>
            {labels.organization}: {publisher.organizationName ?? publisher.organizationSlug ?? labels.unknown}
          </small>
          <small>
            {labels.status}: {formatPublisherStatus(publisher.status, locale, labels.unknown)} / {labels.payout}: {formatPublisherStatus(publisher.payoutStatus, locale, labels.unknown)}
          </small>
        </EvidenceItem>

        <EvidenceItem icon={<ServerCog size={14} aria-hidden="true" />} label={labels.runtime} title={formatRuntimeTitle(manifest, labels)}>
          {manifest?.runtimeTarget ? (
            <small>
              {labels.target}: <code>{manifest.runtimeTarget}</code>
            </small>
          ) : (
            <small>{labels.noEvidence}</small>
          )}
          {manifest?.version ? (
            <small>
              {labels.version}: {manifest.version}
            </small>
          ) : null}
        </EvidenceItem>

        <EvidenceItem icon={<ShieldAlert size={14} aria-hidden="true" />} label={labels.permissions} title={formatRiskLevel(manifest?.permissionLevel ?? null, locale)}>
          {manifest ? (
            <div className="admin-review-evidence__chips">
              <span>{formatEnabledLabel(labels.network, manifest.permissions.network, labels)}</span>
              <span>{formatEnabledLabel(labels.browser, manifest.permissions.browser, labels)}</span>
              <span>
                {labels.filesystem}: {formatFilesystemPermission(manifest.permissions.filesystem, locale, labels.unknown)}
              </span>
              <span>
                {labels.secrets}: {manifest.permissions.secretCount}
              </span>
            </div>
          ) : (
            <small>{labels.noEvidence}</small>
          )}
        </EvidenceItem>

        <EvidenceItem icon={<Braces size={14} aria-hidden="true" />} label={labels.schema} title={formatSchemaTitle(manifest, labels)}>
          {manifest ? (
            <>
              <small>
                {labels.input}: {formatSchemaCounts(manifest.inputPropertyCount, manifest.inputRequiredCount, labels)}
              </small>
              <small>
                {labels.output}: {formatSchemaCounts(manifest.outputPropertyCount, manifest.outputRequiredCount, labels)}
              </small>
            </>
          ) : (
            <small>{labels.noEvidence}</small>
          )}
        </EvidenceItem>

        <EvidenceItem icon={<Tags size={14} aria-hidden="true" />} label={labels.manifest} title={manifest?.displayName ?? manifest?.name ?? labels.unknown}>
          {manifest?.description ? <small>{manifest.description}</small> : null}
          {manifest?.tags.length ? <small>{`${labels.tags}: ${manifest.tags.join(", ")}${manifest.tagsCount > manifest.tags.length ? "..." : ""}`}</small> : null}
          {manifest?.authorName ? (
            <small>
              {labels.author}: {manifest.authorName}
            </small>
          ) : null}
        </EvidenceItem>
      </div>
    </div>
  );
}

function EvidenceItem({ children, icon, label, title }: { children: ReactNode; icon: ReactNode; label: string; title: string }) {
  return (
    <div className="admin-review-evidence__item">
      <span className="admin-review-evidence__label">
        {icon}
        {label}
      </span>
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function formatRuntimeTitle(
  manifest: NonNullable<AdminReviewRecord["reviewEvidence"]>["manifestSummary"],
  labels: ReviewEvidenceLabels
) {
  return manifest?.runtimeType ? manifest.runtimeType.toUpperCase() : labels.unknown;
}

function formatSchemaTitle(
  manifest: NonNullable<AdminReviewRecord["reviewEvidence"]>["manifestSummary"],
  labels: ReviewEvidenceLabels
) {
  if (!manifest) {
    return labels.unknown;
  }

  return `${manifest.inputType ?? labels.unknown} -> ${manifest.outputType ?? labels.unknown}`;
}

function formatSchemaCounts(properties: number, required: number, labels: ReviewEvidenceLabels) {
  return `${properties} ${labels.fields} / ${required} ${labels.required}`;
}

function formatEnabledLabel(label: string, enabled: boolean, labels: ReviewEvidenceLabels) {
  return `${label}: ${enabled ? labels.enabled : labels.disabled}`;
}

function formatRiskLevel(value: string | null | undefined, locale: Locale) {
  const normalized = value?.trim().toLowerCase();
  const labels =
    locale === "zh"
      ? {
          high: "高",
          low: "低",
          medium: "中",
          unknown: "未知"
        }
      : {
          high: "High",
          low: "Low",
          medium: "Medium",
          unknown: "Unknown"
        };

  if (!normalized) {
    return labels.unknown;
  }

  return labels[normalized as keyof typeof labels] ?? humanizeEnum(value ?? "", locale);
}

function formatReviewStatus(value: string | null | undefined, locale: Locale) {
  const normalized = value?.trim().toLowerCase();
  const labels =
    locale === "zh"
      ? {
          approved: "已批准",
          blocked: "已阻断",
          draft: "草稿",
          in_review: "审核中",
          queued: "排队中",
          rejected: "已拒绝",
          submitted: "已提交",
          unknown: "未知"
        }
      : {
          approved: "Approved",
          blocked: "Blocked",
          draft: "Draft",
          in_review: "In review",
          queued: "Queued",
          rejected: "Rejected",
          submitted: "Submitted",
          unknown: "Unknown"
        };

  if (!normalized) {
    return labels.unknown;
  }

  return labels[normalized as keyof typeof labels] ?? humanizeEnum(value ?? "", locale);
}

function formatPublisherStatus(value: string | null | undefined, locale: Locale, fallback: string) {
  const normalized = value?.trim().toLowerCase();
  const labels =
    locale === "zh"
      ? {
          active: "已启用",
          approved: "已批准",
          blocked: "已阻断",
          pending: "待处理",
          rejected: "已拒绝",
          suspended: "已暂停",
          verified: "已验证"
        }
      : {
          active: "Active",
          approved: "Approved",
          blocked: "Blocked",
          pending: "Pending",
          rejected: "Rejected",
          suspended: "Suspended",
          verified: "Verified"
        };

  if (!normalized) {
    return fallback;
  }

  return labels[normalized as keyof typeof labels] ?? humanizeEnum(value ?? "", locale);
}

function formatFilesystemPermission(value: string | null | undefined, locale: Locale, fallback: string) {
  const normalized = value?.trim().toLowerCase();
  const labels =
    locale === "zh"
      ? {
          none: "无",
          read: "只读",
          write: "可写"
        }
      : {
          none: "None",
          read: "Read",
          write: "Write"
        };

  if (!normalized) {
    return fallback;
  }

  return labels[normalized as keyof typeof labels] ?? humanizeEnum(value ?? "", locale);
}

function humanizeEnum(value: string, locale: Locale) {
  const text = value.replaceAll("_", " ").trim();
  if (!text) {
    return locale === "zh" ? "未知" : "Unknown";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildReviewMetrics(reviews: AdminReviewRecord[]) {
  return reviews.reduce(
    (metrics, review) => {
      metrics.total += 1;
      metrics.sla += hasSlaPressure(review) ? 1 : 0;
      metrics.blockers += hasBlockingChecks(review) ? 1 : 0;
      metrics.highRisk += review.riskLevel === "high" ? 1 : 0;
      metrics.warnings += hasWarningChecks(review) ? 1 : 0;
      metrics.ready += isDecisionReady(review) ? 1 : 0;
      return metrics;
    },
    {
      blockers: 0,
      highRisk: 0,
      ready: 0,
      sla: 0,
      total: 0,
      warnings: 0
    }
  );
}

function buildReviewPriority(review: AdminReviewRecord, labels: (typeof copy)["en" | "zh"]) {
  const reasons = new Set<string>();
  const hasBlocker = hasBlockingChecks(review);
  const hasWarning = hasWarningChecks(review);
  const hasOpenCheck = hasOpenChecks(review);
  const hasChecks = Boolean(review.runtimeChecks?.length);
  const risk = riskWeight(review.riskLevel);
  const queueAge = typeof review.reviewQueueAgeHours === "number" && Number.isFinite(review.reviewQueueAgeHours) ? review.reviewQueueAgeHours : 0;
  let score = Math.min(queueAge, 168);
  let label: string = labels.priority.labels.waiting;
  let tone: ReviewPriorityTone = "neutral";

  if (review.status === "approved" || review.status === "rejected" || review.reviewSlaStatus === "decided") {
    return {
      detail: labels.priority.detail.neutral,
      label: labels.priority.labels.decided,
      reasons: [],
      score: 0,
      tone: "neutral" as const
    };
  }

  if (review.reviewSlaStatus === "overdue") {
    score += 650;
    label = labels.priority.labels.overdue;
    tone = "danger";
    reasons.add(labels.priority.reasons.overdue);
  } else if (review.reviewSlaStatus === "due_soon") {
    score += 460;
    label = labels.priority.labels.dueSoon;
    tone = "warning";
    reasons.add(labels.priority.reasons.dueSoon);
  }

  if (review.status === "blocked") {
    score += 420;
    label = labels.priority.labels.blocking;
    tone = "danger";
    reasons.add(labels.priority.reasons.blockedStatus);
  }

  if (hasBlocker) {
    score += 380;
    label = labels.priority.labels.blocking;
    tone = "danger";
    reasons.add(labels.priority.reasons.blocking);
  } else if (hasOpenCheck) {
    score += 170;
    label = labels.priority.labels.missingChecks;
    tone = tone === "danger" ? tone : "warning";
    reasons.add(labels.priority.reasons.openChecks);
  }

  if (!hasChecks) {
    score += 140;
    label = labels.priority.labels.missingChecks;
    tone = tone === "danger" ? tone : "warning";
    reasons.add(labels.priority.reasons.missingChecks);
  }

  if (review.riskLevel === "high") {
    score += 260;
    label = tone === "danger" ? label : labels.priority.labels.highRisk;
    tone = tone === "danger" ? tone : "warning";
    reasons.add(labels.priority.reasons.highRisk);
  } else if (risk === 2) {
    score += 90;
  }

  if (hasWarning) {
    score += 130;
    label = tone === "danger" ? label : labels.priority.labels.warning;
    tone = tone === "danger" ? tone : "warning";
    reasons.add(labels.priority.reasons.warning);
  }

  if (queueAge >= 48) {
    reasons.add(labels.priority.reasons.old);
  }

  if (isDecisionReady(review)) {
    score += 110;
    if (tone === "neutral") {
      label = labels.priority.labels.ready;
      tone = "ready";
    } else {
      reasons.add(labels.priority.labels.ready);
    }
  }

  return {
    detail: labels.priority.detail[tone],
    label,
    reasons: Array.from(reasons),
    score: Math.round(score),
    tone
  };
}

function comparePrioritizedReviews(first: PrioritizedReview, second: PrioritizedReview, sort: ReviewSort) {
  if (sort === "oldest") {
    return compareOldest(first.review, second.review) || second.priority.score - first.priority.score || first.index - second.index;
  }

  if (sort === "due_first") {
    return compareDueAt(first.review, second.review) || second.priority.score - first.priority.score || compareOldest(first.review, second.review);
  }

  if (sort === "risk") {
    return riskWeight(second.review.riskLevel) - riskWeight(first.review.riskLevel) || second.priority.score - first.priority.score || compareOldest(first.review, second.review);
  }

  return second.priority.score - first.priority.score || compareDueAt(first.review, second.review) || compareOldest(first.review, second.review) || first.index - second.index;
}

function matchesFilter(review: AdminReviewRecord, filter: ReviewFilter) {
  if (filter === "sla") {
    return hasSlaPressure(review);
  }

  if (filter === "blockers") {
    return hasBlockingChecks(review);
  }

  if (filter === "high_risk") {
    return review.riskLevel === "high";
  }

  if (filter === "warnings") {
    return hasWarningChecks(review);
  }

  return true;
}

function suggestedDecision(review: AdminReviewRecord) {
  if (!isDecisionReady(review)) {
    return hasBlockingChecks(review) || review.status === "blocked" || review.riskLevel === "high"
      ? "blocked"
      : "rejected";
  }

  if (hasBlockingChecks(review)) {
    return "rejected";
  }

  if (review.status === "blocked" || review.riskLevel === "high") {
    return "blocked";
  }

  if (review.status === "queued" || review.status === "in_review") {
    return review.riskLevel === "low" ? "approved" : "rejected";
  }

  return "rejected";
}

function hasBlockingChecks(review: AdminReviewRecord) {
  const checks = review.runtimeChecks ?? [];

  if (checks.length === 0) {
    return false;
  }

  return checks.some((check) => check.isBlocking === true || check.status === "failed" || check.status === "queued" || check.status === "running");
}

function hasOpenChecks(review: AdminReviewRecord) {
  return (review.runtimeChecks ?? []).some((check) => check.status === "queued" || check.status === "running");
}

function hasWarningChecks(review: AdminReviewRecord) {
  return (review.runtimeChecks ?? []).some((check) => check.status === "warning");
}

function hasSlaPressure(review: AdminReviewRecord) {
  return review.reviewSlaStatus === "overdue" || review.reviewSlaStatus === "due_soon";
}

function isDecisionReady(review: AdminReviewRecord) {
  return (
    (review.status === "queued" || review.status === "in_review") &&
    Boolean(review.runtimeChecks?.length) &&
    !hasBlockingChecks(review) &&
    !hasWarningChecks(review) &&
    review.riskLevel !== "high"
  );
}

function compareOldest(first: AdminReviewRecord, second: AdminReviewRecord) {
  return compareNumbers(reviewSubmittedAtMs(first), reviewSubmittedAtMs(second));
}

function compareDueAt(first: AdminReviewRecord, second: AdminReviewRecord) {
  return compareNumbers(reviewDueAtMs(first), reviewDueAtMs(second));
}

function reviewSubmittedAtMs(review: AdminReviewRecord) {
  return parseDateMs(review.reviewSubmittedAt ?? review.createdAt, 0);
}

function reviewDueAtMs(review: AdminReviewRecord) {
  return parseDateMs(review.reviewSlaDueAt, Number.POSITIVE_INFINITY);
}

function parseDateMs(value: string | null | undefined, fallback: number) {
  if (!value || value === "demo") {
    return fallback;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? fallback : time;
}

function compareNumbers(first: number, second: number) {
  if (first === second) {
    return 0;
  }

  return first < second ? -1 : 1;
}

function riskWeight(risk: AdminReviewRecord["riskLevel"]) {
  if (risk === "high") {
    return 3;
  }

  if (risk === "medium") {
    return 2;
  }

  if (risk === "low") {
    return 1;
  }

  return 0;
}

function formatCheckType(checkType: string, labels: (typeof copy)["en" | "zh"]) {
  return labels.checkLabels[checkType as keyof typeof labels.checkLabels] ?? checkType;
}

function formatCheckStatus(status: string, labels: (typeof copy)["en" | "zh"]) {
  return labels.checkStatusLabels[status as keyof typeof labels.checkStatusLabels] ?? status;
}

function checkStatusClass(status: string) {
  if (status === "passed") {
    return "status-chip";
  }

  if (status === "failed") {
    return "status-chip status-chip--danger";
  }

  if (status === "warning" || status === "queued" || status === "running") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function riskClass(risk: AdminReviewRecord["riskLevel"]) {
  if (risk === "high") {
    return "status-chip status-chip--danger";
  }

  if (risk === "medium") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function statusClass(status: AdminReviewRecord["status"]) {
  if (status === "approved") {
    return "status-chip";
  }

  if (status === "blocked" || status === "rejected") {
    return "status-chip status-chip--danger";
  }

  if (status === "queued" || status === "in_review") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function reviewSlaClass(status: AdminReviewRecord["reviewSlaStatus"]) {
  if (status === "overdue") {
    return "status-chip status-chip--danger";
  }

  if (status === "due_soon") {
    return "status-chip status-chip--warning";
  }

  if (status === "on_track" || status === "decided") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function priorityClass(tone: ReviewPriorityTone) {
  return `admin-review-priority admin-review-priority--${tone}`;
}

function formatReviewSlaStatus(status: AdminReviewRecord["reviewSlaStatus"], labels: (typeof copy)["en" | "zh"]) {
  if (!status) {
    return labels.slaStatuses.not_submitted;
  }

  return labels.slaStatuses[status as keyof typeof labels.slaStatuses] ?? status;
}

function formatQueueAge(value: number | null | undefined, locale: Locale) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return locale === "zh" ? "未开始" : "Not started";
  }

  if (value < 24) {
    return locale === "zh" ? `${value} 小时` : `${value}h`;
  }

  const days = Math.floor(value / 24);
  const hours = value % 24;

  if (locale === "zh") {
    return hours > 0 ? `${days} 天 ${hours} 小时` : `${days} 天`;
  }

  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value || value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
