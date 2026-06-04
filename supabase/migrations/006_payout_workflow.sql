alter table payouts
  add column if not exists review_reason text,
  add column if not exists failure_reason text,
  add column if not exists provider_reference text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists payout_balance_items (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references payouts(id) on delete cascade,
  publisher_balance_id uuid not null references publisher_balances(id) on delete restrict,
  amount_cents integer not null,
  currency text not null default 'usd',
  created_at timestamptz not null default now()
);

create index if not exists payout_balance_items_payout_idx
  on payout_balance_items(payout_id);

create index if not exists payout_balance_items_balance_idx
  on payout_balance_items(publisher_balance_id, created_at desc);

create index if not exists payouts_publisher_status_idx
  on payouts(publisher_profile_id, status, requested_at desc);
