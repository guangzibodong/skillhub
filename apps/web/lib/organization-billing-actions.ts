"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type OrganizationBillingActionState = {
  message: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    missingToken: "Sign in with an organization account before managing organization billing.",
    paymentSaved: "Payment method state saved.",
    profileSaved: "Billing profile saved.",
    unablePayment: "Unable to save payment method.",
    unableProfile: "Unable to save billing profile."
  },
  zh: {
    missingToken: "请先登录具备组织权限的账号，才能管理组织账单。",
    paymentSaved: "付款方式状态已保存。",
    profileSaved: "账单资料已保存。",
    unablePayment: "无法保存付款方式。",
    unableProfile: "无法保存账单资料。"
  }
} as const;

export async function updateOrganizationBillingProfileAction(
  locale: Locale,
  _previousState: OrganizationBillingActionState,
  formData: FormData
): Promise<OrganizationBillingActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/billing/profile`, {
      body: JSON.stringify({
        addressLine1: String(formData.get("addressLine1") ?? "").trim() || undefined,
        addressLine2: String(formData.get("addressLine2") ?? "").trim() || undefined,
        billingEmail: String(formData.get("billingEmail") ?? "").trim() || undefined,
        billingName: String(formData.get("billingName") ?? "").trim() || undefined,
        city: String(formData.get("city") ?? "").trim() || undefined,
        country: String(formData.get("country") ?? "").trim() || undefined,
        invoiceNotes: String(formData.get("invoiceNotes") ?? "").trim() || undefined,
        postalCode: String(formData.get("postalCode") ?? "").trim() || undefined,
        region: String(formData.get("region") ?? "").trim() || undefined,
        taxId: String(formData.get("taxId") ?? "").trim() || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableProfile);
    }

    revalidatePath("/dashboard");

    return { message: labels.profileSaved, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableProfile, status: "error" };
  }
}

export async function addOrganizationPaymentMethodAction(
  locale: Locale,
  _previousState: OrganizationBillingActionState,
  formData: FormData
): Promise<OrganizationBillingActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/billing/payment-methods`, {
      body: JSON.stringify({
        brand: String(formData.get("brand") ?? "").trim() || undefined,
        expMonth: String(formData.get("expMonth") ?? "").trim() || undefined,
        expYear: String(formData.get("expYear") ?? "").trim() || undefined,
        isDefault: formData.get("isDefault") === "on",
        last4: String(formData.get("last4") ?? "").trim() || undefined,
        methodType: String(formData.get("methodType") ?? "invoice"),
        provider: String(formData.get("provider") ?? "manual"),
        providerCustomerId: String(formData.get("providerCustomerId") ?? "").trim() || undefined,
        providerPaymentMethodId: String(formData.get("providerPaymentMethodId") ?? "").trim() || undefined,
        status: String(formData.get("status") ?? "pending")
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unablePayment);
    }

    revalidatePath("/dashboard");

    return { message: labels.paymentSaved, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unablePayment, status: "error" };
  }
}

export async function updateOrganizationPaymentMethodAction(
  locale: Locale,
  _previousState: OrganizationBillingActionState,
  formData: FormData
): Promise<OrganizationBillingActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const paymentMethodId = String(formData.get("paymentMethodId") ?? "").trim();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/billing/payment-methods/${encodeURIComponent(paymentMethodId)}`, {
      body: JSON.stringify({
        isDefault: formData.get("isDefault") === "on" ? true : undefined,
        status: String(formData.get("status") ?? "").trim() || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unablePayment);
    }

    revalidatePath("/dashboard");

    return { message: labels.paymentSaved, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unablePayment, status: "error" };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
