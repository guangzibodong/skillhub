"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileWarning,
  Gavel,
  ReceiptText,
  RotateCcw,
  Save,
  Scale,
  XCircle
} from "lucide-react";
import { decideAdminDisputeAction, decideAdminRefundAction, type AdminAdjustmentActionState } from "@/lib/admin-adjustment-actions";
import type { Locale } from "@/lib/i18n";
import type { DisputeRecord, RefundRecord } from "@/lib/ops-data";
import { formatMoney } from "@/lib/ops-format";

type AdminAdjustmentManagerProps = {
  disputes: DisputeRecord[];
  locale: Locale;
  refunds: RefundRecord[];
};

const copy = {
  en: {
    amount: "Amount",
    approve: "Approve",
    disputeReason: "Dispute note",
    disputeStatus: "Dispute status",
    disputes: "Disputes",
    due: "Due",
    emptyDisputes: "No card disputes require operator action.",
    emptyRefunds: "No refunds require finance action.",
    fail: "Fail",
    post: "Post refund",
    postRefund: "Post refund on loss",
    project: "Project",
    providerReference: "Provider ref",
    reason: "Finance reason",
    refundAction: "Refund action",
    refunds: "Refunds",
    reject: "Reject",
    requested: "Requested",
    save: "Record decision",
    saving: "Saving",
    title: "Refund and dispute queue",
    transaction: "Transaction",
    disputeStatuses: {
      lost: "Lost",
      open: "Open",
      warning_needs_response: "Needs response",
      won: "Won"
    },
    refundStatuses: {
      approved: "Approved",
      failed: "Failed",
      posted: "Posted",
      rejected: "Rejected",
      requested: "Requested"
    }
  },
  zh: {
    amount: "金额",
    approve: "批准",
    disputeReason: "争议备注",
    disputeStatus: "争议状态",
    disputes: "争议",
    due: "截止时间",
    emptyDisputes: "当前没有需要处理的支付争议。",
    emptyRefunds: "当前没有需要财务处理的退款。",
    fail: "失败",
    post: "入账退款",
    postRefund: "败诉时入账退款",
    project: "项目",
    providerReference: "服务商编号",
    reason: "财务原因",
    refundAction: "退款动作",
    refunds: "退款",
    reject: "拒绝",
    requested: "申请时间",
    save: "记录决策",
    saving: "保存中",
    title: "退款与争议队列",
    transaction: "交易",
    disputeStatuses: {
      lost: "已败诉",
      open: "处理中",
      warning_needs_response: "需要响应",
      won: "已胜诉"
    },
    refundStatuses: {
      approved: "已批准",
      failed: "失败",
      posted: "已入账",
      rejected: "已拒绝",
      requested: "已申请"
    }
  }
} as const;

const initialState: AdminAdjustmentActionState = {
  message: "",
  status: "idle"
};

