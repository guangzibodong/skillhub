alter table notification_events
  add column if not exists delivery_attempts integer not null default 0,
  add column if not exists last_attempted_at timestamptz,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists delivery_provider text,
  add column if not exists provider_message_id text;

create index if not exists notification_events_delivery_queue_idx
  on notification_events(channel, status, coalesce(next_attempt_at, created_at), created_at desc)
  where channel in ('email', 'webhook');

create index if not exists notification_events_event_type_idx
  on notification_events(event_type, created_at desc);
