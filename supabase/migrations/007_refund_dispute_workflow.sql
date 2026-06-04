alter table refunds
  add column if not exists currency text not null default 'usd',
  add column if not exists status text not null default 'requested',
  add column if not exists adjustment_transaction_id uuid references transactions(id) on delete set null,
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists decided_at timestamptz,
  add column if not exists posted_at timestamptz,
  add column if not exists provider_reference text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists metadata jsonb not null default '{}';

alter table refunds drop constraint if exists refunds_status_check;

alter table refunds
  add constraint refunds_status_check
  check (status in ('requested', 'approved', 'posted', 'rejected', 'failed'));

alter table disputes
  add column if not exists currency text not null default 'usd',
  add column if not exists external_reference text,
  add column if not exists due_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists metadata jsonb not null default '{}';

create index if not exists refunds_status_idx
  on refunds(status, created_at desc);

create index if not exists refunds_transaction_idx
  on refunds(transaction_id, status, created_at desc);

create index if not exists disputes_status_idx
  on disputes(status, created_at desc);

create index if not exists disputes_transaction_idx
  on disputes(transaction_id, status, created_at desc);
