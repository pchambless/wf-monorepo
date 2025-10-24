/*
* @view acctList
* @description Account listing view for WhatsFresh
* @schema whatsfresh
* @table accounts
*/
CREATE OR REPLACE VIEW api_wf.acctList AS
SELECT 
  a.id AS acctID,
  a.name AS acctName,
  a.description AS acctDesc,
  a.street_address AS acctAddr,
  a.city AS acctCity,
  a.state_code AS acctState,
  a.zip_code AS acctZipCode,
  a.company_code AS acctCompCode,
  a.default_location AS acctDfltLoc,
  a.url AS acctURL,
  a.payment_customer_code AS acctPayCustCode,
  a.payment_subscription_code AS acctSubsptnCode
FROM whatsfresh.accounts a
WHERE a.active = 'Y';