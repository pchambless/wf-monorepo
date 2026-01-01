CREATE
    OR REPLACE VIEW `wf_ingrBtchLast` AS
  SELECT
    `a`.`ingredient_id` AS `ingredient_id`,max(`a`.`purchase_date`) AS `lastPurchDate`,max(`a`.`batch_number`) AS `lastBtchNbr`,count(0) AS `btchCount`
  FROM `whatsfresh`.`ingredient_batches` `a`
  GROUP BY `a`.`ingredient_id`;
