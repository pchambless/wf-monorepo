/*
* @view brndList
* @description Brand listing for WhatsFresh
* @schema whatsfresh
* @table brands
*/
CREATE OR REPLACE VIEW api_wf.brndList AS
SELECT 
  a.id AS brndID,
  a.name AS brndName,
  a.comments AS brndComments,
  a.url AS brndURL,
  a.account_id AS acctID
FROM whatsfresh.brands a
WHERE a.active = 'Y'
ORDER BY a.account_id, a.name;