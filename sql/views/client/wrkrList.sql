/*
* @view wrkrList
* @description Worker listing for WhatsFresh
* @schema whatsfresh
* @table workers
*/
CREATE OR REPLACE VIEW api_wf.wrkrList AS
SELECT 
  a.id AS wrkrID,
  a.name AS wrkrName,
  a.account_id AS acctID
FROM whatsfresh.workers a
WHERE a.active = 'y';