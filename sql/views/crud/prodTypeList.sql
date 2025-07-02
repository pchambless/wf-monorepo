/*
* @view prodTypeList
* @description Product type listing for WhatsFresh
* @schema whatsfresh
* @table product_types
*/
CREATE OR REPLACE VIEW api_wf.prodTypeList AS
SELECT 
  a.id AS prodTypeID, -- PK; sys; type:number
  a.name AS prodTypeName, -- req; type:text; label:Type Name; width:200; grp:1; searchable
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.product_types a
ORDER BY a.account_id, a.name;