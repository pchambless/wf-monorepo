create or replace view api_wf.wf_prodBtchLast
as
select 
a.prodTypeName
,a.prodName
,a.prodCode
,a.prodBtchDate
,a.prodBtchNbr
,a.account_id
,a.product_id
,a.product_batch_id
from api_wf.wf_prodBtchDtl a 
left join api_wf.wf_prodBtchDtl b 
on a.product_id = b.product_id 
and a.prodBtchDate < b.prodBtchDate 
where isnull(b.prodBtchDate) 
and a.prodBtchDate is not null 
order by a.account_id,a.prodTypeName,a.prodName