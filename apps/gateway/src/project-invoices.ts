import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type InvoiceGenerateInput = {
  currency?: unknown;
  periodEnd?: unknown;
  periodStart?: unknown;
};

type ProjectRecord = {
  id: string;
  slug: string;
  name: string;
  organizationId: string;
};

type TransactionRow = {
  id: string;
  skillId: string | null;
  skillSlug: string | null;
  skillName: string | null;
  sourceType: "usage" | "subscription" | "refund" | "adjustment";
  amountCents: number;
  currency: string;
  createdAt: string;
};

type InvoiceRow = {
  id: string;
  projectSlug: string;
  invoiceNumber: string;
  status: "draft" | "issued" | "paid" | "void";
  currency: string;
  periodStart: string;
  periodEnd: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  lineItemCount: number;
};

type InvoiceLineItemRow = {
  id: string;
  transactionId: string | null;
  skillSlug: string | null;
  skillName: string | null;
  description: string;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  currency: string;
  sourceType: "usage" | "subscription" | "refund" | "adjustment";
  servicePeriodStart: string | null;
  servicePeriodEnd: string | null;
  createdAt: string;
};

const fallbackInvoices = [
  {
    id: "demo-invoice-june",
    projectSlug: "research-agent",
    invoiceNumber: "SH-DEMO-202606",
    status: "issued",
    currency: "usd",
    periodStart: "2026-06-01T00:00:00.000Z",
    periodEnd: "2026-07-01T00:00:00.000Z",
    subtotalCents: 248000,
    taxCents: 0,
    totalCents: 248000,
    issuedAt: "demo",
    dueAt: "demo",
    paidAt: null,
    createdAt: "demo",
    updatedAt: "demo",
    lineItemCount: 2
  }
] as const;

const fallbackLineItems = [
  {
    id: "demo-line-browser-research",
    transactionId: "demo-usage-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    description: "Usage - Browser Research",
    quantity: 1,
    unitAmountCents: 124000,
    amountCents: 124000,
    currency: "usd",
    sourceType: "usage",
    servicePeriodStart: "demo",
    servicePeriodEnd: "demo",
    createdAt: "demo"
  },
  {
    id: "demo-line-dataset-summarizer",
    transactionId: "demo-usage-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    skillName: "Dataset Summarizer",
    description: "Usage - Dataset Summarizer",
    quantity: 1,
    unitAmountCents: 124000,
    amountCents: 124000,
    currency: "usd",
    sourceType: "usage",
    servicePeriodStart: "demo",
    servicePeriodEnd: "demo",
    createdAt: "demo"
  }
] as const;

export async function listProjectInvoices(projectSlug: string, organizationId?: string | null, limit = 20) {
  const sql = await getSql();

  if (!sql) {
    return fallbackInvoices.filter((invoice) => invoice.projectSlug === projectSlug).slice(0, limit);
  }

  const scopedOrganizationId = organizationId ?? null;
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);

  return (await sql`
    select
      pi.id::text,
      p.slug as "projectSlug",
      pi.invoice_number as "invoiceNumber",
      pi.status,
      pi.currency,
      pi.period_start as "periodStart",
      pi.period_end as "periodEnd",
      pi.subtotal_cents as "subtotalCents",
      pi.tax_cents as "taxCents",
      pi.total_cents as "totalCents",
      pi.issued_at as "issuedAt",
      pi.due_at as "dueAt",
      pi.paid_at as "paidAt",
      pi.created_at as "createdAt",
      pi.updated_at as "updatedAt",
      count(pili.id)::int as "lineItemCount"
    from project_invoices pi
    join projects p on p.id = pi.project_id
    left join project_invoice_line_items pili on pili.invoice_id = pi.id
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    group by pi.id, p.slug
    order by pi.period_start desc, pi.created_at desc
    limit ${safeLimit}
  `) as InvoiceRow[];
}

export async function getProjectInvoice(projectSlug: string, invoiceId: string, organizationId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    const invoice = fallbackInvoices.find((item) => item.projectSlug === projectSlug && item.id === invoiceId);
    return invoice ? { invoice, lineItems: fallbackLineItems } : null;
  }

  return getProjectInvoiceWithSql(sql, projectSlug, invoiceId, organizationId ?? null);
}

