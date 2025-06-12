/*
* @view ingrBtchList
* @description Ingredient batch listing for WhatsFresh
* @schema whatsfresh
* @table ingredient_batches
*/
CREATE OR REPLACE VIEW api_wf.ingrBtchList AS
SELECT 
  a.id AS btchID, -- PK; sys; type:number
  a.batch_number AS btchNbr, -- req; type:text; label:Batch Number; width:120; grp:1; searchable
  a.vendor_id AS vndrID, -- type:select; label:Vendor; width:180; entity:vndrList; valField:vndrID; dispField:vndrName; grp:1
  a.brand_id AS brndID, -- type:select; label:Brand; width:150; entity:brndList; valField:brndID; dispField:brndName; grp:2
  DATE_FORMAT(a.purchase_date, '%Y-%m-%d') AS purchDate, -- type:date; label:Purchase Date; width:120; grp:2
  a.unit_quantity AS unitQty, -- type:decimal; label:Unit Qty; width:80; dec:10,2; grp:3
  a.unit_price AS unitPrice, -- type:decimal; label:Unit Price; width:100; dec:10,2; grp:3
  a.purchase_quantity AS purchQty, -- type:decimal; label:Purchase Qty; width:100; dec:10,2; grp:3
  a.global_measure_unit_id AS measID, -- type:select; label:Measure; width:120; entity:measList; valField:measID; dispField:name; grp:3
  a.lot_number AS lotNbr, -- type:text; label:Lot Number; width:150; grp:4
  DATE_FORMAT(a.best_by_date, '%Y-%m-%d') AS bestByDate, -- type:date; label:Best By Date; width:120; grp:4
  CONCAT(
    a.purchase_quantity, ' @ $', 
    FORMAT(a.unit_price, 2), 
    ' per ', a.unit_quantity, ' ', 
    (SELECT gmu.value FROM whatsfresh.global_measure_units gmu WHERE gmu.id = a.global_measure_unit_id)
  ) AS purch_dtl, -- type:text; label:Purchase Detail; width:200; tableHide; grp:5
  a.comments AS comments, -- type:multiline; label:Comments; tableHide
  a.ingredient_id AS ingrID -- parentKey; sys; type:select; entity:ingrList; valField:ingrID; dispField:ingrName
FROM whatsfresh.ingredient_batches a
ORDER BY a.purchase_date DESC;