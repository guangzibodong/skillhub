"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

type LedgerOperation = "usage" | "subscriptions" | "renewals" | "release";

export type AdminLedgerActionState = {
  message: string;
  operation?: LedgerOperation;
  processedCount?: number;
  releasedCount?: number;
  renewedCount?: number;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidLimit: "Limit must be an integer between 1 and 500.",
    missingToken: "Sign in with a finance or admin account before processing ledger jobs.",
    processedSubscriptions: "Subscription periods posted to the ledger.",
    processedUsage: "Billable usage posted to the ledger.",
    releasedBalances: "Matured publisher balances released.",
    renewedSubscriptions: "Subscription periods renewed.",
    unable: "Unable to process the selected ledger job.",
    unknownOperation: "Choose a ledger job to process."
  },
  zh: {
    invalidLimit: "\u5904\u7406\u6570\u91cf\u5fc5\u987b\u662f 1 \u5230 500 \u4e4b\u95f4\u7684\u6574\u6570\u3002",
    missingToken: "请先使用具备财务或管理员权限的账号登录，才能处理账本任务。",
    processedSubscriptions: "\u8ba2\u9605\u5468\u671f\u5df2\u5199\u5165\u8d26\u672c\u3002",
    processedUsage: "\u6309\u6b21\u8c03\u7528\u5df2\u5199\u5165\u8d26\u672c\u3002",
    releasedBalances: "\u6210\u719f\u7684\u53d1\u5e03\u8005\u4f59\u989d\u5df2\u91ca\u653e\u3002",
    renewedSubscriptions: "\u8ba2\u9605\u8d26\u671f\u5df2\u7eed\u671f\u3002",
    unable: "\u65e0\u6cd5\u5904\u7406\u9009\u4e2d\u7684\u8d26\u672c\u4efb\u52a1\u3002",
    unknownOperation: "\u8bf7\u9009\u62e9\u8981\u5904\u7406\u7684\u8d26\u672c\u4efb\u52a1\u3002"
  }
} as const;

export async function processAdminLedgerAction(
  locale: Locale,
  _previousState: AdminLedgerActionState,
  formData: FormData
): Promise<AdminLedgerActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const operation = normalizeOperation(formData.get("operation"));
  const limit = normalizeLimit(formData.get("limit"));

  if (!operation) {
    return { message: labels.unknownOperation, status: "error" };
  }

  if (!limit) {
    return { message: labels.invalidLimit, operation, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, operation, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}${endpointForOperation(operation)}`, {
      body: JSON.stringify({ limit }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unable);
    }

    const payload = (await response.json()) as { processedCount?: number; releasedCount?: number; renewedCount?: number };

    revalidatePath("/admin");

    return {
      message: messageForOperation(operation, payload, labels),
      operation,
      processedCount: payload.processedCount,
      releasedCount: payload.releasedCount,
      renewedCount: payload.renewedCount,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unable,
      operation,
      status: "error"
    };
  }
}

function normalizeOperation(value: FormDataEntryValue | null): LedgerOperation | null {
  const operation = String(value ?? "").trim();

  if (operation === "usage" || operation === "subscriptions" || operation === "renewals" || operation === "release") {
    return operation;
  }

  return null;
}

function normalizeLimit(value: FormDataEntryValue | null) {
  const limit = Number(value ?? 50);

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return null;
  }

  return limit;
}

function endpointForOperation(operation: LedgerOperation) {
  if (operation === "subscriptions") {
    return "/v1/admin/finance/process-subscriptions";
  }

  if (operation === "renewals") {
    return "/v1/admin/finance/renew-subscriptions";
  }

  if (operation === "release") {
    return "/v1/admin/finance/release-balances";
  }

  return "/v1/admin/finance/process-usage";
}

function messageForOperation(
  operation: LedgerOperation,
  payload: { processedCount?: number; releasedCount?: number; renewedCount?: number },
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (operation === "subscriptions") {
    return `${labels.processedSubscriptions} (${payload.processedCount ?? 0})`;
  }

  if (operation === "renewals") {
    return `${labels.renewedSubscriptions} (${payload.renewedCount ?? 0})`;
  }

  if (operation === "release") {
    return `${labels.releasedBalances} (${payload.releasedCount ?? 0})`;
  }

  return `${labels.processedUsage} (${payload.processedCount ?? 0})`;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
