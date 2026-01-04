CREATE
OR REPLACE VIEW userList AS
SELECT
a.id AS userID,
a.last_name AS lastName,
a.first_name AS firstName,
a.email AS userEmail,
a.password AS password,
a.role AS roleID,
a.default_account_id AS dfltAcctID,
date_format(a.last_login,
'%Y-%m-%d') AS lastLogin
FROM whatsfresh.users a
WHERE (a.active = 1);
