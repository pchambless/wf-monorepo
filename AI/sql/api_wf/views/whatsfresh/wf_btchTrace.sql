CREATE OR REPLACE VIEW api_wf.wf_btchTrace AS
SELECT
  f.name AS acctName,
  e.btchCat AS btchCat,
  CONCAT(e.btchType, '.', e.btchName) AS btchID,
  e.btchNbr AS btchNbr,
  DATE_FORMAT(e.btchDate, '%Y-%m-%d') AS btchDate,
  e.account_id
FROM
  (
    SELECT
      'Ingr' AS btchCat,
      c.account_id,
      c.ingrTypeName AS btchType,
      c.ingrName  AS btchName,
      c.ingrBtchNbr  btchNbr ,
      c.purchDate    btchDate
    FROM api_wf.wf_ingrBtchDtl c 
    WHERE YEAR(c.purchDate) >= 2020
    UNION ALL
    SELECT
      'Prod' AS btchCat,
      d.account_id,
      d.prodTypeName AS btchType,
      d.prodName AS btchName,
      d.prodBtchNbr AS btchNbr,
      d.prodBtchDate AS btchDate
    FROM api_wf.wf_prodBtchDtl d 
    WHERE YEAR(d.prodBtchDate) >= 2020
  ) e
LEFT JOIN whatsfresh.accounts f ON e.account_id = f.id
ORDER BY
  DATE_FORMAT(e.btchDate, '%Y-%m-%d'),
  CONCAT(e.btchType, '.', e.btchName),
  e.btchNbr
