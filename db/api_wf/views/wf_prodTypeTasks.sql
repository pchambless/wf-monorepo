CREATE
    OR REPLACE VIEW `wf_prodTypeTasks` AS
  SELECT
    `a`.`name` AS `prdTypeName`,`c`.`ordr` AS `taskOrdr`,`c`.`name` AS `taskName`,`c`.`description` AS `taskDesc`,`a`.`active` AS `prodTypeActive`,`c`.`active` AS `taskActive`,`a`.`account_id` AS `account_id`,`c`.`id` AS `task_id`,`c`.`product_type_id` AS `prd_type_id`
  FROM (`whatsfresh`.`product_types` `a`
    JOIN `whatsfresh`.`tasks` `c` on((`a`.`id` = `c`.`product_type_id`)))
  ORDER BY `a`.`account_id`,`a`.`name`,`c`.`ordr`;
