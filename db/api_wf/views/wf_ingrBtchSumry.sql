CREATE
OR REPLACE VIEW wf_ingrBtchSumry AS
SELECT
a.ingrName AS ingrName,
count(a.ingredient_batch_id) AS batches,
sum(a.purchQty) AS totalQty,
min(a.unitRate) AS min_rate,
max(a.unitRate) AS max_rate,
cast(avg((ifnull(a.unitPrice,
0) / ifnull(a.unitQty,
1))) as decimal(5,
2)) AS avgRate,
a.purchMeas AS units,
cast(sum(a.purchTotalAmt) as decimal(10,
2)) AS totalCost
FROM wf_ingrBtchDtl a
WHERE ((a.purchDate > (now() - interval 365 day))
AND (a.purchMeas <> '-'))
GROUP BY a.ingrName,
a.purchMeas
ORDER BY a.ingrName;
