alter table stripe_checkout_sessions
  add column if not exists stripe_connected_account_id text,
  add column if not exists application_fee_amount_cents integer,
  add column if not exists publisher_share_cents integer;

create index if not exists stripe_checkout_sessions_connect_idx
  on stripe_checkout_sessions(stripe_connected_account_id, created_at desc)
  where stripe_connected_account_id is not null;
