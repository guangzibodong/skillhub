"use client";

import { useActionState } from "react";
import { CheckCircle2, CreditCard, Save, ShieldCheck, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillCheckbox, SkillInput, SkillSelect, SkillStatusTag } from "@/components/skill-antd";
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
    updateStatus: "Update",
    methodTypes: {
      bank_account: "Bank account",
      card: "Card",
      external: "External",
      invoice: "Invoice"
    },
    providers: {
      manual: "Manual"
    },
    statuses: {
      disabled: "Disabled",
      failed: "Failed",
      not_configured: "Not configured",
      pending: "Pending",
      ready: "Ready",
      requires_action: "Requires action"
    }
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
    updateStatus: "更新",
    methodTypes: {
      bank_account: "银行账户",
      card: "银行卡",
      external: "外部方式",
      invoice: "发票"
    },
    providers: {
      manual: "人工处理"
    },
    statuses: {
      disabled: "已停用",
      failed: "失败",
      not_configured: "未配置",
      pending: "待处理",
      ready: "可用",
      requires_action: "需要操作"
    }
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
        <SkillStatusTag className={billing.summary.invoiceReady ? "status-chip" : "status-chip status-chip--warning"}>
          {billing.summary.invoiceReady ? labels.ready : labels.requiresSetup}
        </SkillStatusTag>
      </div>

      <form action={profileAction} className="organization-billing-form">
        <strong>{labels.profileTitle}</strong>
        <label>
          <span>{labels.billingName}</span>
          <SkillInput defaultValue={profile?.billingName ?? ""} name="billingName" required />
        </label>
        <label>
          <span>{labels.billingEmail}</span>
          <SkillInput defaultValue={profile?.billingEmail ?? ""} name="billingEmail" type="email" />
        </label>
        <label>
          <span>{labels.taxId}</span>
          <SkillInput defaultValue={profile?.taxId ?? ""} name="taxId" />
        </label>
        <label>
          <span>{labels.country}</span>
          <SkillInput defaultValue={profile?.country ?? ""} maxLength={2} name="country" />
        </label>
        <label className="organization-billing-form__wide">
          <span>{labels.addressLine1}</span>
          <SkillInput defaultValue={profile?.addressLine1 ?? ""} name="addressLine1" />
        </label>
        <label>
          <span>{labels.city}</span>
          <SkillInput defaultValue={profile?.city ?? ""} name="city" />
        </label>
        <label>
          <span>{labels.region}</span>
          <SkillInput defaultValue={profile?.region ?? ""} name="region" />
        </label>
        <label>
          <span>{labels.postalCode}</span>
          <SkillInput defaultValue={profile?.postalCode ?? ""} name="postalCode" />
        </label>
        <label className="organization-billing-form__wide">
          <span>{labels.invoiceNotes}</span>
          <SkillInput defaultValue={profile?.invoiceNotes ?? ""} name="invoiceNotes" />
        </label>
        <SkillButton className="primary-button organization-billing-form__wide" disabled={isProfilePending} htmlType="submit">
          <Save size={16} aria-hidden="true" />
          <span>{isProfilePending ? labels.saving : labels.saveProfile}</span>
        </SkillButton>
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
          <SkillSelect defaultValue="manual" name="provider" options={[{ label: labels.providers.manual, value: "manual" }]} />
        </label>
        <label>
          <span>{labels.providerCustomerId}</span>
          <SkillInput name="providerCustomerId" />
        </label>
        <label className="organization-payment-form__wide">
          <span>{labels.providerPaymentMethodId}</span>
          <SkillInput name="providerPaymentMethodId" />
        </label>
        <label>
          <span>{labels.methodType}</span>
          <SkillSelect defaultValue="invoice" name="methodType" options={[
            { label: labels.methodTypes.invoice, value: "invoice" },
            { label: labels.methodTypes.card, value: "card" },
            { label: labels.methodTypes.bank_account, value: "bank_account" },
            { label: labels.methodTypes.external, value: "external" }
          ]} />
        </label>
        <label>
          <span>{labels.status}</span>
          <SkillSelect defaultValue="pending" name="status" options={paymentStatusOptions(labels)} />
        </label>
        <label>
          <span>{labels.brand}</span>
          <SkillInput defaultValue="manual" name="brand" />
        </label>
        <label>
          <span>{labels.last4}</span>
          <SkillInput maxLength={4} name="last4" />
        </label>
        <label>
          <span>{labels.expMonth}</span>
          <SkillInput min="1" max="12" name="expMonth" type="number" />
        </label>
        <label>
          <span>{labels.expYear}</span>
          <SkillInput min="2026" max="2100" name="expYear" type="number" />
        </label>
        <label className="policy-checkbox organization-payment-form__default">
          <SkillCheckbox defaultChecked name="isDefault" />
          <span>{labels.defaultMethod}</span>
        </label>
        <SkillButton className="secondary-button organization-payment-form__submit" disabled={isPaymentPending} htmlType="submit">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{isPaymentPending ? labels.saving : labels.addMethod}</span>
        </SkillButton>
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
          {formatMethodType(method.methodType, labels.methodTypes)} / {formatProvider(method.provider, labels.providers)}
        </strong>
        <span>
          {method.brand ?? "manual"}
          {method.last4 ? ` / ${method.last4}` : ""}
          {method.providerPaymentMethodId ? ` / ${method.providerPaymentMethodId}` : ""}
          {method.isDefault ? ` / ${labels.defaultMethod}` : ""}
        </span>
      </div>
      <SkillSelect defaultValue={method.status} name="status" options={paymentStatusOptions(labels)} />
      <label className="policy-checkbox">
        <SkillCheckbox name="isDefault" />
        <span>{labels.setDefault}</span>
      </label>
      <SkillButton className="secondary-button secondary-button--compact" disabled={disabled} htmlType="submit">
        <Save size={15} aria-hidden="true" />
        <span>{labels.updateStatus}</span>
      </SkillButton>
    </form>
  );
}

function formatMethodType(value: OrganizationPaymentMethod["methodType"], labels: Record<string, string>) {
  return labels[value] ?? value.replaceAll("_", " ");
}

function formatProvider(value: string, labels: Record<string, string>) {
  return labels[value] ?? value.replaceAll("_", " ");
}

function ActionMessage({ state }: { state: OrganizationBillingActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}

function paymentStatusOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return [
    { label: labels.statuses.not_configured, value: "not_configured" },
    { label: labels.statuses.pending, value: "pending" },
    { label: labels.statuses.ready, value: "ready" },
    { label: labels.statuses.requires_action, value: "requires_action" },
    { label: labels.statuses.failed, value: "failed" },
    { label: labels.statuses.disabled, value: "disabled" }
  ];
}
