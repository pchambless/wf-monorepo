CREATE OR REPLACE VIEW api_wf.wf_ingrBtchTrace AS
SELECT
  a.ingrTypeName,
  a.ingrName,
  a.purchDate,
  a.vndrName,
  a.brndName,
  a.ingrBtchNbr,
  IFNULL(b.prodBtchNbr, '') AS prodBtchNbr,
  IFNULL(b.prodBtchDate, '') AS prodBtchDate,
  IFNULL(CONCAT(b.prodTypeName, '-', b.prodName), 'No Product Batches') AS product,
  IFNULL(b.location, '') AS location,
  IFNULL(b.qtyMeas, '') AS prodQtyMeas,
  IFNULL(b.btchQty, 0) AS prodBtchQty,
  a.purchAmt,
  a.purchDtl,
  a.account_id,
  a.ingredient_id,
  b.product_id,
  a.ingredient_batch_id,
  b.product_batch_id,
  b.map_id
FROM api_wf.wf_ingrBtchDtl a
LEFT JOIN api_wf.wf_prodBtchIngrDtl b 
  ON a.ingredient_batch_id = b.ingredient_batch_id;