export function AdminAdjustmentManager({ disputes, locale, refunds }: AdminAdjustmentManagerProps) {
  const labels = copy[locale];
  const [refundState, refundAction, isRefundPending] = useActionState(decideAdminRefundAction.bind(null, locale), initialState);
  const [disputeState, disputeAction, isDisputePending] = useActionState(decideAdminDisputeAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel admin-adjustment-manager">
      <div className="admin-adjustment-manager__head">
        <div className="card-kicker">
          <Scale size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <div className="admin-adjustment-counts">
          <span className="status-chip status-chip--warning">{refunds.length}</span>
          <span className="status-chip status-chip--neutral">{disputes.length}</span>
        </div>
      </div>

      <div className="admin-adjustment-grid">
        <section className="admin-adjustment-queue">
          <header className="admin-adjustment-queue__head">
            <div>
              <RotateCcw size={16} aria-hidden="true" />
              <strong>{labels.refunds}</strong>
            </div>
            <span className="status-chip status-chip--warning">{refunds.length}</span>
          </header>

          <div className="admin-adjustment-list">
            {refunds.length > 0 ? (
              refunds.map((refund) => {
                const rowState = refundState.recordType === "refund" && refundState.recordId === refund.id ? refundState : null;
                const latest = rowState?.refund ?? refund;

                return (
                  <section className="admin-adjustment-card" key={refund.id}>
                    <AdjustmentHeader
                      id={latest.id}
                      status={labels.refundStatuses[latest.status]}
                      statusClassName={refundStatusClass(latest.status)}
                      title={latest.skillName ?? latest.transactionId ?? latest.id}
                    />

                    <div className="admin-adjustment-metrics">
                      <StatusTile icon={<CreditCard size={15} aria-hidden="true" />} label={labels.amount} value={formatMoney(latest.amountCents, latest.currency)} />
                      <StatusTile icon={<ReceiptText size={15} aria-hidden="true" />} label={labels.transaction} value={latest.transactionId ?? "n/a"} />
                      <StatusTile icon={<Gavel size={15} aria-hidden="true" />} label={labels.project} value={latest.projectSlug ?? "n/a"} />
                      <StatusTile icon={<Clock3 size={15} aria-hidden="true" />} label={labels.requested} value={formatDate(latest.requestedAt, locale)} />
                    </div>

                    <RecordNote
                      icon={<ReceiptText size={15} aria-hidden="true" />}
                      text={joinParts([latest.reason, latest.providerReference, latest.adjustmentTransactionId])}
                    />

                    <form action={refundAction} className="admin-adjustment-action-form">
                      <input name="refundId" type="hidden" value={latest.id} />
                      <label>
                        <span>{labels.refundAction}</span>
                        <select defaultValue={suggestedRefundAction(latest)} name="action">
                          <option value="approve">{labels.approve}</option>
                          <option value="reject">{labels.reject}</option>
                          <option value="post">{labels.post}</option>
                          <option value="fail">{labels.fail}</option>
                        </select>
                      </label>
                      <label>
                        <span>{labels.reason}</span>
                        <input defaultValue={defaultRefundReason(latest, locale)} name="reason" required />
                      </label>
                      <label>
                        <span>{labels.providerReference}</span>
                        <input defaultValue={latest.providerReference ?? ""} name="providerReference" />
                      </label>
                      <button className="secondary-button secondary-button--compact" disabled={isRefundPending || isRefundTerminal(latest.status)} type="submit">
                        <Save size={15} aria-hidden="true" />
                        <span>{isRefundPending && rowState ? labels.saving : labels.save}</span>
                      </button>
                    </form>

                    {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
                  </section>
                );
              })
            ) : (
              <div className="admin-adjustment-empty">{labels.emptyRefunds}</div>
            )}
          </div>
        </section>

        <section className="admin-adjustment-queue">
          <header className="admin-adjustment-queue__head">
            <div>
              <FileWarning size={16} aria-hidden="true" />
              <strong>{labels.disputes}</strong>
            </div>
            <span className="status-chip status-chip--neutral">{disputes.length}</span>
          </header>

          <div className="admin-adjustment-list">
            {disputes.length > 0 ? (
              disputes.map((dispute) => {
                const rowState = disputeState.recordType === "dispute" && disputeState.recordId === dispute.id ? disputeState : null;
                const latest = rowState?.dispute ?? dispute;

                return (
                  <section className="admin-adjustment-card" key={dispute.id}>
                    <AdjustmentHeader
                      id={latest.id}
                      status={labels.disputeStatuses[latest.status]}
                      statusClassName={disputeStatusClass(latest.status)}
                      title={latest.skillName ?? latest.transactionId ?? latest.id}
                    />

                    <div className="admin-adjustment-metrics">
                      <StatusTile icon={<CreditCard size={15} aria-hidden="true" />} label={labels.amount} value={formatMoney(latest.amountCents, latest.currency)} />
                      <StatusTile icon={<ReceiptText size={15} aria-hidden="true" />} label={labels.transaction} value={latest.transactionId ?? "n/a"} />
                      <StatusTile icon={<Gavel size={15} aria-hidden="true" />} label={labels.project} value={latest.projectSlug ?? "n/a"} />
                      <StatusTile icon={<Clock3 size={15} aria-hidden="true" />} label={labels.due} value={formatDate(latest.dueAt ?? latest.updatedAt, locale)} />
                    </div>

                    <RecordNote icon={<FileWarning size={15} aria-hidden="true" />} text={joinParts([latest.reason, latest.externalReference])} />

                    <form action={disputeAction} className="admin-adjustment-action-form admin-adjustment-action-form--dispute">
                      <input name="disputeId" type="hidden" value={latest.id} />
                      <label>
                        <span>{labels.disputeStatus}</span>
                        <select defaultValue={suggestedDisputeStatus(latest)} name="status">
                          <option value="open">{labels.disputeStatuses.open}</option>
                          <option value="warning_needs_response">{labels.disputeStatuses.warning_needs_response}</option>
                          <option value="won">{labels.disputeStatuses.won}</option>
                          <option value="lost">{labels.disputeStatuses.lost}</option>
                        </select>
                      </label>
                      <label>
                        <span>{labels.disputeReason}</span>
                        <input defaultValue={defaultDisputeReason(latest, locale)} name="reason" required />
                      </label>
                      <label className="admin-adjustment-check">
                        <input defaultChecked name="postRefund" type="checkbox" />
                        <span>{labels.postRefund}</span>
                      </label>
                      <button className="secondary-button secondary-button--compact" disabled={isDisputePending} type="submit">
                        <Save size={15} aria-hidden="true" />
                        <span>{isDisputePending && rowState ? labels.saving : labels.save}</span>
                      </button>
                    </form>

                    {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
                  </section>
                );
              })
            ) : (
              <div className="admin-adjustment-empty">{labels.emptyDisputes}</div>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function AdjustmentHeader({ id, status, statusClassName, title }: { id: string; status: string; statusClassName: string; title: string }) {
  return (
    <header className="admin-adjustment-card__head">
      <div>
        <strong>{title}</strong>
        <span>{id}</span>
      </div>
      <span className={statusClassName}>{status}</span>
    </header>
  );
}

function StatusTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecordNote({ icon, text }: { icon: ReactNode; text: string | null }) {
  if (!text) {
    return null;
  }

  return (
    <div className="admin-adjustment-note">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function ActionMessage({ state }: { state: AdminAdjustmentActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function suggestedRefundAction(refund: RefundRecord) {
  if (refund.status === "approved") {
    return "post";
  }

  if (refund.status === "rejected") {
    return "reject";
  }

  if (refund.status === "failed") {
    return "fail";
  }

  if (refund.status === "posted") {
    return "post";
  }

  return "approve";
}

function suggestedDisputeStatus(dispute: DisputeRecord) {
  return dispute.status;
}

function defaultRefundReason(refund: RefundRecord, locale: Locale) {
  if (refund.reason) {
    return refund.reason;
  }

  if (refund.status === "approved") {
    return locale === "zh" ? "退款已批准，准备入账调整。" : "Refund approved; ready to post ledger adjustment.";
  }

  return locale === "zh" ? "已核对交易、项目和剩余可退金额。" : "Transaction, project, and remaining refundable amount verified.";
}

function defaultDisputeReason(dispute: DisputeRecord, locale: Locale) {
  if (dispute.reason) {
    return dispute.reason;
  }

  if (dispute.status === "warning_needs_response") {
    return locale === "zh" ? "支付网络预警需要证据响应。" : "Card network warning requires evidence response.";
  }

  return locale === "zh" ? "已核对支付争议证据和关联交易。" : "Dispute evidence and linked transaction verified.";
}

function refundStatusClass(status: RefundRecord["status"]) {
  if (status === "posted" || status === "approved") {
    return "status-chip";
  }

  if (status === "requested") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--danger";
}

function disputeStatusClass(status: DisputeRecord["status"]) {
  if (status === "won") {
    return "status-chip";
  }

  if (status === "lost") {
    return "status-chip status-chip--danger";
  }

  if (status === "warning_needs_response") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function isRefundTerminal(status: RefundRecord["status"]) {
  return status === "posted" || status === "rejected" || status === "failed";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value || value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function joinParts(parts: Array<string | null | undefined>) {
  const visible = parts.map((part) => part?.trim()).filter(Boolean);
  return visible.length > 0 ? visible.join(" / ") : null;
}
