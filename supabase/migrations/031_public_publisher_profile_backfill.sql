with ranked_public_skills as (
  select
    s.organization_id,
    latest.manifest -> 'author' ->> 'name' as author_name,
    row_number() over (
      partition by s.organization_id
      order by
        case s.verification_status
          when 'verified' then 0
          when 'submitted' then 1
          else 2
        end,
        s.updated_at desc
    ) as skill_rank
  from skills s
  join lateral (
    select sv.manifest
    from skill_versions sv
    left join lateral (
      select status, decided_at, created_at
      from skill_reviews
      where skill_version_id = sv.id
      order by created_at desc
      limit 1
    ) review on true
    where sv.skill_id = s.id
    order by
      case
        when review.status = 'approved' then 0
        when s.verification_status = 'submitted' and review.status in ('queued', 'in_review') then 1
        else 2
      end,
      coalesce(review.decided_at, review.created_at, sv.created_at) desc,
      sv.created_at desc
    limit 1
  ) latest on true
  where s.visibility = 'public'
    and s.verification_status in ('verified', 'submitted', 'deprecated')
)
insert into publisher_profiles (
  organization_id,
  display_name,
  status,
  payout_status
)
select
  ranked_public_skills.organization_id,
  coalesce(nullif(trim(ranked_public_skills.author_name), ''), organizations.name),
  'pending',
  'not_configured'
from ranked_public_skills
join organizations on organizations.id = ranked_public_skills.organization_id
where ranked_public_skills.skill_rank = 1
on conflict (organization_id) do nothing;
