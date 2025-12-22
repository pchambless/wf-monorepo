create or replace view wf_prdBtchIngr_Map as
select
  a.prodBtchNbr as prodBtchNbr,
  b.ingrOrdr as ingrOrdr,
  b.ingrName as ingrName,
  ifnull(b.ingrQtyMeas, '') as ingrQtyMeas,
  whatsfresh.f_json_to_com_delim (c.ingrMaps) as ingrMaps,
  b.prodIngrDesc as prodIngrDesc,
  b.ingredient_id as ingredient_id,
  a.product_id as product_id,
  a.product_type_id as product_type_id,
  b.product_recipe_id as product_recipe_id,
  a.product_batch_id as product_batch_id,
  a.qtyMeas as btchQtyMeas
from
  (
    (
      wf_prodBtchDtl a
      join wf_prodRcpeDtl b on ((a.product_id = b.product_id))
    )
    left join (
      select
        wf_prodBtchIngrDtl.product_batch_id as product_batch_id,
        wf_prodBtchIngrDtl.product_recipe_id as product_recipe_id,
        json_arrayagg(wf_prodBtchIngrDtl.ingrBtchSrce) as ingrMaps
      from
        wf_prodBtchIngrDtl
      group by
        wf_prodBtchIngrDtl.product_batch_id,
        wf_prodBtchIngrDtl.product_recipe_id
    ) c on (
      (
        (a.product_batch_id = c.product_batch_id)
        and (b.product_recipe_id = c.product_recipe_id)
      )
    )
  )
order by
  a.prodBtchNbr,
  b.ingrOrdr
