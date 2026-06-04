create table if not exists payout_account_onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null references publisher_profiles(id) on delete cascade,
  payout_account_id uuid references payout_accounts(id) on delete set null,
  provider text not null,
  provider_session_id text not null unique,
  onboarding_url text not null,
  return_url text,
  refresh_url text,
  status text not null default 'created' check (
    status in ('created', 'opened', 'completed', 'expired', 'canceled')
  ),
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payout_account_onboarding_profile_idx
  on payout_account_onboarding_sessions(publisher_profile_id, created_at desc);

create index if not exists payout_account_onboarding_status_idx
  on payout_account_onboarding_sessions(status, created_at desc);
