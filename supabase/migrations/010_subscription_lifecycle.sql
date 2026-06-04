alter table subscriptions
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists paused_at timestamptz,
  add column if not exists canceled_at timestamptz;

alter table subscriptions
  drop constraint if exists subscriptions_status_check;

alter table subscriptions
  add constraint subscriptions_status_check
  check (status in ('trialing', 'active', 'past_due', 'paused', 'canceled'));

create index if not exists subscriptions_project_status_idx
  on subscriptions(project_id, status, updated_at desc);

create index if not exists subscriptions_skill_status_idx
  on subscriptions(skill_id, status, updated_at desc);
