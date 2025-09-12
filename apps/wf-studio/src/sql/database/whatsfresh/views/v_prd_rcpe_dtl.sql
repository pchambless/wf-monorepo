create or replace view whatsfresh.v_prd_rcpe_dtl
as
select	pt.name								prd_type
,			b.name								prd_name
,			concat(b.name,' ', pt.name) 	prd_type_n_name
,			b.recipe_quantity					rcpe_qty
,			whatsfresh.f_measure(b.measure_id) 	rcpe_meas
,			a.ingredient_order				ingr_ordr
,			c.code								ingr_code
,			c.name								ingr_name
,			it.name				 				ingr_type
,			nullif(concat(a.quantity,' ',whatsfresh.f_measure(a.measure_id)),'0 -') ingr_qty_meas
,			a.quantity							ingr_qty
,			whatsfresh.f_measure(a.measure_id) ingr_meas
-- ,			f_unit_oz (a.measure_id, a.quantity) ingr_oz
,			b.description						prd_desc
,			ifnull(a.comments,'') 			prd_ingr_desc
,		   a.active								prd_rcpe_actv
,			b.active								prd_actv
,			c.active								ingr_actv
,		   a.active								prd_rcpe_active
,			b.active								prd_active
,			c.active								ingr_active
,			a.id									prd_rcpe_id
,			b.account_id						acct_id
,			a.product_id						prd_id
,			pt.id									prd_type_id
,			a.ingredient_id					ingr_id
,			it.id									ingr_type_id
,			a.measure_id		            ingr_meas_id		
from		whatsfresh.product_recipes 		a
join		whatsfresh.products					b
on			a.product_id = b.id
join		whatsfresh.product_types			pt
on			b.product_type_id = pt.id
join		whatsfresh.ingredients				c
on			a.ingredient_id = c.id
join		whatsfresh.ingredient_types		it
on			c.ingredient_type_id = it.id
order by b.account_id, b.product_type_id,b.name, a.ingredient_order, c.name