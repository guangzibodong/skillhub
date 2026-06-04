"use server";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n";

export type BuyerRequestActionState = {
  intent?: "create" | "developer" | "publisher";
  message: string;
  requestId?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    created: "Buyer request created.",
    invalidBounty: "Bounty must be zero or greater.",
    invalidDecision: "Decision must be matched, closed, or canceled.",
    invalidDueDate: "Due date must be a valid date.",
    invalidPublisherAction: "Publisher action must be claim or submit.",
    missingDescription: "Describe the requested skill outcome.",
    missingRequest: "Missing buyer request id.",
    missingTitle: "Enter a buyer request title.",
    missingToken: "Set SKILLHUB_USER_TOKEN or SKILLHUB_ADMIN_TOKEN before managing buyer requests.",
    publisherSaved: "Buyer request updated.",
    decisionSaved: "Buyer request decision recorded.",
    unableCreate: "Unable to create buyer request.",
    unableDecision: "Unable to update buyer request decision.",
    unablePublisherUpdate: "Unable to update buyer request."
  },
  zh: {
    created: "买家需求已创建。",
    invalidBounty: "悬赏金额必须大于或等于 0。",
    invalidDecision: "处理结果必须是匹配、关闭或取消。",
    invalidDueDate: "截止日期必须是有效日期。",
    invalidPublisherAction: "发布者动作必须是认领或提交。",
    missingDescription: "请描述需要交付的技能结果。",
    missingRequest: "缺少买家需求 ID。",
    missingTitle: "请输入买家需求标题。",
    missingToken: "请先配置 SKILLHUB_USER_TOKEN 或 SKILLHUB_ADMIN_TOKEN，才能管理买家需求。",
    publisherSaved: "买家需求已更新。",
    decisionSaved: "买家需求处理结果已记录。",
    unableCreate: "无法创建买家需求。",
    unableDecision: "无法更新买家需求处理结果。",
    unablePublisherUpdate: "无法更新买家需求。"
  }
} as const;

const publisherActions = ["claim", "submit"] as const;
const developerDecisions = ["matched", "closed", "canceled"] as const;

export async function createBuyerRequestAction(
  locale: Locale,
  _previousState: BuyerRequestActionState,
  formData: FormData
): Promise<BuyerRequestActionState> {
  const labels = copy[locale];
  const token = getWorkspaceToken();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "workflow").trim() || "workflow";
  const currency = String(formData.get("currency") ?? "usd").trim().toLowerCase() || "usd";

  if (!title) {
    return { intent: "create", message: labels.missingTitle, status: "error" };
  }

  if (!description) {
    return { intent: "create", message: labels.missingDescription, status: "error" };
  }

  let bountyCents: number;
  let dueAt: string | null;

  try {
    bountyCents = parseBountyCents(formData.get("bounty"), labels.invalidBounty);
    dueAt = parseDueAt(formData.get("dueAt"), labels.invalidDueDate);
  } catch (error) {
    return {
      intent: "create",
      message: error instanceof Error ? error.message : labels.invalidBounty,
      status: "error"
    };
  }

  if (!token) {
    return { intent: "create", message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/developer/buyer-requests`, {
      body: JSON.stringify({
        bountyCents,
        category,
        currency,
        description,
        dueAt,
        title
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

    revalidatePath("/dashboard");

    return { intent: "create", message: labels.created, status: "success" };
  } catch (error) {
    return {
      intent: "create",
      message: error instanceof Error ? error.message : labels.unableCreate,
      status: "error"
    };
  }
}

export async function updatePublisherBuyerRequestAction(
  locale: Locale,
  _previousState: BuyerRequestActionState,
  formData: FormData
): Promise<BuyerRequestActionState> {
  const labels = copy[locale];
  const token = getWorkspaceToken();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!requestId) {
    return { intent: "publisher", message: labels.missingRequest, status: "error" };
  }

  if (!publisherActions.includes(action as (typeof publisherActions)[number])) {
    return { intent: "publisher", message: labels.invalidPublisherAction, requestId, status: "error" };
  }

  if (!token) {
    return { intent: "publisher", message: labels.missingToken, requestId, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/publisher/buyer-requests/${encodeURIComponent(requestId)}/${action}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unablePublisherUpdate);
    }

    revalidatePath("/dashboard");

    return { intent: "publisher", message: labels.publisherSaved, requestId, status: "success" };
  } catch (error) {
    return {
      intent: "publisher",
      message: error instanceof Error ? error.message : labels.unablePublisherUpdate,
      requestId,
      status: "error"
    };
  }
}

export async function decideDeveloperBuyerRequestAction(
  locale: Locale,
  _previousState: BuyerRequestActionState,
  formData: FormData
): Promise<BuyerRequestActionState> {
  const labels = copy[locale];
  const token = getWorkspaceToken();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const status = String(formData.get("decision") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!requestId) {
    return { intent: "developer", message: labels.missingRequest, status: "error" };
  }

  if (!developerDecisions.includes(status as (typeof developerDecisions)[number])) {
    return { intent: "developer", message: labels.invalidDecision, requestId, status: "error" };
  }

  if (!token) {
    return { intent: "developer", message: labels.missingToken, requestId, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/developer/buyer-requests/${encodeURIComponent(requestId)}/decision`,
      {
        body: JSON.stringify({
          reason: reason || undefined,
          status
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableDecision);
    }

    revalidatePath("/dashboard");

    return { intent: "developer", message: labels.decisionSaved, requestId, status: "success" };
  } catch (error) {
    return {
      intent: "developer",
      message: error instanceof Error ? error.message : labels.unableDecision,
      requestId,
      status: "error"
    };
  }
}

function parseBountyCents(value: FormDataEntryValue | null, invalidMessage: string) {
  const rawValue = String(value ?? "0").trim();
  const normalized = rawValue ? Number(rawValue) : 0;

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error(invalidMessage);
  }

  return Math.round(normalized * 100);
}

function parseDueAt(value: FormDataEntryValue | null, invalidMessage: string) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return null;
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(invalidMessage);
  }

  return date.toISOString();
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}

function getWorkspaceToken() {
  return process.env.SKILLHUB_USER_TOKEN ?? process.env.SKILLHUB_ADMIN_TOKEN;
}
