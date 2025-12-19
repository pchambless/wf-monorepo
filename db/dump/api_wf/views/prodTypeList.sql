create or replace view prodTypeList as
select
  a.id as prodTypeID,
  a.name as prodTypeName,
  a.account_id as acctID
from
  whatsfresh.product_types a
order by
  a.account_id,
  a.name
