/*
* @view ingrTypeList
* @description Ingredient type listing for WhatsFresh
* @schema whatsfresh
* @table ingredient_types
*/
CREATE OR REPLACE VIEW api_wf.ingrTypeList AS
SELECT 
  a.id AS ingrTypeID,
  a.name AS ingrTypeName,
  a.description AS ingrTypeDesc,
  a.account_id AS acctID
FROM whatsfresh.ingredient_types a
WHERE a.active = 1
ORDER BY a.account_id, a.name;