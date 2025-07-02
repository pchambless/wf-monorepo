/*
* @view ingrTypeList
* @description Ingredient type listing for WhatsFresh
* @schema whatsfresh
* @table ingredient_types
*/
CREATE OR REPLACE VIEW api_wf.ingrTypeList AS
SELECT 
  a.id AS ingrTypeID, -- PK; sys; type:number
  a.name AS ingrTypeName, -- req; type:text; label:Type Name; width:200; grp:1; searchable
  a.description AS ingrTypeDesc, -- type:multiLine; label:Description; tableHide
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.ingredient_types a
WHERE a.active = 'Y'
ORDER BY a.account_id, a.name;