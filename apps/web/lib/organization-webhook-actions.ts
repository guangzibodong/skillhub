"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { OrganizationWebhookEndpoint } from "@/lib/ops-data";

export type OrganizationWebhookActionState = {
  endpoint?: OrganizationWebhookEndpoint;
  endpointId?: string;
  message: string;
  signingSecret?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    created: "Webhook endpoint created. Copy the signing secret now; it will not be shown again.",
    missingEndpoint: "Missing webhook endpoint id.",
    missingToken: "Sign in with an owner, admin, or developer account before managing webhooks.",
    missingUrl: "Webhook URL is required.",
    rotated: "Webhook signing secret rotated. Copy it now; it will not be shown again.",
    updated: "Webhook endpoint updated.",
    unableCreate: "Unable to create webhook endpoint.",
    unableRotate: "Unable to rotate webhook signing secret.",
    unableUpdate: "Unable to update webhook endpoint."
  },
  zh: {
    created: "Webhook endpoint 已创建。请现在复制签名密钥，它不会再次显示。",
    missingEndpoint: "缺少 Webhook endpoint ID。",
    missingToken: "请先使用具备 owner/admin/developer 角色的账号登录，才能管理 Webhook。",
    missingUrl: "必须填写 Webhook URL。",
    rotated: "Webhook 签名密钥已轮换。请现在复制，它不会再次显示。",
    updated: "Webhook endpoint 已更新。",
    unableCreate: "无法创建 Webhook endpoint。",
    unableRotate: "无法轮换 Webhook 签名密钥。",
    unableUpdate: "无法更新 Webhook endpoint。"
  }
} as const;

export async function createOrganizationWebhookAction(
  locale: Locale,
  _previousState: OrganizationWebhookActionState,
  formData: FormData
): Promise<OrganizationWebhookActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const url = String(formData.get("url") ?? "").trim();

  if (!url) {
    return { message: labels.missingUrl, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/webhooks`, {
      body: JSON.stringify({
        description: String(formData.get("description") ?? "").trim(),
        events: normalizeEventFormData(formData),
        status: String(formData.get("status") ?? "active").trim(),
        url
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableCreate);
    }

    const payload = (await response.json()) as { endpoint: OrganizationWebhookEndpoint; signingSecret: string };
    revalidatePath("/developer");

    return {
      endpoint: payload.endpoint,
      endpointId: payload.endpoint.id,
      message: labels.created,
      signingSecret: payload.signingSecret,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableCreate,
      status: "error"
    };
  }
}

export async function updateOrganizationWebhookAction(
  locale: Locale,
  _previousState: OrganizationWebhookActionState,
  formData: FormData
): Promise<OrganizationWebhookActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const endpointId = String(formData.get("endpointId") ?? "").trim();

  if (!endpointId) {
    return { message: labels.missingEndpoint, status: "error" };
  }

  if (!token) {
    return { endpointId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/webhooks/${encodeURIComponent(endpointId)}`, {
      body: JSON.stringify({
        description: String(formData.get("description") ?? "").trim(),
        events: normalizeEventFormData(formData),
        status: String(formData.get("status") ?? "active").trim(),
        url: String(formData.get("url") ?? "").trim()
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableUpdate);
    }

    const payload = (await response.json()) as { endpoint: OrganizationWebhookEndpoint };
    revalidatePath("/developer");

    return {
      endpoint: payload.endpoint,
      endpointId,
      message: labels.updated,
      status: "success"
    };
  } catch (error) {
    return {
      endpointId,
      message: error instanceof Error ? error.message : labels.unableUpdate,
      status: "error"
    };
  }
}

export async function rotateOrganizationWebhookSecretAction(
  locale: Locale,
  _previousState: OrganizationWebhookActionState,
  formData: FormData
): Promise<OrganizationWebhookActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const endpointId = String(formData.get("endpointId") ?? "").trim();

  if (!endpointId) {
    return { message: labels.missingEndpoint, status: "error" };
  }

  if (!token) {
    return { endpointId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/webhooks/${encodeURIComponent(endpointId)}/rotate-secret`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRotate);
    }

    const payload = (await response.json()) as { endpoint: OrganizationWebhookEndpoint; signingSecret: string };
    revalidatePath("/developer");

    return {
      endpoint: payload.endpoint,
      endpointId,
      message: labels.rotated,
      signingSecret: payload.signingSecret,
      status: "success"
    };
  } catch (error) {
    return {
      endpointId,
      message: error instanceof Error ? error.message : labels.unableRotate,
      status: "error"
    };
  }
}

function normalizeEventFormData(formData: FormData) {
  const events = formData.getAll("events").map(String).map((event) => event.trim()).filter(Boolean);
  return events.length > 0 ? events : undefined;
}

function getApiUrl() {
  return getServerApiUrl();
}
