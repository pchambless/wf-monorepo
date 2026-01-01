CREATE
    OR REPLACE VIEW `ingrBtchList` AS
  SELECT
    `ib`.`id` AS `ingrBtchID`,`ib`.`batch_number` AS `btchNbr`,`ib`.`vendor_id` AS `vndrID`,`ib`.`brand_id` AS `brndID`,date_format(`ib`.`purchase_date`,'%Y-%m-%d') AS `purchDate`,`ib`.`unit_quantity` AS `unitQty`,`ib`.`unit_price` AS `unitPrice`,`ib`.`purchase_quantity` AS `purchQty`,`ib`.`measure_id` AS `measID`,`ib`.`lot_number` AS `lotNbr`,date_format(`ib`.`best_by_date`,'%Y-%m-%d') AS `bestByDate`,`ib`.`comments` AS `comments`,`ib`.`ingredient_id` AS `ingrID`,(case when (`ib`.`id` is not null) then concat(`ib`.`purchase_quantity`,' @ $',format(coalesce(`ib`.`unit_price`,0),2),' per ',cast(`ib`.`unit_quantity` as decimal(10,2)),' ',coalesce(`m`.`abbrev`,'')) else '' end) AS `purch_dtl`,`i`.`name` AS `ingrName`,`i`.`code` AS `ingrCode`,`it`.`name` AS `ingrType`,`v`.`name` AS `vndrName`,`b`.`name` AS `brndName`,cast((coalesce(`ib`.`unit_price`,0) / nullif(`ib`.`unit_quantity`,0)) as decimal(13,4)) AS `unitRate`,coalesce((`ib`.`purchase_quantity` * `ib`.`unit_price`),0) AS `purchAmt`,coalesce(`pbi`.`productBatchCount`,0) AS `usageCount`,(case when (coalesce(`pbi`.`productBatchCount`,0) > 0) then 'In Use' when (`ib`.`best_by_date` < curdate()) then 'Expired' when (`ib`.`best_by_date` <= (curdate() + interval 30 day)) then 'Expiring Soon' when (`ib`.`purchase_date` >= (curdate() - interval 30 day)) then 'Recently Purchased' else 'Available' end) AS `batchStatus`,(case when (`ib`.`shop_event_id` is not null) then concat('Shop Event #',`ib`.`shop_event_id`) when ((`ib`.`purchase_date` is not null)
    AND (`v`.`name` is not null)) then concat(cast(`ib`.`purchase_date` as date),' : ',`v`.`name`) else NULL end) AS `shopEventRef`,`i`.`account_id` AS `acctID`
  FROM ((((((`whatsfresh`.`ingredient_batches` `ib`
    JOIN `whatsfresh`.`ingredients` `i` on((`ib`.`ingredient_id` = `i`.`id`)))
    JOIN `whatsfresh`.`ingredient_types` `it` on((`i`.`ingredient_type_id` = `it`.`id`)))
    LEFT JOIN `whatsfresh`.`vendors` `v` on(((`ib`.`vendor_id` = `v`.`id`)
    AND (`v`.`active` = 'Y'))))
    LEFT JOIN `whatsfresh`.`brands` `b` on(((`ib`.`brand_id` = `b`.`id`)
    AND (`b`.`active` = 'Y'))))
    LEFT JOIN `whatsfresh`.`measures` `m` on((`ib`.`measure_id` = `m`.`id`)))
    LEFT JOIN (select `pbi`.`ingredient_batch_id` AS `ingredient_batch_id`,count(0) AS `productBatchCount` from (`whatsfresh`.`product_batch_ingredients` `pbi`
    JOIN `whatsfresh`.`product_batches` `pb` on((`pbi`.`product_batch_id` = `pb`.`id`)))
  WHERE (`pb`.`active` = 'Y')
  GROUP BY `pbi`.`ingredient_batch_id`) `pbi` on((`ib`.`id` = `pbi`.`ingredient_batch_id`))) where ((`ib`.`active` = 1)
    AND (`i`.`active` = 1)
    AND (`it`.`active` = 1)
    AND (`ib`.`purchase_date` >= (now() - interval 7 year)))
  ORDER BY `ib`.`purchase_date` desc,`ib`.`batch_number`;
