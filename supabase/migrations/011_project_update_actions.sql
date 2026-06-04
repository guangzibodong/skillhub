create table if not exists project_update_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  skill_update_event_id uuid not null references skill_update_events(id) on delete cascade,
  status text not null check (status in ('acknowledged', 'scheduled', 'adopted', 'ignored')),
  note text,
  scheduled_for timestamptz,
  decided_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (project_id, skill_update_event_id)
);

create index if not exists project_update_actions_project_status_idx
  on project_update_actions(project_id, status, updated_at desc);

create index if not exists project_update_actions_event_idx
  on project_update_actions(skill_update_event_id, updated_at desc);
