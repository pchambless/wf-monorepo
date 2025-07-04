/*
* @view wrkrList
* @description Worker listing for WhatsFresh
* @schema whatsfresh
* @table workers
*/
CREATE OR REPLACE VIEW api_wf.wrkrList AS
SELECT 
  a.id AS wrkrID, -- PK; sys; type:number
  a.name AS wrkrName, -- req; type:text; label:Worker Name; width:200; grp:1; searchable
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.workers a
WHERE a.active = 'y';