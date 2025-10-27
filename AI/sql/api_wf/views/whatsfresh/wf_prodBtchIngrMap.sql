CREATE OR REPLACE VIEW api_wf.wf_prdBtchIngrMap AS
SELECT
  a.prodBtchNbr,
  b.ingrOrdr,
  b.ingrName,
  IFNULL(b.ingrQtyMeas, '') AS ingrQtyMeas,
  whatsfresh.f_json_to_com_delim(c.ingrMaps) AS ingrMaps,
  b.prodIngrDesc,
  b.ingredient_id,
  a.product_id,
  a.product_type_id,
  b.product_recipe_id,
  a.product_batch_id,
  a.qtyMeas AS btchQtyMeas
FROM api_wf.wf_prodBtchDtl 	a
JOIN api_wf.wf_prodRcpeDtl  b 
  ON a.product_id = b.product_id
LEFT JOIN
  (SELECT product_batch_id, product_recipe_id, json_arrayagg(ingrBtchSrce) AS ingrMaps
   FROM api_wf.wf_prodBtchIngrDtl
   GROUP BY product_batch_id, product_recipe_id) c
ON
  a.product_batch_id = c.product_batch_id
  AND b.product_recipe_id = c.product_recipe_id
ORDER BY
  a.prodBtchNbr, ingrOrdr;