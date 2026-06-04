"use client";

import { useActionState } from "react";
import { CheckCircle2, Flag, Send, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { createSkillAbuseReportAction, type SkillAbuseReportActionState } from "@/lib/skill-abuse-report-actions";

type SkillAbuseReportFormProps = {
  locale: Locale;
  skillName: string;
  skillSlug: string;
};

const copy = {
  en: {
    category: "Category",
    description: "Description",
    descriptionPlaceholder: "Describe the runtime behavior, billing issue, privacy concern, or quality failure.",
    evidenceUrl: "Evidence URL",
    projectSlug: "Project slug",
    severity: "Severity",
    submit: "Submit report",
    submitting: "Submitting",
    title: "Report a trust or runtime issue",
    titleField: "Report title",
    titlePlaceholder: "Unexpected outbound domain during runtime",
    categories: {
      billing: "Billing",
      copyright: "Copyright",
      malicious: "Malicious behavior",
      other: "Other",
      privacy: "Privacy",
      quality: "Quality",
      security: "Security",
      spam: "Spam"
    },
    severities: {
      critical: "Critical",
      high: "High",
      low: "Low",
      medium: "Medium"
    }
  },
  zh: {
    category: "分类",
    description: "问题描述",
    descriptionPlaceholder: "描述运行行为、计费问题、隐私风险或质量失败。",
    evidenceUrl: "证据 URL",
    projectSlug: "项目 slug",
    severity: "严重程度",
    submit: "提交举报",
    submitting: "提交中",
    title: "报告信任或运行问题",
    titleField: "举报标题",
    titlePlaceholder: "运行时出现未声明的外部域名",
    categories: {
      billing: "计费",
      copyright: "版权",
      malicious: "恶意行为",
      other: "其他",
      privacy: "隐私",
      quality: "质量",
      security: "安全",
      spam: "垃圾内容"
    },
    severities: {
      critical: "严重",
      high: "高",
      low: "低",
      medium: "中"
    }
  }
} as const;

const categories = ["security", "privacy", "quality", "billing", "malicious", "copyright", "spam", "other"] as const;
const severities = ["medium", "low", "high", "critical"] as const;

const initialState: SkillAbuseReportActionState = {
  message: "",
  status: "idle"
};

export function SkillAbuseReportForm({ locale, skillName, skillSlug }: SkillAbuseReportFormProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    createSkillAbuseReportAction.bind(null, skillSlug, locale),
    initialState
  );

  return (
    <article className="skill-detail-panel skill-report-panel">
      <div className="card-kicker">
        <Flag size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={action} className="skill-report-form">
        <label className="skill-report-form__wide">
          <span>{labels.titleField}</span>
          <input name="title" placeholder={labels.titlePlaceholder} required />
        </label>
        <label>
          <span>{labels.category}</span>
          <select defaultValue="security" name="category">
            {categories.map((category) => (
              <option key={category} value={category}>
                {labels.categories[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.severity}</span>
          <select defaultValue="medium" name="severity">
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {labels.severities[severity]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.projectSlug}</span>
          <input name="projectSlug" placeholder="research-agent" />
        </label>
        <label>
          <span>{labels.evidenceUrl}</span>
          <input name="evidenceUrl" placeholder="https://example.com/evidence" type="url" />
        </label>
        <label className="skill-report-form__wide">
          <span>{labels.description}</span>
          <textarea
            aria-label={`${labels.description}: ${skillName}`}
            name="description"
            placeholder={labels.descriptionPlaceholder}
            required
          />
        </label>
        <button className="secondary-button" disabled={isPending} type="submit">
          <Send size={15} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function ActionMessage({ state }: { state: SkillAbuseReportActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
