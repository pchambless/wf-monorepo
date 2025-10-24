create or replace view whatsfresh.v_prd_btch_ingr_dtl
as
select		r.prd_type
,				r.prd_name
,				c.batch_start
,				DATE_FORMAT(c.batch_start,'%Y-%m-%d')   prd_btch_date
,				c.batch_quantity								btch_qty
,				c.comments										btchComments
,				whatsfresh.f_measure(c.measure_id) unit_meas
,           ifnull(concat(c.batch_quantity,' ', whatsfresh.f_measure(c.measure_id)),'') prd_qty_meas
,				c.batch_number									prd_btch_nbr
,				ifnull(c.location,'')						location
,				a.comments										ingrComments									
,				r.ingr_ordr
,				r.ingr_name										
,				d.ingr_btch_nbr								ingr_btch_nbr
,				concat('<strong>',ifnull(d.ingr_btch_nbr,'no batch'),'</strong>: ',ifnull(d.vndr_name,'no vendor')) ingr_btch_srce
,				concat(ifnull(d.ingr_btch_nbr,'no batch'),': ',ifnull(d.vndr_name,'no vendor')) ingrBtchSrce							
,				d.ingr_lot_nbr									
,				d.purch_date
,				d.purch_dtl
,				d.purch_amt			
,				d.vndr_name										
,				d.brnd_name
,				r.prd_ingr_desc
,				c.active											prd_btch_active
,				r.prd_actv
,				d.ingr_btch_active
,				r.acct_id
,				r.prd_id
,				r.prd_type_id
,				r.ingr_id
,				a.id												prd_btch_ingr_id
,				a.measure_id									meas_id
,				c.id												prd_btch_id									
,				r.prd_rcpe_id
,				a.ingredient_batch_id						ingr_btch_id
from 			product_batches c
left join	v_prd_rcpe_dtl  r
on				c.product_id = r.prd_id
left join	product_batch_ingredients a
on				c.id		= a.product_batch_id
and			r.prd_rcpe_id = a.product_recipe_id
left join	v_ingr_btch_dtl	d
on				a.ingredient_batch_id = d.ingr_btch_id
WHERE			a.created_at IS NOT null
order by 	r.acct_id
, 				c.batch_start desc
, 				c.batch_number desc 
,				r.ingr_ordr