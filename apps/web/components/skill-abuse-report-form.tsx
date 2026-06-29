"use client";

import { useActionState } from "react";
import { CheckCircle2, Flag, LogIn, Send, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillSelect, SkillTextArea } from "@/components/skill-antd";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { createSkillAbuseReportAction, type SkillAbuseReportActionState } from "@/lib/skill-abuse-report-actions";

type SkillAbuseReportFormProps = {
  canSubmit?: boolean;
  locale: Locale;
  loginHref?: string;
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
    signInAction: "Sign in to report",
    signInBody: "Trust reports create operator queue items and must be tied to a signed-in SkillHub account.",
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

export function SkillAbuseReportForm({ canSubmit = true, locale, loginHref, skillName, skillSlug }: SkillAbuseReportFormProps) {
  const labels = copy[locale];
  const signInAction = locale === "zh" ? "\u767b\u5f55\u540e\u4e3e\u62a5" : copy.en.signInAction;
  const signInBody =
    locale === "zh"
      ? "\u4fe1\u4efb\u4e3e\u62a5\u4f1a\u521b\u5efa\u8fd0\u8425\u961f\u5217\u4e8b\u9879\uff0c\u5fc5\u987b\u7ed1\u5b9a\u5df2\u767b\u5f55\u7684 SkillHub \u8d26\u53f7\u3002"
      : copy.en.signInBody;
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

      {!canSubmit ? (
        <div className="skill-action-locked">
          <p>{signInBody}</p>
          <a className="secondary-button" href={loginHref ?? localizedHref("/login", locale)}>
            <LogIn size={15} aria-hidden="true" />
            <span>{signInAction}</span>
          </a>
        </div>
      ) : (
      <form action={action} className="skill-report-form">
        <label className="skill-report-form__wide">
          <span>{labels.titleField}</span>
          <SkillInput name="title" placeholder={labels.titlePlaceholder} required />
        </label>
        <label>
          <span>{labels.category}</span>
          <SkillSelect defaultValue="security" name="category" options={categories.map((category) => ({ label: labels.categories[category], value: category }))} />
        </label>
        <label>
          <span>{labels.severity}</span>
          <SkillSelect defaultValue="medium" name="severity" options={severities.map((severity) => ({ label: labels.severities[severity], value: severity }))} />
        </label>
        <label>
          <span>{labels.projectSlug}</span>
          <SkillInput name="projectSlug" placeholder="research-agent" />
        </label>
        <label>
          <span>{labels.evidenceUrl}</span>
          <SkillInput name="evidenceUrl" placeholder="https://example.com/evidence" type="url" />
        </label>
        <label className="skill-report-form__wide">
          <span>{labels.description}</span>
          <SkillTextArea
            aria-label={`${labels.description}: ${skillName}`}
            name="description"
            placeholder={labels.descriptionPlaceholder}
            required
          />
        </label>
        <SkillButton className="secondary-button" disabled={isPending} htmlType="submit">
          <Send size={15} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </SkillButton>
      </form>
      )}

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function ActionMessage({ state }: { state: SkillAbuseReportActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}
