CREATE
    OR REPLACE VIEW `wf_prodBtchDtl` AS
  SELECT
    `prd`.`name` AS `prodName`,`prd`.`code` AS `prodCode`,`c`.`name` AS `prodTypeName`,`prd`.`recipe_quantity` AS `rcpeQty`,`whatsfresh`.`f_measure`(`prd`.`measure_id`) AS `rcpeMeas`,`pb`.`recipe_multiply_factor` AS `rcpeMultFctr`,ifnull(`d`.`ingr_maps`,0) AS `ingrMaps`,ifnull(`e`.`task_maps`,0) AS `taskMaps`,ifnull((`d`.`ingr_maps` + `e`.`task_maps`),0) AS `totalMaps`,ifnull(`pb`.`location`,'') AS `location`,ifnull(`pb`.`batch_quantity`,0) AS `btchQty`,ifnull(`whatsfresh`.`f_measure`(`pb`.`measure_id`),'') AS `btchMeas`,ifnull(concat(`pb`.`batch_quantity`,' ',`whatsfresh`.`f_measure`(`pb`.`measure_id`),'s'),'') AS `qtyMeas`,ifnull(cast(date_format(`pb`.`batch_start`,'%Y-%m-%d') as date),'') AS `prodBtchDate`,ifnull(`pb`.`comments`,'') AS `comments`,ifnull(`pb`.`batch_number`,'No Batches') AS `prodBtchNbr`,ifnull(date_format(`pb`.`best_by_date`,'%Y-%m-%d'),'') AS `bestByDate`,`prd`.`active` AS `prodActv`,`pb`.`active` AS `prodBtchActv`,`c`.`active` AS `prdTypeActv`,`pb`.`created_at` AS `prodBtchCreatedAt`,`prd`.`product_type_id` AS `product_type_id`,`prd`.`id` AS `product_id`,`pb`.`id` AS `product_batch_id`,`prd`.`account_id` AS `account_id`,`pb`.`measure_id` AS `measure_id`
  FROM ((((`whatsfresh`.`products` `prd`
    LEFT JOIN `whatsfresh`.`product_batches` `pb` on((`prd`.`id` = `pb`.`product_id`)))
    JOIN `whatsfresh`.`product_types` `c` on((`prd`.`product_type_id` = `c`.`id`)))
    LEFT JOIN (select `whatsfresh`.`product_batch_ingredients`.`product_batch_id` AS `product_batch_id`,count(0) AS `ingr_maps` from `whatsfresh`.`product_batch_ingredients`
  GROUP BY `whatsfresh`.`product_batch_ingredients`.`product_batch_id`) `d` on((`pb`.`id` = `d`.`product_batch_id`)))
    LEFT JOIN (select `whatsfresh`.`product_batch_tasks`.`product_batch_id` AS `product_batch_id`,count(0) AS `task_maps` from `whatsfresh`.`product_batch_tasks` group by `whatsfresh`.`product_batch_tasks`.`product_batch_id`) `e` on((`pb`.`id` = `e`.`product_batch_id`)))
  ORDER BY `prd`.`account_id`,`pb`.`batch_start` desc,`pb`.`batch_number`;
