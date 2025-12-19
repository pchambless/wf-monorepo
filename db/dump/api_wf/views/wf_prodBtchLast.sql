create or replace view wf_prodBtchLast as
select
  a.prodTypeName as prodTypeName,
  a.prodName as prodName,
  a.prodCode as prodCode,
  a.prodBtchDate as prodBtchDate,
  a.prodBtchNbr as prodBtchNbr,
  a.account_id as account_id,
  a.product_id as product_id,
  a.product_batch_id as product_batch_id
from
  (
    wf_prodBtchDtl a
    left join wf_prodBtchDtl b on (
      (
        (a.product_id = b.product_id)
        and (a.prodBtchDate < b.prodBtchDate)
      )
    )
  )
where
  (
    (b.prodBtchDate is null)
    and (a.prodBtchDate is not null)
  )
order by
  a.account_id,
  a.prodTypeName,
  a.prodName
