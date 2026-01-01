CREATE
    OR REPLACE VIEW `wf_ingrPricing` AS
  SELECT
    `a`.`ingrTypeName` AS `ingrTypeName`,`a`.`ingrName` AS `ingrName`,`a`.`ingredient_id` AS `ingredient_id`,`a`.`account_id` AS `account_id`,`a`.`unitQty` AS `unitQty`,`a`.`purchMeas` AS `purchMeas`,count(0) AS `purchases`,cast(max(`a`.`unitRate`) as decimal(7,2)) AS `maxPrice`,cast(min(`a`.`unitRate`) as decimal(7,2)) AS `minPrice`,cast(avg(`a`.`unitRate`) as decimal(7,2)) AS `avgPrice`
  FROM `wf_ingrBtchDtl` `a`
  WHERE (`a`.`purchDate` > (cast(now() as date) - interval 30 month))
  GROUP BY `a`.`ingrTypeName`,`a`.`ingrName`,`a`.`ingredient_id`,`a`.`account_id`,`a`.`unitQty`,`a`.`purchMeas`
  ORDER BY `a`.`account_id`,`a`.`ingrTypeName`,`a`.`ingrName`;
