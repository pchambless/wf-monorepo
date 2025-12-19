create or replace view vw_AISql as
select
  AISql.id as id,
  AISql.category as category,
  AISql.qryName as qryName,
  AISql.qrySQL as qrySQL,
  AISql.description as description,
  api_wf.f_aiParams (AISql.id) as params,
  AISql.usage_count as usage_count,
  AISql.created_at as created_at,
  AISql.created_by as created_by,
  AISql.updated_at as updated_at,
  AISql.updated_by as updated_by,
  AISql.deleted_at as deleted_at,
  AISql.deleted_by as deleted_by,
  AISql.active as active
from
  AISql
where
  (AISql.active = 1)
