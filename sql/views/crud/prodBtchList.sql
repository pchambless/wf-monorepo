/*
* @view prodBtchList
* @description Product batch listing for WhatsFresh
* @schema whatsfresh
* @table product_batches
*/
CREATE OR REPLACE VIEW api_wf.prodBtchList AS
SELECT 
  a.id AS prodBtchID, -- PK; sys; type:number
  a.batch_number AS btchNbr, -- req; type:text; label:Batch Number; width:120; grp:1; searchable
  DATE_FORMAT(a.batch_start, '%Y-%m-%d') AS btchStart, -- type:date; label:Start Date; width:120; grp:1
  a.location AS btchLoc, -- type:text; label:Location; width:150; grp:2
  a.batch_quantity AS btchQty, -- type:decimal; label:Quantity; width:100; dec:10,2; grp:2
  a.global_measure_unit_id AS measID, -- type:select; label:Measure; width:120; entity:measList; valField:measID; dispField:name; grp:2
  DATE_FORMAT(a.best_by_date, '%Y-%m-%d') AS bestByDate, -- type:date; label:Best By Date; width:120; grp:3
  a.comments AS comments, -- type:multiline; label:Comments; tableHide
  a.product_id AS prodID -- parentKey; sys; type:select; entity:prodList; valField:prodID; dispField:prodName
FROM whatsfresh.product_batches a
WHERE a.active = 'Y'
ORDER BY a.product_id, a.batch_start DESC;