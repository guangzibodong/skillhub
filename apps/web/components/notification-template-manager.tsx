"use client";

import { useActionState } from "react";
import { CheckCircle2, FilePenLine, Save, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import {
  saveNotificationTemplateAction,
  type NotificationTemplateActionState
} from "@/lib/notification-template-actions";
import type { NotificationTemplateRecord } from "@/lib/ops-data";

type NotificationTemplateManagerProps = {
  locale: Locale;
  templates: NotificationTemplateRecord[];
};

const copy = {
  en: {
    body: "Body",
    channel: "Channel",
    create: "Create template",
    empty: "No notification templates configured.",
    locale: "Locale",
    save: "Save template",
    saving: "Saving",
    status: "Status",
    subject: "Subject",
    templateKey: "Template key",
    title: "Notification templates",
    updated: "Updated",
    templateKeyPlaceholder: "skill.review.approved",
    subjectPlaceholder: "Skill review approved",
    bodyPlaceholder: "Use {{skillSlug}}, {{projectSlug}}, {{amountCents}}, and other event payload fields.",
    channels: {
      email: "Email",
      in_app: "In-app",
      webhook: "Webhook"
    },
    statuses: {
      active: "Active",
      archived: "Archived",
      draft: "Draft"
    }
  },
  zh: {
    body: "正文",
    channel: "渠道",
    create: "创建模板",
    empty: "还没有配置通知模板。",
    locale: "语言",
    save: "保存模板",
    saving: "保存中",
    status: "状态",
    subject: "标题",
    templateKey: "模板 key",
    title: "通知模板",
    updated: "更新时间",
    templateKeyPlaceholder: "skill.review.approved",
    subjectPlaceholder: "技能审核已通过",
    bodyPlaceholder: "可使用 {{skillSlug}}、{{projectSlug}}、{{amountCents}} 等事件字段。",
    channels: {
      email: "邮件",
      in_app: "站内通知",
      webhook: "Webhook"
    },
    statuses: {
      active: "启用",
      archived: "归档",
      draft: "草稿"
    }
  }
} as const;

const channels = ["in_app", "email", "webhook"] as const;
const statuses = ["draft", "active", "archived"] as const;

const initialState: NotificationTemplateActionState = {
  message: "",
  status: "idle"
};

export function NotificationTemplateManager({ locale, templates }: NotificationTemplateManagerProps) {
  const labels = copy[locale];
  const [createState, createAction, isCreating] = useActionState(saveNotificationTemplateAction.bind(null, locale), initialState);
  const [saveState, saveAction, isSaving] = useActionState(saveNotificationTemplateAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel notification-template-panel">
      <div className="card-kicker">
        <FilePenLine size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={createAction} className="notification-template-form">
        <label>
          <span>{labels.templateKey}</span>
          <input name="templateKey" placeholder={labels.templateKeyPlaceholder} required />
        </label>
        <label>
          <span>{labels.channel}</span>
          <select defaultValue="in_app" name="channel">
            {channels.map((channel) => (
              <option key={channel} value={channel}>
                {labels.channels[channel]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.locale}</span>
          <input defaultValue={locale === "zh" ? "zh" : "en"} name="locale" required />
        </label>
        <label>
          <span>{labels.status}</span>
          <select defaultValue="draft" name="status">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {labels.statuses[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="notification-template-form__wide">
          <span>{labels.subject}</span>
          <input name="subject" placeholder={labels.subjectPlaceholder} required />
        </label>
        <label className="notification-template-form__wide">
          <span>{labels.body}</span>
          <textarea name="body" placeholder={labels.bodyPlaceholder} required rows={4} />
        </label>
        <button className="secondary-button secondary-button--compact" disabled={isCreating} type="submit">
          <FilePenLine size={15} aria-hidden="true" />
          <span>{isCreating ? labels.saving : labels.create}</span>
        </button>
      </form>
      {createState.status !== "idle" ? <ActionMessage state={createState} /> : null}

      <div className="notification-template-list">
        {templates.length > 0 ? (
          templates.map((template) => {
            const templateIdentity = makeTemplateIdentity(template);
            const statusMessage = saveState.templateIdentity === templateIdentity ? saveState : null;

            return (
              <section className="notification-template-card" key={template.id}>
                <header className="notification-template-card__head">
                  <div>
                    <strong>{template.templateKey}</strong>
                    <span>
                      {labels.channels[template.channel]} / {template.locale} / {labels.updated}: {formatDate(template.updatedAt, locale)}
                    </span>
                  </div>
                  <span className={statusClass(template.status)}>{labels.statuses[template.status]}</span>
                </header>

                <form action={saveAction} className="notification-template-update-form">
                  <label>
                    <span>{labels.templateKey}</span>
                    <input defaultValue={template.templateKey} name="templateKey" required />
                  </label>
                  <label>
                    <span>{labels.channel}</span>
                    <select defaultValue={template.channel} name="channel">
                      {channels.map((channel) => (
                        <option key={channel} value={channel}>
                          {labels.channels[channel]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{labels.locale}</span>
                    <input defaultValue={template.locale} name="locale" required />
                  </label>
                  <label>
                    <span>{labels.status}</span>
                    <select defaultValue={template.status} name="status">
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {labels.statuses[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="notification-template-form__wide">
                    <span>{labels.subject}</span>
                    <input defaultValue={template.subject} name="subject" required />
                  </label>
                  <label className="notification-template-form__wide">
                    <span>{labels.body}</span>
                    <textarea defaultValue={template.body} name="body" required rows={5} />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isSaving} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isSaving && statusMessage ? labels.saving : labels.save}</span>
                  </button>
                </form>

                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
              </section>
            );
          })
        ) : (
          <div className="notification-template-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ActionMessage({ state }: { state: NotificationTemplateActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function statusClass(status: NotificationTemplateRecord["status"]) {
  if (status === "active") {
    return "status-chip";
  }

  if (status === "draft") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function makeTemplateIdentity(template: Pick<NotificationTemplateRecord, "channel" | "locale" | "templateKey">) {
  return `${template.templateKey.trim().toLowerCase()}::${template.channel.trim()}::${template.locale.trim().toLowerCase()}`;
}

function formatDate(value: string, locale: Locale) {
  if (value === "demo") {
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
