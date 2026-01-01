CREATE
    OR REPLACE VIEW `gridMapped` AS
  SELECT
    `whatsfresh`.`a`.`prd_btch_ingr_id` AS `mapID`,`whatsfresh`.`a`.`ingr_btch_nbr` AS `ingrBtchNbr`,`whatsfresh`.`a`.`purch_date` AS `purchDate`,`whatsfresh`.`a`.`vndr_name` AS `vndrName`,`whatsfresh`.`a`.`prd_rcpe_id` AS `prodRcpeID`,`whatsfresh`.`a`.`ingr_id` AS `ingrID`,`whatsfresh`.`a`.`prd_btch_id` AS `prodBtchID`
  FROM `whatsfresh`.`v_prd_btch_ingr_dtl` `a`
  ORDER BY `whatsfresh`.`a`.`purch_date` desc;
