create or replace view wf_btchTrace as
select
  f.name as acctName,
  e.btchCat as btchCat,
  concat(e.btchType, '.', e.btchName) as btchID,
  e.btchNbr as btchNbr,
  date_format(e.btchDate, '%Y-%m-%d') as btchDate,
  e.account_id as account_id
from
  (
    (
      select
        'Ingr' as btchCat,
        c.account_id as account_id,
        c.ingrTypeName as btchType,
        c.ingrName as btchName,
        c.ingrBtchNbr as btchNbr,
        c.purchDate as btchDate
      from
        wf_ingrBtchDtl c
      where
        (year(c.purchDate) >= 2020)
      union all
      select
        'Prod' as btchCat,
        d.account_id as account_id,
        d.prodTypeName as btchType,
        d.prodName as btchName,
        d.prodBtchNbr as btchNbr,
        d.prodBtchDate as btchDate
      from
        wf_prodBtchDtl d
      where
        (year(d.prodBtchDate) >= 2020)
    ) e
    left join whatsfresh.accounts f on ((e.account_id = f.id))
  )
order by
  date_format(e.btchDate, '%Y-%m-%d'),
  concat(e.btchType, '.', e.btchName),
  e.btchNbr
