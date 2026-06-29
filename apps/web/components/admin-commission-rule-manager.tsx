"use client";

import type { ReactNode } from "react";
import { useActionState, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, Percent, Save, Scale, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillStatusTag, useSkillModal } from "@/components/skill-antd";
import { createAdminCommissionRuleAction, type AdminCommissionRuleActionState } from "@/lib/admin-commission-rule-actions";
import type { Locale } from "@/lib/i18n";
import type { CommissionRuleRecord } from "@/lib/ops-data";

type AdminCommissionRuleManagerProps = {
  locale: Locale;
  rules: CommissionRuleRecord[];
};

const copy = {
  en: {
    active: "Active",
    created: "Created",
    empty: "No commission rules are available yet.",
    endsAt: "Ends at",
    ended: "Ended",
    confirmSchedule: "Confirm this commission split schedule?",
    platformFee: "Platform fee",
    platformFeeHelp: "Enter a percent. For example, 20 means 20% platform fee and 80% publisher share.",
    publisherShare: "Publisher share",
    reason: "Finance reason",
    reasonPlaceholder: "Example: Launch 20/80 public marketplace split after finance approval.",
    ruleName: "Rule name",
    save: "Schedule rule",
    saving: "Scheduling",
    scheduled: "Scheduled",
    startsAt: "Starts at",
    startsNow: "Blank means now",
    summary: "Current split",
    timeline: "Version timeline",
    title: "Commission rule management"
  },
  zh: {
    active: "\u751f\u6548\u4e2d",
    created: "\u521b\u5efa\u65f6\u95f4",
    empty: "\u8fd8\u6ca1\u6709\u53ef\u7528\u7684\u4f63\u91d1\u89c4\u5219\u3002",
    endsAt: "\u7ed3\u675f\u65f6\u95f4",
    ended: "\u5df2\u7ed3\u675f",
    confirmSchedule: "\u786e\u8ba4\u6392\u671f\u8fd9\u6761\u4f63\u91d1\u5206\u6210\u89c4\u5219\uff1f",
    platformFee: "\u5e73\u53f0\u4f63\u91d1",
    platformFeeHelp: "\u8bf7\u8f93\u5165\u767e\u5206\u6bd4\u3002\u4f8b\u5982 20 \u8868\u793a\u5e73\u53f0 20%\uff0c\u53d1\u5e03\u8005 80%\u3002",
    publisherShare: "\u53d1\u5e03\u8005\u5206\u6210",
    reason: "\u8d22\u52a1\u539f\u56e0",
    reasonPlaceholder: "\u4f8b\uff1a\u8d22\u52a1\u786e\u8ba4\u540e\u542f\u7528\u516c\u5f00\u5e02\u573a 20/80 \u5206\u6210\u3002",
    ruleName: "\u89c4\u5219\u540d\u79f0",
    save: "\u6392\u671f\u89c4\u5219",
    saving: "\u6392\u671f\u4e2d",
    scheduled: "\u5df2\u6392\u671f",
    startsAt: "\u751f\u6548\u65f6\u95f4",
    startsNow: "\u7559\u7a7a\u8868\u793a\u7acb\u5373\u751f\u6548",
    summary: "\u5f53\u524d\u5206\u6210",
    timeline: "\u89c4\u5219\u7248\u672c",
    title: "\u4f63\u91d1\u89c4\u5219\u7ba1\u7406"
  }
} as const;

const initialState: AdminCommissionRuleActionState = {
  message: "",
  status: "idle"
};

