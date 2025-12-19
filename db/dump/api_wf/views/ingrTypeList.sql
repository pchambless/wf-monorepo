create or replace view ingrTypeList as
select
  a.id as ingrTypeID,
  a.name as ingrTypeName,
  a.description as ingrTypeDesc,
  a.account_id as acctID
from
  whatsfresh.ingredient_types a
where
  (a.active = 1)
order by
  a.account_id,
  a.name
