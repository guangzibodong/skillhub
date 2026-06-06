alter table payouts
  add column if not exists retry_condition text,
  add column if not exists next_action text;

update payouts
set
  retry_condition = coalesce(retry_condition, 'Resolve the finance or provider issue before requesting payout again.'),
  next_action = coalesce(next_action, 'resolve_blocker_before_retry')
where status = 'blocked';

update payouts
set
  retry_condition = coalesce(retry_condition, 'Resolve the provider failure, then request payout again after balances return to available.'),
  next_action = coalesce(next_action, 'request_again_after_failure')
where status = 'failed';

update payouts
set next_action = coalesce(
  next_action,
  case
    when status in ('requested', 'review') then 'await_finance_review'
    when status = 'processing' then 'await_provider_processing'
    when status = 'paid' then 'complete'
    else next_action
  end
);
