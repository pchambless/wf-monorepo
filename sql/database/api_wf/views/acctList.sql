create or replace view acctList as
select
  a.id as acctID,
  a.name as acctName,
  a.description as acctDesc,
  a.street_address as acctAddr,
  a.city as acctCity,
  a.state_code as acctState,
  a.zip_code as acctZipCode,
  a.company_code as acctCompCode,
  a.default_location as acctDfltLoc,
  a.url as acctURL,
  a.payment_customer_code as acctPayCustCode,
  a.payment_subscription_code as acctSubsptnCode
from
  whatsfresh.accounts a
where
  (a.active = 'Y')
