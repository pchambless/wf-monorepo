create or replace view vw_plan_composite as
select
  plans.id as plan_id,
  ('plan' collate utf8mb4_general_ci) as source,
  (plans.created_by collate utf8mb4_general_ci) as agent,
  ('The Plan' collate utf8mb4_general_ci) as change_type,
  (plans.name collate utf8mb4_general_ci) as subject,
  (plans.description collate utf8mb4_general_ci) as message,
  plans.created_at as created_at
from
  plans
union
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
  ) as subject,
  (
    plan_communications.message collate utf8mb4_general_ci
  ) as message,
  plan_communications.created_at as created_at
from
  plan_communications
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
order by
  plan_id desc,
  created_at
