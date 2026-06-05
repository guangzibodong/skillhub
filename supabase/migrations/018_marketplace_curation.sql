create table if not exists marketplace_curation_rules (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null unique references skills(id) on delete cascade,
  placement text not null default 'standard' check (placement in ('featured', 'standard', 'suppressed')),
  boost integer not null default 0 check (boost >= -250 and boost <= 250),
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_by_user_id uuid references users(id) on delete set null,
  updated_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

alter table marketplace_curation_rules enable row level security;
revoke all on table marketplace_curation_rules from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table marketplace_curation_rules from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table marketplace_curation_rules from authenticated;
  end if;
end $$;

create index if not exists marketplace_curation_rules_active_idx
  on marketplace_curation_rules(placement, boost desc, updated_at desc);

create index if not exists marketplace_curation_rules_skill_idx
  on marketplace_curation_rules(skill_id, updated_at desc);
