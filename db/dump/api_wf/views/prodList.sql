create or replace view prodList as
select
  a.id as prodID,
  a.name as prodName,
  a.code as prodCode,
  a.location as prodDfltLoc,
  a.best_by_days as prodDfltBestBy,
  a.description as prodDesc,
  a.upc_item_reference as prodUpcItemRef,
  a.upc_check_digit as prodUpcChkDgt,
  a.product_type_id as prodTypeID,
  a.account_id as acctID
from
  whatsfresh.products a
where
  (a.active = 1)
order by
  a.product_type_id,
  a.name
