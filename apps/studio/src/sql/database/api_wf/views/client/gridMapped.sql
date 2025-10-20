create or replace view gridMapped as
select a.prd_btch_ingr_id id
, a.ingr_btch_nbr ingrBtchNbr
, a.purch_date purchDate
, a.vndr_name vndrName
, a.prd_rcpe_id prodRcpeID
, a.ingr_id ingrID
, a.prd_btch_id prodBtchID
from   whatsfresh.v_prd_btch_ingr_dtl a
order by purch_date desc