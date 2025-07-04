/*
* @view vndrList
* @description Vendor listing for WhatsFresh
* @schema whatsfresh
* @table vendors
*/
CREATE OR REPLACE VIEW api_wf.vndrList AS
SELECT 
  a.id AS vndrID, -- PK; sys; type:number
  a.name AS vndrName, -- req; type:text; label:Vendor Name; width:200; grp:1; searchable
  a.contact_name AS vndrContactName, -- type:text; label:Contact Name; width:150; grp:1
  a.contact_phone AS vndrContactPhone, -- type:text; label:Phone; width:120; grp:2
  a.contact_email AS vndrContactEmail, -- type:text; label:Email; width:180; grp:2
  a.comments AS vndrComments, -- type:multiLine; label:Comments; tableHide
  a.account_id AS acctID -- parentKey; sys; type:select; entity:acctList; valField:acctID; dispField:acctName
FROM whatsfresh.vendors a
WHERE a.active = 'Y';