/*
* @view rcpeList
* @description Recipe details for WhatsFresh products
* @schema whatsfresh
* @table product_recipes
* @note This is based on a database view rather than a direct table
*/
CREATE OR REPLACE VIEW api_wf.rcpeList AS
SELECT 
  a.prd_rcpe_id AS rcpeID, -- PK; sys; type:number
  a.ingr_ordr AS ingrOrdr, -- type:number; label:Order; width:80; grp:1
  a.ingr_name AS ingrName, -- type:text; label:Ingredient Name; width:200; grp:1; searchable
  a.ingr_qty_meas AS qtyMeas, -- type:text; label:Quantity & Measure; width:150; grp:2
  a.prd_id AS prodID, -- parentKey; sys; type:select; entity:prodList; valField:prodID; dispField:prodName
  a.ingr_type_id AS ingrTypeSel, -- type:select; label:Ingredient Type; width:150; entity:ingrTypeList; valField:ingrTypeID; dispField:ingrTypeName; grp:3
  a.ingr_id AS ingrSel, -- type:select; label:Ingredient; width:180; entity:ingrList; valField:ingrID; dispField:ingrName; grp:3
  a.ingr_meas_id AS measID, -- type:select; label:Measure; width:120; entity:measList; valField:measID; dispField:name; grp:2
  a.ingr_qty AS Qty, -- type:decimal; label:Quantity; width:100; dec:10,2; grp:2
  a.prd_ingr_desc AS Comments -- type:multiLine; label:Comments; tableHide
FROM whatsfresh.v_prd_rcpe_dtl a -- db_table: product_recipes
ORDER BY a.prd_id, a.ingr_ordr;