alter table buyer_requests
  add column if not exists submitted_skill_id uuid references skills(id) on delete set null,
  add column if not exists submitted_skill_version_id uuid references skill_versions(id) on delete set null,
  add column if not exists delivery_note text,
  add column if not exists evidence_url text,
  add column if not exists submitted_at timestamptz,
  add column if not exists decision_note text,
  add column if not exists decided_at timestamptz;

create index if not exists buyer_requests_submitted_skill_idx
  on buyer_requests(submitted_skill_id, submitted_skill_version_id);

create index if not exists buyer_requests_claimed_status_idx
  on buyer_requests(claimed_by_publisher_id, status, updated_at desc);
