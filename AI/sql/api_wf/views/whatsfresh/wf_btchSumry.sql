CREATE OR REPLACE VIEW api_wf.wf_btchSumry AS
SELECT
  a.acctName,
  YEAR(a.btchDate) AS yr,
  SUM(CASE WHEN a.btchCat = 'Ingr' THEN 1 ELSE 0 END) AS IngrCount,
  SUM(CASE WHEN a.btchCat = 'Prod' THEN 1 ELSE 0 END) AS ProdCount
FROM
  api_wf.wf_btchTrace a
GROUP BY
  a.acctName, YEAR(a.btchDate)
ORDER BY
  YEAR(a.btchDate) DESC 