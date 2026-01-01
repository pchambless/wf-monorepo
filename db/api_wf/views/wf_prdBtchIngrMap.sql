CREATE
    OR REPLACE VIEW `wf_prdBtchIngrMap` AS
  SELECT
    `a`.`prodBtchNbr` AS `prodBtchNbr`,`b`.`ingrOrdr` AS `ingrOrdr`,`b`.`ingrName` AS `ingrName`,ifnull(`b`.`ingrQtyMeas`,'') AS `ingrQtyMeas`,`whatsfresh`.`f_json_to_com_delim`(`c`.`ingrMaps`) AS `ingrMaps`,`b`.`prodIngrDesc` AS `prodIngrDesc`,`b`.`ingredient_id` AS `ingredient_id`,`a`.`product_id` AS `product_id`,`a`.`product_type_id` AS `product_type_id`,`b`.`product_recipe_id` AS `product_recipe_id`,`a`.`product_batch_id` AS `product_batch_id`,`a`.`qtyMeas` AS `btchQtyMeas`
  FROM ((`wf_prodBtchDtl` `a`
    JOIN `wf_prodRcpeDtl` `b` on((`a`.`product_id` = `b`.`product_id`)))
    LEFT JOIN (select `wf_prodBtchIngrDtl`.`product_batch_id` AS `product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id` AS `product_recipe_id`,json_arrayagg(`wf_prodBtchIngrDtl`.`ingrBtchSrce`) AS `ingrMaps` from `wf_prodBtchIngrDtl`
  GROUP BY `wf_prodBtchIngrDtl`.`product_batch_id`,`wf_prodBtchIngrDtl`.`product_recipe_id`) `c` on(((`a`.`product_batch_id` = `c`.`product_batch_id`)
    AND (`b`.`product_recipe_id` = `c`.`product_recipe_id`))))
  ORDER BY `a`.`prodBtchNbr`,`b`.`ingrOrdr`;
