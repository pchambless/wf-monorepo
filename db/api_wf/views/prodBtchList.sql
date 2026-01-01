CREATE
    OR REPLACE VIEW `prodBtchList` AS
  SELECT
    `pb`.`id` AS `prodBtchID`,`pb`.`batch_number` AS `btchNbr`,date_format(`pb`.`batch_start`,'%Y-%m-%d') AS `btchStart`,`pb`.`location` AS `btchLoc`,`pb`.`batch_quantity` AS `btchQty`,`pb`.`global_measure_unit_id` AS `measID`,date_format(`pb`.`best_by_date`,'%Y-%m-%d') AS `bestByDate`,`pb`.`comments` AS `comments`,`pb`.`product_id` AS `prodID`,`p`.`name` AS `prodName`,`pt`.`name` AS `prodType`,`p`.`account_id` AS `acctID`
  FROM ((`whatsfresh`.`product_batches` `pb`
    JOIN `whatsfresh`.`products` `p` on((`pb`.`product_id` = `p`.`id`)))
    JOIN `whatsfresh`.`product_types` `pt` on((`p`.`product_type_id` = `pt`.`id`)))
  WHERE ((`pb`.`active` = 1)
    AND (`p`.`active` = 1)
    AND (`pt`.`active` = 1))
  ORDER BY `pb`.`batch_start` desc,`pb`.`batch_number`;
