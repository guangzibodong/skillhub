"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Copy, KeyRound, Plus, RotateCcw, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { ProjectSensitiveActionForm } from "@/components/project-sensitive-action-form";
import {
  createProjectApiKeyAction,
  revokeProjectApiKeyAction,
  type ProjectKeyActionState
} from "@/lib/project-key-actions";
import type { DeveloperProjectApiKeyRecord } from "@/lib/ops-data";

type ProjectApiKeyManagerProps = {
  activeLabel: string;
  emptyLabel: string;
  keys: DeveloperProjectApiKeyRecord[];
  locale: Locale;
  noDateLabel: string;
  projectSlug: string;
  revokedLabel: string;
  titleLabel: string;
};

const copy = {
  en: {
    cancelRotation: "Cancel",
    copy: "Copy",
    copied: "Copied",
    create: "Create key",
    creating: "Creating",
    keyHeaders: ["Name", "Key", "Last used", "State", "Action"],
    namePlaceholder: "Production runtime key",
    newKey: "New runtime secret",
    revealOnce: "This raw key is shown once. Store it in your agent runtime before closing this page.",
    revoke: "Revoke",
    revoking: "Revoking",
    rotate: "Rotate key",
    rotateBody: "Create a replacement key first, update your agent runtime, then revoke the old key.",
    rotateTitle: "Key rotation"
  },
  zh: {
    cancelRotation: "取消",
    copy: "复制",
    copied: "已复制",
    create: "创建 Key",
    creating: "创建中",
    keyHeaders: ["名称", "Key", "最近使用", "状态", "操作"],
    namePlaceholder: "生产运行 Key",
    newKey: "新的运行密钥",
    revealOnce: "原始 Key 只展示一次。关闭页面前，请先写入你的智能体运行环境。",
    revoke: "撤销",
    revoking: "撤销中",
    rotate: "轮换 Key",
    rotateBody: "先创建替换 Key，更新智能体运行环境后，再撤销旧 Key。",
    rotateTitle: "Key 轮换"
  }
} as const;

const sensitiveCopy = {
  en: {
    confirm: "Confirmation",
    confirmRevokePlaceholder: "Type REVOKE or the key last 4",
    reason: "Reason",
    revokeDescription: "This immediately blocks agents using this key. Record why the key is being revoked for audit and incident review.",
    revokeReasonPlaceholder: "Rotation completed, suspected leak, owner request, or environment retired"
  },
  zh: {
    confirm: "\u786e\u8ba4\u77ed\u8bed",
    confirmRevokePlaceholder: "\u8f93\u5165 REVOKE \u6216 Key \u540e 4 \u4f4d",
    reason: "\u539f\u56e0",
    revokeDescription: "\u8fd9\u4f1a\u7acb\u5373\u963b\u65ad\u6b63\u5728\u4f7f\u7528\u8be5 Key \u7684\u667a\u80fd\u4f53\u3002\u8bf7\u8bb0\u5f55\u64a4\u9500\u539f\u56e0\uff0c\u4fbf\u4e8e\u5ba1\u8ba1\u548c\u4e8b\u6545\u590d\u76d8\u3002",
    revokeReasonPlaceholder: "\u5df2\u5b8c\u6210\u8f6e\u6362\u3001\u7591\u4f3c\u6cc4\u9732\u3001\u8d1f\u8d23\u4eba\u8981\u6c42\u6216\u73af\u5883\u4e0b\u7ebf"
  }
} as const;

const initialActionState: ProjectKeyActionState = {
  message: "",
  status: "idle"
};

