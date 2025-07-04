/*
* @view prodTypeList
* @description Product type listing for WhatsFresh
* @schema whatsfresh
* @table product_types
*/
CREATE OR REPLACE VIEW api_wf.prodTypeList AS
SELECT 
  a.id AS prodTypeID,
  a.name AS prodTypeName,
  a.account_id AS acctID
FROM whatsfresh.product_types a
ORDER BY a.account_id, a.name;