"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { NotificationTemplateRecord } from "@/lib/ops-data";

export type NotificationTemplateActionState = {
  message: string;
  status: "idle" | "success" | "error";
  template?: NotificationTemplateRecord;
  templateIdentity?: string;
  templateKey?: string;
};

const copy = {
  en: {
    missingBody: "Template body is required.",
    missingSubject: "Template subject is required.",
    missingTemplateKey: "Template key is required.",
    missingToken: "Sign in with an admin or support account before managing notification templates.",
    saved: "Notification template saved.",
    unableSave: "Unable to save notification template."
  },
  zh: {
    missingBody: "必须填写模板正文。",
    missingSubject: "必须填写模板标题。",
    missingTemplateKey: "必须填写模板 key。",
    missingToken: "请先使用具备 admin/support 角色的账号登录，才能管理通知模板。",
    saved: "通知模板已保存。",
    unableSave: "无法保存通知模板。"
  }
} as const;

export async function saveNotificationTemplateAction(
  locale: Locale,
  _previousState: NotificationTemplateActionState,
  formData: FormData
): Promise<NotificationTemplateActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const templateKey = String(formData.get("templateKey") ?? "").trim();
  const channel = String(formData.get("channel") ?? "in_app").trim();
  const templateLocale = String(formData.get("locale") ?? "en").trim();
  const templateIdentity = makeTemplateIdentity(templateKey, channel, templateLocale);
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!templateKey) {
    return { message: labels.missingTemplateKey, status: "error" };
  }

  if (!subject) {
    return { message: labels.missingSubject, status: "error", templateIdentity, templateKey };
  }

  if (!body) {
    return { message: labels.missingBody, status: "error", templateIdentity, templateKey };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", templateIdentity, templateKey };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/notification-templates`, {
      body: JSON.stringify({
        body,
        channel,
        locale: templateLocale,
        status: String(formData.get("status") ?? "draft").trim(),
        subject,
        templateKey
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    const payload = (await response.json()) as { template: NotificationTemplateRecord };
    revalidatePath("/admin");

    return {
      message: labels.saved,
      status: "success",
      template: payload.template,
      templateIdentity: makeTemplateIdentity(payload.template.templateKey, payload.template.channel, payload.template.locale),
      templateKey
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
      templateIdentity,
      templateKey
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}

function makeTemplateIdentity(templateKey: string, channel: string, locale: string) {
  return `${templateKey.trim().toLowerCase()}::${channel.trim()}::${locale.trim().toLowerCase()}`;
}
