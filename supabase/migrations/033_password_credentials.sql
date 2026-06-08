create table if not exists user_password_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  username text not null unique,
  password_hash text not null,
  password_salt text not null,
  password_iterations integer not null default 210000,
  password_algorithm text not null default 'pbkdf2-sha256',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  check (username ~ '^[a-z0-9][a-z0-9_-]{2,31}$'),
  check (password_iterations >= 100000),
  check (password_algorithm = 'pbkdf2-sha256')
);

create index if not exists user_password_credentials_user_idx
  on user_password_credentials(user_id, created_at desc);

create index if not exists user_password_credentials_username_idx
  on user_password_credentials(username);