export function ProjectApiKeyManager({
  activeLabel,
  emptyLabel,
  keys,
  locale,
  noDateLabel,
  projectSlug,
  revokedLabel,
  titleLabel
}: ProjectApiKeyManagerProps) {
  const labels = copy[locale];
  const sensitiveLabels = sensitiveCopy[locale];
  const [isCreating, setIsCreating] = useState(keys.length === 0);
  const [copied, setCopied] = useState(false);
  const [createState, createAction, isCreatePending] = useActionState(
    createProjectApiKeyAction.bind(null, projectSlug, locale),
    initialActionState
  );
  const [revokeState, revokeAction, isRevokePending] = useActionState(
    revokeProjectApiKeyAction.bind(null, projectSlug, locale),
    initialActionState
  );

  async function copySecret(secret: string) {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="ops-panel project-table-panel project-key-manager">
      <div className="project-key-manager__head">
        <div className="card-kicker">
          <KeyRound size={16} aria-hidden="true" />
          <span>{titleLabel}</span>
        </div>
        <button className="secondary-button" onClick={() => setIsCreating((current) => !current)} type="button">
          {isCreating ? <XCircle size={16} aria-hidden="true" /> : keys.length === 0 ? <Plus size={16} aria-hidden="true" /> : <RotateCcw size={16} aria-hidden="true" />}
          <span>{isCreating ? labels.cancelRotation : keys.length === 0 ? labels.create : labels.rotate}</span>
        </button>
      </div>

      <div className="rotation-note">
        <strong>{labels.rotateTitle}</strong>
        <span>{labels.rotateBody}</span>
      </div>

      {isCreating ? (
        <form action={createAction} className="key-create-form">
          <label>
            <span>{labels.namePlaceholder}</span>
            <input name="name" placeholder={labels.namePlaceholder} required />
          </label>
          <button className="primary-button" disabled={isCreatePending} type="submit">
            <Plus size={16} aria-hidden="true" />
            <span>{isCreatePending ? labels.creating : labels.create}</span>
          </button>
        </form>
      ) : null}

      {createState.status !== "idle" ? (
        <div className={createState.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
          {createState.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
          <span>{createState.message}</span>
        </div>
      ) : null}

      {createState.apiKey ? (
        <div className="secret-reveal">
          <span>{labels.newKey}</span>
          <code>{createState.apiKey.apiKey}</code>
          <small>{labels.revealOnce}</small>
          <button className="secondary-button" onClick={() => copySecret(createState.apiKey!.apiKey)} type="button">
            <Copy size={16} aria-hidden="true" />
            <span>{copied ? labels.copied : labels.copy}</span>
          </button>
        </div>
      ) : null}

      {revokeState.status !== "idle" ? (
        <div className={revokeState.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
          {revokeState.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
          <span>{revokeState.message}</span>
        </div>
      ) : null}

      <div className="project-table project-table--compact">
        <div className="project-table__row project-table__row--head project-key-row project-key-row--actions">
          {labels.keyHeaders.map((header) => (
            <span key={header}>{header}</span>
          ))}
        </div>
        {keys.length > 0 ? (
          keys.map((key) => (
            <div className="project-table__row project-key-row project-key-row--actions" key={key.id}>
              <strong>{key.name}</strong>
              <code>{key.keyPrefix}...{key.keyLast4}</code>
              <span>{formatDateValue(key.lastUsedAt, locale, noDateLabel)}</span>
              <span className={key.revokedAt ? "status-chip status-chip--danger" : "status-chip"}>
                {key.revokedAt ? revokedLabel : activeLabel}
              </span>
              {key.revokedAt ? (
                <span>{revokedLabel}</span>
              ) : (
                <ProjectSensitiveActionForm
                  action={revokeAction}
                  cancelLabel={labels.cancelRotation}
                  confirmLabel={sensitiveLabels.confirm}
                  confirmPlaceholder={sensitiveLabels.confirmRevokePlaceholder}
                  description={sensitiveLabels.revokeDescription}
                  disabled={isRevokePending}
                  hiddenFields={{
                    keyId: key.id,
                    keyLast4: key.keyLast4
                  }}
                  icon={XCircle}
                  label={labels.revoke}
                  reasonLabel={sensitiveLabels.reason}
                  reasonPlaceholder={sensitiveLabels.revokeReasonPlaceholder}
                  submitLabel={isRevokePending ? labels.revoking : labels.revoke}
                />
              )}
            </div>
          ))
        ) : (
          <div className="project-table__row project-table__row--empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
}

function formatDateValue(value: string | null | undefined, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value === "demo") {
    return "demo";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
}
