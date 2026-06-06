"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
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
    decisionSaved: "Buyer request decision recorded.",
    invalidBounty: "Bounty must be zero or greater.",
    invalidDecision: "Decision must be matched, closed, or canceled.",
    invalidDeliverySkill: "Select a delivery skill and version.",
    invalidDueDate: "Due date must be a valid date.",
    invalidEvidenceUrl: "Evidence URL must be a valid http or https URL.",
    invalidPublisherAction: "Publisher action must be claim or submit.",
    missingDeliveryNote: "Add a delivery note for buyer review.",
    missingDescription: "Describe the requested skill outcome.",
    missingRequest: "Missing buyer request id.",
    missingTitle: "Enter a buyer request title.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing buyer requests.",
    publisherSaved: "Buyer request updated.",
    unableCreate: "Unable to create buyer request.",
    unableDecision: "Unable to update buyer request decision.",
    unablePublisherUpdate: "Unable to update buyer request."
  },
  zh: {
    created: "买家需求已创建。",
    decisionSaved: "买家需求处理结果已记录。",
    invalidBounty: "悬赏金额必须大于或等于 0。",
    invalidDecision: "处理结果必须是匹配、关闭或取消。",
    invalidDeliverySkill: "请选择交付的技能和版本。",
    invalidDueDate: "截止日期必须是有效日期。",
    invalidEvidenceUrl: "证据链接必须是有效的 http 或 https URL。",
    invalidPublisherAction: "发布者动作必须是认领或提交。",
    missingDeliveryNote: "请填写给买家验收的交付说明。",
    missingDescription: "请描述需要交付的技能结果。",
    missingRequest: "缺少买家需求 ID。",
    missingTitle: "请输入买家需求标题。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端 fallback token，才能管理买家需求。",
    publisherSaved: "买家需求已更新。",
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
  const token = await getWorkspaceToken();
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
    revalidatePath("/developer");

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
  const token = await getWorkspaceToken();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const deliverySkill = String(formData.get("deliverySkill") ?? "").trim();
  const deliveryNote = String(formData.get("deliveryNote") ?? "").trim();
  const evidenceUrl = String(formData.get("evidenceUrl") ?? "").trim();
  let skillSlug = String(formData.get("skillSlug") ?? "").trim();
  let version = String(formData.get("version") ?? "").trim();

  if (!requestId) {
    return { intent: "publisher", message: labels.missingRequest, status: "error" };
  }

  if (!publisherActions.includes(action as (typeof publisherActions)[number])) {
    return { intent: "publisher", message: labels.invalidPublisherAction, requestId, status: "error" };
  }

  if (action === "submit") {
    const parsedDelivery = parseDeliverySkill(deliverySkill);

    skillSlug = parsedDelivery?.skillSlug ?? skillSlug;
    version = parsedDelivery?.version ?? version;

    if (!skillSlug || !version) {
      return { intent: "publisher", message: labels.invalidDeliverySkill, requestId, status: "error" };
    }

    if (!deliveryNote) {
      return { intent: "publisher", message: labels.missingDeliveryNote, requestId, status: "error" };
    }

    if (!isHttpUrl(evidenceUrl)) {
      return { intent: "publisher", message: labels.invalidEvidenceUrl, requestId, status: "error" };
    }
  }

  if (!token) {
    return { intent: "publisher", message: labels.missingToken, requestId, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/publisher/buyer-requests/${encodeURIComponent(requestId)}/${action}`,
      {
        body:
          action === "submit"
            ? JSON.stringify({
                deliveryNote,
                evidenceUrl,
                skillSlug,
                version
              })
            : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(action === "submit" ? { "Content-Type": "application/json" } : {})
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unablePublisherUpdate);
    }

    revalidatePath("/dashboard");
    revalidatePath("/publisher");

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
  const token = await getWorkspaceToken();
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
    revalidatePath("/developer");

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

function parseDeliverySkill(value: string) {
  if (!value) {
    return null;
  }

  const [skillSlug, version] = value.split("@@", 2).map((part) => part.trim());

  if (!skillSlug || !version) {
    return null;
  }

  return { skillSlug, version };
}

function isHttpUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
