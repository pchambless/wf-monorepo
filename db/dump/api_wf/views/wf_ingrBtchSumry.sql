create or replace view wf_ingrBtchSumry as
select
  a.ingrName as ingrName,
  count(a.ingredient_batch_id) as batches,
  sum(a.purchQty) as totalQty,
  min(a.unitRate) as min_rate,
  max(a.unitRate) as max_rate,
  cast(
    avg((ifnull(a.unitPrice, 0) / ifnull(a.unitQty, 1))) as decimal(5, 2)
  ) as avgRate,
  a.purchMeas as units,
  cast(sum(a.purchTotalAmt) as decimal(10, 2)) as totalCost
from
  wf_ingrBtchDtl a
where
  (
    (a.purchDate > (now() - interval 365 day))
    and (a.purchMeas <> '-')
  )
group by
  a.ingrName,
  a.purchMeas
order by
  a.ingrName
