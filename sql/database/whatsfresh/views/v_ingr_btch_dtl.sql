-- Test Git
create or replace view whatsfresh.v_ingr_btch_dtl
as
select
 it.name													ingr_type
,i.name													ingr_name
,i.code													ingr_code
,i.grams_per_ounce									gms_per_oz
,i.description										   ingr_desc
,i.default_measure_unit								dflt_meas_id
,i.default_vendor										dflt_vndr_id
,ifnull(ib.batch_number,'No Batches')			ingr_btch_nbr
,ifnull(ib.lot_number,'')							ingr_lot_nbr
,ifnull(date_format(ib.purchase_date,'%Y-%m-%d'),'') collate utf8mb4_unicode_ci purch_date
,ifnull(ib.purchase_quantity,'') 						purch_qty
,whatsfresh.f_measure_unit(ib.global_measure_unit_id)	purch_meas
,ib.unit_quantity 									unit_qty
,ib.unit_price 										unit_price
,cast((ifnull(ib.unit_price,0) / ifnull(ib.unit_quantity,1)) as decimal(9,4)) unit_rate
,ifnull(concat(ib.purchase_quantity,' @ ',concat('$',format(ifnull(ib.unit_price,0),2)),' per ',
			(trim(round(ib.unit_quantity,2)) + 0),' ',
			whatsfresh.f_measure_unit(ib.global_measure_unit_id)),'') purch_dtl
,concat('$',format(ifnull(ib.purchase_quantity * ib.unit_price,0),2)) purch_amt
,ifnull(ib.purchase_quantity * ib.unit_price,0)		purch_total_amt
,whatsfresh.f_vendor(ib.vendor_id)							vndr_name
,whatsfresh.f_brand(ib.brand_id)								brnd_name
,ifnull(date_format(ib.best_by_date,'%Y-%m-%d'),'') 	best_by_date
,ifnull(pbi.prd_btch_cnt,0)									prd_btch_cnt
,ib.comments
,concat(ib.purchase_date, ' : ', whatsfresh.f_vendor(ib.vendor_id)) shop_event
,i.active												ingr_active
,ib.`active`											ingr_btch_active
,it.active											   ingr_type_active
,i.account_id											acct_id
,ib.id 													ingr_btch_id
,i.id														ingr_id
,it.id													ingr_type_id
,ib.vendor_id											vndr_id
,ib.brand_id											brnd_id
,cast(ib.global_measure_unit_id as signed)	meas_id
,ib.shop_event_id	
from 			whatsfresh.ingredients				i 
left join 	(select *
	 from ingredient_batches a
	 WHERE YEAR(a.purchase_date) >= YEAR(NOW() - INTERVAL 7 YEAR))   	ib
on 			i.id 		= ib.ingredient_id
left join	whatsfresh.ingredient_types		it
on				i.ingredient_type_id = it.id
left join 
	(select ingredient_batch_id
	      , count(*)    prd_btch_cnt
	 from product_batch_ingredients
	 group by ingredient_batch_id) pbi
on  ib.id = pbi.ingredient_batch_id