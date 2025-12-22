create or replace view taskList as
select
  a.id as taskID,
  a.name as taskName,
  a.description as taskDesc,
  a.ordr as taskOrder,
  a.product_type_id as prodTypeID
from
  whatsfresh.tasks a
where
  (a.active = 1)
order by
  a.product_type_id,
  a.ordr
