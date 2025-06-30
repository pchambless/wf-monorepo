CREATE OR REPLACE VIEW v_ingr_pricing AS
SELECT
  ROW_NUMBER() OVER() uID, 
  a.ingr_type,
  a.ingr_name,
  a.ingr_id,
  a.acct_id,
  a.unit_qty,
  a.purch_meas,
  COUNT(*) AS purchases,
  CAST(MAX(a.unit_rate) AS DECIMAL(7, 2)) AS max_price,
  CAST(MIN(a.unit_rate) AS DECIMAL(7, 2)) AS min_price,
  CAST(AVG(a.unit_rate) AS DECIMAL(7, 2)) AS avg_price
FROM
  v_ingr_btch_dtl a
WHERE
  a.purch_date > DATE(NOW()) - INTERVAL 30 MONTH
GROUP BY
  a.ingr_type, a.ingr_name, a.ingr_id, a.acct_id, a.unit_qty, a.purch_meas
ORDER BY
  a.acct_id, a.ingr_type, a.ingr_name;
