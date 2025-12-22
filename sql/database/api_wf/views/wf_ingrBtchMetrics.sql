create or replace view wf_ingrBtchMetrics as
select
  a.ingrTypeName as ingrTypeName,
  a.ingrName as ingrName,
  a.ingrCode as ingrCode,
  a.ingrDesc as ingrDesc,
  a.gmsPerOz as gmsPerOz,
  coalesce(rcpe.rcpeCnt, 0) as recipes,
  count(a.ingredient_batch_id) as batches,
  a.ingredient_type_id as ingredient_type_id,
  a.ingredient_id as ingredient_id,
  a.account_id as account_id,
  a.ingrActv as ingrActv
from
  (
    wf_ingrBtchDtl a
    left join (
      select
        whatsfresh.product_recipes.ingredient_id as ingredient_id,
        count(0) as rcpeCnt
      from
        whatsfresh.product_recipes
      where
        (whatsfresh.product_recipes.active = 'Y')
      group by
        whatsfresh.product_recipes.ingredient_id
    ) rcpe on ((a.ingredient_id = rcpe.ingredient_id))
  )
group by
  a.ingrTypeName,
  a.ingrName,
  a.ingrCode,
  a.ingrDesc,
  a.gmsPerOz,
  a.ingredient_type_id,
  a.ingredient_id,
  a.account_id,
  a.ingrActv
order by
  a.account_id,
  a.ingrTypeName,
  a.ingrName
