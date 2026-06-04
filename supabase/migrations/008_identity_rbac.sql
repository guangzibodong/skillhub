alter table users
  add column if not exists platform_role text not null default 'user';

alter table users drop constraint if exists users_platform_role_check;

alter table users
  add constraint users_platform_role_check
  check (platform_role in ('user', 'support', 'reviewer', 'finance', 'admin', 'super_admin'));

create table if not exists user_access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  token_prefix text not null,
  token_last4 text not null,
  scopes text[] not null default '{}',
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists users_platform_role_idx
  on users(platform_role, created_at desc);

create index if not exists user_access_tokens_user_idx
  on user_access_tokens(user_id, created_at desc);

create index if not exists user_access_tokens_hash_idx
  on user_access_tokens(token_hash)
  where revoked_at is null;
