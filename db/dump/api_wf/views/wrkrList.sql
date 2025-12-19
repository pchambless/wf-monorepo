create or replace view wrkrList as
select
  a.id as wrkrID,
  a.name as wrkrName,
  a.account_id as acctID
from
  whatsfresh.workers a
where
  (a.active = 1)
