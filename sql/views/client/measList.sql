/*
* @view measList
* @description Measurement units for WhatsFresh
* @schema whatsfresh
* @table measures
*/
CREATE OR REPLACE VIEW api_wf.measList AS
SELECT 
  a.id AS measID, -- PK; sys; type:number
  a.name AS name, -- req; type:text; label:Name; width:200; grp:1; searchable
  a.abbrev AS abbrev, -- type:text; label:Abbreviation; width:100; grp:1
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.measures a
ORDER BY a.account_id, a.name;