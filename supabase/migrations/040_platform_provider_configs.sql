create table if not exists platform_provider_configs (
  id uuid primary key default gen_random_uuid(),
  provider_type text not null check (provider_type in ('oauth', 'email', 'stripe')),
  provider_key text not null,
  status text not null default 'disabled' check (status in ('active', 'disabled')),
  config jsonb not null default '{}',
  secret_ciphertext text,
  secret_iv text,
  secret_tag text,
  secret_last4 text,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_type, provider_key)
);

create index if not exists platform_provider_configs_lookup_idx
  on platform_provider_configs(provider_type, provider_key, status);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'platform_provider_configs_key_check') then
    alter table platform_provider_configs
      add constraint platform_provider_configs_key_check
      check (
        (provider_type = 'oauth' and provider_key in ('google', 'github'))
        or (provider_type = 'email' and provider_key in ('resend', 'smtp'))
        or (provider_type = 'stripe' and provider_key in ('commerce'))
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'platform_provider_configs_config_object_check') then
    alter table platform_provider_configs
      add constraint platform_provider_configs_config_object_check
      check (jsonb_typeof(config) = 'object')
      not valid;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'platform_provider_configs_provider_type_check') then
    alter table platform_provider_configs
      drop constraint platform_provider_configs_provider_type_check;
  end if;

  if exists (select 1 from pg_constraint where conname = 'platform_provider_configs_key_check') then
    alter table platform_provider_configs
      drop constraint platform_provider_configs_key_check;
  end if;
end $$;

alter table platform_provider_configs
  add constraint platform_provider_configs_provider_type_check
  check (provider_type in ('oauth', 'email', 'stripe'));

alter table platform_provider_configs
  add constraint platform_provider_configs_key_check
  check (
    (provider_type = 'oauth' and provider_key in ('google', 'github'))
    or (provider_type = 'email' and provider_key in ('resend', 'smtp'))
    or (provider_type = 'stripe' and provider_key in ('commerce'))
  );

create table if not exists platform_runtime_settings (
  id uuid primary key default gen_random_uuid(),
  setting_group text not null check (setting_group in ('webhooks', 'payouts', 'launch', 'runtime')),
  setting_key text not null,
  value jsonb not null default '{}',
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (setting_group, setting_key),
  check (jsonb_typeof(value) = 'object')
);

create index if not exists platform_runtime_settings_lookup_idx
  on platform_runtime_settings(setting_group, setting_key, updated_at desc);
