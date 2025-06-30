CREATE OR REPLACE VIEW v_btch_sumry AS
SELECT
  ROW_NUMBER() OVER() uID, 
  a.acct_name AS acct_name,
  YEAR(a.btchDate) AS yr,
  SUM(CASE WHEN a.btchCat = 'Ingr' THEN 1 ELSE 0 END) AS IngrCount,
  SUM(CASE WHEN a.btchCat = 'Prod' THEN 1 ELSE 0 END) AS ProdCount
FROM
  v_btch_trace a
GROUP BY
  a.acct_name, YEAR(a.btchDate)
ORDER BY
  YEAR(a.btchDate) DESC 