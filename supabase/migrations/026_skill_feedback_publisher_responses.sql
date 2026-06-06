alter table skill_feedback
  add column if not exists publisher_response_body text,
  add column if not exists publisher_responded_by_user_id uuid references users(id) on delete set null,
  add column if not exists publisher_responded_at timestamptz;

create index if not exists skill_feedback_publisher_response_idx
  on skill_feedback(skill_id, publisher_responded_at desc)
  where publisher_response_body is not null;
