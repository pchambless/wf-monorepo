create or replace view wf_ingrBtchTrace as
select
  a.ingrTypeName as ingrTypeName,
  a.ingrName as ingrName,
  a.purchDate as purchDate,
  a.vndrName as vndrName,
  a.brndName as brndName,
  a.ingrBtchNbr as ingrBtchNbr,
  ifnull(b.prodBtchNbr, '') as prodBtchNbr,
  ifnull(b.prodBtchDate, '') as prodBtchDate,
  ifnull(
    concat(b.prodTypeName, '-', b.prodName),
    'No Product Batches'
  ) as product,
  ifnull(b.location, '') as location,
  ifnull(b.qtyMeas, '') as prodQtyMeas,
  ifnull(b.btchQty, 0) as prodBtchQty,
  a.purchAmt as purchAmt,
  a.purchDtl as purchDtl,
  a.account_id as account_id,
  a.ingredient_id as ingredient_id,
  b.product_id as product_id,
  a.ingredient_batch_id as ingredient_batch_id,
  b.product_batch_id as product_batch_id,
  b.map_id as map_id
from
  (
    wf_ingrBtchDtl a
    left join wf_prodBtchIngrDtl b on ((a.ingredient_batch_id = b.ingredient_batch_id))
  )
