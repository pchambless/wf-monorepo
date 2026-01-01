CREATE
    OR REPLACE VIEW `ingrTypeList` AS
  SELECT
    `a`.`id` AS `ingrTypeID`,`a`.`name` AS `ingrTypeName`,`a`.`description` AS `ingrTypeDesc`,`a`.`account_id` AS `acctID`
  FROM `whatsfresh`.`ingredient_types` `a`
  WHERE (`a`.`active` = 1)
  ORDER BY `a`.`account_id`,`a`.`name`;
