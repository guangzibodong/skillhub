alter table transactions
  add column if not exists source_reference text;

create unique index if not exists transactions_subscription_source_reference_idx
  on transactions(source_reference)
  where source_type = 'subscription' and source_reference is not null;

create index if not exists transactions_source_type_created_idx
  on transactions(source_type, created_at desc);
