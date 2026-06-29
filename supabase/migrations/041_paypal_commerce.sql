do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'platform_provider_configs') then
    alter table platform_provider_configs
      drop constraint if exists platform_provider_configs_provider_type_check;
    alter table platform_provider_configs
      drop constraint if exists platform_provider_configs_key_check;

    alter table platform_provider_configs
      add constraint platform_provider_configs_provider_type_check
      check (provider_type in ('oauth', 'email', 'stripe', 'paypal'));

    alter table platform_provider_configs
      add constraint platform_provider_configs_key_check
      check (
        (provider_type = 'oauth' and provider_key in ('google', 'github'))
        or (provider_type = 'email' and provider_key in ('resend', 'smtp'))
        or (provider_type = 'stripe' and provider_key in ('commerce'))
        or (provider_type = 'paypal' and provider_key in ('commerce'))
      );
  end if;
end $$;

alter table skill_prices
  add column if not exists paypal_product_id text,
  add column if not exists paypal_plan_id text;

create unique index if not exists skill_prices_paypal_plan_id_idx
  on skill_prices(paypal_plan_id)
  where paypal_plan_id is not null;

alter table subscriptions
  add column if not exists paypal_subscription_id text;

create unique index if not exists subscriptions_paypal_subscription_id_idx
  on subscriptions(paypal_subscription_id)
  where paypal_subscription_id is not null;

create table if not exists paypal_payers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  paypal_payer_id text not null unique,
  email text,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create table if not exists paypal_orders (
  id uuid primary key default gen_random_uuid(),
  paypal_order_id text not null unique,
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  paypal_payer_id text,
  status text not null default 'created',
  amount_total_cents integer,
  currency text,
  approval_url text,
  application_fee_amount_cents integer,
  publisher_share_cents integer,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paypal_orders_org_idx
  on paypal_orders(organization_id, created_at desc);

create table if not exists paypal_captures (
  id uuid primary key default gen_random_uuid(),
  paypal_capture_id text not null unique,
  paypal_order_id text,
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

create table if not exists paypal_subscriptions (
  id uuid primary key default gen_random_uuid(),
  paypal_subscription_id text not null unique,
  paypal_plan_id text,
  organization_id uuid references organizations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paypal_subscriptions_org_idx
  on paypal_subscriptions(organization_id, updated_at desc);

create table if not exists paypal_refunds (
  id uuid primary key default gen_random_uuid(),
  paypal_refund_id text not null unique,
  paypal_capture_id text,
  amount_cents integer,
  currency text,
  status text,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists paypal_webhook_events (
  id uuid primary key default gen_random_uuid(),
  paypal_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processing_status text not null default 'processed' check (processing_status in ('processed', 'failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists paypal_webhook_events_type_idx
  on paypal_webhook_events(event_type, received_at desc);

create unique index if not exists transactions_paypal_capture_source_reference_idx
  on transactions(source_reference)
  where source_reference like 'paypal:capture:%';
