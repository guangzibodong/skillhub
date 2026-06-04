delete from saved_skills a
using saved_skills b
where a.project_id = b.project_id
  and a.skill_id = b.skill_id
  and a.collection_name is null
  and b.collection_name is null
  and (a.created_at, a.id) > (b.created_at, b.id);

update saved_skills
set collection_name = 'default'
where collection_name is null;

alter table saved_skills
  alter column collection_name set default 'default',
  alter column collection_name set not null;