async function getProjectInvoiceWithSql(sql: Sql, projectSlug: string, invoiceId: string, organizationId: string | null) {
  const invoiceRows = (await sql`
    select
      pi.id::text,
      p.slug as "projectSlug",
      pi.invoice_number as "invoiceNumber",
      pi.status,
      pi.currency,
      pi.period_start as "periodStart",
      pi.period_end as "periodEnd",
      pi.subtotal_cents as "subtotalCents",
      pi.tax_cents as "taxCents",
      pi.total_cents as "totalCents",
      pi.issued_at as "issuedAt",
      pi.due_at as "dueAt",
      pi.paid_at as "paidAt",
      pi.created_at as "createdAt",
      pi.updated_at as "updatedAt",
      count(pili.id)::int as "lineItemCount"
    from project_invoices pi
    join projects p on p.id = pi.project_id
    left join project_invoice_line_items pili on pili.invoice_id = pi.id
    where p.slug = ${projectSlug}
      and pi.id = ${invoiceId}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    group by pi.id, p.slug
    limit 1
  `) as InvoiceRow[];
  const invoice = invoiceRows[0];

  if (!invoice) {
    return null;
  }

  const lineItems = (await sql`
    select
      pili.id::text,
      pili.transaction_id::text as "transactionId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      pili.description,
      pili.quantity,
      pili.unit_amount_cents as "unitAmountCents",
      pili.amount_cents as "amountCents",
      pili.currency,
      pili.source_type as "sourceType",
      pili.service_period_start as "servicePeriodStart",
      pili.service_period_end as "servicePeriodEnd",
      pili.created_at as "createdAt"
    from project_invoice_line_items pili
    left join skills s on s.id = pili.skill_id
    where pili.invoice_id = ${invoice.id}
    order by pili.created_at asc
  `) as InvoiceLineItemRow[];

  return { invoice, lineItems };
}

