/*
* @view measList
* @description Measurement units for WhatsFresh
* @schema whatsfresh
* @table measures
*/
CREATE OR REPLACE VIEW api_wf.measList AS
SELECT 
  a.id AS measID,
  a.name AS name,
  a.abbrev AS abbrev,
  a.account_id AS acctID
FROM whatsfresh.measures a
ORDER BY a.account_id, a.name;