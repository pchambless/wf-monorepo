create or replace view wf_ingrPricing as
select
  a.ingrTypeName as ingrTypeName,
  a.ingrName as ingrName,
  a.ingredient_id as ingredient_id,
  a.account_id as account_id,
  a.unitQty as unitQty,
  a.purchMeas as purchMeas,
  count(0) as purchases,
  cast(max(a.unitRate) as decimal(7, 2)) as maxPrice,
  cast(min(a.unitRate) as decimal(7, 2)) as minPrice,
  cast(avg(a.unitRate) as decimal(7, 2)) as avgPrice
from
  wf_ingrBtchDtl a
where
  (
    a.purchDate > (cast(now() as date) - interval 30 month)
  )
group by
  a.ingrTypeName,
  a.ingrName,
  a.ingredient_id,
  a.account_id,
  a.unitQty,
  a.purchMeas
order by
  a.account_id,
  a.ingrTypeName,
  a.ingrName