export async function generateProjectInvoice(
  projectSlug: string,
  input: InvoiceGenerateInput = {},
  organizationId?: string | null
) {
  const currency = normalizeCurrency(input.currency);
  const period = normalizePeriod(input.periodStart, input.periodEnd);
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;

  return sql.begin(async (tx: Sql) => {
    const project = await getProject(tx, projectSlug, scopedOrganizationId);
    const transactions = await listInvoiceTransactions(tx, project.id, period.start, period.end, currency);
    const subtotalCents = transactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);
    const taxCents = 0;
    const totalCents = subtotalCents + taxCents;
    const dueAt = addDays(period.end, 14).toISOString();
    const invoiceNumber = createInvoiceNumber(project.id, period.start, period.end);

    const invoiceRows = (await tx`
      insert into project_invoices (
        project_id,
        invoice_number,
        status,
        currency,
        period_start,
        period_end,
        subtotal_cents,
        tax_cents,
        total_cents,
        issued_at,
        due_at,
        updated_at
      )
      values (
        ${project.id},
        ${invoiceNumber},
        'issued',
        ${currency},
        ${period.start.toISOString()},
        ${period.end.toISOString()},
        ${subtotalCents},
        ${taxCents},
        ${totalCents},
        now(),
        ${dueAt},
        now()
      )
      on conflict (project_id, period_start, period_end, currency) do update set
        status = 'issued',
        subtotal_cents = excluded.subtotal_cents,
        tax_cents = excluded.tax_cents,
        total_cents = excluded.total_cents,
        issued_at = coalesce(project_invoices.issued_at, now()),
        due_at = excluded.due_at,
        updated_at = now()
      returning
        id::text,
        invoice_number as "invoiceNumber",
        status,
        currency,
        period_start as "periodStart",
        period_end as "periodEnd",
        subtotal_cents as "subtotalCents",
        tax_cents as "taxCents",
        total_cents as "totalCents",
        issued_at as "issuedAt",
        due_at as "dueAt",
        paid_at as "paidAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as Array<Omit<InvoiceRow, "lineItemCount" | "projectSlug">>;
    const invoice = invoiceRows[0];

    await tx`delete from project_invoice_line_items where invoice_id = ${invoice.id}`;

    for (const transaction of transactions) {
      await tx`
        insert into project_invoice_line_items (
          invoice_id,
          transaction_id,
          skill_id,
          description,
          quantity,
          unit_amount_cents,
          amount_cents,
          currency,
          source_type,
          service_period_start,
          service_period_end
        )
        values (
          ${invoice.id},
          ${transaction.id},
          ${transaction.skillId},
          ${describeLineItem(transaction)},
          1,
          ${transaction.amountCents},
          ${transaction.amountCents},
          ${transaction.currency},
          ${transaction.sourceType},
          ${transaction.createdAt},
          ${transaction.createdAt}
        )
      `;
    }

    await tx`
      insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
      values (
        'project_invoice.generated',
        'project_invoice',
        ${invoice.id},
        'Project invoice generated from posted transactions.',
        ${tx.json({
          projectSlug,
          invoiceNumber: invoice.invoiceNumber,
          periodStart: period.start.toISOString(),
          periodEnd: period.end.toISOString(),
          transactionCount: transactions.length,
          totalCents,
          currency
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${project.organizationId},
        'project_invoice.generated',
        'in_app',
        'Project invoice generated',
        ${tx.json({
          projectSlug,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalCents,
          currency
        })},
        'queued'
      )
    `;

    return getProjectInvoiceWithSql(tx, projectSlug, invoice.id, scopedOrganizationId);
  });
}

export function invoiceToCsv(detail: Awaited<ReturnType<typeof getProjectInvoice>>) {
  if (!detail) {
    throw new Error("Invoice not found.");
  }

  const rows = [
    ["Invoice Number", detail.invoice.invoiceNumber],
    ["Project", detail.invoice.projectSlug],
    ["Status", detail.invoice.status],
    ["Period Start", detail.invoice.periodStart],
    ["Period End", detail.invoice.periodEnd],
    ["Currency", detail.invoice.currency],
    ["Subtotal Cents", String(detail.invoice.subtotalCents)],
    ["Tax Cents", String(detail.invoice.taxCents)],
    ["Total Cents", String(detail.invoice.totalCents)],
    [],
    ["Description", "Skill", "Source", "Quantity", "Unit Amount Cents", "Amount Cents", "Transaction ID"]
  ];

  for (const lineItem of detail.lineItems) {
    rows.push([
      lineItem.description,
      lineItem.skillName ?? lineItem.skillSlug ?? "",
      lineItem.sourceType,
      String(lineItem.quantity),
      String(lineItem.unitAmountCents),
      String(lineItem.amountCents),
      lineItem.transactionId ?? ""
    ]);
  }

  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

async function getProject(sql: Sql, projectSlug: string, organizationId: string | null): Promise<ProjectRecord> {
  const rows = (await sql`
    select id::text, slug, name, organization_id::text as "organizationId"
    from projects
    where slug = ${projectSlug}
      and (${organizationId}::uuid is null or organization_id = ${organizationId})
    limit 1
  `) as ProjectRecord[];
  const project = rows[0];

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

async function listInvoiceTransactions(sql: Sql, projectId: string, periodStart: Date, periodEnd: Date, currency: string) {
  return (await sql`
    select
      t.id::text,
      t.skill_id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      t.source_type as "sourceType",
      t.amount_cents as "amountCents",
      t.currency,
      t.created_at as "createdAt"
    from transactions t
    left join skills s on s.id = t.skill_id
    where t.project_id = ${projectId}
      and t.status = 'posted'
      and t.currency = ${currency}
      and t.created_at >= ${periodStart.toISOString()}
      and t.created_at < ${periodEnd.toISOString()}
    order by t.created_at asc
  `) as TransactionRow[];
}

function normalizeCurrency(value: unknown) {
  const currency = String(value ?? "usd").trim().toLowerCase();

  if (!/^[a-z]{3}$/.test(currency)) {
    throw new Error("currency must be a three-letter ISO currency code.");
  }

  return currency;
}

function normalizePeriod(periodStartValue: unknown, periodEndValue: unknown) {
  const start = periodStartValue ? new Date(String(periodStartValue)) : startOfMonth(new Date());
  const end = periodEndValue ? new Date(String(periodEndValue)) : addMonths(start, 1);

  if (Number.isNaN(start.getTime())) {
    throw new Error("periodStart must be a valid date.");
  }

  if (Number.isNaN(end.getTime())) {
    throw new Error("periodEnd must be a valid date.");
  }

  if (end.getTime() <= start.getTime()) {
    throw new Error("periodEnd must be after periodStart.");
  }

  return { start, end };
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate(), 0, 0, 0, 0));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function createInvoiceNumber(projectId: string, periodStart: Date, periodEnd: Date) {
  const start = periodKey(periodStart);
  const end = periodKey(periodEnd);
  return `SH-${projectId.replace(/-/g, "").slice(0, 8).toUpperCase()}-${start}-${end}`;
}

function periodKey(date: Date) {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
}

function describeLineItem(transaction: TransactionRow) {
  const source = transaction.sourceType[0].toUpperCase() + transaction.sourceType.slice(1);
  return `${source} - ${transaction.skillName ?? transaction.skillSlug ?? "SkillHub platform"}`;
}

function csvCell(value: string) {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for project invoice operations.");
  }

  return sql;
}
