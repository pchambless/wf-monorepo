CREATE
OR REPLACE VIEW wf_prodBtchLast AS
SELECT
a.prodTypeName AS prodTypeName,
a.prodName AS prodName,
a.prodCode AS prodCode,
a.prodBtchDate AS prodBtchDate,
a.prodBtchNbr AS prodBtchNbr,
a.account_id AS account_id,
a.product_id AS product_id,
a.product_batch_id AS product_batch_id
FROM (wf_prodBtchDtl a
LEFT JOIN wf_prodBtchDtl b on(((a.product_id = b.product_id)
AND (a.prodBtchDate < b.prodBtchDate))))
WHERE ((b.prodBtchDate is null)
AND (a.prodBtchDate is not null))
ORDER BY a.account_id,
a.prodTypeName,
a.prodName;
