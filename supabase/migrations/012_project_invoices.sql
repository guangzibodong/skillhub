create table if not exists project_invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  invoice_number text not null unique,
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'void')),
  currency text not null default 'usd',
  period_start timestamptz not null,
  period_end timestamptz not null,
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, period_start, period_end, currency)
);

create table if not exists project_invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references project_invoices(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  description text not null,
  quantity integer not null default 1,
  unit_amount_cents integer not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  source_type text not null check (source_type in ('usage', 'subscription', 'refund', 'adjustment')),
  service_period_start timestamptz,
  service_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists project_invoices_project_period_idx
  on project_invoices(project_id, period_start desc, period_end desc);

create index if not exists project_invoice_line_items_invoice_idx
  on project_invoice_line_items(invoice_id, created_at asc);

create unique index if not exists project_invoice_line_items_invoice_transaction_idx
  on project_invoice_line_items(invoice_id, transaction_id)
  where transaction_id is not null;
