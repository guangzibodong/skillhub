create table if not exists agent_model_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('openai', 'anthropic', 'google', 'deepseek', 'openrouter', 'custom')),
  display_name text not null,
  model text not null,
  api_key text not null,
  base_url text,
  status text not null default 'draft' check (status in ('draft', 'active', 'disabled')),
  is_default boolean not null default false,
  temperature numeric(3,2) not null default 0.70 check (temperature >= 0 and temperature <= 2),
  max_output_tokens integer not null default 900 check (max_output_tokens between 128 and 8192),
  system_prompt text not null default 'You are a prompt architect for SkillHub. Create useful, reusable prompts from the user input.',
  created_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists agent_model_configs_active_default_idx
  on agent_model_configs (is_default)
  where is_default = true and status = 'active';

create index if not exists agent_model_configs_status_provider_idx
  on agent_model_configs(status, provider, updated_at desc);

create table if not exists agent_prompt_generations (
  id uuid primary key default gen_random_uuid(),
  model_config_id uuid references agent_model_configs(id) on delete set null,
  created_by_user_id uuid references users(id) on delete set null,
  provider text,
  model text,
  input_content text not null,
  use_case text,
  language text,
  output_prompt text,
  status text not null check (status in ('success', 'error')),
  error_message text,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  request_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists agent_prompt_generations_created_idx
  on agent_prompt_generations(created_at desc);

create index if not exists agent_prompt_generations_model_idx
  on agent_prompt_generations(model_config_id, created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'agent_prompt_generations_metadata_object_check') then
    alter table agent_prompt_generations
      add constraint agent_prompt_generations_metadata_object_check
      check (jsonb_typeof(request_metadata) = 'object')
      not valid;
  end if;
end $$;
