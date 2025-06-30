CREATE OR REPLACE VIEW whatsfresh.v_ingr_btch_trace AS
SELECT
  a.ingr_type,
  a.ingr_name,
  a.purch_date,
  a.vndr_name,
  a.brnd_name,
  a.ingr_btch_nbr,
  IFNULL(b.prd_btch_nbr, '') AS prd_btch_nbr,
  IFNULL(CAST(DATE_FORMAT(b.batch_start, '%Y-%m-%d') AS DATE), '') AS prd_btch_date,
  IFNULL(CONCAT(b.prd_type, '-', b.prd_name), 'No Product Batches') AS prd,
  IFNULL(b.location, '') AS location,
  a.unit_qty AS purch_qty,
  a.purch_meas,
  IFNULL(b.prd_qty_meas, '') AS prd_qty_meas,
  IFNULL(b.btch_qty, 0) AS prd_btch_qty,
  IFNULL(b.unit_meas, '') AS prd_btch_meas,
  a.purch_amt,
  a.purch_dtl,
  a.acct_id,
  a.ingr_id,
  b.prd_id,
  a.ingr_btch_id,
  b.prd_btch_id,
  b.prd_btch_ingr_id
FROM
  whatsfresh.v_ingr_btch_dtl a
LEFT JOIN
  v_prd_btch_ingr_dtl b ON a.ingr_btch_id = b.ingr_btch_id
