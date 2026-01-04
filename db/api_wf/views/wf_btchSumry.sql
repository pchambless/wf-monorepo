CREATE
OR REPLACE VIEW wf_btchSumry AS
SELECT
a.acctName AS acctName,
year(a.btchDate) AS yr,
sum((case when (a.btchCat = 'Ingr') then 1 else 0 end)) AS IngrCount,
sum((case when (a.btchCat = 'Prod') then 1 else 0 end)) AS ProdCount
FROM wf_btchTrace a
GROUP BY a.acctName,
year(a.btchDate)
ORDER BY year(a.btchDate) desc;
