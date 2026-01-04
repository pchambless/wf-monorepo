CREATE
OR REPLACE VIEW wf_prodBtchIngrID AS
SELECT
r.prodTypeName AS prodTypeName,
r.prodName AS prodName,
c.prodBtchDate AS prodBtchDate,
c.btchQty AS btchQty,
c.comments AS btchComments,
whatsfresh.f_measure(c.measure_id) AS unitMeas,
c.qtyMeas AS qtyMeas,
c.prodBtchNbr AS prodBtchNbr,
c.location AS location,
a.comments AS ingrComments,
r.ingrOrdr AS ingrOrdr,
r.ingrName AS ingrName,
d.ingrBtchNbr AS ingrBtchNbr,
concat('<strong>',
ifnull(d.ingrBtchNbr,
'no batch'),
'</strong>: ',
ifnull(d.vndrName,
'no vendor')) AS ingrBtchSrceHTML,
concat(ifnull(d.ingrBtchNbr,
'no batch'),
': ',
ifnull(d.vndrName,
'no vendor')) AS ingrBtchSrce,
d.ingrLotNbr AS ingrLotNbr,
d.purchDate AS purchDate,
d.purchDtl AS purchDtl,
d.purchAmt AS purchAmt,
d.vndrName AS vndrName,
d.brndName AS brndName,
r.prodIngrDesc AS prodIngrDesc,
c.prodBtchActv AS prodBtchActv,
r.prodActv AS prodActv,
d.ingrBtchActv AS ingrBtchActv,
r.account_id AS account_id,
r.product_id AS product_id,
r.product_type_id AS product_type_id,
r.ingredient_id AS ingredient_id,
a.id AS product_batch_ingredient_id,
a.measure_id AS measure_id,
c.product_batch_id AS product_batch_id,
r.product_recipe_id AS product_recipe_id,
a.ingredient_batch_id AS ingredient_batch_id
FROM (((wf_prodBtchDtl c
LEFT JOIN wf_prodRcpeDtl r on((c.product_id = r.product_id)))
LEFT JOIN whatsfresh.product_batch_ingredients a on(((c.product_batch_id = a.product_batch_id)
AND (r.product_recipe_id = a.product_recipe_id))))
LEFT JOIN wf_ingrBtchDtl d on((a.ingredient_batch_id = d.ingredient_batch_id)))
WHERE (a.created_at is not null)
ORDER BY r.account_id,
c.prodBtchDate desc,
c.prodBtchNbr desc,
r.ingrOrdr;
