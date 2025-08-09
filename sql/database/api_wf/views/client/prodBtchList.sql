/*
* @view prodBtchList
* @description Product batch listing for WhatsFresh CRUD operations
* @schema api_wf
* @table product_batches
*/
CREATE OR REPLACE VIEW api_wf.prodBtchList AS
SELECT 
  pb.id AS prodBtchID,
  pb.batch_number AS btchNbr,
  DATE_FORMAT(pb.batch_start, '%Y-%m-%d') AS btchStart,
  pb.location AS btchLoc,
  pb.batch_quantity AS btchQty,
  pb.global_measure_unit_id AS measID,
  DATE_FORMAT(pb.best_by_date, '%Y-%m-%d') AS bestByDate,
  pb.comments AS comments,
  pb.product_id AS prodID,
  
  -- Context BI fields (no duplicated rows)
  p.name AS prodName,
  pt.name AS prodType,
  p.account_id AS acctID

FROM whatsfresh.product_batches pb
  INNER JOIN whatsfresh.products p ON pb.product_id = p.id
  INNER JOIN whatsfresh.product_types pt ON p.product_type_id = pt.id
WHERE pb.active = 'Y' 
  AND p.active = 'Y'
  AND pt.active = 'Y'
ORDER BY pb.batch_start DESC, pb.batch_number;