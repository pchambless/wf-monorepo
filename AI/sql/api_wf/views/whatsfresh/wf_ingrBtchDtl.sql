create or replace view api_wf.wf_ingrBtchDtl
as
select
 it.name												ingrTypeName
,i.name													ingrName
,i.code													ingrCode
,ifnull(ib.batch_number,'No Batches')					ingrBtchNbr
,i.grams_per_ounce										gmsPerOz
,i.description										   	ingrDesc
,i.default_measure_unit									dfltMeasId
,i.default_vendor										dfltVndrId
,ifnull(ib.lot_number,'')								ingrLotNbr
,ifnull(date_format(ib.purchase_date,'%Y-%m-%d'),'') collate utf8mb4_unicode_ci purchDate
,ifnull(ib.purchase_quantity,'') 						purchQty
,whatsfresh.f_measure(ib.measure_id)					purchMeas
,ib.unit_quantity 										unitQty
,ib.unit_price 											unitPrice
,cast((ifnull(ib.unit_price,0) / ifnull(ib.unit_quantity,1)) as decimal(9,4)) unitRate
,ifnull(concat(ib.purchase_quantity,' @ ',concat('$',format(ifnull(ib.unit_price,0),2)),' per ',
			(trim(round(ib.unit_quantity,2)) + 0),' ',
			whatsfresh.f_measure(ib.measure_id)),'') 	purchDtl
,concat('$',format(ifnull(ib.purchase_quantity * ib.unit_price,0),2)) purchAmt
,ifnull(ib.purchase_quantity * ib.unit_price,0)			purchTotalAmt
,whatsfresh.f_vendor(ib.vendor_id)						vndrName
,whatsfresh.f_brand(ib.brand_id)						brndName
,ifnull(date_format(ib.best_by_date,'%Y-%m-%d'),'') 	bestByDate
,ifnull(pbi.prd_btch_cnt,0)								prdBtchCnt
,ib.comments
,concat(ib.purchase_date, ' : ', whatsfresh.f_vendor(ib.vendor_id)) shopEvent
,i.active												ingrActv
,ib.`active`											ingrBtchActv
,it.active											   	ingrTypeActv
,i.account_id											account_id
,ib.id 													ingredient_batch_id
,i.id													ingredient_id
,it.id													ingredient_type_id
,ib.vendor_id											vendor_id
,ib.brand_id											brand_id
,cast(ib.measure_id as signed)							measure_id
,ib.shop_event_id	
from 			whatsfresh.ingredients					i 
left join 	(select *
	 from whatsfresh.ingredient_batches a
	 WHERE YEAR(a.purchase_date) >= YEAR(NOW() - INTERVAL 7 YEAR)) ib
on 	i.id 		= ib.ingredient_id
left join	whatsfresh.ingredient_types					it
on				i.ingredient_type_id = it.id
left join 
	(select ingredient_batch_id
	      , count(*)    prd_btch_cnt
	 from whatsfresh.product_batch_ingredients
	 group by ingredient_batch_id) 						pbi
on  ib.id = pbi.ingredient_batch_id