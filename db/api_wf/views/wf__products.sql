CREATE
    OR REPLACE VIEW `wf__products` AS
  SELECT
    `b`.`name` AS `prodTypeName`,`a`.`name` AS `prodName`,`a`.`code` AS `prodCode`,ifnull(replace(`a`.`description`,'\n','<br>'),'') AS `description`,`a`.`best_by_days` AS `bestByDays`,ifnull(`a`.`location`,'') AS `location`,`whatsfresh`.`f_measure`(`a`.`measure_id`) AS `prodMeas`,`a`.`account_id` AS `account_id`,`a`.`id` AS `product_id`,`a`.`product_type_id` AS `product_type_id`
  FROM ((`whatsfresh`.`products` `a`
    JOIN `whatsfresh`.`product_types` `b` on((`a`.`product_type_id` = `b`.`id`)))
    JOIN `whatsfresh`.`accounts` `c` on((`a`.`account_id` = `c`.`id`)))
  WHERE ((`a`.`active` = 1)
    AND (`c`.`active` = 1));
