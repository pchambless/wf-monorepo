create or replace view vndrList as
select
  a.id as vndrID,
  a.name as vndrName,
  a.contact_name as vndrContactName,
  a.contact_phone as vndrContactPhone,
  a.contact_email as vndrContactEmail,
  a.comments as vndrComments,
  a.account_id as acctID
from
  whatsfresh.vendors a
where
  (a.active = 1)
