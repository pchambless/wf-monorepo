create or replace view vw_plan45 as
select
  plan_communications.plan_id as plan_id,
  ('communication' collate utf8mb4_general_ci) as source,
  (
    plan_communications.from_agent collate utf8mb4_general_ci
  ) as agent,
  (
    plan_communications.type collate utf8mb4_general_ci
  ) as change_type,
  (
    plan_communications.subject collate utf8mb4_general_ci
  ) as subject / path,
  (
    plan_communications.message collate utf8mb4_general_ci
  ) as message,
  plan_communications.created_at as created_at
from
  plan_communications
where
  (plan_communications.plan_id = 45)
union
select
  plan_impacts.plan_id as plan_id,
  ('impacts' collate utf8mb4_general_ci) as source,
  (
    plan_impacts.created_by collate utf8mb4_general_ci
  ) as agent,
  (
    plan_impacts.change_type collate utf8mb4_general_ci
  ) as change_type collate utf8mb4_general_ci,
  (plan_impacts.file_path collate utf8mb4_general_ci) as subject,
  (
    plan_impacts.description collate utf8mb4_general_ci
  ) as message,
  plan_impacts.created_at as created_at
from
  plan_impacts
where
  (plan_impacts.plan_id = 45)
order by
  created_at desc
