"use client";

import { useActionState } from "react";
import { CheckCircle2, Download, FileText, Plus, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectInvoiceRecord } from "@/lib/ops-data";
import { formatMoney } from "@/lib/ops-format";
import { generateProjectInvoiceAction, type ProjectInvoiceActionState } from "@/lib/project-invoice-actions";

type ProjectInvoiceManagerProps = {
  emptyLabel: string;
  invoices: DeveloperProjectInvoiceRecord[];
  locale: Locale;
  noDateLabel: string;
  projectSlug: string;
  titleLabel: string;
};

const copy = {
  en: {
    currency: "Currency",
    download: "CSV",
    due: "Due",
    generate: "Generate invoice",
    generating: "Generating",
    lineItems: "line items",
    notAvailable: "Not available",
    periodEnd: "Period end",
    periodStart: "Period start",
    total: "Total",
    statuses: {
      draft: "Draft",
      issued: "Issued",
      paid: "Paid",
      overdue: "Overdue",
      void: "Void"
    }
  },
  zh: {
    currency: "币种",
    download: "CSV",
    due: "到期",
    generate: "生成发票",
    generating: "生成中",
    lineItems: "行项目",
    notAvailable: "暂无",
    periodEnd: "结束日期",
    periodStart: "开始日期",
    total: "合计",
    statuses: {
      draft: "草稿",
      issued: "已开具",
      paid: "已支付",
      overdue: "已逾期",
      void: "已作废"
    }
  }
} as const;

const initialInvoiceActionState: ProjectInvoiceActionState = {
  message: "",
  status: "idle"
};

export function ProjectInvoiceManager({
  emptyLabel,
  invoices,
  locale,
  noDateLabel,
  projectSlug,
  titleLabel
}: ProjectInvoiceManagerProps) {
  const labels = copy[locale];
  const [invoiceState, invoiceAction, isInvoicePending] = useActionState(
    generateProjectInvoiceAction.bind(null, projectSlug, locale),
    initialInvoiceActionState
  );
  const defaultPeriod = getDefaultPeriod();

  return (
    <section className="ops-panel project-table-panel project-invoice-manager">
      <div className="card-kicker">
        <FileText size={16} aria-hidden="true" />
        <span>{titleLabel}</span>
      </div>

      <form action={invoiceAction} className="project-invoice-generate-form">
        <label>
          <span>{labels.periodStart}</span>
          <input defaultValue={defaultPeriod.start} name="periodStart" type="date" />
        </label>
        <label>
          <span>{labels.periodEnd}</span>
          <input defaultValue={defaultPeriod.end} name="periodEnd" type="date" />
        </label>
        <label>
          <span>{labels.currency}</span>
          <input defaultValue="usd" maxLength={3} name="currency" />
        </label>
        <button className="primary-button" disabled={isInvoicePending} type="submit">
          <Plus size={16} aria-hidden="true" />
          <span>{isInvoicePending ? labels.generating : labels.generate}</span>
        </button>
      </form>

      {invoiceState.status !== "idle" ? (
        <div className={invoiceState.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
          {invoiceState.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
          <span>{invoiceState.message}</span>
        </div>
      ) : null}

      <div className="project-invoice-list">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <article className="project-invoice-card" key={invoice.id}>
              <header className="project-invoice-card__head">
                <strong>
                  {invoice.invoiceNumber}
                  <small>
                    {formatDateValue(invoice.periodStart, locale, noDateLabel)} - {formatDateValue(invoice.periodEnd, locale, noDateLabel)}
                  </small>
                </strong>
                <span className={statusChipClass(invoice.status)}>{formatInvoiceStatus(invoice.status, labels)}</span>
              </header>
              <div className="project-invoice-card__meta">
                <span>
                  {labels.total}
                  <strong>{formatMoney(invoice.totalCents, invoice.currency)}</strong>
                </span>
                <span>
                  {labels.due}
                  <strong>{formatDateValue(invoice.dueAt, locale, noDateLabel)}</strong>
                </span>
                <span>
                  {invoice.lineItemCount} {labels.lineItems}
                </span>
              </div>
              <a className="secondary-button secondary-button--compact project-invoice-download" href={`/dashboard/projects/${projectSlug}/invoices/${invoice.id}/download`}>
                <Download size={15} aria-hidden="true" />
                <span>{labels.download}</span>
              </a>
            </article>
          ))
        ) : (
          <div className="project-table__row project-table__row--empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
}

function statusChipClass(status: string) {
  if (status === "void") {
    return "status-chip status-chip--danger";
  }

  if (status === "draft" || status === "issued") {
    return "status-chip status-chip--warning";
  }

  return "status-chip";
}

type InvoiceLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function formatInvoiceStatus(value: string, labels: InvoiceLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.statuses[normalized as keyof typeof labels.statuses] ?? humanizeEnum(value, labels.notAvailable);
}

function humanizeEnum(value: string, fallback: string) {
  const normalized = value.replaceAll("_", " ").trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : fallback;
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
    month: "short"
  }).format(date);
}

function getDefaultPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    end: toDateInputValue(end),
    start: toDateInputValue(start)
  };
}

function toDateInputValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}
