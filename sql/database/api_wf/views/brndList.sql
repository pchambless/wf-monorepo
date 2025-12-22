create or replace view brndList as
select
  a.id as brndID,
  a.name as brndName,
  a.comments as brndComments,
  a.url as brndURL,
  a.account_id as acctID
from
  whatsfresh.brands a
where
  (a.active = 1)
order by
  a.account_id,
  a.name
