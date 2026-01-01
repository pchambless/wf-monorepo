CREATE
    OR REPLACE VIEW `userAcctList` AS
  SELECT
    `c`.`id` AS `acctID`,`c`.`name` AS `acctName`,`a`.`id` AS `userID`,`a`.`first_name` AS `firstName`
  FROM ((`whatsfresh`.`users` `a`
    JOIN `whatsfresh`.`accounts_users` `b` on((`a`.`id` = `b`.`user_id`)))
    JOIN `whatsfresh`.`accounts` `c` on((`b`.`account_id` = `c`.`id`)))
  WHERE ((`a`.`active` = 1)
    AND (`c`.`active` = 1))
  ORDER BY `c`.`id`,`c`.`name`;
