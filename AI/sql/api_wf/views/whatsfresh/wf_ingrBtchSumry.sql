CREATE OR REPLACE VIEW api_wf.wf_ingrBtchSumry AS
SELECT
  a.ingrName,
  COUNT(a.ingredient_batch_id) AS batches,
  SUM(a.purchQty) AS totalQty,
  MIN(a.unitRate) AS min_rate,
  MAX(a.unitRate) AS max_rate,
  CAST(AVG(IFNULL(a.unitPrice, 0) / IFNULL(a.unitQty, 1)) AS DECIMAL(5, 2)) AS avgRate,
  a.purchMeas AS units,
  CAST(SUM(a.purchTotalAmt) AS DECIMAL(10, 2)) AS totalCost
FROM
  api_wf.wf_ingrBtchDtl a
WHERE
  a.purchDate > NOW() - INTERVAL 365 DAY
  AND a.purchMeas <> '-'
GROUP BY
  a.ingrName,
  a.purchMeas
ORDER BY
  a.ingrName;