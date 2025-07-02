CREATE OR REPLACE VIEW v_btch_trace AS
SELECT
  f.name AS acct_name,
  e.btchCat AS btchCat,
  CONCAT(e.btchType, '.', e.btchName) AS btchID,
  e.btchNbr AS btchNbr,
  DATE_FORMAT(e.btchDate, '%Y-%m-%d') AS btchDate,
  e.acct_id AS acct_id
FROM
  (
    SELECT
      'Ingr' AS btchCat,
      c.acct_id AS acct_id,
      c.ingr_type AS btchType,
      c.ingr_name AS btchName,
      a.batch_number AS btchNbr,
      a.purchase_date AS btchDate
    FROM ingredient_batches a
    JOIN v_ingr_btch_dtl c ON a.id = c.ingr_btch_id
    WHERE YEAR(a.purchase_date) >= 2020
    UNION ALL
    SELECT
      'Prod' AS btchCat,
      d.acct_id AS acct_id,
      d.prd_type AS btchType,
      d.prd_name AS btchName,
      b.batch_number AS btchNbr,
      b.batch_start AS btchDate
    FROM product_batches b
    JOIN v_prd_btch_dtl d ON b.id = d.prd_btch_id
    WHERE YEAR(b.batch_start) >= 2020
  ) e
LEFT JOIN accounts f ON e.acct_id = f.id
ORDER BY
  DATE_FORMAT(e.btchDate, '%Y-%m-%d'),
  CONCAT(e.btchType, '.', e.btchName),
  e.btchNbr
