CREATE OR REPLACE VIEW vw_user_list AS
SELECT
  a.id AS userID,
  a.last_name AS lastName,
  a.first_name AS firstName,
  a.email AS userEmail,
  a.password AS password,
  a.role AS roleID,
  a.default_account_id AS dfltAcctID,
  DATE_FORMAT(a.last_login, '%Y-%m-%d') AS lastLogin
FROM whatsfresh.users a
WHERE a.active = 'Y';