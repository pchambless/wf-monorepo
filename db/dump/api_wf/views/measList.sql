create or replace view measList as
select
  a.id as measID,
  a.name as name,
  a.abbrev as abbrev,
  a.account_id as acctID
from
  whatsfresh.measures a
order by
  a.account_id,
  a.name
