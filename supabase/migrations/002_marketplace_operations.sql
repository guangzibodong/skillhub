create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'developer', 'publisher', 'reviewer', 'finance')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists publisher_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references organizations(id) on delete cascade,
  display_name text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'restricted', 'suspended')),
  payout_status text not null default 'not_configured' check (
    payout_status in ('not_configured', 'verification_required', 'verified', 'blocked')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skill_reviews (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  reviewer_id uuid references users(id) on delete set null,
  status text not null check (status in ('queued', 'in_review', 'approved', 'rejected', 'blocked')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists skill_prices (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  billing_model text not null check (billing_model in ('free', 'per_call', 'subscription')),
  currency text not null default 'usd',
  unit_amount_cents integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  price_id uuid references skill_prices(id) on delete set null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists commission_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform_fee_bps integer not null check (platform_fee_bps >= 0 and platform_fee_bps <= 10000),
  publisher_share_bps integer not null check (publisher_share_bps >= 0 and publisher_share_bps <= 10000),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  price_id uuid references skill_prices(id) on delete set null,
  source_type text not null check (source_type in ('usage', 'subscription', 'refund', 'adjustment')),
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null check (status in ('pending', 'posted', 'reversed')),
  created_at timestamptz not null default now()
);

create table if not exists transaction_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  commission_rule_id uuid references commission_rules(id) on delete set null,
  platform_fee_cents integer not null,
  publisher_share_cents integer not null,
  processing_fee_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists publisher_balances (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null references publisher_profiles(id) on delete cascade,
  transaction_split_id uuid references transaction_splits(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  state text not null check (state in ('pending', 'available', 'paid', 'reversed', 'blocked')),
  available_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payout_accounts (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null references publisher_profiles(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  status text not null check (status in ('not_configured', 'verification_required', 'verified', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_account_id)
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null references publisher_profiles(id) on delete cascade,
  payout_account_id uuid references payout_accounts(id) on delete set null,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null check (status in ('requested', 'review', 'processing', 'paid', 'failed', 'blocked')),
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete set null,
  amount_cents integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete set null,
  amount_cents integer not null,
  status text not null check (status in ('open', 'won', 'lost', 'warning_needs_response')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists skill_reviews_status_idx on skill_reviews(status, created_at desc);
create index if not exists skill_prices_skill_idx on skill_prices(skill_id, status);
create index if not exists transactions_created_at_idx on transactions(created_at desc);
create index if not exists publisher_balances_state_idx on publisher_balances(state, available_at);
create index if not exists payouts_status_idx on payouts(status, requested_at desc);
create index if not exists admin_audit_logs_entity_idx on admin_audit_logs(entity_type, entity_id, created_at desc);
