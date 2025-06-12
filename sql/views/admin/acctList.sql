/*
* @view acctList
* @description Account listing view for WhatsFresh
* @schema whatsfresh
* @table accounts
*/
CREATE OR REPLACE VIEW api_wf.acctList AS
SELECT 
  a.id AS acctID, -- PK; sys; type:number
  a.name AS acctName, -- req; type:text; label:Account Name; width:200; grp:1; searchable
  a.description AS acctDesc, -- type:multiline; label:Description; tableHide
  a.street_address AS acctAddr, -- type:text; label:Address; width:200; grp:2
  a.city AS acctCity, -- type:text; label:City; width:150; grp:3
  a.state_code AS acctState, -- type:text; label:State; width:60; grp:3
  a.zip_code AS acctZipCode, -- type:text; label:ZIP; width:80; grp:3
  a.company_code AS acctCompCode, -- type:text; label:Company Code; width:120; grp:4
  a.default_location AS acctDfltLoc, -- type:text; label:Default Location; width:150; grp:4
  a.url AS acctURL, -- type:text; label:Website URL; width:200; grp:5
  a.payment_customer_code AS acctPayCustCode, -- type:text; label:Customer Code; width:150; tableHide; grp:6
  a.payment_subscription_code AS acctSubsptnCode -- type:text; label:Subscription Code; width:150; tableHide; grp:6
FROM whatsfresh.accounts a
WHERE a.active = 'Y';