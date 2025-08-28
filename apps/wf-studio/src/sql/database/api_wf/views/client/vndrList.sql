/*
* @view vndrList
* @description Vendor listing for WhatsFresh
* @schema whatsfresh
* @table vendors
*/
CREATE OR REPLACE VIEW api_wf.vndrList AS
SELECT 
  a.id AS vndrID,
  a.name AS vndrName,
  a.contact_name AS vndrContactName,
  a.contact_phone AS vndrContactPhone,
  a.contact_email AS vndrContactEmail,
  a.comments AS vndrComments,
  a.account_id AS acctID
FROM whatsfresh.vendors a
WHERE a.active = 'Y';