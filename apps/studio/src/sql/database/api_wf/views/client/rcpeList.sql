/*
* @view rcpeList
* @description Recipe details for WhatsFresh products
* @schema whatsfresh
* @table product_recipes
* @note This is based on a database view rather than a direct table
*/
CREATE OR REPLACE VIEW api_wf.rcpeList AS
SELECT 
  a.prd_rcpe_id AS rcpeID,
  a.ingr_ordr AS ingrOrdr,
  a.ingr_name AS ingrName,
  a.ingr_qty_meas AS qtyMeas,
  a.prd_id AS prodID,
  a.ingr_type_id AS ingrTypeSel,
  a.ingr_id AS ingrSel,
  a.ingr_meas_id AS measID,
  a.ingr_qty AS Qty,
  a.prd_ingr_desc AS Comments
FROM whatsfresh.v_prd_rcpe_dtl a -- db_table: product_recipes
ORDER BY a.prd_id, a.ingr_ordr;