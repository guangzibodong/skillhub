"use client";

import { useActionState } from "react";
import { CheckCircle2, CreditCard, Save, ShieldCheck, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { OrganizationBillingSummary, OrganizationPaymentMethod } from "@/lib/ops-data";
import {
  addOrganizationPaymentMethodAction,
  updateOrganizationBillingProfileAction,
  updateOrganizationPaymentMethodAction,
  type OrganizationBillingActionState
} from "@/lib/organization-billing-actions";

type OrganizationBillingManagerProps = {
  billing: OrganizationBillingSummary;
  locale: Locale;
};

const copy = {
  en: {
    addMethod: "Add payment state",
    addressLine1: "Address line 1",
    billingEmail: "Billing email",
    billingName: "Billing name",
    brand: "Brand",
    city: "City",
    country: "Country",
    defaultMethod: "Default",
    expMonth: "Exp month",
    expYear: "Exp year",
    invoiceNotes: "Invoice notes",
    last4: "Last 4",
    methodType: "Method type",
    noPaymentMethods: "No payment method state yet.",
    paymentTitle: "Payment method state",
    postalCode: "Postal code",
    profileTitle: "Billing profile",
    provider: "Provider",
    providerCustomerId: "Provider customer ID",
    providerPaymentMethodId: "Provider method ID",
    ready: "Invoice ready",
    region: "Region",
    requiresSetup: "Needs setup",
    saveProfile: "Save profile",
    saving: "Saving",
    setDefault: "Set default",
    status: "Status",
    taxId: "Tax ID",
    title: "Organization billing",
    updateStatus: "Update"
  },
  zh: {
    addMethod: "添加付款状态",
    addressLine1: "地址",
    billingEmail: "账单邮箱",
    billingName: "账单名称",
    brand: "品牌",
    city: "城市",
    country: "国家",
    defaultMethod: "默认",
    expMonth: "到期月",
    expYear: "到期年",
    invoiceNotes: "发票备注",
    last4: "尾号",
    methodType: "方式类型",
    noPaymentMethods: "还没有付款方式状态",
    paymentTitle: "付款方式状态",
    postalCode: "邮编",
    profileTitle: "账单资料",
    provider: "服务商",
    providerCustomerId: "服务商客户 ID",
    providerPaymentMethodId: "服务商方式 ID",
    ready: "可开票",
    region: "地区",
    requiresSetup: "需完善",
    saveProfile: "保存资料",
    saving: "保存中",
    setDefault: "设为默认",
    status: "状态",
    taxId: "税号",
    title: "组织账单",
    updateStatus: "更新"
  }
} as const;

const initialActionState: OrganizationBillingActionState = {
  message: "",
  status: "idle"
};

export function OrganizationBillingManager({ billing, locale }: OrganizationBillingManagerProps) {
  const labels = copy[locale];
  const [profileState, profileAction, isProfilePending] = useActionState(updateOrganizationBillingProfileAction.bind(null, locale), initialActionState);
  const [paymentState, paymentAction, isPaymentPending] = useActionState(addOrganizationPaymentMethodAction.bind(null, locale), initialActionState);
  const [methodState, methodAction, isMethodPending] = useActionState(updateOrganizationPaymentMethodAction.bind(null, locale), initialActionState);
  const profile = billing.billingProfile;

  return (
    <article className="ops-panel organization-billing-panel">
      <div className="organization-billing-panel__head">
        <div className="card-kicker">
          <CreditCard size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className={billing.summary.invoiceReady ? "status-chip" : "status-chip status-chip--warning"}>
          {billing.summary.invoiceReady ? labels.ready : labels.requiresSetup}
        </span>
      </div>

      <form action={profileAction} className="organization-billing-form">
        <strong>{labels.profileTitle}</strong>
        <label>
          <span>{labels.billingName}</span>
          <input defaultValue={profile?.billingName ?? ""} name="billingName" required />
        </label>
        <label>
          <span>{labels.billingEmail}</span>
          <input defaultValue={profile?.billingEmail ?? ""} name="billingEmail" type="email" />
        </label>
        <label>
          <span>{labels.taxId}</span>
          <input defaultValue={profile?.taxId ?? ""} name="taxId" />
        </label>
        <label>
          <span>{labels.country}</span>
          <input defaultValue={profile?.country ?? ""} maxLength={2} name="country" />
        </label>
        <label className="organization-billing-form__wide">
          <span>{labels.addressLine1}</span>
          <input defaultValue={profile?.addressLine1 ?? ""} name="addressLine1" />
        </label>
        <label>
          <span>{labels.city}</span>
          <input defaultValue={profile?.city ?? ""} name="city" />
        </label>
        <label>
          <span>{labels.region}</span>
          <input defaultValue={profile?.region ?? ""} name="region" />
        </label>
        <label>
          <span>{labels.postalCode}</span>
          <input defaultValue={profile?.postalCode ?? ""} name="postalCode" />
        </label>
        <label className="organization-billing-form__wide">
          <span>{labels.invoiceNotes}</span>
          <input defaultValue={profile?.invoiceNotes ?? ""} name="invoiceNotes" />
        </label>
        <button className="primary-button organization-billing-form__wide" disabled={isProfilePending} type="submit">
          <Save size={16} aria-hidden="true" />
          <span>{isProfilePending ? labels.saving : labels.saveProfile}</span>
        </button>
      </form>

      {profileState.status !== "idle" ? <ActionMessage state={profileState} /> : null}

      <div className="organization-payment-section">
        <strong>{labels.paymentTitle}</strong>
        <div className="organization-payment-list">
          {billing.paymentMethods.length > 0 ? (
            billing.paymentMethods.map((method) => (
              <PaymentMethodCard
                action={methodAction}
                disabled={isMethodPending}
                key={method.id}
                labels={labels}
                method={method}
              />
            ))
          ) : (
            <div className="organization-payment-empty">{labels.noPaymentMethods}</div>
          )}
        </div>
        {methodState.status !== "idle" ? <ActionMessage state={methodState} /> : null}
      </div>

      <form action={paymentAction} className="organization-payment-form">
        <label>
          <span>{labels.provider}</span>
          <input defaultValue="manual" name="provider" />
        </label>
        <label>
          <span>{labels.providerCustomerId}</span>
          <input name="providerCustomerId" />
        </label>
        <label className="organization-payment-form__wide">
          <span>{labels.providerPaymentMethodId}</span>
          <input name="providerPaymentMethodId" />
        </label>
        <label>
          <span>{labels.methodType}</span>
          <select defaultValue="invoice" name="methodType">
            <option value="invoice">invoice</option>
            <option value="card">card</option>
            <option value="bank_account">bank_account</option>
            <option value="external">external</option>
          </select>
        </label>
        <label>
          <span>{labels.status}</span>
          <select defaultValue="pending" name="status">
            <option value="not_configured">not_configured</option>
            <option value="pending">pending</option>
            <option value="ready">ready</option>
            <option value="requires_action">requires_action</option>
            <option value="failed">failed</option>
            <option value="disabled">disabled</option>
          </select>
        </label>
        <label>
          <span>{labels.brand}</span>
          <input defaultValue="manual" name="brand" />
        </label>
        <label>
          <span>{labels.last4}</span>
          <input maxLength={4} name="last4" />
        </label>
        <label>
          <span>{labels.expMonth}</span>
          <input min="1" max="12" name="expMonth" type="number" />
        </label>
        <label>
          <span>{labels.expYear}</span>
          <input min="2026" max="2100" name="expYear" type="number" />
        </label>
        <label className="policy-checkbox organization-payment-form__default">
          <input defaultChecked name="isDefault" type="checkbox" />
          <span>{labels.defaultMethod}</span>
        </label>
        <button className="secondary-button organization-payment-form__submit" disabled={isPaymentPending} type="submit">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{isPaymentPending ? labels.saving : labels.addMethod}</span>
        </button>
      </form>

      {paymentState.status !== "idle" ? <ActionMessage state={paymentState} /> : null}
    </article>
  );
}

function PaymentMethodCard({
  action,
  disabled,
  labels,
  method
}: {
  action: (payload: FormData) => void;
  disabled: boolean;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  method: OrganizationPaymentMethod;
}) {
  return (
    <form action={action} className="organization-payment-card">
      <input name="paymentMethodId" type="hidden" value={method.id} />
      <div>
        <strong>
          {method.methodType} / {method.provider}
        </strong>
        <span>
          {method.brand ?? "manual"}
          {method.last4 ? ` / ${method.last4}` : ""}
          {method.providerPaymentMethodId ? ` / ${method.providerPaymentMethodId}` : ""}
          {method.isDefault ? ` / ${labels.defaultMethod}` : ""}
        </span>
      </div>
      <select defaultValue={method.status} name="status">
        <option value="not_configured">not_configured</option>
        <option value="pending">pending</option>
        <option value="ready">ready</option>
        <option value="requires_action">requires_action</option>
        <option value="failed">failed</option>
        <option value="disabled">disabled</option>
      </select>
      <label className="policy-checkbox">
        <input name="isDefault" type="checkbox" />
        <span>{labels.setDefault}</span>
      </label>
      <button className="secondary-button secondary-button--compact" disabled={disabled} type="submit">
        <Save size={15} aria-hidden="true" />
        <span>{labels.updateStatus}</span>
      </button>
    </form>
  );
}

function ActionMessage({ state }: { state: OrganizationBillingActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
