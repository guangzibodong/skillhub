create table if not exists organization_webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  url text not null,
  description text,
  events text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  signing_secret_hash text not null,
  signing_secret_prefix text not null,
  signing_secret_last4 text not null,
  last_delivery_status text check (last_delivery_status in ('pending', 'delivered', 'failed', 'skipped')),
  last_delivered_at timestamptz,
  failure_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists webhook_delivery_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  endpoint_id uuid references organization_webhook_endpoints(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'delivered', 'failed', 'skipped')),
  attempt_count integer not null default 0,
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  response_status integer,
  response_body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_webhook_endpoints_org_idx
  on organization_webhook_endpoints(organization_id, status, created_at desc);

create index if not exists webhook_delivery_events_endpoint_idx
  on webhook_delivery_events(endpoint_id, status, created_at desc);

create index if not exists webhook_delivery_events_org_idx
  on webhook_delivery_events(organization_id, status, created_at desc);
