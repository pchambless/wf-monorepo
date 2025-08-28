CREATE OR REPLACE VIEW v_ingr_btch_metrics AS
SELECT
  a.ingr_type,
  a.ingr_name,
  a.ingr_code,
  a.ingr_desc,
  a.gms_per_oz,
  COALESCE(rcpe.rcpeCnt, 0) AS recipes,
  COUNT(a.ingr_btch_id) AS batches,
  IFNULL(SUM(a.prd_btch_cnt), 0) AS prod_batches,
  IFNULL(SUM(a.purch_qty), 0) AS tot_qty,
  IFNULL(MAX(a.purch_date), '') AS last_purchase,
  CAST(MIN(a.unit_rate) AS DECIMAL(5, 2)) AS min_rate,
  CAST(MAX(a.unit_rate) AS DECIMAL(5, 2)) AS max_rate,
  CAST(AVG(IFNULL(a.unit_price, 0) / IFNULL(a.unit_qty, 1)) AS DECIMAL(5, 2)) AS avg_rate,
  a.purch_meas AS units,
  CONCAT('$', FORMAT(IFNULL(SUM(a.purch_total_amt), 0), 2)) AS total_cost,
  a.ingr_type_id,
  a.ingr_id,
  a.acct_id,
  a.ingr_active
FROM
  whatsfresh.v_ingr_btch_dtl a
LEFT JOIN (
  SELECT ingredient_id, COUNT(*) AS rcpeCnt
  FROM product_recipes
  WHERE `active` = 'Y'
  GROUP BY ingredient_id
) rcpe ON a.ingr_id = rcpe.ingredient_id
GROUP BY
  a.ingr_type,
  a.ingr_name,
  a.ingr_code,
  a.ingr_desc,
  a.gms_per_oz,
  a.purch_meas,
  a.ingr_type_id,
  a.ingr_id,
  a.acct_id,
  a.ingr_active
ORDER BY
  a.acct_id,
  a.ingr_type,
  a.ingr_name;
