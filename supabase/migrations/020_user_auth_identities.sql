create table if not exists user_auth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null check (provider in ('email', 'google', 'github')),
  provider_user_id text,
  email text not null,
  email_verified boolean not null default false,
  display_name text,
  avatar_url text,
  metadata jsonb not null default '{}',
  connected_at timestamptz not null default now(),
  last_login_at timestamptz,
  updated_at timestamptz not null default now(),
  check (provider = 'email' or provider_user_id is not null),
  unique (user_id, provider),
  unique (provider, provider_user_id)
);

create index if not exists user_auth_identities_user_idx
  on user_auth_identities(user_id, connected_at desc);

create index if not exists user_auth_identities_provider_idx
  on user_auth_identities(provider, provider_user_id)
  where provider_user_id is not null;
