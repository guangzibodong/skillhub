create table if not exists marketplace_curation_appeals (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  publisher_organization_id uuid not null references organizations(id) on delete cascade,
  curation_rule_id uuid references marketplace_curation_rules(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'under_review', 'approved', 'rejected', 'closed')),
  request_type text not null check (request_type in ('suppression_appeal', 'featured_request', 'placement_review')),
  current_placement text not null default 'standard' check (current_placement in ('featured', 'standard', 'suppressed')),
  requested_placement text not null check (requested_placement in ('featured', 'standard')),
  current_curation_reason text,
  appeal_reason text not null,
  evidence_url text,
  operator_reason text,
  created_by_user_id uuid references users(id) on delete set null,
  decided_by_user_id uuid references users(id) on delete set null,
  sla_due_at timestamptz not null default (now() + interval '7 days'),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table marketplace_curation_appeals enable row level security;
revoke all on table marketplace_curation_appeals from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table marketplace_curation_appeals from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table marketplace_curation_appeals from authenticated;
  end if;
end $$;

create unique index if not exists marketplace_curation_appeals_active_skill_idx
  on marketplace_curation_appeals(skill_id)
  where status in ('open', 'under_review');

create index if not exists marketplace_curation_appeals_status_idx
  on marketplace_curation_appeals(status, sla_due_at, created_at desc);

create index if not exists marketplace_curation_appeals_publisher_idx
  on marketplace_curation_appeals(publisher_organization_id, created_at desc);
