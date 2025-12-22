create or replace view userAcctList as
select
  c.id as acctID,
  c.name as acctName,
  a.id as userID,
  a.first_name as firstName
from
  (
    (
      whatsfresh.users a
      join whatsfresh.accounts_users b on ((a.id = b.user_id))
    )
    join whatsfresh.accounts c on ((b.account_id = c.id))
  )
where
  (
    (a.active = 1)
    and (c.active = 1)
  )
order by
  c.id,
  c.name
