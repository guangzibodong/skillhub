alter table usage_events
  add column if not exists price_id uuid references skill_prices(id) on delete set null,
  add column if not exists transaction_id uuid references transactions(id) on delete set null,
  add column if not exists processed_at timestamptz;

alter table transaction_splits
  add column if not exists publisher_profile_id uuid references publisher_profiles(id) on delete set null;

create index if not exists usage_events_billable_unprocessed_idx
  on usage_events(created_at)
  where billable = true and transaction_id is null;

create unique index if not exists usage_events_transaction_id_idx
  on usage_events(transaction_id)
  where transaction_id is not null;

create index if not exists transaction_splits_publisher_idx
  on transaction_splits(publisher_profile_id, created_at desc);

create unique index if not exists publisher_balances_transaction_split_idx
  on publisher_balances(transaction_split_id)
  where transaction_split_id is not null;
