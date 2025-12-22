create or replace view wf_prodRcpeDtl as
select
  pt.name as prodTypeName,
  b.name as prodName,
  b.recipe_quantity as rcpeQty,
  whatsfresh.f_measure (b.measure_id) as rcpeMeas,
  a.ingredient_order as ingrOrdr,
  c.code as ingrCode,
  c.name as ingrName,
  it.name as ingrType,
  nullif(
    concat(
      a.quantity,
      ' ',
      whatsfresh.f_measure (a.measure_id)
    ),
    '0 -'
  ) as ingrQtyMeas,
  a.quantity as ingrQty,
  whatsfresh.f_measure (a.measure_id) as ingrMeas,
  b.description as prdDesc,
  ifnull(a.comments, '') as prodIngrDesc,
  a.active as prodRcpeActv,
  b.active as prodActv,
  c.active as ingrActv,
  a.id as product_recipe_id,
  b.account_id as account_id,
  a.product_id as product_id,
  pt.id as product_type_id,
  a.ingredient_id as ingredient_id,
  it.id as ingredient_type_id,
  a.measure_id as measure_id
from
  (
    (
      (
        (
          whatsfresh.product_recipes a
          join whatsfresh.products b on ((a.product_id = b.id))
        )
        join whatsfresh.product_types pt on ((b.product_type_id = pt.id))
      )
      join whatsfresh.ingredients c on ((a.ingredient_id = c.id))
    )
    join whatsfresh.ingredient_types it on ((c.ingredient_type_id = it.id))
  )
order by
  b.account_id,
  b.product_type_id,
  b.name,
  a.ingredient_order,
  c.name
