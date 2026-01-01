CREATE
    OR REPLACE VIEW `rcpeList` AS
  SELECT
    `whatsfresh`.`a`.`prd_rcpe_id` AS `rcpeID`,`whatsfresh`.`a`.`ingr_ordr` AS `ingrOrdr`,`whatsfresh`.`a`.`ingr_name` AS `ingrName`,`whatsfresh`.`a`.`ingr_qty_meas` AS `qtyMeas`,`whatsfresh`.`a`.`prd_id` AS `prodID`,`whatsfresh`.`a`.`ingr_type_id` AS `ingrTypeSel`,`whatsfresh`.`a`.`ingr_id` AS `ingrSel`,`whatsfresh`.`a`.`ingr_meas_id` AS `measID`,`whatsfresh`.`a`.`ingr_qty` AS `Qty`,`whatsfresh`.`a`.`prd_ingr_desc` AS `Comments`
  FROM `whatsfresh`.`v_prd_rcpe_dtl` `a`
  ORDER BY `whatsfresh`.`a`.`prd_id`,`whatsfresh`.`a`.`ingr_ordr`;
