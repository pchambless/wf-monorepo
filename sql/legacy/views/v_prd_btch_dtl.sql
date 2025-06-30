CREATE OR REPLACE VIEW whatsfresh.v_prd_btch_dtl AS
SELECT
  ROW_NUMBER() OVER() uID, 
  CONCAT(prd.name, ' ', c.name) AS prd_type_and_name,
  prd.name AS prd_name,
  prd.code AS prd_code,
  c.name AS prd_type,
  prd.recipe_quantity AS rcpe_qty,
  whatsfresh.f_measure_unit(prd.global_measure_unit_id) AS rcpe_meas,
  pb.recipe_multiply_factor AS rcpe_mult_fctr,
  IFNULL(d.ingr_maps, 0) AS ingr_maps,
  IFNULL(e.task_maps, 0) AS task_maps,
  IFNULL(d.ingr_maps + e.task_maps, 0) AS total_maps,
  IFNULL(pb.location, '') AS location,
  IFNULL(pb.batch_quantity, 0) AS btch_qty,
  IFNULL(whatsfresh.f_measure_unit(pb.global_measure_unit_id), '') AS btch_meas,
  IFNULL(CONCAT(pb.batch_quantity, ' ', whatsfresh.f_measure_unit(pb.global_measure_unit_id), 's'), '') AS qty_meas,
  IFNULL(CAST(DATE_FORMAT(pb.batch_start, '%Y-%m-%d') AS DATE), '') AS prd_btch_date,
  IFNULL(pb.batch_start, '') AS batch_start,
  IFNULL(pb.comments, '') AS comments,
  IFNULL(pb.batch_number, 'No Batches') AS prd_btch_nbr,
  IFNULL(DATE_FORMAT(pb.best_by_date, '%Y-%m-%d'), '') AS best_by_date,
  prd.active AS prd_active,
  pb.active AS prd_btch_active,
  c.active AS prd_type_active,
  pb.created_at AS prd_btch_cre,
  prd.product_type_id AS prd_type_id,
  prd.id AS prd_id,
  pb.id AS prd_btch_id,
  prd.account_id AS acct_id,
  pb.global_measure_unit_id AS meas_unit_id
FROM
  whatsfresh.products prd
LEFT JOIN
  whatsfresh.product_batches pb ON prd.id = pb.product_id
JOIN
  whatsfresh.product_types c ON prd.product_type_id = c.id
LEFT JOIN
  (SELECT product_batch_id, COUNT(*) AS ingr_maps
   FROM product_batch_ingredients
   GROUP BY product_batch_id) d ON pb.id = d.product_batch_id
LEFT JOIN
  (SELECT product_batch_id, COUNT(*) AS task_maps
   FROM product_batch_tasks
   GROUP BY product_batch_id) e ON pb.id = e.product_batch_id
ORDER BY
  prd.account_id,
  pb.batch_start DESC,
  pb.batch_number;
