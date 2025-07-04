/*
* @view prodList
* @description Product listing view for WhatsFresh
* @schema whatsfresh
* @table products
*/
CREATE OR REPLACE VIEW api_wf.prodList AS
SELECT 
  a.id AS prodID, -- PK; sys; type:number
  a.name AS prodName, -- req; type:text; label:Product Name; width:200; grp:1; searchable
  a.code AS prodCode, -- type:text; label:Code; width:100; grp:1
  a.location AS prodDfltLoc, -- type:text; label:Default Location; width:120; grp:2
  a.best_by_days AS prodDfltBestBy, -- type:number; label:Best By Days; width:80; grp:2
  a.description AS prodDesc, -- type:multiLine; label:Description; tableHide
  a.upc_item_reference AS prodUpcItemRef, -- type:text; label:UPC Reference; width:120; grp:3
  a.upc_check_digit AS prodUpcChkDgt, -- type:text; label:UPC Check Digit; width:80; grp:3
  a.product_type_id AS prodTypeID -- parentKey; sys; type:select; entity:prodTypeList; valField:prodTypeID; dispField:prodTypeName
FROM whatsfresh.products a
WHERE a.active = 'Y'
ORDER BY a.product_type_id, a.name;