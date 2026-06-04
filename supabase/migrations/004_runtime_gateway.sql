alter table api_keys
  add column if not exists key_prefix text,
  add column if not exists key_last4 text;

alter table skill_invocations
  add column if not exists request_id text,
  add column if not exists input_summary text,
  add column if not exists output_summary text,
  add column if not exists policy_result jsonb not null default '{}';

create unique index if not exists skill_invocations_request_id_idx
  on skill_invocations(request_id)
  where request_id is not null;
