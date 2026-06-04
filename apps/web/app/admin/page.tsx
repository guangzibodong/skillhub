import {
  AlertTriangle,
  Banknote,
  ClipboardCheck,
  FileClock,
  Gavel,
  ListChecks,
  LockKeyhole,
  ReceiptText,
  Scale,
  ShieldCheck,
  Siren,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const financeIcons = [Scale, Banknote, AlertTriangle] as const;

const adminOpsCopy = {
  en: {
    riskTitle: "Risk command center",
    riskHeaders: ["Signal", "Scope", "Action", "Owner"],
    riskRows: [
      ["High-risk filesystem skill", "codebase-risk-scanner", "Require owner approval", "Trust"],
      ["Unusual payout request", "$4,800 request", "Hold for KYC review", "Finance"],
      ["Runtime error spike", "browser-research-pro", "Throttle and notify publisher", "Platform"]
    ],
    moneyTitle: "Money ledger controls",
    moneyHeaders: ["Batch", "Gross", "Platform fee", "Publisher share", "State"],
    moneyRows: [
      ["usage-2026-06-04", "$2,840", "$568", "$2,272", "maturing"],
      ["sub-2026-06", "$6,300", "$1,260", "$5,040", "available"],
      ["refund-1820", "-$96", "-$19", "-$77", "adjusted"]
    ],
    actionTitle: "Admin action rules",
    actionRows: [
      ["Approve skill", "Creates audit log and public listing event"],
      ["Block payout", "Requires reason, owner, and retry condition"],
      ["Reverse transaction", "Adds adjustment, never edits historical split"]
    ],
    payoutRows: [
      ["$4,800 payout", "KYC hold"],
      ["$1,240 payout", "ready"],
      ["$680 payout", "scheduled"]
    ]
  },
  zh: {
    riskTitle: "风险指挥台",
    riskHeaders: ["信号", "范围", "动作", "负责人"],
    riskRows: [
      ["高风险文件系统技能", "codebase-risk-scanner", "要求 owner 批准", "Trust"],
      ["异常提现请求", "$4,800 请求", "暂停并做 KYC 审核", "Finance"],
      ["运行错误激增", "browser-research-pro", "限流并通知发布者", "Platform"]
    ],
    moneyTitle: "资金账本控制",
    moneyHeaders: ["批次", "总额", "平台佣金", "发布者收入", "状态"],
    moneyRows: [
      ["usage-2026-06-04", "$2,840", "$568", "$2,272", "成熟中"],
      ["sub-2026-06", "$6,300", "$1,260", "$5,040", "可提现"],
      ["refund-1820", "-$96", "-$19", "-$77", "已调整"]
    ],
    actionTitle: "后台动作规则",
    actionRows: [
      ["批准技能", "创建审计日志和公开上架事件"],
      ["阻止提现", "必须记录原因、负责人和重试条件"],
      ["冲回交易", "新增调整交易，绝不修改历史分账"]
    ],
    payoutRows: [
      ["$4,800 提现", "KYC 暂停"],
      ["$1,240 提现", "可执行"],
      ["$680 提现", "已计划"]
    ]
  }
} as const;

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.adminPage;
  const ops = adminOpsCopy[locale];

  return (
    <main className="product-shell">
      <SiteHeader active="admin" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/admin" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="console-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {labels.metrics.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-layout">
        <article className="ops-panel admin-review-panel">
          <div className="card-kicker">
            <ClipboardCheck size={16} aria-hidden="true" />
            <span>{labels.reviewTitle}</span>
          </div>
          <div className="review-queue">
            {labels.reviewRows.map(([name, risk, signal, state]) => (
              <div className="review-queue__row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{signal}</span>
                </div>
                <span className="risk-badge">{risk}</span>
                <span className="status-chip">{state}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel admin-audit-panel">
          <div className="card-kicker">
            <FileClock size={16} aria-hidden="true" />
            <span>{labels.auditTitle}</span>
          </div>
          <div className="audit-list">
            {labels.auditRows.map((item) => (
              <div className="audit-row" key={item}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="admin-layout">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <Siren size={16} aria-hidden="true" />
            <span>{ops.riskTitle}</span>
          </div>
          <div className="work-table">
            <div className="work-table__row work-table__row--head">
              {ops.riskHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {ops.riskRows.map(([signal, scope, action, owner]) => (
              <div className="work-table__row" key={signal}>
                <strong>{signal}</strong>
                <span>{scope}</span>
                <span>{action}</span>
                <span>{owner}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel">
          <div className="card-kicker">
            <Gavel size={16} aria-hidden="true" />
            <span>{ops.actionTitle}</span>
          </div>
          <div className="ops-list">
            {ops.actionRows.map(([title, detail]) => (
              <div className="ops-row" key={title}>
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="workspace-ops-layout">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <ReceiptText size={16} aria-hidden="true" />
            <span>{ops.moneyTitle}</span>
          </div>
          <div className="money-table">
            <div className="money-table__row money-table__row--head">
              {ops.moneyHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {ops.moneyRows.map(([batch, gross, fee, share, state]) => (
              <div className="money-table__row" key={batch}>
                <strong>{batch}</strong>
                <span>{gross}</span>
                <span>{fee}</span>
                <span>{share}</span>
                <span className="status-chip">{state}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel">
          <div className="card-kicker">
            <WalletCards size={16} aria-hidden="true" />
            <span>{labels.metrics[2][0]}</span>
          </div>
          <div className="payout-list">
            {ops.payoutRows.map(([label, state], index) => {
              const Icon = index === 0 ? AlertTriangle : index === 1 ? ShieldCheck : Banknote;
              return (
                <div className="payout-row" key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{state}</strong>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="admin-finance-section">
        <div className="section-heading section-heading--compact">
          <div className="eyebrow">
            <ListChecks size={16} aria-hidden="true" />
            <span>{labels.financeTitle}</span>
          </div>
        </div>

        <div className="finance-rule-grid">
          {labels.financeRows.map(([title, detail], index) => {
            const Icon = financeIcons[index];
            return (
              <article className="finance-rule lift-card" key={title}>
                <Icon size={19} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
