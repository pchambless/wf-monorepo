CREATE
OR REPLACE VIEW wf_btchTrace AS
SELECT
f.name AS acctName,
e.btchCat AS btchCat,
concat(e.btchType,
'.',
e.btchName) AS btchID,
e.btchNbr AS btchNbr,
date_format(e.btchDate,
'%Y-%m-%d') AS btchDate,
e.account_id AS account_id
FROM ((select 'Ingr' AS btchCat,
c.account_id AS account_id,
c.ingrTypeName AS btchType,
c.ingrName AS btchName,
c.ingrBtchNbr AS btchNbr,
c.purchDate AS btchDate from wf_ingrBtchDtl c
WHERE (year(c.purchDate) >= 2020)

UNION

ALL

select 'Prod' AS btchCat,
d.account_id AS account_id,
d.prodTypeName AS btchType,
d.prodName AS btchName,
d.prodBtchNbr AS btchNbr,
d.prodBtchDate AS btchDate from wf_prodBtchDtl d where (year(d.prodBtchDate) >= 2020)) e
LEFT JOIN whatsfresh.accounts f on((e.account_id = f.id)))
ORDER BY date_format(e.btchDate,
'%Y-%m-%d'),
concat(e.btchType,
'.',
e.btchName),
e.btchNbr;
