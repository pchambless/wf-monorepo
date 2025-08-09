/*
* @view prodList
* @description Product listing view for WhatsFresh
* @schema whatsfresh
* @table products
*/
CREATE OR REPLACE VIEW api_wf.prodList AS
SELECT 
  a.id AS prodID,
  a.name AS prodName,
  a.code AS prodCode,
  a.location AS prodDfltLoc,
  a.best_by_days AS prodDfltBestBy,
  a.description AS prodDesc,
  a.upc_item_reference AS prodUpcItemRef,
  a.upc_check_digit AS prodUpcChkDgt,
  a.product_type_id AS prodTypeID, 
  a.account_id AS acctID
FROM whatsfresh.products a
WHERE a.active = 'Y'
ORDER BY a.product_type_id, a.name;