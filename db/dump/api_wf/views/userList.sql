create or replace view userList as
select
  a.id as userID,
  a.last_name as lastName,
  a.first_name as firstName,
  a.email as userEmail,
  a.password as password,
  a.role as roleID,
  a.default_account_id as dfltAcctID,
  date_format(a.last_login, '%Y-%m-%d') as lastLogin
from
  whatsfresh.users a
where
  (a.active = 1)
