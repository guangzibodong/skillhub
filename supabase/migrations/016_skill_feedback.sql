create table if not exists skill_feedback (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  reviewer_user_id uuid references users(id) on delete set null,
  reviewer_organization_id uuid references organizations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  use_case text,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'rejected')),
  moderation_reason text,
  moderated_by_user_id uuid references users(id) on delete set null,
  moderated_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_feedback_skill_public_idx
  on skill_feedback(skill_id, status, created_at desc);

create index if not exists skill_feedback_reviewer_idx
  on skill_feedback(reviewer_organization_id, reviewer_user_id, created_at desc);

create index if not exists skill_feedback_project_idx
  on skill_feedback(project_id, created_at desc)
  where project_id is not null;

create index if not exists skill_feedback_moderation_idx
  on skill_feedback(status, created_at desc);
