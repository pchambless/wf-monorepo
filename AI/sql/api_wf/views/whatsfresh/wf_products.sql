create or replace view api_wf.wf__products as
select b.name 												prodTypeName
,a.name 													prodName
,a.code														prodCode
,ifnull(replace(a.description,'\n','<br>'),'') 				description
,a.best_by_days												bestByDays
,ifnull(a.location,'') 										location
,whatsfresh.f_measure(a.measure_id) 									prodMeas
,a.account_id 										
,a.id 														product_id
,a.product_type_id 
from whatsfresh.products a 
join whatsfresh.product_types b 
on   a.product_type_id = b.id
join whatsfresh.accounts c 
on   a.account_id = c.id
where a.active = 1 and  c.active = 1