export function AdminCommissionRuleManager({ locale, rules }: AdminCommissionRuleManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(createAdminCommissionRuleAction.bind(null, locale), initialState);
  const visibleRules = mergeCreatedRule(rules, state.rule);
  const activeRule = visibleRules.find((rule) => rule.isActive) ?? visibleRules[0] ?? null;
  const defaultPlatformFee = activeRule?.platformFeeBps ?? 2000;

  return (
    <article className="ops-panel admin-commission-manager">
      <div className="admin-commission-manager__head">
        <div className="card-kicker">
          <Scale size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <SkillStatusTag className="status-chip status-chip--neutral" tone="neutral">{visibleRules.length}</SkillStatusTag>
      </div>

      {activeRule ? (
        <div className="admin-commission-summary" aria-label={labels.summary}>
          <SplitTile icon={<Percent size={16} aria-hidden="true" />} label={labels.platformFee} value={formatBps(activeRule.platformFeeBps)} />
          <SplitTile icon={<Scale size={16} aria-hidden="true" />} label={labels.publisherShare} value={formatBps(activeRule.publisherShareBps)} />
          <SplitTile icon={<Clock3 size={16} aria-hidden="true" />} label={labels.startsAt} value={formatDate(activeRule.startsAt, locale)} />
        </div>
      ) : (
        <div className="admin-commission-empty">{labels.empty}</div>
      )}

      <CommissionRuleForm
        action={action}
        defaultPlatformFee={defaultPlatformFee}
        isPending={isPending}
        labels={labels}
        locale={locale}
      />

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}

      <div className="admin-commission-timeline" aria-label={labels.timeline}>
        <div className="admin-commission-timeline__head">
          <strong>{labels.timeline}</strong>
          <span>{labels.created}</span>
        </div>
        {visibleRules.length > 0 ? (
          visibleRules.slice(0, 6).map((rule) => (
            <div className="admin-commission-rule-row" key={rule.id}>
              <div>
                <strong>{rule.name}</strong>
                <span>
                  {formatBps(rule.platformFeeBps)} / {formatBps(rule.publisherShareBps)}
                </span>
              </div>
              <SkillStatusTag className={statusClass(rule)}>{statusLabel(rule, labels)}</SkillStatusTag>
              <small>
                {formatDate(rule.startsAt, locale)}
                {rule.endsAt ? ` - ${formatDate(rule.endsAt, locale)}` : ""}
              </small>
            </div>
          ))
        ) : (
          <div className="admin-commission-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

type CommissionLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function CommissionRuleForm({
  action,
  defaultPlatformFee,
  isPending,
  labels,
  locale
}: {
  action: (payload: FormData) => void;
  defaultPlatformFee: number;
  isPending: boolean;
  labels: CommissionLabels;
  locale: Locale;
}) {
  const [platformFeePercent, setPlatformFeePercent] = useState(formatPercentInput(defaultPlatformFee));
  const modal = useSkillModal();
  const isSubmitArmed = useRef(false);
  const platformFeeBps = percentInputToBps(platformFeePercent);
  const publisherShareBps = Math.max(0, 10000 - platformFeeBps);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const startsAt = form.elements.namedItem("startsAt") as HTMLInputElement | null;
    const endsAt = form.elements.namedItem("endsAt") as HTMLInputElement | null;

    if (startsAt?.value && endsAt?.value && new Date(endsAt.value).getTime() <= new Date(startsAt.value).getTime()) {
      event.preventDefault();
      modal.error({ title: locale === "zh" ? "结束时间必须晚于生效时间。" : "End time must be later than start time." });
      return;
    }

    if (platformFeeBps < 0 || platformFeeBps > 10000 || Number.isNaN(platformFeeBps)) {
      event.preventDefault();
      modal.error({ title: locale === "zh" ? "平台佣金必须是 0 到 100 之间的百分比。" : "Platform fee must be a percentage between 0 and 100." });
      return;
    }

    if (isSubmitArmed.current) {
      isSubmitArmed.current = false;
      return;
    }

    event.preventDefault();
    modal.confirm({
      title: labels.confirmSchedule,
      onOk: () => {
        isSubmitArmed.current = true;
        form.requestSubmit();
      }
    });
  }

  return (
    <form action={action} className="admin-commission-form" onSubmit={handleSubmit}>
        <label>
          <span>{labels.ruleName}</span>
          <SkillInput defaultValue={defaultRuleName(defaultPlatformFee, locale)} name="name" required />
        </label>
        <label>
          <span>{labels.platformFee}</span>
          <SkillInput
            max={100}
            min={0}
            onChange={(event) => setPlatformFeePercent(event.target.value)}
            required
            step={0.01}
            type="number"
            value={platformFeePercent}
          />
          <input name="platformFeeBps" type="hidden" value={Number.isNaN(platformFeeBps) ? "" : platformFeeBps} />
          <small>
            {labels.platformFee} {formatBps(platformFeeBps)} / {labels.publisherShare} {formatBps(publisherShareBps)}
          </small>
          <small>{labels.platformFeeHelp}</small>
        </label>
        <label>
          <span>{labels.startsAt}</span>
          <SkillInput name="startsAt" type="datetime-local" />
          <small>{labels.startsNow}</small>
        </label>
        <label>
          <span>{labels.endsAt}</span>
          <SkillInput name="endsAt" type="datetime-local" />
        </label>
        <label className="admin-commission-form__wide">
          <span>{labels.reason}</span>
          <SkillInput name="reason" placeholder={labels.reasonPlaceholder} required />
        </label>
        <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit">
          <Save size={15} aria-hidden="true" />
          <span>{isPending ? labels.saving : labels.save}</span>
        </SkillButton>
      </form>
  );
}

function SplitTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionMessage({ state }: { state: AdminCommissionRuleActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}

function mergeCreatedRule(rules: CommissionRuleRecord[], createdRule?: CommissionRuleRecord) {
  if (!createdRule) {
    return rules;
  }

  const withoutDuplicate = rules.filter((rule) => rule.id !== createdRule.id);
  return [createdRule, ...withoutDuplicate];
}

function defaultRuleName(platformFeeBps: number, locale: Locale) {
  if (locale === "zh") {
    return `${formatBps(platformFeeBps)} \u5e73\u53f0 / ${formatBps(10000 - platformFeeBps)} \u53d1\u5e03\u8005`;
  }

  return `${formatBps(platformFeeBps)} platform / ${formatBps(10000 - platformFeeBps)} publisher`;
}

function formatBps(bps: number) {
  if (!Number.isFinite(bps)) {
    return "0%";
  }

  const percent = bps / 100;
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(2)}%`;
}

function formatPercentInput(bps: number) {
  const percent = bps / 100;
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(2);
}

function percentInputToBps(value: string) {
  if (!value.trim()) {
    return Number.NaN;
  }

  const percent = Number(value);
  return Math.round(percent * 100);
}

function statusClass(rule: CommissionRuleRecord) {
  if (rule.isActive) {
    return "status-chip";
  }

  if (isFuture(rule.startsAt)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function statusLabel(rule: CommissionRuleRecord, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  if (rule.isActive) {
    return labels.active;
  }

  return isFuture(rule.startsAt) ? labels.scheduled : labels.ended;
}

function isFuture(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

function formatDate(value: string | null, locale: Locale) {
  if (!value || value === "demo") {
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
