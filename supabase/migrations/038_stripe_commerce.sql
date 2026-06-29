alter table skill_prices
  add column if not exists stripe_product_id text,
  add column if not exists stripe_price_id text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists skill_prices_stripe_price_id_idx
  on skill_prices(stripe_price_id)
  where stripe_price_id is not null;

alter table subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_checkout_session_id text;

create unique index if not exists subscriptions_stripe_subscription_id_idx
  on subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists subscriptions_project_skill_idx
  on subscriptions(project_id, skill_id);

create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  stripe_customer_id text not null unique,
  email text,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create table if not exists stripe_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  stripe_customer_id text,
  mode text not null check (mode in ('payment', 'subscription')),
  status text not null default 'created',
  payment_status text,
  amount_total_cents integer,
  currency text,
  url text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_checkout_sessions_org_idx
  on stripe_checkout_sessions(organization_id, created_at desc);

create table if not exists stripe_payment_intents (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_intent_id text not null unique,
  stripe_customer_id text,
  organization_id uuid references organizations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  amount_cents integer,
  currency text,
  status text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text not null unique,
  stripe_customer_id text,
  organization_id uuid references organizations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_subscriptions_org_idx
  on stripe_subscriptions(organization_id, updated_at desc);

create table if not exists stripe_refunds (
  id uuid primary key default gen_random_uuid(),
  stripe_refund_id text not null unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  amount_cents integer,
  currency text,
  status text,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stripe_disputes (
  id uuid primary key default gen_random_uuid(),
  stripe_dispute_id text not null unique,
  stripe_payment_intent_id text,
  amount_cents integer,
  currency text,
  status text,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stripe_connect_accounts (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null references publisher_profiles(id) on delete cascade,
  stripe_account_id text not null unique,
  details_submitted boolean not null default false,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  requirements_currently_due text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publisher_profile_id)
);

alter table payout_accounts
  add column if not exists stripe_account_id text;

create unique index if not exists payout_accounts_stripe_account_id_idx
  on payout_accounts(stripe_account_id)
  where stripe_account_id is not null;

create table if not exists stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  payload jsonb not null,
  processing_status text not null default 'processed' check (processing_status in ('processed', 'failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists stripe_webhook_events_type_idx
  on stripe_webhook_events(event_type, received_at desc);
