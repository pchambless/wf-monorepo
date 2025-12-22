create or replace view wf_ingrBtchLast as
select
  a.ingredient_id as ingredient_id,
  max(a.purchase_date) as lastPurchDate,
  max(a.batch_number) as lastBtchNbr,
  count(0) as btchCount
from
  whatsfresh.ingredient_batches a
group by
  a.ingredient_id
