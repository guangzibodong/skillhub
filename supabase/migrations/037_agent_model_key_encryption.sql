alter table agent_model_configs
  add column if not exists api_key_ciphertext text,
  add column if not exists api_key_iv text,
  add column if not exists api_key_tag text,
  add column if not exists api_key_last4 text;

alter table agent_model_configs
  alter column api_key drop not null;

create index if not exists agent_model_configs_encrypted_key_idx
  on agent_model_configs(status, updated_at desc)
  where api_key_ciphertext is not null
    and api_key_iv is not null
    and api_key_tag is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'agent_model_configs_encrypted_key_check') then
    alter table agent_model_configs
      add constraint agent_model_configs_encrypted_key_check
      check (
        status <> 'active'
        or (
          api_key_ciphertext is not null
          and api_key_iv is not null
          and api_key_tag is not null
          and api_key_last4 is not null
        )
      )
      not valid;
  end if;
end $$;
