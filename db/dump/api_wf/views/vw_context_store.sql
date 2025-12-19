create or replace view vw_context_store as
select
  context_store.id as id,
  context_store.paramName as paramName,
  context_store.paramVal as paramVal,
  context_store.updates as updates,
  context_store.getVals as getVals,
  context_store.email as email,
  context_store.updated_at as updated_at
from
  context_store
order by
  date_format(context_store.updated_at, '%Y-%m-%d %H:%i:%s') desc
