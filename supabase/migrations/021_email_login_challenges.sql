create table if not exists email_login_challenges (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mode text not null check (mode in ('login', 'signup')),
  code_hash text not null,
  attempts integer not null default 0,
  max_attempts integer not null default 6,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  display_name text,
  organization_name text,
  organization_slug text,
  role text check (role in ('owner', 'developer', 'publisher')),
  return_to text,
  delivery_channel text not null default 'email',
  delivery_status text not null default 'queued',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_login_challenges_email_idx
  on email_login_challenges(email, created_at desc);

create index if not exists email_login_challenges_active_idx
  on email_login_challenges(email, mode, expires_at desc)
  where consumed_at is null;
