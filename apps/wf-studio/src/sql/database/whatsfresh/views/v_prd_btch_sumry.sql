create or replace view v_prd_btch_sumry
as
select 	ROW_NUMBER() OVER() AS uID
,			b.account_id			acct_id
,			a.product_id			prd_id
,			max(a.batch_start)	last_btch_date
,			max(a.batch_number)	last_btch_nbr
,			count(*)					btch_cnt
from		product_batches a
join     products b
on			a.product_id = b.id
group by b.account_id, b.id