CREATE
    OR REPLACE VIEW `btchMapRcpeList` AS
  SELECT
    `whatsfresh`.`a`.`prd_rcpe_id` AS `rcpeID`,`whatsfresh`.`a`.`ingr_ordr` AS `ingrOrdr`,`whatsfresh`.`a`.`ingr_name` AS `ingrName`,`whatsfresh`.`a`.`ingr_id` AS `ingrID`,`whatsfresh`.`a`.`prd_id` AS `prodID`
  FROM `whatsfresh`.`v_prd_rcpe_dtl` `a`
  WHERE (`whatsfresh`.`a`.`prd_rcpe_actv` = 1)
  ORDER BY `whatsfresh`.`a`.`prd_id`,`whatsfresh`.`a`.`ingr_ordr`;
