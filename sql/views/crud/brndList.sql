/*
* @view brndList
* @description Brand listing for WhatsFresh
* @schema whatsfresh
* @table brands
*/
CREATE OR REPLACE VIEW api_wf.brndList AS
SELECT 
  a.id AS brndID, -- PK; sys; type:number
  a.name AS brndName, -- req; type:text; label:Brand Name; width:200; grp:1; searchable
  a.comments AS brndComments, -- type:multiLine; label:Comments; tableHide
  a.url AS brndURL, -- type:text; label:Website; width:200; grp:2
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.brands a
WHERE a.active = 'Y'
ORDER BY a.account_id, a.name;