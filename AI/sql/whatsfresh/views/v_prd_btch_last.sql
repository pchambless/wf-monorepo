create or replace view whatsfresh.v_prd_btch_last
as
select 
ROW_NUMBER() OVER() uID, 
a.prd_type
,a.prd_name
,a.prd_code
,a.prd_btch_date
,a.prd_btch_nbr
,a.acct_id
,a.prd_id
,a.prd_btch_id
from whatsfresh.v_prd_btch_dtl a 
left join whatsfresh.v_prd_btch_dtl b 
on a.prd_id = b.prd_id 
and a.prd_btch_date < b.prd_btch_date 
where isnull(b.prd_btch_date) 
and a.prd_btch_date is not null 
order by a.acct_id,a.prd_type,a.prd_name