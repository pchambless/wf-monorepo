create or replace view gridMapped as
select a.ingr_btch_nbr ingrBtchNbr
, a.purch_date purchDate
, a.vndr_name vndrName
, a.prd_btch_ingr_id id
, a.prd_rcpe_id product_recipe_id
, a.ingr_id ingredient_id
, a.prd_btch_id product_batch_id
from   whatsfresh.v_prd_btch_ingr_dtl a
order by purch_date desc