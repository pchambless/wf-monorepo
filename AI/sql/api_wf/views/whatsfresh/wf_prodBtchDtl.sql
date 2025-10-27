CREATE OR REPLACE VIEW api_wf.wf_prodBtchDtl 
AS
SELECT
  prd.name                             prodName,
  prd.code                             prodCode,
  c.name AS                            prodTypeName,
  prd.recipe_quantity AS               rcpeQty,
  whatsfresh.f_measure(prd.measure_id) AS rcpeMeas,
  pb.recipe_multiply_factor AS         rcpeMultFctr,
  IFNULL(d.ingr_maps, 0) AS            ingrMaps,
  IFNULL(e.task_maps, 0) AS            taskMaps,
  IFNULL(d.ingr_maps + e.task_maps, 0) AS totalMaps,
  IFNULL(pb.location, '') AS           location,
  IFNULL(pb.batch_quantity, 0) AS      btchQty,
  IFNULL(whatsfresh.f_measure(pb.measure_id), '') AS btchMeas,
  IFNULL(CONCAT(pb.batch_quantity, ' ', whatsfresh.f_measure(pb.measure_id), 's'), '') AS qtyMeas,
  IFNULL(CAST(DATE_FORMAT(pb.batch_start, '%Y-%m-%d') AS DATE), '') AS prodBtchDate,
  IFNULL(pb.comments, '')  AS         comments,
  IFNULL(pb.batch_number, 'No Batches') AS prodBtchNbr,
  IFNULL(DATE_FORMAT(pb.best_by_date, '%Y-%m-%d'), '') AS bestByDate,
  prd.active AS prodActv,
  pb.active AS prodBtchActv,
  c.active AS prdTypeActv,
  pb.created_at AS prodBtchCreatedAt,
  prd.product_type_id,
  prd.id AS product_id,
  pb.id AS product_batch_id,
  prd.account_id,
  pb.measure_id
FROM whatsfresh.products prd
LEFT JOIN whatsfresh.product_batches pb 
ON prd.id = pb.product_id
JOIN   whatsfresh.product_types c 
ON prd.product_type_id = c.id
LEFT JOIN
  (SELECT product_batch_id, COUNT(*) AS ingr_maps
   FROM whatsfresh.product_batch_ingredients
   GROUP BY product_batch_id) d ON pb.id = d.product_batch_id
LEFT JOIN
  (SELECT product_batch_id, COUNT(*) AS task_maps
   FROM whatsfresh.product_batch_tasks
   GROUP BY product_batch_id) e ON pb.id = e.product_batch_id
ORDER BY
  prd.account_id,
  pb.batch_start DESC,
  pb.batch_number;
