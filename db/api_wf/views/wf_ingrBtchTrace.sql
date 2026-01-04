CREATE
OR REPLACE VIEW wf_ingrBtchTrace AS
SELECT
a.ingrTypeName AS ingrTypeName,
a.ingrName AS ingrName,
a.purchDate AS purchDate,
a.vndrName AS vndrName,
a.brndName AS brndName,
a.ingrBtchNbr AS ingrBtchNbr,
ifnull(b.prodBtchNbr,
'') AS prodBtchNbr,
ifnull(b.prodBtchDate,
'') AS prodBtchDate,
ifnull(concat(b.prodTypeName,
'-',
b.prodName),
'No Product Batches') AS product,
ifnull(b.location,
'') AS location,
ifnull(b.qtyMeas,
'') AS prodQtyMeas,
ifnull(b.btchQty,
0) AS prodBtchQty,
a.purchAmt AS purchAmt,
a.purchDtl AS purchDtl,
a.account_id AS account_id,
a.ingredient_id AS ingredient_id,
b.product_id AS product_id,
a.ingredient_batch_id AS ingredient_batch_id,
b.product_batch_id AS product_batch_id,
b.map_id AS map_id
FROM (wf_ingrBtchDtl a
LEFT JOIN wf_prodBtchIngrDtl b on((a.ingredient_batch_id = b.ingredient_batch_id)));
