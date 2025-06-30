CREATE OR REPLACE VIEW v_prdBtchIngr_Map AS
SELECT
  a.prd_btch_nbr,
  b.ingr_ordr,
  b.ingr_name,
  IFNULL(b.ingr_qty_meas, '') AS ingr_qty_meas,
  f_json_to_com_delim(ingrMaps) AS ingrMaps,
  b.prd_ingr_desc,
  b.ingr_id,
  a.prd_id,
  a.prd_type_id,
  b.prd_rcpe_id,
  a.prd_btch_id,
  a.qty_meas AS btch_qty_meas
FROM
  v_prd_btch_dtl a
JOIN
  v_prd_rcpe_active b ON a.prd_id = b.prd_id
LEFT JOIN
  (SELECT prd_btch_id, prd_rcpe_id, json_arrayagg(ingrBtchSrce) AS ingrMaps
   FROM v_prd_btch_ingr_dtl
   GROUP BY prd_btch_id, prd_rcpe_id) c
ON
  a.prd_btch_id = c.prd_btch_id
  AND b.prd_rcpe_id = c.prd_rcpe_id
ORDER BY
  a.prd_btch_nbr, ingr_ordr;

	