CREATE
    OR REPLACE VIEW `wf_prodRcpeDtl` AS
  SELECT
    `pt`.`name` AS `prodTypeName`,`b`.`name` AS `prodName`,`b`.`recipe_quantity` AS `rcpeQty`,`whatsfresh`.`f_measure`(`b`.`measure_id`) AS `rcpeMeas`,`a`.`ingredient_order` AS `ingrOrdr`,`c`.`code` AS `ingrCode`,`c`.`name` AS `ingrName`,`it`.`name` AS `ingrType`,nullif(concat(`a`.`quantity`,' ',`whatsfresh`.`f_measure`(`a`.`measure_id`)),'0 -') AS `ingrQtyMeas`,`a`.`quantity` AS `ingrQty`,`whatsfresh`.`f_measure`(`a`.`measure_id`) AS `ingrMeas`,`b`.`description` AS `prdDesc`,ifnull(`a`.`comments`,'') AS `prodIngrDesc`,`a`.`active` AS `prodRcpeActv`,`b`.`active` AS `prodActv`,`c`.`active` AS `ingrActv`,`a`.`id` AS `product_recipe_id`,`b`.`account_id` AS `account_id`,`a`.`product_id` AS `product_id`,`pt`.`id` AS `product_type_id`,`a`.`ingredient_id` AS `ingredient_id`,`it`.`id` AS `ingredient_type_id`,`a`.`measure_id` AS `measure_id`
  FROM ((((`whatsfresh`.`product_recipes` `a`
    JOIN `whatsfresh`.`products` `b` on((`a`.`product_id` = `b`.`id`)))
    JOIN `whatsfresh`.`product_types` `pt` on((`b`.`product_type_id` = `pt`.`id`)))
    JOIN `whatsfresh`.`ingredients` `c` on((`a`.`ingredient_id` = `c`.`id`)))
    JOIN `whatsfresh`.`ingredient_types` `it` on((`c`.`ingredient_type_id` = `it`.`id`)))
  ORDER BY `b`.`account_id`,`b`.`product_type_id`,`b`.`name`,`a`.`ingredient_order`,`c`.`name`;
