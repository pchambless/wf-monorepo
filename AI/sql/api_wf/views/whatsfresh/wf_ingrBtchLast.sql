create or replace view api_wf.wf_ingrBtchLast
as
select 	
			a.ingredient_id
,			max(a.purchase_date)	lastPurchDate
,			max(a.batch_number)		lastBtchNbr
,			count(*)				btchCount
from		whatsfresh.ingredient_batches a
group by 	a.ingredient_id