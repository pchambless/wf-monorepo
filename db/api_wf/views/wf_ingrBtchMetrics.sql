CREATE
    OR REPLACE VIEW `wf_ingrBtchMetrics` AS
  SELECT
    `a`.`ingrTypeName` AS `ingrTypeName`,`a`.`ingrName` AS `ingrName`,`a`.`ingrCode` AS `ingrCode`,`a`.`ingrDesc` AS `ingrDesc`,`a`.`gmsPerOz` AS `gmsPerOz`,coalesce(`rcpe`.`rcpeCnt`,0) AS `recipes`,count(`a`.`ingredient_batch_id`) AS `batches`,`a`.`ingredient_type_id` AS `ingredient_type_id`,`a`.`ingredient_id` AS `ingredient_id`,`a`.`account_id` AS `account_id`,`a`.`ingrActv` AS `ingrActv`
  FROM (`wf_ingrBtchDtl` `a`
    LEFT JOIN (select `whatsfresh`.`product_recipes`.`ingredient_id` AS `ingredient_id`,count(0) AS `rcpeCnt` from `whatsfresh`.`product_recipes`
  WHERE (`whatsfresh`.`product_recipes`.`active` = 'Y')
  GROUP BY `whatsfresh`.`product_recipes`.`ingredient_id`) `rcpe` on((`a`.`ingredient_id` = `rcpe`.`ingredient_id`))) group by `a`.`ingrTypeName`,`a`.`ingrName`,`a`.`ingrCode`,`a`.`ingrDesc`,`a`.`gmsPerOz`,`a`.`ingredient_type_id`,`a`.`ingredient_id`,`a`.`account_id`,`a`.`ingrActv`
  ORDER BY `a`.`account_id`,`a`.`ingrTypeName`,`a`.`ingrName`;
