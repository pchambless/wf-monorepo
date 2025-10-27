CREATE OR REPLACE VIEW api_wf.wf_prodBtchIngrID 
as
select		    r.prodTypeName
,				r.prodName
,				c.prodBtchDate
,				c.btchQty
,				c.comments										btchComments
,				whatsfresh.f_measure(c.measure_id)              unitMeas
,           	c.qtyMeas
,				c.prodBtchNbr
,				c.location
,				a.comments										ingrComments									
,				r.ingrOrdr
,				r.ingrName										
,				d.ingrBtchNbr								
,				concat('<strong>',ifnull(d.ingrBtchNbr,'no batch'),'</strong>: ',ifnull(d.vndrName,'no vendor')) ingrBtchSrceHTML
,				concat(ifnull(d.ingrBtchNbr,'no batch'),': ',ifnull(d.vndrName,'no vendor')) ingrBtchSrce							
,				d.ingrLotNbr									
,				d.purchDate
,				d.purchDtl
,				d.purchAmt			
,				d.vndrName										
,				d.brndName
,				r.prodIngrDesc
,				c.prodBtchActv
,				r.prodActv
,				d.ingrBtchActv
,				r.account_id
,				r.product_id
,				r.product_type_id
,				r.ingredient_id
,				a.id												product_batch_ingredient_id
,				a.measure_id									
,				c.product_batch_id									
,				r.product_recipe_id   
,				a.ingredient_batch_id				
from 			api_wf.wf_prodBtchDtl c
left join	    api_wf.wf_prodRcpeDtl  r
on				c.product_id = r.product_id
left join	    whatsfresh.product_batch_ingredients a
on				c.product_batch_id		= a.product_batch_id
and			    r.product_recipe_id = a.product_recipe_id
left join	    api_wf.wf_ingrBtchDtl	d
on				a.ingredient_batch_id = d.ingredient_batch_id
WHERE			a.created_at IS NOT null
order by 	    r.account_id
, 				c.prodBtchDate desc
, 				c.prodBtchNbr desc 
,				r.ingrOrdr