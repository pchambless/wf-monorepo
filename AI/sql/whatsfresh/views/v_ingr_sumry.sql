create or replace view v_ingr_sumry
as
select 	ROW_NUMBER() OVER() AS uID
,			a.ingredient_id		ingr_id
,			max(a.purchase_date)	last_purch_date
,			max(a.batch_number)	last_btch_nbr
,			count(*)					btch_cnt
from		ingredient_batches a
group by a.ingredient_id