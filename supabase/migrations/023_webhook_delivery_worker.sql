alter table webhook_delivery_events
  add column if not exists last_attempted_at timestamptz;

alter table webhook_delivery_events
  drop constraint if exists webhook_delivery_events_status_check;

alter table webhook_delivery_events
  add constraint webhook_delivery_events_status_check
  check (status in ('pending', 'processing', 'delivered', 'failed', 'skipped'));

create index if not exists webhook_delivery_events_due_idx
  on webhook_delivery_events(status, next_attempt_at, updated_at, created_at)
  where status in ('pending', 'processing', 'failed');
