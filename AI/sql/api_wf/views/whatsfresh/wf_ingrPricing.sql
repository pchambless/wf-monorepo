CREATE OR REPLACE VIEW api_wf.wf_ingrPricing AS
SELECT
  a.ingrTypeName,
  a.ingrName,
  a.ingredient_id,
  a.account_id,
  a.unitQty,
  a.purchMeas,
  COUNT(*) AS purchases,
  CAST(MAX(a.unitRate) AS DECIMAL(7, 2)) AS maxPrice,
  CAST(MIN(a.unitRate) AS DECIMAL(7, 2)) AS minPrice,
  CAST(AVG(a.unitRate) AS DECIMAL(7, 2)) AS avgPrice
FROM
  api_wf.wf_ingrBtchDtl a
WHERE
  a.purchDate > DATE(NOW()) - INTERVAL 30 MONTH
GROUP BY
  a.ingrTypeName, a.ingrName, a.ingredient_id, a.account_id, a.unitQty, a.purchMeas
ORDER BY
  a.account_id, a.ingrTypeName, a.ingrName;