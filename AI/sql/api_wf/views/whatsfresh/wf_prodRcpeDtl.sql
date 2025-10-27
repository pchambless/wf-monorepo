create or replace view api_wf.wf_prodRcpeDtl
as
select	    pt.name								prodTypeName
,			b.name								prodName
,			b.recipe_quantity					rcpeQty
,			whatsfresh.f_measure(b.measure_id) 	rcpeMeas
,			a.ingredient_order				    ingrOrdr
,			c.code								ingrCode
,			c.name								ingrName
,			it.name				 				ingrType
,			nullif(concat(a.quantity,' ',whatsfresh.f_measure(a.measure_id)),'0 -') ingrQtyMeas
,			a.quantity							ingrQty
,			whatsfresh.f_measure(a.measure_id) ingrMeas
-- ,			f_unit_oz (a.measure_id, a.quantity) ingr_oz
,			b.description						prdDesc
,			ifnull(a.comments,'') 			    prodIngrDesc
,		   a.active								prodRcpeActv
,			b.active							prodActv
,			c.active							ingrActv
,			a.id								product_recipe_id
,			b.account_id						account_id
,			a.product_id					    product_id
,			pt.id								product_type_id
,			a.ingredient_id					    ingredient_id
,			it.id								ingredient_type_id
,			a.measure_id		                measure_id
from		whatsfresh.product_recipes 		    a
join		whatsfresh.products					b
on			a.product_id = b.id
join		whatsfresh.product_types			pt
on			b.product_type_id = pt.id
join		whatsfresh.ingredients				c
on			a.ingredient_id = c.id
join		whatsfresh.ingredient_types		    it
on			c.ingredient_type_id = it.id
order by b.account_id, b.product_type_id,b.name, a.ingredient_order, c.name