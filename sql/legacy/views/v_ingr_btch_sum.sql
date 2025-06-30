CREATE OR REPLACE VIEW whatsfresh.v_ingr_btch_sum AS
SELECT
  ROW_NUMBER() OVER() uID, 
  a.ingr_name,
  COUNT(a.ingr_btch_id) AS batches,
  SUM(a.purch_qty) AS tot_qty,
  MIN(a.unit_rate) AS min_rate,
  MAX(a.unit_rate) AS max_rate,
  CAST(AVG(IFNULL(a.unit_price, 0) / IFNULL(a.unit_qty, 1)) AS DECIMAL(5, 2)) AS avg_rate,
  a.purch_meas AS units,
  CAST(SUM(a.purch_total_amt) AS DECIMAL(10, 2)) AS total_cost
FROM
  whatsfresh.v_ingr_btch_dtl a
WHERE
  a.acct_id = 1
  AND a.purch_date > NOW() - INTERVAL 365 DAY
  AND a.purch_meas <> '-'
GROUP BY
  a.ingr_name,
  a.purch_meas
ORDER BY
  a.ingr_name;
