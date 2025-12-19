create or replace view wf_prodBtchIngrDtl as
select
  r.prodTypeName as prodTypeName,
  r.prodName as prodName,
  c.prodBtchDate as prodBtchDate,
  c.btchQty as btchQty,
  c.comments as btchComments,
  whatsfresh.f_measure (c.measure_id) as unitMeas,
  c.qtyMeas as qtyMeas,
  c.prodBtchNbr as prodBtchNbr,
  c.location as location,
  a.comments as ingrComments,
  r.ingrOrdr as ingrOrdr,
  r.ingrName as ingrName,
  d.ingrBtchNbr as ingrBtchNbr,
  concat(
    '<strong>',
    ifnull(d.ingrBtchNbr, 'no batch'),
    '</strong>: ',
    ifnull(d.vndrName, 'no vendor')
  ) as ingrBtchSrceHTML,
  concat(
    ifnull(d.ingrBtchNbr, 'no batch'),
    ': ',
    ifnull(d.vndrName, 'no vendor')
  ) as ingrBtchSrce,
  d.ingrLotNbr as ingrLotNbr,
  d.purchDate as purchDate,
  d.purchDtl as purchDtl,
  d.purchAmt as purchAmt,
  d.vndrName as vndrName,
  d.brndName as brndName,
  r.prodIngrDesc as prodIngrDesc,
  c.prodBtchActv as prodBtchActv,
  r.prodActv as prodActv,
  d.ingrBtchActv as ingrBtchActv,
  r.account_id as account_id,
  r.product_id as product_id,
  r.product_type_id as product_type_id,
  r.ingredient_id as ingredient_id,
  a.id as map_id,
  a.measure_id as measure_id,
  c.product_batch_id as product_batch_id,
  r.product_recipe_id as product_recipe_id,
  a.ingredient_batch_id as ingredient_batch_id
from
  (
    (
      (
        wf_prodBtchDtl c
        left join wf_prodRcpeDtl r on ((c.product_id = r.product_id))
      )
      left join whatsfresh.product_batch_ingredients a on (
        (
          (c.product_batch_id = a.product_batch_id)
          and (r.product_recipe_id = a.product_recipe_id)
        )
      )
    )
    left join wf_ingrBtchDtl d on ((a.ingredient_batch_id = d.ingredient_batch_id))
  )
where
  (a.created_at is not null)
order by
  r.account_id,
  c.prodBtchDate desc,
  c.prodBtchNbr desc,
  r.ingrOrdr
