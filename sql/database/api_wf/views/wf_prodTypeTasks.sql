create or replace view wf_prodTypeTasks as
select
  a.name as prdTypeName,
  c.ordr as taskOrdr,
  c.name as taskName,
  c.description as taskDesc,
  a.active as prodTypeActive,
  c.active as taskActive,
  a.account_id as account_id,
  c.id as task_id,
  c.product_type_id as prd_type_id
from
  (
    whatsfresh.product_types a
    join whatsfresh.tasks c on ((a.id = c.product_type_id))
  )
order by
  a.account_id,
  a.name,
  c.ordr
